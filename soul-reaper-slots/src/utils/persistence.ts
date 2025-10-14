// src/utils/persistence.ts
import localForage from 'localforage';

export class GamePersistence {
  private storage = localForage.createInstance({
    name: 'soul-reaper-slots'
  });

  async saveGame(state: GameState) {
    try {
      await this.storage.setItem('gameState', state);
      await this.storage.setItem('lastSaved', Date.now());
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }

  async loadGame(): Promise<GameState | null> {
    try {
      return await this.storage.getItem('gameState');
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  async exportSave(): Promise<string> {
    const state = await this.loadGame();
    return btoa(JSON.stringify(state));
  }

  async importSave(encodedData: string): Promise<boolean> {
    try {
      const state = JSON.parse(atob(encodedData));
      await this.saveGame(state);
      return true;
    } catch {
      return false;
    }
  }
}