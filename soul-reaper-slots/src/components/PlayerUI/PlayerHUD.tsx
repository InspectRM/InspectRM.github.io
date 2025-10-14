import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../game/state/store';
import { increaseBet, decreaseBet, offerBiscuits } from '../../game/state/gameSlice';

export const PlayerHUD: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);

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
    </div>
  );
};