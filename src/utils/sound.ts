import { Howl, Howler } from 'howler';

// Sound file paths (to be added to public/sounds/)
const SOUND_PATHS = {
  click: '/sounds/click.mp3',
  success: '/sounds/success.mp3',
  error: '/sounds/error.mp3',
  mint: '/sounds/mint.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  notification: '/sounds/notification.mp3',
  hover: '/sounds/hover.mp3',
  coin_flip: '/sounds/coin_flip.mp3',
  game_start: '/sounds/game_start.mp3',
  countdown: '/sounds/countdown.mp3',
  lightning: '/sounds/lightning.mp3',
  glitch: '/sounds/glitch.mp3',
} as const;

type SoundName = keyof typeof SOUND_PATHS;

class SoundEngine {
  private sounds: Map<SoundName, Howl> = new Map();
  private isEnabled: boolean = false;
  private volume: number = 0.5;
  private isInitialized: boolean = false;

  constructor() {
    // Initialize with user preference from localStorage
    if (typeof window !== 'undefined') {
      const savedEnabled = localStorage.getItem('hypercatz_sound_enabled');
      const savedVolume = localStorage.getItem('hypercatz_sound_volume');
      
      this.isEnabled = savedEnabled === 'true';
      this.volume = savedVolume ? parseFloat(savedVolume) : 0.5;
    }
  }

  // Initialize all sounds
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set global volume
      Howler.volume(this.volume);

      // Preload all sounds
      const soundPromises = Object.entries(SOUND_PATHS).map(([name, path]) => {
        return new Promise<void>((resolve, reject) => {
          const sound = new Howl({
            src: [path],
            volume: this.volume,
            preload: true,
            onload: () => {
              this.sounds.set(name as SoundName, sound);
              resolve();
            },
            onloaderror: (id, error) => {
              console.warn(`Failed to load sound: ${name}`, error);
              resolve(); // Don't reject, just continue without this sound
            },
          });
        });
      });

      await Promise.all(soundPromises);
      this.isInitialized = true;
      console.log('Sound engine initialized successfully');
    } catch (error) {
      console.error('Failed to initialize sound engine:', error);
    }
  }

  // Play a sound
  play(soundName: SoundName, options?: { volume?: number; rate?: number; loop?: boolean }): void {
    if (!this.isEnabled || !this.isInitialized) return;

    const sound = this.sounds.get(soundName);
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    try {
      // Apply options if provided
      if (options?.volume !== undefined) {
        sound.volume(options.volume);
      }
      if (options?.rate !== undefined) {
        sound.rate(options.rate);
      }
      if (options?.loop !== undefined) {
        sound.loop(options.loop);
      }

      sound.play();
    } catch (error) {
      console.error(`Failed to play sound: ${soundName}`, error);
    }
  }

  // Stop a sound
  stop(soundName: SoundName): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.stop();
    }
  }

  // Stop all sounds
  stopAll(): void {
    this.sounds.forEach(sound => sound.stop());
  }

  // Enable/disable sounds
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('hypercatz_sound_enabled', enabled.toString());
    }
    
    if (!enabled) {
      this.stopAll();
    }
  }

  // Set global volume
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.volume);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('hypercatz_sound_volume', this.volume.toString());
    }
  }

  // Get current settings
  getSettings() {
    return {
      enabled: this.isEnabled,
      volume: this.volume,
      initialized: this.isInitialized,
    };
  }

  // Fade in a sound
  fadeIn(soundName: SoundName, duration: number = 1000): void {
    if (!this.isEnabled || !this.isInitialized) return;

    const sound = this.sounds.get(soundName);
    if (!sound) return;

    sound.volume(0);
    sound.play();
    sound.fade(0, this.volume, duration);
  }

  // Fade out a sound
  fadeOut(soundName: SoundName, duration: number = 1000): void {
    const sound = this.sounds.get(soundName);
    if (!sound) return;

    sound.fade(sound.volume(), 0, duration);
    setTimeout(() => sound.stop(), duration);
  }

  // Play UI interaction sounds
  playClick(): void {
    this.play('click', { volume: 0.3 });
  }

  playHover(): void {
    this.play('hover', { volume: 0.2 });
  }

  playSuccess(): void {
    this.play('success', { volume: 0.6 });
  }

  playError(): void {
    this.play('error', { volume: 0.5 });
  }

  playMint(): void {
    this.play('mint', { volume: 0.7 });
  }

  playWin(): void {
    this.play('win', { volume: 0.8 });
  }

  playLose(): void {
    this.play('lose', { volume: 0.6 });
  }

  playNotification(): void {
    this.play('notification', { volume: 0.5 });
  }

  // Game-specific sounds
  playCoinFlip(): void {
    this.play('coin_flip', { volume: 0.6 });
  }

  playGameStart(): void {
    this.play('game_start', { volume: 0.7 });
  }

  playCountdown(): void {
    this.play('countdown', { volume: 0.5 });
  }

  // Atmospheric sounds
  playLightning(): void {
    this.play('lightning', { volume: 0.4 });
  }

  playGlitch(): void {
    this.play('glitch', { volume: 0.3 });
  }

  // Create sound sequence
  playSequence(sounds: { name: SoundName; delay: number; options?: any }[]): void {
    if (!this.isEnabled) return;

    sounds.forEach(({ name, delay, options }) => {
      setTimeout(() => this.play(name, options), delay);
    });
  }

  // Cleanup
  destroy(): void {
    this.stopAll();
    this.sounds.clear();
    this.isInitialized = false;
  }
}

// Create singleton instance
export const soundEngine = new SoundEngine();

// React hook for sound controls
export const useSoundEngine = () => {
  const settings = soundEngine.getSettings();

  return {
    ...settings,
    play: soundEngine.play.bind(soundEngine),
    stop: soundEngine.stop.bind(soundEngine),
    stopAll: soundEngine.stopAll.bind(soundEngine),
    setEnabled: soundEngine.setEnabled.bind(soundEngine),
    setVolume: soundEngine.setVolume.bind(soundEngine),
    fadeIn: soundEngine.fadeIn.bind(soundEngine),
    fadeOut: soundEngine.fadeOut.bind(soundEngine),
    
    // Convenience methods
    playClick: soundEngine.playClick.bind(soundEngine),
    playHover: soundEngine.playHover.bind(soundEngine),
    playSuccess: soundEngine.playSuccess.bind(soundEngine),
    playError: soundEngine.playError.bind(soundEngine),
    playMint: soundEngine.playMint.bind(soundEngine),
    playWin: soundEngine.playWin.bind(soundEngine),
    playLose: soundEngine.playLose.bind(soundEngine),
    playNotification: soundEngine.playNotification.bind(soundEngine),
    playCoinFlip: soundEngine.playCoinFlip.bind(soundEngine),
    playGameStart: soundEngine.playGameStart.bind(soundEngine),
    playCountdown: soundEngine.playCountdown.bind(soundEngine),
    playLightning: soundEngine.playLightning.bind(soundEngine),
    playGlitch: soundEngine.playGlitch.bind(soundEngine),
    playSequence: soundEngine.playSequence.bind(soundEngine),
  };
};

// Initialize sound engine on first user interaction
export const initializeSoundEngine = async (): Promise<void> => {
  try {
    await soundEngine.initialize();
  } catch (error) {
    console.error('Failed to initialize sound engine:', error);
  }
};

export default soundEngine;