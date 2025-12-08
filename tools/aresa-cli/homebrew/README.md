# Homebrew Tap Setup Guide

This guide walks you through setting up `brew tap yoreai/tap` for distributing `aresa-cli`.

## Quick Setup (5 minutes)

### Step 1: Create the Tap Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository:
   - **Name:** `homebrew-tap`
   - **Owner:** `yoreai`
   - **Visibility:** Public (or Private if you prefer)
   - **Initialize:** Add a README

### Step 2: Add the Formula

In your new `homebrew-tap` repo, create this structure:

```
homebrew-tap/
├── README.md
└── Formula/
    └── aresa-cli.rb    # Copy from this directory
```

### Step 3: After Your First Release

Once GitHub Actions creates a release with binaries:

1. Download the `.sha256` files from the release
2. Update `Formula/aresa-cli.rb` with:
   - The correct `version`
   - The SHA256 hashes for each platform

Example update:

```ruby
version "0.1.0"

on_macos do
  if Hardware::CPU.arm?
    url "https://github.com/yoreai/aresa/releases/download/aresa-cli-v0.1.0/aresa-cli-darwin-arm64"
    sha256 "abc123..."  # From aresa-cli-darwin-arm64.sha256
  else
    url "https://github.com/yoreai/aresa/releases/download/aresa-cli-v0.1.0/aresa-cli-darwin-x64"
    sha256 "def456..."  # From aresa-cli-darwin-x64.sha256
  end
end
```

## Installation Commands

Once set up, users can install with:

```bash
# Add the tap (one time)
brew tap yoreai/tap

# Install aresa-cli
brew install aresa-cli

# Upgrade to latest
brew upgrade aresa-cli
```

## Automating Updates (Optional)

To auto-update the formula after releases, you can:

1. Add a `HOMEBREW_TAP_TOKEN` secret to your main repo (a GitHub PAT with repo access)
2. Uncomment the homebrew job in `.github/workflows/aresa-cli.yml`
3. Add a workflow to your `homebrew-tap` repo that updates the formula

## Private Tap

If your tap is private, users install with:

```bash
# With SSH
brew tap yoreai/tap git@github.com:yoreai/homebrew-tap.git

# Or with HTTPS (will prompt for auth)
brew tap yoreai/tap https://github.com/yoreai/homebrew-tap.git
```

## Troubleshooting

### "No available formula"
- Ensure the formula file is in `Formula/aresa-cli.rb` (capital F)
- Check the formula syntax with `brew audit --new-formula aresa-cli`

### SHA256 mismatch
- Re-download the binary and regenerate: `shasum -a 256 aresa-cli-darwin-arm64`
- Ensure you're using the binary from the correct release tag

### Formula won't load
- Validate Ruby syntax: `ruby -c Formula/aresa-cli.rb`
- Test locally: `brew install --build-from-source ./Formula/aresa-cli.rb`



