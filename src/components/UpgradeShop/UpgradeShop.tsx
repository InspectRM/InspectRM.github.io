import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../game/state/store';
import { purchaseUpgrade, UPGRADES } from '../../game/state/gameSlice';

export const UpgradeShop: React.FC = () => {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const handlePurchase = (upgrade: any) => {
    dispatch(purchaseUpgrade(upgrade));
  };

  const canAfford = (cost: number) => gameState.souls >= cost;
  const isPurchased = (id: string) => gameState.unlockedUpgrades.includes(id);

  return (
    <div className={`upgrade-shop ${isShopOpen ? 'open' : ''}`}>
      <button 
        className="shop-toggle"
        onClick={() => setIsShopOpen(!isShopOpen)}
      >
        <span className="shop-icon">🛒</span>
        <span className="shop-label">DARK BAZAAR</span>
        <span className="shop-arrow">{isShopOpen ? '▼' : '▲'}</span>
      </button>

      {isShopOpen && (
        <div className="shop-content">
          <div className="shop-header">
            <h4>FORBIDDEN UPGRADES</h4>
            <p>Purchase favors from the underworld</p>
          </div>

          <div className="upgrades-grid">
            {UPGRADES.map((upgrade) => {
              const purchased = isPurchased(upgrade.id);
              const affordable = canAfford(upgrade.cost);

              return (
                <div 
                  key={upgrade.id}
                  className={`upgrade-card ${purchased ? 'purchased' : ''} ${
                    !purchased && !affordable ? 'unaffordable' : ''
                  }`}
                >
                  <div className="upgrade-header">
                    <h5>{upgrade.name}</h5>
                    <span className="upgrade-cost">
                      {purchased ? 'OWNED' : `${upgrade.cost} SOULS`}
                    </span>
                  </div>
                  
                  <p className="upgrade-description">{upgrade.description}</p>
                  
                  <div className="upgrade-type">
                    <span className={`type-badge ${upgrade.type}`}>
                      {upgrade.type.toUpperCase()}
                    </span>
                  </div>

                  {!purchased && (
                    <button
                      className={`purchase-btn ${affordable ? 'affordable' : 'unaffordable'}`}
                      onClick={() => handlePurchase(upgrade)}
                      disabled={!affordable}
                    >
                      {affordable ? 'PURCHASE' : 'NEED MORE SOULS'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};