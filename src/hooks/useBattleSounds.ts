import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShotResult } from '../game/types';

const MUTE_KEY = 'battleship-muted';

type AudioContextConstructor = new () => AudioContext;

const readMuted = () => {
  try {
    return window.localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
};

export function useBattleSounds() {
  const [muted, setMutedState] = useState(readMuted);
  const context = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (muted || typeof window === 'undefined') return null;
    const Context =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: AudioContextConstructor })
        .webkitAudioContext;
    if (!Context) return null;
    try {
      if (!context.current) context.current = new Context();
      if (context.current.state === 'suspended') {
        void context.current.resume().catch(() => undefined);
      }
    } catch {
      return null;
    }
    return context.current;
  }, [muted]);

  const arm = useCallback(() => {
    getContext();
  }, [getContext]);

  const playShot = useCallback(
    (result: ShotResult) => {
      const audio = getContext();
      if (!audio) return;
      try {
        const now = audio.currentTime;
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = result === 'miss' ? 'square' : 'sawtooth';
        oscillator.frequency.setValueAtTime(result === 'sunk' ? 120 : 180, now);
        oscillator.frequency.exponentialRampToValueAtTime(
          result === 'miss' ? 75 : 65,
          now + 0.12,
        );
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(
          result === 'sunk' ? 0.22 : 0.14,
          now + 0.01,
        );
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        oscillator.connect(gain).connect(audio.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.18);
      } catch {
        // Audio is an enhancement and can fail after the context is closed.
      }
    },
    [getContext],
  );

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    try {
      window.localStorage.setItem(MUTE_KEY, String(next));
    } catch {
      // Storage can be unavailable in privacy-restricted contexts.
    }
  }, []);

  useEffect(
    () => () => {
      context.current?.close();
    },
    [],
  );

  return { muted, setMuted, arm, playShot };
}
