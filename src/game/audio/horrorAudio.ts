// src/game/audio/horrorAudio.ts
import { Howl } from 'howler';

class HorrorAudio {
  private sounds: Map<string, Howl> = new Map();
  private bgm: Howl | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.loadSounds();
  }

  private loadSounds() {
    const soundConfigs = {
      spin: { src: ['/sounds/spin.wav'], volume: 0.5 },
      win: { src: ['/sounds/win.wav'], volume: 0.7 },
      lose: { src: ['/sounds/lose.wav'], volume: 0.3 },
      jumpscare: { src: ['/sounds/jumpscare.wav'], volume: 0.8 },
      reaper: { src: ['/sounds/reaper_laugh.wav'], volume: 0.6 }
    };

    Object.entries(soundConfigs).forEach(([key, config]) => {
      this.sounds.set(key, new Howl(config));
    });

    // Background ambiance
    this.bgm = new Howl({
      src: ['/sounds/horror_ambiance.mp3'],
      volume: 0.2,
      loop: true
    });
  }

  play(soundName: string) {
    if (this.isMuted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    }
  }

  startAmbiance() {
    this.bgm?.play();
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    Howler.mute(muted);
  }
}

export const audioManager = new HorrorAudio();