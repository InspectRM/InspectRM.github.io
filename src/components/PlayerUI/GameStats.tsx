import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../game/state/store';

export const GameStats: React.FC = () => {
  const gameState = useSelector((state: RootState) => state.game);

  const winRate = gameState.totalSpins > 0 
    ? ((gameState.totalWins / gameState.totalSpins) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="game-stats">
      <div className="stats-header">
        <h4>SOUL LEDGER</h4>
      </div>
      
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-name">Total Spins</span>
          <span className="stat-value">{gameState.totalSpins}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-name">Wins</span>
          <span className="stat-value">{gameState.totalWins}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-name">Win Rate</span>
          <span className="stat-value">{winRate}%</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-name">Biggest Win</span>
          <span className="stat-value">{gameState.biggestWin}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-name">Upgrades</span>
          <span className="stat-value">{gameState.unlockedUpgrades.length}</span>
        </div>
        
        <div className="stat-item">
          <span className="stat-name">Total Biscuits</span>
          <span className="stat-value">{gameState.biscuits}</span>
        </div>
      </div>
    </div>
  );
};