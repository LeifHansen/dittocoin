#!/bin/bash
# Double-click this file to push the local DittoCoin repo to GitHub.
# Uses HTTPS so you'll be prompted for a Personal Access Token (PAT) the first time.
# Create one at: https://github.com/settings/tokens  (classic, scope: repo)

cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════"
echo "  DittoCoin → GitHub push"
echo "═══════════════════════════════════════════════"

# Switch to HTTPS so the macOS keychain can store a PAT
git remote set-url origin https://github.com/LeifHansen/DittoCoin.git
git branch -M main

# Pull anything that was added via the GitHub web UI first, then push
echo ""
echo "→ Pulling any remote commits from the web UI..."
git pull --rebase origin main || {
  echo ""
  echo "⚠️  Rebase had conflicts. Resolve them, then run:"
  echo "    git rebase --continue && git push origin main"
  read -p "Press Enter to close..."
  exit 1
}

echo ""
echo "→ Pushing to origin/main..."
git push -u origin main

echo ""
echo "Done! View at: https://github.com/LeifHansen/DittoCoin"
read -p "Press Enter to close..."
