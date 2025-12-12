#!/usr/bin/env python3
"""
DEPRECATED: This script has been moved to quarto/scripts/generate_mdx_previews.py

Please use:
    cd ../quarto && make mdx
    
Or run directly:
    python ../quarto/scripts/generate_mdx_previews.py
"""

import sys
import os
from pathlib import Path

print("⚠️  This script has been relocated!")
print("")
print("Quarto source files are now in: quarto/publications/")
print("")
print("To generate MDX previews, run:")
print("  cd ../quarto && make mdx")
print("")
print("Or directly:")
print("  python ../quarto/scripts/generate_mdx_previews.py")
print("")

# Try to run the new script
new_script = Path(__file__).parent.parent.parent / "quarto" / "scripts" / "generate_mdx_previews.py"
if new_script.exists():
    print("🔄 Forwarding to new location...")
    print("")
    os.execvp(sys.executable, [sys.executable, str(new_script)])
else:
    print(f"❌ New script not found at: {new_script}")
    sys.exit(1)
