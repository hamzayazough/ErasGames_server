declare module 'react-native-sound' {
  export default class Sound {
    static MAIN_BUNDLE: string;
    static DOCUMENT: string;
    static LIBRARY: string;
    static CACHES: string;

    static setCategory(category: string): void;

    constructor(
      filename: string,
      basePath?: string | null,
      onError?: (error: any) => void,
    );

    play(onEnd?: (success: boolean) => void): this;
    pause(): this;
    stop(): this;
    reset(): this;
    release(): this;

    getDuration(): number;
    getCurrentTime(): number;
    setCurrentTime(time: number): this;

    isPlaying(): boolean;
    isLoaded(): boolean;

    setVolume(volume: number): this;
    getVolume(): number;

    setPan(pan: number): this;
    getPan(): number;

    setNumberOfLoops(loops: number): this;
    getNumberOfLoops(): number;

    setSpeed(speed: number): this;
    getSpeed(): number;
  }
}
