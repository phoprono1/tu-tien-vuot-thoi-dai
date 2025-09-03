import { NextRequest, NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite';
import { Query } from 'appwrite';

// Combat calculation functions
const calculateDamage = (attacker: { attack: number }, defender: { defense: number }) => {
  const baseDamage = attacker.attack;
  const defense = defender.defense;
  const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - defense / (defense + 100))));

  // Random variance ±20%
  const variance = 0.8 + Math.random() * 0.4;
  return Math.floor(finalDamage * variance);
};

const checkCritical = (criticalRate: number) => {
  return Math.random() * 100 < criticalRate;
};

export async function POST(request: NextRequest) {
  try {
    const { attackerId, defenderId, combatType = 'pve', turnData } = await request.json();

    if (!attackerId || !defenderId) {
      return NextResponse.json(
        { error: 'AttackerId và DefenderId là bắt buộc' },
        { status: 400 }
      );
    }

    // Get attacker combat stats
    const attackerStatsResponse = await databases.listDocuments(
      'tu-tien-database',
      'combat_stats',
      [Query.equal('characterId', attackerId)]
    );

    if (attackerStatsResponse.documents.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy combat stats của attacker' },
        { status: 404 }
      );
    }

    const attackerStats = attackerStatsResponse.documents[0];

    // Get defender stats (trial enemy stats)
    let defenderStats;
    if (combatType === 'pve') {
      const trialResponse = await databases.getDocument(
        'tu-tien-database',
        'trials',
        defenderId
      );

      defenderStats = typeof trialResponse.enemyStats === 'string'
        ? JSON.parse(trialResponse.enemyStats)
        : trialResponse.enemyStats;
    }

    // Use current HP from turnData or initial values
    const currentAttackerHP = turnData?.attackerHP || attackerStats.maxHealth;
    const currentDefenderHP = turnData?.defenderHP || defenderStats.health;

    // Check if combat is already over
    if (currentAttackerHP <= 0 || currentDefenderHP <= 0) {
      return NextResponse.json({
        success: true,
        combatEnded: true,
        winner: currentAttackerHP > 0 ? 'attacker' : 'defender',
        finalStats: {
          attackerHP: currentAttackerHP,
          defenderHP: currentDefenderHP
        }
      });
    }

    // Determine turn order based on agility
    const attackerSpeed = attackerStats.agility;
    const defenderSpeed = defenderStats.agility || 50;

    const playerGoesFirst = attackerSpeed >= defenderSpeed;
    const currentTurn = turnData?.turn || 1;

    // Determine who attacks this turn
    let attacker, defender;
    let isPlayerTurn;

    if (playerGoesFirst) {
      isPlayerTurn = currentTurn % 2 === 1; // Odd turns: player, Even turns: enemy
    } else {
      isPlayerTurn = currentTurn % 2 === 0; // Even turns: player, Odd turns: enemy
    }

    if (isPlayerTurn) {
      attacker = { ...attackerStats, name: 'Player' };
      defender = { ...defenderStats, name: 'Enemy' };
    } else {
      attacker = { ...defenderStats, name: 'Enemy' };
      defender = { ...attackerStats, name: 'Player' };
    }

    // Calculate damage
    let damage = calculateDamage(attacker, defender);
    const isCritical = checkCritical(attacker.criticalRate || 10);

    if (isCritical) {
      damage = Math.floor(damage * 1.5);
    }

    // Apply damage
    const newDefenderHP = Math.max(0, currentDefenderHP - damage);

    // Update HP values
    let newAttackerHP, newEnemyHP;
    if (isPlayerTurn) {
      newAttackerHP = currentAttackerHP;
      newEnemyHP = newDefenderHP;
    } else {
      newAttackerHP = newDefenderHP;
      newEnemyHP = currentDefenderHP;
    }

    // Create turn log
    const turnLog = {
      turn: currentTurn,
      attacker: isPlayerTurn ? 'Player' : 'Enemy',
      defender: isPlayerTurn ? 'Enemy' : 'Player',
      action: isCritical ? 'Critical Attack' : 'Attack',
      damage,
      effects: isCritical ? ['Critical Hit!'] : [],
      attackerHealth: newAttackerHP,
      defenderHealth: newEnemyHP
    };

    // Check if combat ended
    const combatEnded = newAttackerHP <= 0 || newEnemyHP <= 0;
    let winner = null;

    if (combatEnded) {
      winner = newAttackerHP > 0 ? 'player' : 'enemy';
    }

    return NextResponse.json({
      success: true,
      turnLog,
      combatEnded,
      winner,
      currentStats: {
        attackerHP: newAttackerHP,
        defenderHP: newEnemyHP,
        turn: currentTurn + 1
      }
    });

  } catch (error) {
    console.error('Lỗi trong combat turn:', error);
    return NextResponse.json(
      { error: 'Lỗi xử lý combat turn' },
      { status: 500 }
    );
  }
}
