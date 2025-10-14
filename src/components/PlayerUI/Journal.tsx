import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../game/state/store';

export const Journal: React.FC = () => {
  const journalEntries = useSelector((state: RootState) => state.game.journalEntries);
  const journalEndRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   journalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [journalEntries]);

  return (
    <div className="journal-container">
      <div className="journal-header">
        <h3>REAPER'S WHISPERS</h3>
        <div className="journal-ornament">⚰️</div>
      </div>
      <div className="journal-content">
        {journalEntries.map((entry, index) => (
          <div 
            key={index} 
            className={`journal-entry ${index === journalEntries.length - 1 ? 'new-entry' : ''}`}
          >
            <div className="entry-timestamp">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="entry-text">{entry}</div>
          </div>
        ))}
        <div ref={journalEndRef} />
      </div>
    </div>
  );
};