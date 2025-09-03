import { CombatStats } from '@/types/combat';
import { DatabaseCharacter } from '@/types/database';
import {
    CombatResult,
    CombatTurn,
    CombatAction,
    CombatEffect,
    CombatTurnEffect
} from '@/types/combat-extended';

export interface CombatParticipant {
    id: string;
    name: string;
    character?: DatabaseCharacter;
    stats: CombatStats;
    currentHealth: number;
    currentStamina: number;
    effects: CombatEffect[];
}

export class CombatEngine {
    private attacker: CombatParticipant;
    private defender: CombatParticipant;
    private turns: CombatTurn[] = [];
    private maxTurns: number = 50; // Prevent infinite combat
    private currentTurn: number = 1;

    constructor(attacker: CombatParticipant, defender: CombatParticipant) {
        this.attacker = { ...attacker, effects: [] };
        this.defender = { ...defender, effects: [] };
    }

    public executeCombat(): CombatResult {
        this.turns = [];
        this.currentTurn = 1;

        // Reset health and stamina to max
        this.attacker.currentHealth = this.attacker.stats.maxHealth;
        this.attacker.currentStamina = this.attacker.stats.maxStamina;
        this.defender.currentHealth = this.defender.stats.maxHealth;
        this.defender.currentStamina = this.defender.stats.maxStamina;

        while (this.currentTurn <= this.maxTurns) {
            // Check if combat should end
            if (this.attacker.currentHealth <= 0 || this.defender.currentHealth <= 0) {
                break;
            }

            // Determine turn order based on agility
            const attackerGoesFirst = this.attacker.stats.agility >= this.defender.stats.agility;

            if (attackerGoesFirst) {
                this.executeTurn(this.attacker, this.defender);
                if (this.defender.currentHealth > 0) {
                    this.executeTurn(this.defender, this.attacker);
                }
            } else {
                this.executeTurn(this.defender, this.attacker);
                if (this.attacker.currentHealth > 0) {
                    this.executeTurn(this.attacker, this.defender);
                }
            }

            this.currentTurn++;
        }

        return this.getCombatResult();
    }

    private executeTurn(activePlayer: CombatParticipant, targetPlayer: CombatParticipant): void {
        // Apply ongoing effects first
        this.applyOngoingEffects(activePlayer);
        this.applyOngoingEffects(targetPlayer);

        // Skip turn if stunned
        if (this.hasEffect(activePlayer, 'stun')) {
            this.addTurn(activePlayer, targetPlayer, {
                type: 'skip',
                staminaCost: 0
            }, [], `${activePlayer.name} bị choáng và mất lượt!`);
            this.removeEffect(activePlayer, 'stun');
            return;
        }

        // Check stamina for attack
        const staminaCost = 20;
        if (activePlayer.currentStamina < staminaCost) {
            // Rest to recover stamina
            const staminarecovery = Math.min(30, activePlayer.stats.maxStamina - activePlayer.currentStamina);
            activePlayer.currentStamina += staminarecovery;

            this.addTurn(activePlayer, targetPlayer, {
                type: 'defend',
                staminaCost: 0
            }, [], `${activePlayer.name} nghỉ ngơi và hồi ${staminarecovery} stamina`);
            return;
        }

        // Execute basic attack
        const action: CombatAction = {
            type: 'attack',
            staminaCost: staminaCost,
            damage: 0,
            isDodged: false,
            isCritical: false,
            isMultiStrike: false,
            isCounterAttack: false
        };
        const effects: CombatTurnEffect[] = [];
        let message = '';

        // Apply dodge check
        if (this.checkDodge(targetPlayer, activePlayer)) {
            action.isDodged = true;
            message = `${activePlayer.name} tấn công nhưng ${targetPlayer.name} né tránh!`;
        } else {
            // Calculate damage
            let damage = this.calculateDamage(activePlayer, targetPlayer);

            // Apply critical hit
            if (this.checkCritical(activePlayer)) {
                damage *= 2;
                action.isCritical = true;
                message += `💥 Bạo kích! `;
            }

            // Apply multi-strike
            if (this.checkMultiStrike(activePlayer)) {
                const strikes = Math.floor(Math.random() * 3) + 2; // 2-4 strikes
                damage *= (1 + (strikes - 1) * 0.3);
                action.isMultiStrike = true;
                action.multiStrikeCount = strikes;
                message += `⚡ Liên kích ${strikes} đòn! `;
            }

            action.damage = Math.floor(damage);
            targetPlayer.currentHealth -= action.damage;

            message += `${activePlayer.name} gây ${action.damage} sát thương lên ${targetPlayer.name}`;

            // Apply lifesteal
            if (this.checkLifeSteal(activePlayer)) {
                const healAmount = Math.floor(action.damage * 0.25);
                activePlayer.currentHealth = Math.min(
                    activePlayer.stats.maxHealth,
                    activePlayer.currentHealth + healAmount
                );
                effects.push({
                    type: 'lifesteal',
                    value: healAmount,
                    stacks: 1,
                    duration: 1,
                    targetId: activePlayer.id
                });
                message += `, hút ${healAmount} máu`;
            }

            // Apply elemental effects
            this.applyElementalEffects(activePlayer, targetPlayer, effects);

            // Check counter attack
            if (!action.isDodged && this.checkCounterAttack(targetPlayer) && targetPlayer.currentHealth > 0) {
                const counterDamage = Math.floor(this.calculateDamage(targetPlayer, activePlayer) * 0.7);
                activePlayer.currentHealth -= counterDamage;
                action.isCounterAttack = true;
                message += `. ${targetPlayer.name} phản kích gây ${counterDamage} sát thương!`;
            }
        }

        // Consume stamina
        activePlayer.currentStamina -= staminaCost;

        this.addTurn(activePlayer, targetPlayer, action, effects, message);
    }

