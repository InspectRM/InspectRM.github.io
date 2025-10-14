import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../game/state/store';
import { placeBet, resolveSpin } from '../game/state/gameSlice';
import { SlotReels } from './SlotMachine/SlotReels';
import { PlayerHUD } from './PlayerUI/PlayerHUD';
import { Journal } from './PlayerUI/Journal';
import { UpgradeShop } from './UpgradeShop/UpgradeShop';
import { GameStats } from './PlayerUI/GameStats';

export const GameManager: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);

  const handleSpin = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (gameState.isSpinning || gameState.souls < gameState.currentBet) return;
    
    console.log('Spin button clicked');
    
    // Just dispatch placeBet - the calculation happens in the slice
    dispatch(placeBet());
  };

  const handleSpinStart = () => {
    console.log('Spin animation started');
  };

  const handleSpinComplete = () => {
    console.log('Spin animation completed, resolving spin');
    // Resolve the spin with the pre-stored result
    dispatch(resolveSpin());
  };

  return (
    <div className="game-container">
      {/* Horror Overlay */}
      <div 
        className="horror-overlay" 
        style={{ 
          opacity: gameState.horrorMeter / 200,
          background: `radial-gradient(circle at 50% 50%, 
            transparent 0%, 
            rgba(139, 0, 0, ${gameState.horrorMeter / 100}) 70%)`
        }} 
      />
      
      {/* Background Pattern */}
      <div className="background-pattern"></div>

      {/* Main Layout */}
      <div className="game-layout">
        {/* Left Sidebar */}
        <div className="sidebar left-sidebar">
          <PlayerHUD />
          <GameStats />
        </div>

        {/* Center Game Area */}
        <div className="main-game-area">
          <div className="game-header">
            <h1 className="game-title">SOUL REAPER SLOTS</h1>
            <p className="game-subtitle">Your soul is the ante. Death is the dealer.</p>
          </div>

          <SlotReels 
            isSpinning={gameState.isSpinning}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            lastSpinResult={gameState.lastSpinResult}
          />

          <div className="spin-controls">
            <button 
              className="spin-button"
              onClick={handleSpin}
              disabled={gameState.isSpinning || gameState.souls < gameState.currentBet}
            >
              {gameState.isSpinning ? 'REAPING SOULS...' : `OFFER ${gameState.currentBet} SOULS`}
            </button>
          </div>

          <UpgradeShop />
        </div>

        {/* Right Sidebar */}
        <div className="sidebar right-sidebar">
          <Journal />
        </div>
      </div>

      {/* Footer */}
      <div className="game-footer">
        <div className="footer-note">
          The Reaper watches... and waits for your next offering
        </div>
      </div>
    </div>
  );
};