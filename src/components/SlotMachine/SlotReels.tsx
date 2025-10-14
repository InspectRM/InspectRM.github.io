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
  const [winAmount, setWinAmount] = useState(0);
  const spinIntervalRef = useRef<NodeJS.Timeout[]>([]);
  const spinTimeoutRef = useRef<NodeJS.Timeout[]>([]);
  const finalReelsRef = useRef<string[][] | null>(null);
  const animationFrameRef = useRef<number[]>([]);

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      spinIntervalRef.current?.forEach(interval => interval && clearInterval(interval));
      spinTimeoutRef.current?.forEach(timeout => timeout && clearTimeout(timeout));
      animationFrameRef.current?.forEach(frame => frame && cancelAnimationFrame(frame));
      
      spinIntervalRef.current = [];
      spinTimeoutRef.current = [];
      animationFrameRef.current = [];
    };
  }, []);

  // Reset win highlight after animation
  useEffect(() => {
    if (showWinHighlight) {
      const timer = setTimeout(() => setShowWinHighlight(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWinHighlight]);

  // Handle spin state changes
  useEffect(() => {
    if (isSpinning && lastSpinResult) {
      console.log('Starting spin animation with result:', lastSpinResult.reels);
      finalReelsRef.current = lastSpinResult.reels;
      setWinAmount(lastSpinResult.winAmount);
      startSpinning();
    } else {
      setDisplayReels(gameState.currentReels);
    }
  }, [isSpinning, gameState.currentReels, lastSpinResult]);

  const startSpinning = () => {
    console.log('Spin animation started');
    onSpinStart();
    setSpinningReels([true, true, true]);
    setShowWinHighlight(false);

    // Clear any existing intervals, timeouts, and animation frames
    spinIntervalRef.current?.forEach(interval => interval && clearInterval(interval));
    spinTimeoutRef.current?.forEach(timeout => timeout && clearTimeout(timeout));
    animationFrameRef.current?.forEach(frame => frame && cancelAnimationFrame(frame));
    
    spinIntervalRef.current = [];
    spinTimeoutRef.current = [];
    animationFrameRef.current = [];

    const symbols = Object.keys(SYMBOLS);
    let completedReels = 0;
    
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
      }, 80);

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
          completedReels++;
          
          // If all reels stopped, complete the spin
          if (completedReels === 3) {
            setTimeout(() => {
              console.log('All reels stopped, completing spin');
              completeSpin();
            }, 500);
          }
          
          return newSpinning;
        });
      }, 800 + reelIndex * 400);

      spinTimeoutRef.current.push(timeout);
    }
  };

  const completeSpin = () => {
    console.log('Complete spin called');
    
    // Prevent any focus changes that might cause scrolling
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
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
                    boxShadow: isWinning ? `0 0 25px ${symbol.color}, 0 0 50px ${symbol.color}` : 'none',
                    backgroundColor: isWinning ? `${symbol.color}30` : 'rgba(26, 26, 26, 0.9)',
                    transform: isSpinningThisReel ? 'scale(1.05)' : isWinning ? 'scale(1.15)' : 'scale(1)',
                    transition: isSpinningThisReel ? 'all 0.1s ease' : 'all 0.4s ease',
                    zIndex: isWinning ? 10 : 1
                  }}
                >
                  <span 
                    className="symbol-emoji"
                    style={{
                      filter: isSpinningThisReel ? 'blur(1px) brightness(1.3)' : isWinning ? 'brightness(1.5)' : 'none',
                      transform: isSpinningThisReel ? 'rotate(5deg)' : isWinning ? 'scale(1.2)' : 'rotate(0deg)',
                      transition: 'all 0.3s ease'
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

      {/* Enhanced Win Display */}
      {showWinHighlight && lastSpinResult && lastSpinResult.winAmount > 0 && (
        <div className="win-display-overlay enhanced-win">
          <div className="win-message">
            <h3 className="win-title">🎉 VICTORY! 🎉</h3>
            <div className="win-amount-display">
              <span className="win-amount">{winAmount}</span>
              <span className="win-label">SOULS CLAIMED!</span>
            </div>
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
            <div className="win-celebration">
              {winAmount > 30 ? '✨ AMAZING! ✨' : 
               winAmount > 15 ? '⭐ GREAT! ⭐' : 
               winAmount > 5 ? '👍 NICE! 👍' : '✓ GOOD! ✓'}
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