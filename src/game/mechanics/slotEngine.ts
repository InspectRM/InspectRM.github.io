// src/game/mechanics/slotEngine.ts
export interface Symbol {
  id: string;
  weight: number;
  payout: number;
  horrorEffect: string;
  satisfactionChange: number;
  emoji: string;
  color: string;
}

export interface SpinResult {
  reels: string[][];
  winAmount: number;
  horrorIncrease: number;
  satisfactionChange: number;
  newJournalEntry?: string;
  winningCombos: WinningCombo[];
}

export interface WinningCombo {
  symbol: string;
  count: number;
  payout: number;
  positions: number[][];
}

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

export class SlotEngine {
  private rtp: number = 0.75;
  private jackpotChance: number = 0.01;
  
  calculateSpinResult(bet: number, upgrades: string[]): SpinResult {
    const reels = this.generateReels();
    const winningCombos = this.checkWinningCombinations(reels);
    const winAmount = this.calculateTotalWin(winningCombos, bet);
    const horrorIncrease = this.calculateHorrorIncrease(winningCombos);
    
    return {
      reels,
      winAmount,
      horrorIncrease,
      satisfactionChange: this.calculateSatisfactionChange(winningCombos),
      winningCombos,
      newJournalEntry: this.generateJournalEntry(winAmount, winningCombos)
    };
  }
  
  private generateReels(): string[][] {
    const reels: string[][] = [];
    const symbols = Object.keys(SYMBOLS);
    
    for (let i = 0; i < 3; i++) {
      const reel: string[] = [];
      for (let j = 0; j < 3; j++) {
        const randomSymbol = this.weightedRandomSymbol();
        reel.push(randomSymbol);
      }
      reels.push(reel);
    }
    
    return reels;
  }
  
  private weightedRandomSymbol(): string {
    const totalWeight = Object.values(SYMBOLS).reduce((sum, symbol) => sum + symbol.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const symbol of Object.values(SYMBOLS)) {
      if (random < symbol.weight) {
        return symbol.id;
      }
      random -= symbol.weight;
    }
    
    return 'void';
  }
  
  private checkWinningCombinations(reels: string[][]): WinningCombo[] {
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
  }
  
  private calculateTotalWin(winningCombos: WinningCombo[], bet: number): number {
    let totalWin = 0;
    
    winningCombos.forEach(combo => {
      totalWin += combo.payout * bet;
    });
    
    // Jackpot for all reapers
    if (winningCombos.length > 0 && winningCombos.every(combo => combo.symbol === 'reaper')) {
      totalWin += 1000 * bet;
    }
    
    return totalWin;
  }
  
  private calculateHorrorIncrease(winningCombos: WinningCombo[]): number {
    let horror = 0;
    
    winningCombos.forEach(combo => {
      horror += SYMBOLS[combo.symbol].payout * 2;
    });
    
    return Math.min(horror, 30);
  }
  
  private calculateSatisfactionChange(winningCombos: WinningCombo[]): number {
    let satisfaction = 0;
    
    winningCombos.forEach(combo => {
      satisfaction += SYMBOLS[combo.symbol].satisfactionChange;
    });
    
    return satisfaction || -2; // -2 if no wins
  }
  
  private generateJournalEntry(winAmount: number, winningCombos: WinningCombo[]): string {
    if (winAmount === 0) {
      return 'The void consumes your offering...';
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
    
    return 'The spirits grant you a small boon...';
  }
}