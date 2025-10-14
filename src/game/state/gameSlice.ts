// src/game/state/gameSlice.ts
import { createSlice } from '@reduxjs/toolkit';

// Define interfaces
export interface Symbol {
  id: string;
  weight: number;
  payout: number;
  horrorEffect: string;
  satisfactionChange: number;
  emoji: string;
  color: string;
}

export interface WinningCombo {
  symbol: string;
  count: number;
  payout: number;
  positions: number[][];
}

export interface SpinResult {
  reels: string[][];
  winAmount: number;
  horrorIncrease: number;
  satisfactionChange: number;
  newJournalEntry?: string;
  winningCombos: WinningCombo[];
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'slot' | 'satisfaction' | 'horror';
  satisfactionBonus: number;
}

export interface GameState {
  souls: number;
  biscuits: number;
  currentBet: number;
  isSpinning: boolean;
  playerLevel: number;
  unlockedUpgrades: string[];
  horrorMeter: number;
  journalEntries: string[];
  reaperSatisfaction: number;
  currentReels: string[][];
  winningCombos: WinningCombo[];
  totalSpins: number;
  totalWins: number;
  biggestWin: number;
}

const initialState: GameState = {
  souls: 100,
  biscuits: 0,
  currentBet: 1,
  isSpinning: false,
  playerLevel: 1,
  unlockedUpgrades: [],
  horrorMeter: 0,
  journalEntries: ['The Reaper awaits your offering...'],
  reaperSatisfaction: 50,
  currentReels: [
    ['void', 'void', 'void'],
    ['void', 'void', 'void'],
    ['void', 'void', 'void']
  ],
  winningCombos: [],
  totalSpins: 0,
  totalWins: 0,
  biggestWin: 0
};

// Symbol configurations
export const SYMBOLS: { [key: string]: Symbol } = {
  skull: { 
    id: 'skull', 
    weight: 20, 
    payout: 2, 
    horrorEffect: 'skull_reveal', 
    satisfactionChange: 1,
    emoji: '💀',
    color: '#8B0000'
  },
  soul: { 
    id: 'soul', 
    weight: 15, 
    payout: 3, 
    horrorEffect: 'soul_harvest', 
    satisfactionChange: 2,
    emoji: '👻',
    color: '#4B0082'
  },
  biscuit: { 
    id: 'biscuit', 
    weight: 10, 
    payout: 5, 
    horrorEffect: 'biscuit_offer', 
    satisfactionChange: 5,
    emoji: '🍪',
    color: '#D2691E'
  },
  reaper: { 
    id: 'reaper', 
    weight: 5, 
    payout: 10, 
    horrorEffect: 'reaper_appear', 
    satisfactionChange: 10,
    emoji: '⚰️',
    color: '#000000'
  },
  void: { 
    id: 'void', 
    weight: 50, 
    payout: 0, 
    horrorEffect: 'void_whisper', 
    satisfactionChange: -1,
    emoji: '🌀',
    color: '#2F4F4F'
  }
};

