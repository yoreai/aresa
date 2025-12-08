'use client';

import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    // Create terminal
    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#0f172a',
        foreground: '#e2e8f0',
        cursor: '#06b6d4',
        cursorAccent: '#0f172a',
        black: '#1e293b',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#3b82f6',
        magenta: '#a855f7',
        cyan: '#06b6d4',
        white: '#f1f5f9',
        brightBlack: '#475569',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#22d3ee',
        brightWhite: '#ffffff',
      },
    });

    // Add addons
    const fitAddon = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    term.loadAddon(fitAddon);
    term.loadAddon(webLinksAddon);

    // Open terminal
    term.open(terminalRef.current);
    fitAddon.fit();

    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:3001/api/terminal');

    ws.onopen = () => {
      term.writeln('\x1b[1;36m╔═══════════════════════════════════════════════════════════╗\x1b[0m');
      term.writeln('\x1b[1;36m║\x1b[0m           \x1b[1;36mARESA Studio - Full Shell Access\x1b[0m           \x1b[1;36m║\x1b[0m');
      term.writeln('\x1b[1;36m╚═══════════════════════════════════════════════════════════╝\x1b[0m');
      term.writeln('');
      term.writeln('\x1b[32m✓\x1b[0m Connected to your local shell');
      term.writeln('\x1b[90mType any command: ls, cd, vim, aresa, etc.\x1b[0m');
      term.writeln('');
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'output') {
        term.write(msg.data);
      }
    };

    ws.onerror = (error) => {
      term.writeln('\r\n\x1b[31m✗ WebSocket connection failed\x1b[0m');
      term.writeln('\x1b[90mTip: Ensure aresa server is running with --features ui\x1b[0m');
    };

    ws.onclose = () => {
      term.writeln('\r\n\x1b[33m⚠ Connection closed\x1b[0m');
    };

    // Send input to shell
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'input',
          data: data
        }));
      }
    });

    // Handle resize
    const handleResize = () => {
      fitAddon.fit();
      const { rows, cols } = term;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'resize',
          rows,
          cols
        }));
      }
    };

    window.addEventListener('resize', handleResize);

    xtermRef.current = term;
    wsRef.current = ws;

    return () => {
      window.removeEventListener('resize', handleResize);
      ws.close();
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-slate-900">
      <div
        ref={terminalRef}
        className="w-full h-full p-4"
        style={{ minHeight: '600px' }}
      />
    </div>
  );
}