    private calculateDamage(attacker: CombatParticipant, defender: CombatParticipant): number {
        const baseDamage = Math.max(1, attacker.stats.attack - defender.stats.defense);

        // Apply freeze debuff (reduce damage)
        if (this.hasEffect(attacker, 'freeze')) {
            const freezeStacks = this.getEffectStacks(attacker, 'freeze');
            return Math.floor(baseDamage * (1 - freezeStacks * 0.1)); // 10% reduction per stack
        }

        return baseDamage;
    }

    private checkDodge(defender: CombatParticipant, attacker: CombatParticipant): boolean {
        // Base dodge chance based on agility difference
        const agilityDiff = defender.stats.agility - attacker.stats.agility;
        const baseDodgeChance = Math.max(5, Math.min(30, 15 + agilityDiff * 2)); // 5-30% base chance

        return Math.random() * 100 < baseDodgeChance;
    }

    private checkCritical(attacker: CombatParticipant): boolean {
        return Math.random() * 100 < attacker.stats.criticalRate;
    }

    private checkMultiStrike(attacker: CombatParticipant): boolean {
        return Math.random() * 100 < attacker.stats.multiStrikeRate;
    }

    private checkLifeSteal(attacker: CombatParticipant): boolean {
        return Math.random() * 100 < attacker.stats.lifeStealRate;
    }

    private checkCounterAttack(defender: CombatParticipant): boolean {
        return Math.random() * 100 < defender.stats.counterAttackRate;
    }

    private applyElementalEffects(
        attacker: CombatParticipant,
        target: CombatParticipant,
        effects: CombatTurnEffect[]
    ): void {
        // Burn effect
        if (Math.random() * 100 < attacker.stats.burnRate) {
            const burnDamage = Math.floor(attacker.stats.attack * 0.2);
            this.addEffect(target, {
                type: 'burn',
                value: burnDamage,
                stacks: 1,
                remainingTurns: 3,
                stackable: true
            });
            effects.push({
                type: 'burn',
                value: burnDamage,
                stacks: 1,
                duration: 3,
                targetId: target.id
            });
        }

        // Poison effect
        if (Math.random() * 100 < attacker.stats.poisonRate) {
            const poisonDamage = Math.floor(attacker.stats.attack * 0.15);
            this.addEffect(target, {
                type: 'poison',
                value: poisonDamage,
                stacks: 1,
                remainingTurns: 5,
                stackable: true
            });
            effects.push({
                type: 'poison',
                value: poisonDamage,
                stacks: 1,
                duration: 5,
                targetId: target.id
            });
        }

        // Freeze effect
        if (Math.random() * 100 < attacker.stats.freezeRate) {
            this.addEffect(target, {
                type: 'freeze',
                value: 0,
                stacks: 1,
                remainingTurns: 2,
                stackable: true
            });
            effects.push({
                type: 'freeze',
                value: 0,
                stacks: 1,
                duration: 2,
                targetId: target.id
            });
        }

        // Stun effect
        if (Math.random() * 100 < attacker.stats.stunRate) {
            this.addEffect(target, {
                type: 'stun',
                value: 0,
                stacks: 1,
                remainingTurns: 1,
                stackable: false
            });
            effects.push({
                type: 'stun',
                value: 0,
                stacks: 1,
                duration: 1,
                targetId: target.id
            });
        }
    }

