// src/components/SlotMachine/SlotReels.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../game/state/store';
import { resolveSpin } from '../../game/state/gameSlice';
import { SYMBOLS } from '../../game/state/gameSlice';

interface SlotReelsProps {
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinComplete: () => void;
}

export const SlotReels: React.FC<SlotReelsProps> = ({ 
  isSpinning, 
  onSpinStart, 
  onSpinComplete 
}) => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  
  const [displayReels, setDisplayReels] = useState<string[][]>(gameState.currentReels);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
  const [showWinHighlight, setShowWinHighlight] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout[]>([]);
  const spinTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      spinIntervalRef.current.forEach(interval => clearInterval(interval));
      spinTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Reset win highlight after animation
  useEffect(() => {
    if (showWinHighlight) {
      const timer = setTimeout(() => setShowWinHighlight(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showWinHighlight]);

  // Handle spin state changes
  useEffect(() => {
    if (isSpinning) {
      startSpinning();
    } else {
      // If we were spinning but now stopped, ensure we show final reels
      setDisplayReels(gameState.currentReels);
    }
  }, [isSpinning, gameState.currentReels]);

  const startSpinning = () => {
    onSpinStart();
    setSpinningReels([true, true, true]);
    setShowWinHighlight(false);

    // Clear any existing intervals
    spinIntervalRef.current.forEach(interval => clearInterval(interval));
    spinTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
    spinIntervalRef.current = [];
    spinTimeoutRef.current = [];

    // Start spinning animation for all reels
    const symbols = Object.keys(SYMBOLS);
    
    for (let reelIndex = 0; reelIndex < 3; reelIndex++) {
      const interval = setInterval(() => {
        setDisplayReels(prev => {
          const newReels = [...prev];
          newReels[reelIndex] = Array(3).fill(0).map(() => 
            symbols[Math.floor(Math.random() * symbols.length)]
          );
          return newReels;
        });
      }, 100); // Fast spinning effect

      spinIntervalRef.current.push(interval);

      // Stop each reel with staggered timing
      const timeout = setTimeout(() => {
        clearInterval(interval);
        
        setSpinningReels(prev => {
          const newSpinning = [...prev];
          newSpinning[reelIndex] = false;
          return newSpinning;
        });

        // If all reels stopped, complete the spin
        if (reelIndex === 2) {
          setTimeout(() => {
            completeSpin();
          }, 500); // Brief pause after last reel stops
        }
      }, 1000 + reelIndex * 500); // Staggered stop times

      spinTimeoutRef.current.push(timeout);
    }
  };

  const completeSpin = () => {
    // Show final reels
    setDisplayReels(gameState.currentReels);
    
    // Show win animation if there are winning combos
    if (gameState.winningCombos && gameState.winningCombos.length > 0) {
      setShowWinHighlight(true);
    }

    onSpinComplete();
  };

  const isWinningPosition = (reelIndex: number, symbolIndex: number): boolean => {
    if (!showWinHighlight || !gameState.winningCombos) return false;
    
    return gameState.winningCombos.some(combo =>
      combo.positions.some(([reel, symbol]) => 
        reel === reelIndex && symbol === symbolIndex
      )
    );
  };

  const isSpinningAnyReel = spinningReels.some(spinning => spinning);

  return (
    <div className="slot-machine">
      {/* Paylines Overlay */}
      <div className="paylines-overlay">
        <div className="payline horizontal-1"></div>
        <div className="payline horizontal-2"></div>
        <div className="payline horizontal-3"></div>
        <div className="payline vertical-1"></div>
        <div className="payline vertical-2"></div>
        <div className="payline vertical-3"></div>
        <div className="payline diagonal-1"></div>
        <div className="payline diagonal-2"></div>
      </div>

      {/* Reels Container */}
      <div className="reels-container">
        {displayReels.map((reel, reelIndex) => (
          <div 
            key={reelIndex} 
            className={`reel ${spinningReels[reelIndex] ? 'spinning' : ''} ${
              isSpinningAnyReel ? 'reel-spinning' : ''
            }`}
          >
            {reel.map((symbolId, symbolIndex) => {
              const symbol = SYMBOLS[symbolId];
              const isWinning = isWinningPosition(reelIndex, symbolIndex);
              
              return (
                <div
                  key={symbolIndex}
                  className={`symbol ${symbolId} ${isWinning ? 'winning' : ''} ${
                    spinningReels[reelIndex] ? 'symbol-spinning' : ''
                  }`}
                  style={{ 
                    borderColor: symbol.color,
                    boxShadow: isWinning ? `0 0 20px ${symbol.color}, 0 0 40px ${symbol.color}` : 'none',
                    backgroundColor: isWinning ? `${symbol.color}20` : 'rgba(26, 26, 26, 0.9)'
                  }}
                >
                  <span className="symbol-emoji">{symbol.emoji}</span>
                  
                  {/* Win Effects */}
                  {isWinning && (
                    <>
                      <div className="win-sparkle"></div>
                      <div className="win-glow"></div>
                    </>
                  )}
                  
                  {/* Spin Effect */}
                  {spinningReels[reelIndex] && (
                    <div className="spin-trail"></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Frame and Decorations */}
      <div className="slot-frame">
        <div className="frame-top"></div>
        <div className="frame-bottom"></div>
        <div className="frame-left"></div>
        <div className="frame-right"></div>
        <div className="reel-separator-1"></div>
        <div className="reel-separator-2"></div>
      </div>

      {/* Win Display */}
      {showWinHighlight && gameState.winningCombos && gameState.winningCombos.length > 0 && (
        <div className="win-display-overlay">
          <div className="win-message">
            <h3 className="win-title">SOULS CLAIMED!</h3>
            <div className="win-details">
              {gameState.winningCombos.map((combo, index) => (
                <div key={index} className="win-combo">
                  <div className="combo-symbols">
                    {Array(combo.count).fill(0).map((_, i) => (
                      <span key={i} className="combo-symbol">
                        {SYMBOLS[combo.symbol].emoji}
                      </span>
                    ))}
                  </div>
                  <span className="combo-payout">
                    +{combo.payout * gameState.currentBet} souls
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spin Status */}
      <div className="spin-status">
        {isSpinningAnyReel ? (
          <div className="spinning-indicator">
            <div className="spinner"></div>
            <span>REAPING SOULS...</span>
          </div>
        ) : (
          <div className="ready-indicator">
            <span>READY TO SPIN</span>
          </div>
        )}
      </div>
    </div>
  );
};