// Simple slot engine for the slice
export const simpleSlotEngine = {
  calculateSpinResult: (bet: number, upgrades: string[] = []): SpinResult => {
    const generateReels = (): string[][] => {
      const reels: string[][] = [];
      const symbols = Object.keys(SYMBOLS);
      
      for (let i = 0; i < 3; i++) {
        const reel: string[] = [];
        for (let j = 0; j < 3; j++) {
          const totalWeight = Object.values(SYMBOLS).reduce((sum, symbol) => sum + symbol.weight, 0);
          let random = Math.random() * totalWeight;
          let selectedSymbol = 'void';
          
          for (const symbol of Object.values(SYMBOLS)) {
            if (random < symbol.weight) {
              selectedSymbol = symbol.id;
              break;
            }
            random -= symbol.weight;
          }
          reel.push(selectedSymbol);
        }
        reels.push(reel);
      }
      return reels;
    };

    const checkWinningCombinations = (reels: string[][]): WinningCombo[] => {
      const winningCombos: WinningCombo[] = [];
      
      // Check horizontal lines
      for (let row = 0; row < 3; row++) {
        const symbol = reels[0][row];
        if (reels[1][row] === symbol && reels[2][row] === symbol && symbol !== 'void') {
          winningCombos.push({
            symbol,
            count: 3,
            payout: SYMBOLS[symbol].payout,
            positions: [[0, row], [1, row], [2, row]]
          });
        }
      }
      
      // Check vertical lines
      for (let col = 0; col < 3; col++) {
        const symbol = reels[col][0];
        if (reels[col][1] === symbol && reels[col][2] === symbol && symbol !== 'void') {
          winningCombos.push({
            symbol,
            count: 3,
            payout: SYMBOLS[symbol].payout,
            positions: [[col, 0], [col, 1], [col, 2]]
          });
        }
      }
      
      // Check diagonal (top-left to bottom-right)
      const diag1Symbol = reels[0][0];
      if (reels[1][1] === diag1Symbol && reels[2][2] === diag1Symbol && diag1Symbol !== 'void') {
        winningCombos.push({
          symbol: diag1Symbol,
          count: 3,
          payout: SYMBOLS[diag1Symbol].payout,
          positions: [[0, 0], [1, 1], [2, 2]]
        });
      }
      
      // Check diagonal (top-right to bottom-left)
      const diag2Symbol = reels[2][0];
      if (reels[1][1] === diag2Symbol && reels[0][2] === diag2Symbol && diag2Symbol !== 'void') {
        winningCombos.push({
          symbol: diag2Symbol,
          count: 3,
          payout: SYMBOLS[diag2Symbol].payout,
          positions: [[2, 0], [1, 1], [0, 2]]
        });
      }
      
      return winningCombos;
    };

    const calculateTotalWin = (winningCombos: WinningCombo[], betAmount: number): number => {
      let totalWin = 0;
      
      winningCombos.forEach(combo => {
        totalWin += combo.payout * betAmount;
      });
      
      // Jackpot for all reapers
      if (winningCombos.length > 0 && winningCombos.every(combo => combo.symbol === 'reaper')) {
        totalWin += 1000 * betAmount;
      }
      
      return totalWin;
    };

    const calculateHorrorIncrease = (winningCombos: WinningCombo[]): number => {
      let horror = 0;
      
      winningCombos.forEach(combo => {
        horror += SYMBOLS[combo.symbol].payout * 2;
      });
      
      return Math.min(horror, 30);
    };

    const calculateSatisfactionChange = (winningCombos: WinningCombo[]): number => {
      let satisfaction = 0;
      
      winningCombos.forEach(combo => {
        satisfaction += SYMBOLS[combo.symbol].satisfactionChange;
      });
      
      return satisfaction || -2; // -2 if no wins
    };

    const generateJournalEntry = (winAmount: number, winningCombos: WinningCombo[]): string => {
      if (winAmount === 0) {
        const lostEntries = [
          'The void consumes your offering...',
          'Silence echoes in the chamber...',
          'The Reaper\'s gaze grows colder...',
          'Your soul feels lighter, but empty...'
        ];
        return lostEntries[Math.floor(Math.random() * lostEntries.length)];
      }
      
      if (winningCombos.some(combo => combo.symbol === 'reaper')) {
        return 'DEATH SMILES UPON YOU! The Reaper is pleased.';
      }
      
      if (winningCombos.some(combo => combo.symbol === 'biscuit')) {
        return 'A biscuit offering! The Reaper accepts your tribute.';
      }
      
      if (winningCombos.length > 1) {
        return 'Multiple blessings! The underworld favors you.';
      }
      
      const winEntries = [
        'The spirits grant you a small boon...',
        'A whisper of power flows through you...',
        'The darkness yields its secrets...',
        'Souls gather at your command...'
      ];
      return winEntries[Math.floor(Math.random() * winEntries.length)];
    };

    const reels = generateReels();
    const winningCombos = checkWinningCombinations(reels);
    const winAmount = calculateTotalWin(winningCombos, bet);
    const horrorIncrease = calculateHorrorIncrease(winningCombos);
    
    return {
      reels,
      winAmount,
      horrorIncrease,
      satisfactionChange: calculateSatisfactionChange(winningCombos),
      winningCombos,
      newJournalEntry: generateJournalEntry(winAmount, winningCombos)
    };
  }
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    placeBet: (state) => {
      if (state.souls >= state.currentBet && !state.isSpinning) {
        state.souls -= state.currentBet;
        state.isSpinning = true;
        state.totalSpins += 1;
      }
    },
    resolveSpin: (state, action) => {
      const result: SpinResult = action.payload;
      state.isSpinning = false;
      state.currentReels = result.reels;
      state.winningCombos = result.winningCombos;
      
      if (result.winAmount > 0) {
        state.souls += result.winAmount;
        state.reaperSatisfaction += result.satisfactionChange;
        state.totalWins += 1;
        
        if (result.winAmount > state.biggestWin) {
          state.biggestWin = result.winAmount;
        }
      } else {
        state.reaperSatisfaction += result.satisfactionChange;
      }
      
      state.horrorMeter = Math.min(100, state.horrorMeter + result.horrorIncrease);
      
      if (result.newJournalEntry) {
        // Keep only last 10 journal entries
        if (state.journalEntries.length >= 10) {
          state.journalEntries.shift();
        }
        state.journalEntries.push(result.newJournalEntry);
      }

      // Level up based on satisfaction
      if (state.reaperSatisfaction >= 100) {
        state.playerLevel += 1;
        state.reaperSatisfaction = 50; // Reset but keep some progress
        state.journalEntries.push(`LEVEL ${state.playerLevel}! The Reaper grants you greater favor.`);
      }

      // Game over if satisfaction drops too low
      if (state.reaperSatisfaction <= 0) {
        state.reaperSatisfaction = 0;
        state.journalEntries.push('WARNING: The Reaper grows impatient with your failures...');
      }

      // Horror meter effects
      if (state.horrorMeter >= 80) {
        state.journalEntries.push('The darkness whispers terrible secrets...');
      }
    },
    purchaseUpgrade: (state, action) => {
      const upgrade: Upgrade = action.payload;
      if (state.souls >= upgrade.cost) {
        state.souls -= upgrade.cost;
        state.unlockedUpgrades.push(upgrade.id);
        state.reaperSatisfaction += upgrade.satisfactionBonus;
        state.journalEntries.push(`Acquired: ${upgrade.name}`);
      }
    },
    incrementSouls: (state) => {
      state.souls += 10;
    },
    increaseBet: (state) => {
      if (state.currentBet < 10 && state.souls >= state.currentBet * 2) {
        state.currentBet += 1;
      }
    },
    decreaseBet: (state) => {
      if (state.currentBet > 1) {
        state.currentBet -= 1;
      }
    },
    offerBiscuits: (state) => {
      if (state.biscuits >= 5) {
        state.biscuits -= 5;
        state.reaperSatisfaction += 15;
        state.journalEntries.push('Offered biscuits to the Reaper. Satisfaction increased!');
      }
    },
    resetGame: () => initialState,
    loadGame: (state, action) => {
      return { ...state, ...action.payload };
    },
    // New action for manual spin (for testing)
    manualSpin: (state) => {
      if (!state.isSpinning) {
        const result = simpleSlotEngine.calculateSpinResult(state.currentBet);
        state.currentReels = result.reels;
        state.winningCombos = result.winningCombos;
        
        if (result.winAmount > 0) {
          state.souls += result.winAmount;
          state.reaperSatisfaction += result.satisfactionChange;
          state.totalWins += 1;
        } else {
          state.reaperSatisfaction += result.satisfactionChange;
        }
        
        state.horrorMeter = Math.min(100, state.horrorMeter + result.horrorIncrease);
        
        if (result.newJournalEntry) {
          if (state.journalEntries.length >= 10) {
            state.journalEntries.shift();
          }
          state.journalEntries.push(result.newJournalEntry);
        }
      }
    }
  }
});

