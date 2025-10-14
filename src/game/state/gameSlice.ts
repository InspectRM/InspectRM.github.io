// src/game/state/gameSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

export interface WinPattern {
  id: string;
  name: string;
  description: string;
  positions: number[][]; // [[reel, row], [reel, row], ...]
  multiplier: number;
  type: 'horizontal' | 'vertical' | 'diagonal' | 'special';
}

export interface SpinResult {
  reels: string[][];
  winAmount: number;
  horrorIncrease: number;
  satisfactionChange: number;
  newJournalEntry?: string;
  winningCombos: WinningCombo[];
  activePatterns: WinPattern[];
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
  lastSpinResult?: SpinResult;
  activePatterns: WinPattern[];
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
  biggestWin: 0,
  activePatterns: []
};

// Symbol configurations
export const SYMBOLS: { [key: string]: Symbol } = {
  skull: { 
    id: 'skull', 
    weight: 25,  // Increased from 20
    payout: 2, 
    horrorEffect: 'skull_reveal', 
    satisfactionChange: 1,
    emoji: '💀',
    color: '#8B0000'
  },
  soul: { 
    id: 'soul', 
    weight: 20,  // Increased from 15
    payout: 3, 
    horrorEffect: 'soul_harvest', 
    satisfactionChange: 2,
    emoji: '👻',
    color: '#4B0082'
  },
  biscuit: { 
    id: 'biscuit', 
    weight: 15,  // Increased from 10
    payout: 5, 
    horrorEffect: 'biscuit_offer', 
    satisfactionChange: 5,
    emoji: '🍪',
    color: '#D2691E'
  },
  reaper: { 
    id: 'reaper', 
    weight: 10,  // Increased from 5
    payout: 10, 
    horrorEffect: 'reaper_appear', 
    satisfactionChange: 10,
    emoji: '⚰️',
    color: '#000000'
  },
  void: { 
    id: 'void', 
    weight: 30,  // Reduced from 50
    payout: 0, 
    horrorEffect: 'void_whisper', 
    satisfactionChange: -1,
    emoji: '🌀',
    color: '#2F4F4F'
  }
};

// Define win patterns
export const WIN_PATTERNS: WinPattern[] = [
  // Horizontal Lines
  {
    id: 'horizontal-1',
    name: 'Top Line',
    description: 'Match symbols across the top row',
    positions: [[0, 0], [1, 0], [2, 0]],
    multiplier: 1,
    type: 'horizontal'
  },
  {
    id: 'horizontal-2',
    name: 'Center Line',
    description: 'Match symbols across the center row',
    positions: [[0, 1], [1, 1], [2, 1]],
    multiplier: 1.5,
    type: 'horizontal'
  },
  {
    id: 'horizontal-3',
    name: 'Bottom Line',
    description: 'Match symbols across the bottom row',
    positions: [[0, 2], [1, 2], [2, 2]],
    multiplier: 1,
    type: 'horizontal'
  },
  // Vertical Lines
  {
    id: 'vertical-1',
    name: 'Left Column',
    description: 'Match symbols down the left column',
    positions: [[0, 0], [0, 1], [0, 2]],
    multiplier: 1.2,
    type: 'vertical'
  },
  {
    id: 'vertical-2',
    name: 'Center Column',
    description: 'Match symbols down the center column',
    positions: [[1, 0], [1, 1], [1, 2]],
    multiplier: 1.5,
    type: 'vertical'
  },
  {
    id: 'vertical-3',
    name: 'Right Column',
    description: 'Match symbols down the right column',
    positions: [[2, 0], [2, 1], [2, 2]],
    multiplier: 1.2,
    type: 'vertical'
  },
  // Diagonal Lines
  {
    id: 'diagonal-1',
    name: 'Main Diagonal',
    description: 'Match symbols diagonally top-left to bottom-right',
    positions: [[0, 0], [1, 1], [2, 2]],
    multiplier: 2,
    type: 'diagonal'
  },
  {
    id: 'diagonal-2',
    name: 'Anti-Diagonal',
    description: 'Match symbols diagonally top-right to bottom-left',
    positions: [[2, 0], [1, 1], [0, 2]],
    multiplier: 2,
    type: 'diagonal'
  },
  // Special Patterns
  {
    id: 'cross',
    name: 'Holy Cross',
    description: 'Match symbols in a cross pattern',
    positions: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
    multiplier: 3,
    type: 'special'
  },
  {
    id: 'corners',
    name: 'Four Corners',
    description: 'Match symbols in all four corners',
    positions: [[0, 0], [0, 2], [2, 0], [2, 2]],
    multiplier: 2.5,
    type: 'special'
  },
  {
    id: 'full-grid',
    name: 'Reaper\'s Blessing',
    description: 'Match symbols across entire grid',
    positions: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]],
    multiplier: 5,
    type: 'special'
  }
];

