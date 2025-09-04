#!/bin/bash

# Script to remove debug console.log statements

echo "🧹 Cleaning up console.log statements..."

# Remove specific emoji logs from all TypeScript and TSX files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*[🧘🎯✅🔗🧹🔴🟢📜📡📦💥❌]/d'

# Also remove activity/character debug logs
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*ActivityChatTabs/d'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*CharacterInfoPanel/d'

# Remove scroll and realtime debug logs
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*scroll/i/d'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*Messages changed/d'
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '/console\.log.*Scroll effect/d'

echo "✅ Cleanup complete!"
