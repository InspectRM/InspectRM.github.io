// src/components/SlotMachine/SlotReels.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../game/state/store';
import { SYMBOLS } from '../../game/state/gameSlice';
import type { SpinResult } from '../../game/state/gameSlice';

interface SlotReelsProps {
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinComplete: () => void;
  lastSpinResult?: SpinResult;
}

export const SlotReels: React.FC<SlotReelsProps> = ({ 
  isSpinning, 
  onSpinStart, 
  onSpinComplete,
  lastSpinResult
}) => {
  const gameState = useSelector((state: RootState) => state.game);
  
  const [displayReels, setDisplayReels] = useState<string[][]>(gameState.currentReels);
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
  const [showWinHighlight, setShowWinHighlight] = useState(false);
  const spinIntervalRef = useRef<NodeJS.Timeout[]>([]);
  const spinTimeoutRef = useRef<NodeJS.Timeout[]>([]);
  const finalReelsRef = useRef<string[][] | null>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      spinIntervalRef.current?.forEach(interval => interval && clearInterval(interval));
      spinTimeoutRef.current?.forEach(timeout => timeout && clearTimeout(timeout));
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
    if (isSpinning && lastSpinResult) {
      console.log('Starting spin animation with result:', lastSpinResult.reels);
      finalReelsRef.current = lastSpinResult.reels;
      startSpinning();
    } else {
      // When not spinning, ensure display matches current reels
      setDisplayReels(gameState.currentReels);
    }
  }, [isSpinning, gameState.currentReels, lastSpinResult]);

  const startSpinning = () => {
    console.log('Spin animation started');
    onSpinStart();
    setSpinningReels([true, true, true]);
    setShowWinHighlight(false);

    // Clear any existing intervals
    spinIntervalRef.current?.forEach(interval => interval && clearInterval(interval));
    spinTimeoutRef.current?.forEach(timeout => timeout && clearTimeout(timeout));
    spinIntervalRef.current = [];
    spinTimeoutRef.current = [];

    const symbols = Object.keys(SYMBOLS);
    
    for (let reelIndex = 0; reelIndex < 3; reelIndex++) {
      // Fast spinning phase
      const interval = setInterval(() => {
        setDisplayReels(prev => {
          const newReels = [...prev];
          newReels[reelIndex] = Array(3).fill(0).map(() => 
            symbols[Math.floor(Math.random() * symbols.length)]
          );
          return newReels;
        });
      }, 80); // Faster spinning for better effect

      spinIntervalRef.current.push(interval);

      // Stop this reel after delay
      const timeout = setTimeout(() => {
        clearInterval(interval);
        
        // Set this reel to the final result
        if (finalReelsRef.current) {
          setDisplayReels(prev => {
            const newReels = [...prev];
            newReels[reelIndex] = [...finalReelsRef.current![reelIndex]];
            return newReels;
          });
        }

        setSpinningReels(prev => {
          const newSpinning = [...prev];
          newSpinning[reelIndex] = false;
          return newSpinning;
        });

        // If all reels stopped, complete the spin
        if (reelIndex === 2) {
          setTimeout(() => {
            console.log('All reels stopped, completing spin');
            completeSpin();
          }, 500); // Slightly longer delay for dramatic effect
        }
      }, 800 + reelIndex * 400); // Staggered stopping

      spinTimeoutRef.current.push(timeout);
    }
  };

  const completeSpin = () => {
    console.log('Complete spin called');
    
    // Ensure we're showing the final reels
    if (finalReelsRef.current) {
      setDisplayReels(finalReelsRef.current);
      
      if (lastSpinResult?.winningCombos && lastSpinResult.winningCombos.length > 0) {
        console.log('Winning combos found:', lastSpinResult.winningCombos);
        setShowWinHighlight(true);
      }
    }

    // Clear the final reels reference
    finalReelsRef.current = null;
    
    onSpinComplete();
  };

  const isWinningPosition = (reelIndex: number, symbolIndex: number): boolean => {
    if (!showWinHighlight || !lastSpinResult?.winningCombos) return false;
    
    return lastSpinResult.winningCombos.some(combo =>
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
              const isSpinningThisReel = spinningReels[reelIndex];
              
              return (
                <div
                  key={symbolIndex}
                  className={`symbol ${symbolId} ${isWinning ? 'winning' : ''} ${
                    isSpinningThisReel ? 'symbol-spinning' : ''
                  }`}
                  style={{ 
                    borderColor: symbol.color,
                    boxShadow: isWinning ? `0 0 20px ${symbol.color}, 0 0 40px ${symbol.color}` : 'none',
                    backgroundColor: isWinning ? `${symbol.color}20` : 'rgba(26, 26, 26, 0.9)',
                    transform: isSpinningThisReel ? 'scale(1.05)' : 'scale(1)',
                    transition: isSpinningThisReel ? 'all 0.1s ease' : 'all 0.3s ease'
                  }}
                >
                  <span 
                    className="symbol-emoji"
                    style={{
                      filter: isSpinningThisReel ? 'blur(1px) brightness(1.3)' : 'none',
                      transform: isSpinningThisReel ? 'rotate(5deg)' : 'rotate(0deg)'
                    }}
                  >
                    {symbol.emoji}
                  </span>
                  
                  {/* Win Effects */}
                  {isWinning && !isSpinningAnyReel && (
                    <>
                      <div className="win-sparkle"></div>
                      <div className="win-glow"></div>
                    </>
                  )}
                  
                  {/* Spin Effect */}
                  {isSpinningThisReel && (
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
      {showWinHighlight && lastSpinResult?.winningCombos && lastSpinResult.winningCombos.length > 0 && (
        <div className="win-display-overlay">
          <div className="win-message">
            <h3 className="win-title">SOULS CLAIMED!</h3>
            <div className="win-details">
              {lastSpinResult.winningCombos.map((combo, index) => (
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
    {showWinHighlight && gameState.activePatterns && gameState.activePatterns.length > 0 && (
      <div className="active-patterns-overlay">
        <div className="patterns-display">
          <h4 className="patterns-title">ACTIVE PATTERNS</h4>
          <div className="patterns-list">
            {gameState.activePatterns.map((pattern, index) => (
              <div key={index} className="active-pattern">
                <span className="pattern-name">{pattern.name}</span>
                <span className="pattern-multiplier">x{pattern.multiplier}</span>
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