// src/components/PlayerUI/PatternGuide.tsx
import React from 'react';
import { WIN_PATTERNS } from '../../game/state/gameSlice';

interface PatternGuideProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export const PatternGuide: React.FC<PatternGuideProps> = ({ isOpen = false, onToggle }) => {
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
                      {/* Visual representation of the pattern */}
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