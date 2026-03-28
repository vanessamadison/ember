#!/bin/bash
# EMBER — Setup Script
# Run this once after cloning the repo

set -e

echo ""
echo "  🔥 EMBER — Encrypted Mesh Based Emergency Response"
echo "  ────────────────────────────────────────────────────"
echo ""

# Check Node version
NODE_VERSION=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)
if [ -z "$NODE_VERSION" ] || [ "$NODE_VERSION" -lt 18 ]; then
  echo "  ✗ Node.js 18+ required. Current: $(node -v 2>/dev/null || echo 'not found')"
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# Install dependencies with pinned Expo SDK 52
echo ""
echo "  Installing dependencies (Expo SDK 52)..."
echo ""
npm install

# Let Expo fix any peer dependency mismatches
echo ""
echo "  Resolving Expo SDK 52 compatible versions..."
echo ""
npx expo install --fix

# Verify the install
echo ""
echo "  Verifying installation..."
npx expo --version && echo "  ✓ Expo CLI ready"

echo ""
echo "  ────────────────────────────────────────────────────"
echo "  ✓ Setup complete!"
echo ""
echo "  Next steps:"
echo ""
echo "  1. Add your logo:"
echo "     cp /path/to/your/ember-logo.png assets/icon.png"
echo "     cp /path/to/your/ember-logo.png assets/adaptive-icon.png"
echo ""
echo "  2. Start development:"
echo "     npx expo start"
echo ""
echo "  Note: WatermelonDB requires a development build (not Expo Go)."
echo "  For the first run, create a dev build:"
echo "     npx expo run:ios     # or npx expo run:android"
echo ""
echo "  Or use EAS Build for cloud builds:"
echo "     npx eas build --profile development --platform ios"
echo ""