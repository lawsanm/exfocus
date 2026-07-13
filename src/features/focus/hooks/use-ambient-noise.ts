import { useRef, useState } from "react";

export type NoiseColor = "white" | "brown";

const BUFFER_SECONDS = 4;

function createNoiseBuffer(context: AudioContext, color: NoiseColor): AudioBuffer {
  const frameCount = context.sampleRate * BUFFER_SECONDS;
  const buffer = context.createBuffer(1, frameCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  let lastValue = 0;
  for (let i = 0; i < frameCount; i++) {
    const white = Math.random() * 2 - 1;
    if (color === "brown") {
      lastValue = (lastValue + white * 0.02) / 1.02;
      data[i] = lastValue * 3.5;
    } else {
      data[i] = white * 0.3;
    }
  }

  return buffer;
}

/**
 * Synthesizes looping ambient noise entirely client-side (no audio assets
 * to source/license) using a short noise buffer looped through a GainNode.
 */
export function useAmbientNoise() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  function stop() {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setIsPlaying(false);
  }

  function play(color: NoiseColor) {
    stop();

    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;

    const source = context.createBufferSource();
    source.buffer = createNoiseBuffer(context, color);
    source.loop = true;

    const gain = context.createGain();
    gain.gain.value = volume;

    source.connect(gain).connect(context.destination);
    source.start();

    sourceRef.current = source;
    gainRef.current = gain;
    setIsPlaying(true);
  }

  function setVolumeAndApply(value: number) {
    setVolume(value);
    if (gainRef.current) gainRef.current.gain.value = value;
  }

  return { isPlaying, volume, play, stop, setVolume: setVolumeAndApply };
}
