// src/components/PlayerUI/PlayerHUD.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../game/state/store';
import { increaseBet, decreaseBet, offerBiscuits } from '../../game/state/gameSlice';
import { WIN_PATTERNS } from '../../game/state/gameSlice';

// Pattern Guide Component
const PatternGuide: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  const patternsByType = WIN_PATTERNS.reduce((acc, pattern) => {
    if (!acc[pattern.type]) acc[pattern.type] = [];
    acc[pattern.type].push(pattern);
    return acc;
  }, {} as Record<string, typeof WIN_PATTERNS>);

  return (
    <div className="pattern-guide">
      <button 
        className="guide-toggle"
        onClick={onToggle}
      >
        {isOpen ? 'HIDE PATTERNS' : 'SHOW WIN PATTERNS'}
      </button>
      
      {isOpen && (
        <div className="guide-content">
          <h4>Win Patterns & Multipliers</h4>
          
          {Object.entries(patternsByType).map(([type, patterns]) => (
            <div key={type} className="pattern-category">
              <h5 className="category-title">
                {type.charAt(0).toUpperCase() + type.slice(1)} Patterns
              </h5>
              
              <div className="patterns-grid">
                {patterns.map(pattern => (
                  <div key={pattern.id} className="pattern-card">
                    <div className="pattern-header">
                      <span className="pattern-name">{pattern.name}</span>
                      <span className="pattern-multiplier">x{pattern.multiplier}</span>
                    </div>
                    <div className="pattern-description">
                      {pattern.description}
                    </div>
                    <div className="pattern-visual">
                      <div className="pattern-grid">
                        {Array.from({ length: 9 }).map((_, index) => {
                          const row = Math.floor(index / 3);
                          const col = index % 3;
                          const isActive = pattern.positions.some(([reel, posRow]) => 
                            reel === col && posRow === row
                          );
                          
                          return (
                            <div
                              key={index}
                              className={`pattern-cell ${isActive ? 'active' : ''}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const PlayerHUD: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const [showPatterns, setShowPatterns] = useState(false);

  const handleIncreaseBet = () => {
    dispatch(increaseBet());
  };

  const handleDecreaseBet = () => {
    dispatch(decreaseBet());
  };

  const handleOfferBiscuits = () => {
    dispatch(offerBiscuits());
  };

  return (
    <div className="player-hud">
      {/* Main Stats */}
      <div className="hud-main-stats">
        <div className="hud-stat soul-counter">
          <div className="stat-icon">👻</div>
          <div className="stat-info">
            <span className="stat-label">SOULS</span>
            <span className="stat-value">{gameState.souls}</span>
          </div>
          <div className="stat-glow"></div>
        </div>

        <div className="hud-stat biscuit-counter">
          <div className="stat-icon">🍪</div>
          <div className="stat-info">
            <span className="stat-label">BISCUITS</span>
            <span className="stat-value">{gameState.biscuits}</span>
          </div>
          {gameState.biscuits >= 5 && (
            <button 
              className="offer-biscuits-btn"
              onClick={handleOfferBiscuits}
              title="Offer 5 biscuits to increase Reaper satisfaction"
            >
              OFFER
            </button>
          )}
        </div>
      </div>

      {/* Betting Controls */}
      <div className="betting-controls">
        <div className="bet-section">
          <span className="bet-label">SOUL OFFERING</span>
          <div className="bet-amount">
            <button 
              className="bet-btn decrease"
              onClick={handleDecreaseBet}
              disabled={gameState.currentBet <= 1}
            >
              -
            </button>
            <span className="current-bet">{gameState.currentBet}</span>
            <button 
              className="bet-btn increase"
              onClick={handleIncreaseBet}
              disabled={gameState.currentBet >= 10 || gameState.souls < gameState.currentBet * 2}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="status-bars">
        <div className="status-bar">
          <div className="bar-label">
            <span>REAPER'S FAVOR</span>
            <span>{gameState.reaperSatisfaction}/100</span>
          </div>
          <div className="bar-container">
            <div 
              className="bar-fill satisfaction-bar"
              style={{ width: `${gameState.reaperSatisfaction}%` }}
            >
              <div className="bar-glow"></div>
            </div>
          </div>
        </div>

        <div className="status-bar">
          <div className="bar-label">
            <span>HORROR</span>
            <span>{gameState.horrorMeter}%</span>
          </div>
          <div className="bar-container">
            <div 
              className="bar-fill horror-bar"
              style={{ width: `${gameState.horrorMeter}%` }}
            >
              <div className="bar-glow"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Player Level */}
      <div className="player-level">
        <div className="level-badge">
          <span className="level-label">LEVEL</span>
          <span className="level-value">{gameState.playerLevel}</span>
        </div>
      </div>

      {/* Pattern Guide */}
      <PatternGuide 
        isOpen={showPatterns}
        onToggle={() => setShowPatterns(!showPatterns)}
      />
    </div>
  );
};