    private applyOngoingEffects(participant: CombatParticipant): void {
        const newEffects: CombatEffect[] = [];

        for (const effect of participant.effects) {
            if (effect.remainingTurns > 0) {
                switch (effect.type) {
                    case 'burn':
                    case 'poison':
                        const damage = effect.value * effect.stacks;
                        participant.currentHealth = Math.max(0, participant.currentHealth - damage);
                        break;

                    case 'heal_regen':
                        const healAmount = effect.value * effect.stacks;
                        participant.currentHealth = Math.min(
                            participant.stats.maxHealth,
                            participant.currentHealth + healAmount
                        );
                        break;
                }

                // Reduce duration
                effect.remainingTurns--;
                if (effect.remainingTurns > 0) {
                    newEffects.push(effect);
                }
            }
        }

        participant.effects = newEffects;
    }

    private addEffect(participant: CombatParticipant, newEffect: CombatEffect): void {
        if (newEffect.stackable) {
            // Find existing effect of same type
            const existingIndex = participant.effects.findIndex(e => e.type === newEffect.type);
            if (existingIndex >= 0) {
                participant.effects[existingIndex].stacks += newEffect.stacks;
                participant.effects[existingIndex].remainingTurns = Math.max(
                    participant.effects[existingIndex].remainingTurns,
                    newEffect.remainingTurns
                );
            } else {
                participant.effects.push(newEffect);
            }
        } else {
            // Replace existing effect
            const existingIndex = participant.effects.findIndex(e => e.type === newEffect.type);
            if (existingIndex >= 0) {
                participant.effects[existingIndex] = newEffect;
            } else {
                participant.effects.push(newEffect);
            }
        }
    }

    private hasEffect(participant: CombatParticipant, effectType: string): boolean {
        return participant.effects.some(e => e.type === effectType && e.remainingTurns > 0);
    }

    private getEffectStacks(participant: CombatParticipant, effectType: string): number {
        const effect = participant.effects.find(e => e.type === effectType && e.remainingTurns > 0);
        return effect ? effect.stacks : 0;
    }

    private removeEffect(participant: CombatParticipant, effectType: string): void {
        participant.effects = participant.effects.filter(e => e.type !== effectType);
    }

    private addTurn(
        attacker: CombatParticipant,
        defender: CombatParticipant,
        action: CombatAction,
        effects: CombatTurnEffect[],
        message: string
    ): void {
        const turn: CombatTurn = {
            turnNumber: this.currentTurn,
            attacker: {
                id: attacker.id,
                name: attacker.name,
                health: attacker.currentHealth,
                stamina: attacker.currentStamina,
                buffs: attacker.effects.filter(e => ['heal_regen', 'attack_boost', 'defense_boost'].includes(e.type)),
                debuffs: attacker.effects.filter(e => ['burn', 'poison', 'freeze', 'stun'].includes(e.type))
            },
            defender: {
                id: defender.id,
                name: defender.name,
                health: defender.currentHealth,
                stamina: defender.currentStamina,
                buffs: defender.effects.filter(e => ['heal_regen', 'attack_boost', 'defense_boost'].includes(e.type)),
                debuffs: defender.effects.filter(e => ['burn', 'poison', 'freeze', 'stun'].includes(e.type))
            },
            action,
            effects,
            message
        };

        this.turns.push(turn);
    }

    private getCombatResult(): CombatResult {
        let winner: 'attacker' | 'defender' | 'draw';

        if (this.attacker.currentHealth <= 0 && this.defender.currentHealth <= 0) {
            winner = 'draw';
        } else if (this.attacker.currentHealth <= 0) {
            winner = 'defender';
        } else if (this.defender.currentHealth <= 0) {
            winner = 'attacker';
        } else {
            // Timeout - winner is whoever has more health percentage
            const attackerHealthPercent = this.attacker.currentHealth / this.attacker.stats.maxHealth;
            const defenderHealthPercent = this.defender.currentHealth / this.defender.stats.maxHealth;

            if (attackerHealthPercent > defenderHealthPercent) {
                winner = 'attacker';
            } else if (defenderHealthPercent > attackerHealthPercent) {
                winner = 'defender';
            } else {
                winner = 'draw';
            }
        }

        return {
            winner,
            turns: this.turns.length,
            finalStats: {
                attacker: {
                    health: this.attacker.currentHealth,
                    stamina: this.attacker.currentStamina
                },
                defender: {
                    health: this.defender.currentHealth,
                    stamina: this.defender.currentStamina
                }
            },
            combatLog: this.turns
        };
    }
}
