#!/bin/bash

# Script to update imports for new component structure

# Find all TypeScript/TSX files in app directory and update imports
find src/app -name "*.tsx" -o -name "*.ts" | while read file; do
    echo "Updating imports in: $file"
    
    # Update admin imports
    sed -i 's|@/components/AdminGuard|@/components/admin|g' "$file"
    sed -i 's|@/components/AdminTable|@/components/admin|g' "$file" 
    sed -i 's|@/components/AdminAuthModal|@/components/admin|g' "$file"
    
    # Update form imports
    sed -i 's|@/components/CharacterForm|@/components/forms|g' "$file"
    sed -i 's|@/components/ItemForm|@/components/forms|g' "$file"
    sed -i 's|@/components/SkillForm|@/components/forms|g' "$file"
    sed -i 's|@/components/TechniqueForm|@/components/forms|g' "$file"
    sed -i 's|@/components/CultivationTechniqueForm|@/components/forms|g' "$file"
    
    # Update shared imports
    sed -i 's|@/components/Providers|@/components/shared|g' "$file"
    sed -i 's|@/components/ServerSettingsPanel|@/components/shared|g' "$file"
    sed -i 's|@/components/TrialManagementPanel|@/components/shared|g' "$file"
    
    # Update game imports  
    sed -i 's|@/components/CombatTestPanel|@/components/game/combat|g' "$file"
    sed -i 's|@/components/PvPRankingsPanel|@/components/game/combat|g' "$file"
done

echo "Import updates completed!"