// Enhanced slot engine with BETTER win detection
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

    const checkWinningCombinations = (reels: string[][]): { winningCombos: WinningCombo[], activePatterns: WinPattern[] } => {
      const winningCombos: WinningCombo[] = [];
      const activePatterns: WinPattern[] = [];

      // NEW: First check for basic horizontal lines (traditional slot wins)
      for (let row = 0; row < 3; row++) {
        const firstSymbol = reels[0][row];
        if (firstSymbol === 'void') continue; // Skip voids for basic lines
        
        // Check if all reels in this row have the same symbol
        const allMatch = reels[1][row] === firstSymbol && reels[2][row] === firstSymbol;
        
        if (allMatch) {
          winningCombos.push({
            symbol: firstSymbol,
            count: 3,
            payout: SYMBOLS[firstSymbol].payout,
            positions: [[0, row], [1, row], [2, row]]
          });
          
          // Add corresponding horizontal pattern
          const patternId = `horizontal-${row + 1}`;
          const pattern = WIN_PATTERNS.find(p => p.id === patternId);
          if (pattern) {
            activePatterns.push(pattern);
          }
        }
      }

      // NEW: Check for vertical lines
      for (let col = 0; col < 3; col++) {
        const firstSymbol = reels[col][0];
        if (firstSymbol === 'void') continue;
        
        const allMatch = reels[col][1] === firstSymbol && reels[col][2] === firstSymbol;
        
        if (allMatch) {
          winningCombos.push({
            symbol: firstSymbol,
            count: 3,
            payout: SYMBOLS[firstSymbol].payout * 1.2, // Bonus for vertical
            positions: [[col, 0], [col, 1], [col, 2]]
          });
          
          const patternId = `vertical-${col + 1}`;
          const pattern = WIN_PATTERNS.find(p => p.id === patternId);
          if (pattern) {
            activePatterns.push(pattern);
          }
        }
      }

      // Check special patterns (diagonals and special shapes)
      WIN_PATTERNS.forEach(pattern => {
        // Skip basic horizontals and verticals we already checked
        if (pattern.type === 'horizontal' || pattern.type === 'vertical') return;
        
        const positions = pattern.positions;
        const firstSymbol = reels[positions[0][0]][positions[0][1]];
        
        // Allow void in special patterns but with reduced payout
        if (firstSymbol === 'void') return;
        
        const allMatch = positions.every(([reel, row]) => reels[reel][row] === firstSymbol);
        
        if (allMatch) {
          winningCombos.push({
            symbol: firstSymbol,
            count: positions.length,
            payout: SYMBOLS[firstSymbol].payout * pattern.multiplier,
            positions: positions
          });
          
          activePatterns.push(pattern);
        }
      });

      // NEW: Check for 2-of-a-kind wins (more forgiving)
      for (let row = 0; row < 3; row++) {
        const symbolsInRow = [reels[0][row], reels[1][row], reels[2][row]];
        const symbolCounts: { [key: string]: number } = {};
        
        symbolsInRow.forEach(symbol => {
          if (symbol !== 'void') {
            symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
          }
        });
        
        // Check for 2 matching symbols (not void)
        Object.entries(symbolCounts).forEach(([symbol, count]) => {
          if (count >= 2) {
            const positions = [];
            for (let i = 0; i < 3; i++) {
              if (reels[i][row] === symbol) {
                positions.push([i, row]);
              }
            }
            
            winningCombos.push({
              symbol: symbol,
              count: count,
              payout: SYMBOLS[symbol].payout * 0.5 * count, // Half payout for partial wins
              positions: positions
            });
          }
        });
      }

      return { winningCombos, activePatterns };
    };

    const calculateTotalWin = (winningCombos: WinningCombo[], betAmount: number): number => {
      let totalWin = 0;
      
      winningCombos.forEach(combo => {
        totalWin += combo.payout * betAmount;
      });
      
      // NEW: Small consolation for no wins
      if (totalWin === 0) {
        // Check if there are any non-void symbols
        const hasNonVoid = winningCombos.some(combo => combo.symbol !== 'void');
        if (!hasNonVoid) {
          totalWin = betAmount * 0.1; // 10% refund for all voids
        }
      }
      
      // Jackpot for all reapers
      if (winningCombos.length > 0 && winningCombos.every(combo => combo.symbol === 'reaper')) {
        totalWin += 1000 * betAmount;
      }
      
      return Math.floor(totalWin);
    };

    const calculateHorrorIncrease = (winningCombos: WinningCombo[]): number => {
      let horror = 0;
      
      winningCombos.forEach(combo => {
        horror += SYMBOLS[combo.symbol].payout;
      });
      
      // NEW: Less horror for small wins, more for big wins
      return Math.min(horror * 2, 25);
    };

    const calculateSatisfactionChange = (winningCombos: WinningCombo[]): number => {
      if (winningCombos.length === 0) return -2;
      
      let satisfaction = 0;
      winningCombos.forEach(combo => {
        satisfaction += SYMBOLS[combo.symbol].satisfactionChange;
      });
      
      return satisfaction;
    };

    const generateJournalEntry = (winAmount: number, winningCombos: WinningCombo[], activePatterns: WinPattern[]): string => {
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
        if (activePatterns.some(pattern => pattern.id === 'full-grid')) {
          return 'THE REAPER SMILES! Ultimate blessing upon you!';
        }
        return 'DEATH SMILES UPON YOU! The Reaper is pleased.';
      }
      
      if (winningCombos.some(combo => combo.symbol === 'biscuit')) {
        return 'A biscuit offering! The Reaper accepts your tribute.';
      }
      
      if (winningCombos.length > 1) {
        return 'Multiple blessings! The underworld favors you.';
      }
      
      // NEW: Different messages based on win size
      if (winAmount > 50) {
        return 'A substantial offering! The Reaper nods in approval.';
      } else if (winAmount > 20) {
        return 'The spirits grant you a worthy boon...';
      } else {
        const winEntries = [
          'A whisper of power flows through you...',
          'The darkness yields its secrets...',
          'Souls gather at your command...',
          'A small victory in the endless night...'
        ];
        return winEntries[Math.floor(Math.random() * winEntries.length)];
      }
    };

    const reels = generateReels();
    const { winningCombos, activePatterns } = checkWinningCombinations(reels);
    const winAmount = calculateTotalWin(winningCombos, bet);
    const horrorIncrease = calculateHorrorIncrease(winningCombos);
    
    console.log('Spin Results:', {
      reels,
      winningCombos: winningCombos.map(wc => ({
        symbol: wc.symbol,
        payout: wc.payout,
        count: wc.count
      })),
      totalWin: winAmount
    });
    
    return {
      reels,
      winAmount,
      horrorIncrease,
      satisfactionChange: calculateSatisfactionChange(winningCombos),
      winningCombos,
      activePatterns,
      newJournalEntry: generateJournalEntry(winAmount, winningCombos, activePatterns)
    };
  }
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    placeBet: (state) => {
      if (state.souls >= state.currentBet && !state.isSpinning) {
        const result = simpleSlotEngine.calculateSpinResult(
          state.currentBet,
          state.unlockedUpgrades
        );
        
        console.log('Spin result calculated in slice:', result);
        
        state.souls -= state.currentBet;
        state.isSpinning = true;
        state.totalSpins += 1;
        state.lastSpinResult = result;
        state.activePatterns = result.activePatterns;
      }
    },
    resolveSpin: (state) => {
      if (!state.lastSpinResult) return;
      
      const result = state.lastSpinResult;
      
      // Update all state first
      state.isSpinning = false;
      state.currentReels = result.reels;
      state.winningCombos = result.winningCombos;
      state.activePatterns = result.activePatterns;
      
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
        if (state.journalEntries.length >= 10) {
          state.journalEntries.shift();
        }
        state.journalEntries.push(result.newJournalEntry);
      }

      // Level up based on satisfaction
      if (state.reaperSatisfaction >= 100) {
        state.playerLevel += 1;
        state.reaperSatisfaction = 50;
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

      // Clear the stored result AFTER all updates are complete
      state.lastSpinResult = undefined;
    },
    purchaseUpgrade: (state, action: PayloadAction<Upgrade>) => {
      const upgrade = action.payload;
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
    loadGame: (state, action: PayloadAction<Partial<GameState>>) => {
      return { ...state, ...action.payload };
    },
    manualSpin: (state) => {
      if (!state.isSpinning) {
        const result = simpleSlotEngine.calculateSpinResult(state.currentBet);
        state.currentReels = result.reels;
        state.winningCombos = result.winningCombos;
        state.activePatterns = result.activePatterns;
        
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

// Export all types for easy importing
export type { Symbol, WinningCombo, SpinResult, Upgrade, GameState, WinPattern };