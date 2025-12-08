//! Terminal PTY management for web-based shell access
//!
//! Provides real shell sessions via WebSocket using portable-pty.

#[cfg(feature = "ui")]
pub mod pty_manager {
    use anyhow::Result;
    use portable_pty::{CommandBuilder, PtySize, native_pty_system};
    use std::io::{Read, Write};
    use std::sync::Arc;
    use tokio::sync::mpsc;

    /// WebSocket message types
    #[derive(serde::Serialize, serde::Deserialize, Clone)]
    #[serde(tag = "type")]
    pub enum TerminalMessage {
        #[serde(rename = "input")]
        Input { data: String },
        #[serde(rename = "output")]
        Output { data: String },
        #[serde(rename = "resize")]
        Resize { rows: u16, cols: u16 },
    }

    /// Handle WebSocket terminal session
    /// Uses separate threads for blocking PTY I/O to avoid blocking the async runtime
    pub async fn handle_terminal_ws(
        ws: axum::extract::ws::WebSocket,
    ) -> Result<()> {
        use axum::extract::ws::Message;
        use futures_util::{StreamExt, SinkExt};

        let (mut ws_sender, mut ws_receiver) = ws.split();

        // Create channels for communication between async and blocking threads
        let (pty_output_tx, mut pty_output_rx) = mpsc::channel::<String>(100);
        let (pty_input_tx, pty_input_rx) = mpsc::channel::<Vec<u8>>(100);

        // Spawn blocking thread for PTY operations
        let pty_handle = std::thread::spawn(move || {
            run_pty_session(pty_output_tx, pty_input_rx)
        });

        // Track if we should keep running
        let running = Arc::new(std::sync::atomic::AtomicBool::new(true));
        let running_read = running.clone();

        // Task to forward PTY output to WebSocket
        let output_task = tokio::spawn(async move {
            while running_read.load(std::sync::atomic::Ordering::Relaxed) {
                match pty_output_rx.recv().await {
                    Some(data) => {
                        let msg = serde_json::to_string(&TerminalMessage::Output { data }).unwrap();
                        if ws_sender.send(Message::Text(msg)).await.is_err() {
                            break;
                        }
                    }
                    None => break,
                }
            }
        });

        // Handle messages from WebSocket
        while let Some(msg_result) = ws_receiver.next().await {
            match msg_result {
                Ok(Message::Text(text)) => {
                    if let Ok(term_msg) = serde_json::from_str::<TerminalMessage>(&text) {
                        match term_msg {
                            TerminalMessage::Input { data } => {
                                if pty_input_tx.send(data.into_bytes()).await.is_err() {
                                    break;
                                }
                            }
                            TerminalMessage::Resize { .. } => {
                                // Resize is not easily supported by portable-pty
                                // Would need to store pty handle and call resize
                            }
                            _ => {}
                        }
                    }
                }
                Ok(Message::Close(_)) => break,
                Err(_) => break,
                _ => {}
            }
        }

        // Clean up
        running.store(false, std::sync::atomic::Ordering::Relaxed);
        drop(pty_input_tx); // Close the channel to signal PTY thread to exit
        output_task.abort();

        // Wait for PTY thread to finish (with timeout)
        let _ = std::thread::spawn(move || {
            let _ = pty_handle.join();
        });

        Ok(())
    }

    /// Run PTY session in a blocking thread
    fn run_pty_session(
        output_tx: mpsc::Sender<String>,
        mut input_rx: mpsc::Receiver<Vec<u8>>,
    ) -> Result<()> {
        let pty_system = native_pty_system();

        // Create PTY with reasonable size
        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        // Determine user's shell
        let shell = std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string());

        // Spawn shell
        let mut cmd = CommandBuilder::new(&shell);
        cmd.env("TERM", "xterm-256color");
        let _child = pair.slave.spawn_command(cmd)?;

        // Get reader and writer
        let mut reader = pair.master.try_clone_reader()?;
        let mut writer = pair.master.take_writer()?;

        // Spawn thread to read from PTY
        let output_tx_clone = output_tx.clone();
        let read_thread = std::thread::spawn(move || {
            let mut buf = [0u8; 4096];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) => break, // EOF
                    Ok(n) => {
                        let data = String::from_utf8_lossy(&buf[..n]).to_string();
                        if output_tx_clone.blocking_send(data).is_err() {
                            break;
                        }
                    }
                    Err(_) => break,
                }
            }
        });

        // Handle input from WebSocket in this thread
        // Use blocking_recv in a loop
        loop {
            match input_rx.blocking_recv() {
                Some(data) => {
                    if writer.write_all(&data).is_err() {
                        break;
                    }
                    if writer.flush().is_err() {
                        break;
                    }
                }
                None => break, // Channel closed
            }
        }

        // Clean up
        drop(output_tx);
        let _ = read_thread.join();

        Ok(())
    }
}

#[cfg(not(feature = "ui"))]
pub mod pty_manager {
    // Stub when UI feature is disabled
}

