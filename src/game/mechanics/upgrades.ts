// src/game/mechanics/upgrades.ts
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'slot' | 'satisfaction' | 'horror';
  effect: (gameState: GameState) => GameState;
}

export const UPGRADES: Upgrade[] = [
  {
    id: 'lucky_charm',
    name: "Reaper's Favor",
    description: "Slightly increases win chances",
    cost: 50,
    type: 'slot',
    effect: (state) => ({ ...state, reaperSatisfaction: state.reaperSatisfaction + 5 })
  },
  {
    id: 'soul_harvest',
    name: "Soul Harvest",
    description: "Gain +1 soul on every spin",
    cost: 100,
    type: 'slot',
    effect: (state) => ({ ...state, souls: state.souls + 1 })
  },
  {
    id: 'biscuit_offering',
    name: "Biscuit Altar",
    description: "Convert souls to biscuits for special bonuses",
    cost: 200,
    type: 'satisfaction',
    effect: (state) => ({ 
      ...state, 
      biscuits: state.biscuits + Math.floor(state.souls / 10),
      souls: state.souls % 10
    })
  }
];