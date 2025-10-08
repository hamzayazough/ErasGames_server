import Sound from 'react-native-sound';

export class AudioService {
  private currentSound: Sound | null = null;
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) return;

    try {
      // Enable playback in silence mode for iOS
      Sound.setCategory('Playback');
      this.isInitialized = true;
    } catch (error) {
      throw error;
    }
  }

  async playSound(uri: string, onFinish?: () => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.initialize();

        // Stop any currently playing sound
        this.stopCurrentSound();

        // Create new Sound instance from URL
        // For network URLs, use null as the second parameter instead of empty string
        const sound = new Sound(uri, null, error => {
          if (error) {
            // Try alternative approach for network URLs
            this.tryAlternativeLoad(uri, onFinish, resolve, reject);
            return;
          }

          this.currentSound = sound;

          // Play the sound
          sound.play(success => {
            // Clean up
            this.currentSound = null;
            sound.release();

            if (onFinish) {
              onFinish();
            }
          });

          resolve();
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  private tryAlternativeLoad(
    uri: string,
    onFinish?: () => void,
    resolve?: () => void,
    reject?: (error: any) => void,
  ): void {
    // Try with empty string as base path (this is the correct way for network URLs)
    const sound = new Sound(uri, '', error => {
      if (error) {
        // Try one more approach - with undefined base path
        this.tryUndefinedBasePath(uri, onFinish, resolve, reject);
        return;
      }

      this.currentSound = sound;

      sound.play(success => {
        this.currentSound = null;
        sound.release();

        if (onFinish) onFinish();
      });

      if (resolve) resolve();
    });
  }

  private tryUndefinedBasePath(
    uri: string,
    onFinish?: () => void,
    resolve?: () => void,
    reject?: (error: any) => void,
  ): void {
    const sound = new Sound(uri, undefined as any, error => {
      if (error) {
        this.trySystemAudioFallback(uri, reject);
        return;
      }

      this.currentSound = sound;

      sound.play(success => {
        this.currentSound = null;
        sound.release();

        if (onFinish) onFinish();
      });

      if (resolve) resolve();
    });
  }

  private trySystemAudioFallback(
    uri: string,
    reject?: (error: any) => void,
  ): void {
    if (reject) {
      reject(
        new Error('Unable to play audio file. All playback methods failed.'),
      );
    }
  }

  stopCurrentSound(): void {
    if (this.currentSound) {
      try {
        this.currentSound.stop(() => {
          if (this.currentSound) {
            this.currentSound.release();
            this.currentSound = null;
          }
        });
      } catch (error) {
        this.currentSound = null;
      }
    }
  }

  pauseCurrentSound(): void {
    if (this.currentSound) {
      try {
        this.currentSound.pause();
      } catch (error) {
        // Silent error handling
      }
    }
  }

  resumeCurrentSound(): void {
    if (this.currentSound) {
      try {
        this.currentSound.play();
      } catch (error) {
        // Silent error handling
      }
    }
  }

  isCurrentlyPlaying(): boolean {
    return this.currentSound !== null && this.currentSound.isPlaying();
  }

  cleanup(): void {
    this.stopCurrentSound();
  }
}

// Export singleton instance
export const audioService = new AudioService();
export default audioService;
