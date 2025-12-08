//! Secure credential storage using OS keychain or environment variables
//!
//! Credentials are checked in this order:
//! 1. Environment variables (ARESA_OPENAI_API_KEY, ARESA_ANTHROPIC_API_KEY, etc.)
//! 2. OS Keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)

use anyhow::{Context, Result};
use keyring::Entry;

const SERVICE_NAME: &str = "aresa-cli";

/// Secure credential storage using the OS keychain with env var fallback
#[derive(Debug)]
pub struct CredentialStore;

impl CredentialStore {
    /// Create a new credential store
    pub fn new() -> Result<Self> {
        Ok(Self)
    }

    /// Store a credential in the keychain
    pub fn store(&self, name: &str, secret: &str) -> Result<()> {
        let entry = Entry::new(SERVICE_NAME, name)
            .context("Failed to create keyring entry")?;

        entry.set_password(secret)
            .context("Failed to store credential in keychain")?;

        Ok(())
    }

    /// Retrieve a credential - checks env vars first, then keychain
    pub fn get(&self, name: &str) -> Result<String> {
        // First, check environment variables
        let env_var_name = Self::env_var_name(name);
        if let Ok(value) = std::env::var(&env_var_name) {
            if !value.is_empty() {
                return Ok(value);
            }
        }

        // Fall back to keychain
        let entry = Entry::new(SERVICE_NAME, name)
            .context("Failed to create keyring entry")?;

        entry.get_password()
            .context(format!(
                "Credential '{}' not found. Set {} env var or run: aresa config set-llm <provider> --api-key <key>",
                name, env_var_name
            ))
    }

    /// Delete a credential from the keychain
    pub fn delete(&self, name: &str) -> Result<()> {
        let entry = Entry::new(SERVICE_NAME, name)
            .context("Failed to create keyring entry")?;

        entry.delete_password()
            .context("Failed to delete credential")?;

        Ok(())
    }

    /// Check if a credential exists (env var or keychain)
    pub fn exists(&self, name: &str) -> bool {
        // Check env var first
        let env_var_name = Self::env_var_name(name);
        if std::env::var(&env_var_name).map(|v| !v.is_empty()).unwrap_or(false) {
            return true;
        }

        // Check keychain
        if let Ok(entry) = Entry::new(SERVICE_NAME, name) {
            entry.get_password().is_ok()
        } else {
            false
        }
    }

    /// Convert credential name to environment variable name
    fn env_var_name(name: &str) -> String {
        // llm_openai -> ARESA_OPENAI_API_KEY
        // llm_anthropic -> ARESA_ANTHROPIC_API_KEY
        // Otherwise: ARESA_<NAME>
        if name.starts_with("llm_") {
            let provider = name.strip_prefix("llm_").unwrap().to_uppercase();
            format!("ARESA_{}_API_KEY", provider)
        } else {
            format!("ARESA_{}", name.to_uppercase().replace('-', "_"))
        }
    }
}