// Available upgrades
export const UPGRADES: Upgrade[] = [
  {
    id: 'lucky_charm',
    name: "Reaper's Favor",
    description: "Slightly increases win chances",
    cost: 50,
    type: 'slot',
    satisfactionBonus: 5
  },
  {
    id: 'soul_harvest',
    name: "Soul Harvest",
    description: "Gain +1 soul on every win",
    cost: 100,
    type: 'slot',
    satisfactionBonus: 3
  },
  {
    id: 'biscuit_offering',
    name: "Biscuit Altar",
    description: "Convert souls to biscuits for special bonuses",
    cost: 200,
    type: 'satisfaction',
    satisfactionBonus: 10
  },
  {
    id: 'horror_resistance',
    name: "Eldritch Protection",
    description: "Reduces horror meter buildup",
    cost: 150,
    type: 'horror',
    satisfactionBonus: 5
  },
  {
    id: 'higher_stakes',
    name: "Damned Gambler",
    description: "Unlocks higher betting limits",
    cost: 300,
    type: 'slot',
    satisfactionBonus: 15
  }
];

export const { 
  placeBet, 
  resolveSpin, 
  purchaseUpgrade, 
  incrementSouls, 
  increaseBet,
  decreaseBet,
  offerBiscuits,
  resetGame, 
  loadGame,
  manualSpin
} = gameSlice.actions;

export default gameSlice.reducer;