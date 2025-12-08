# Homebrew Formula for aresa-cli
#
# To use this formula:
# 1. Create a new repo: yoreai/homebrew-tap
# 2. Copy this file to: Formula/aresa-cli.rb
# 3. Update the version, URLs, and SHA256 hashes after each release
#
# Users install with:
#   brew tap yoreai/tap
#   brew install aresa-cli

class AresaCli < Formula
  desc "Fast, multi-database CLI tool for data exploration"
  homepage "https://github.com/yoreai/aresa"
  version "0.1.0"
  license "MIT"

  # Update these URLs and SHA256s after each release
  # The GitHub Actions workflow creates these automatically
  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/yoreai/aresa/releases/download/aresa-cli-v#{version}/aresa-cli-darwin-arm64"
      sha256 "PLACEHOLDER_SHA256_DARWIN_ARM64"
    else
      url "https://github.com/yoreai/aresa/releases/download/aresa-cli-v#{version}/aresa-cli-darwin-x64"
      sha256 "PLACEHOLDER_SHA256_DARWIN_X64"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/yoreai/aresa/releases/download/aresa-cli-v#{version}/aresa-cli-linux-arm64"
      sha256 "PLACEHOLDER_SHA256_LINUX_ARM64"
    else
      url "https://github.com/yoreai/aresa/releases/download/aresa-cli-v#{version}/aresa-cli-linux-x64"
      sha256 "PLACEHOLDER_SHA256_LINUX_X64"
    end
  end

  def install
    binary_name = "aresa-cli-#{OS.kernel_name.downcase}-#{Hardware::CPU.arm? ? "arm64" : "x64"}"
    bin.install Dir["*"].first => "aresa"
  end

  test do
    assert_match "aresa", shell_output("#{bin}/aresa --version")
  end
end



