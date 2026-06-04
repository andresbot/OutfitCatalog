import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';

export type SharedVideo = {
  texture: THREE.VideoTexture | null;
  video: HTMLVideoElement | null;
  ready: boolean;
  blocked: boolean;
};

/**
 * Creates a single muted/looping <video> driving a THREE.VideoTexture.
 * Honors prefers-reduced-motion (never plays). Reports `blocked` if autoplay
 * is rejected so the UI can show a poster + play affordance.
 */
export function useSharedVideo(src: string): SharedVideo {
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const reduced = useMemo(
    () => typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const video = useMemo(() => {
    if (typeof document === 'undefined' || reduced) return null;
    const el = document.createElement('video');
    el.src = src;
    el.crossOrigin = 'anonymous';
    el.loop = true;
    el.muted = true;
    el.playsInline = true;
    el.preload = 'auto';
    return el;
  }, [src, reduced]);

  const texture = useMemo(() => {
    if (!video) return null;
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [video]);

  useEffect(() => {
    if (!video) return undefined;
    const onReady = () => setReady(true);
    video.addEventListener('loadeddata', onReady);
    video.play().then(() => setReady(true)).catch(() => setBlocked(true));
    return () => {
      video.removeEventListener('loadeddata', onReady);
      video.pause();
    };
  }, [video]);

  return { texture, video, ready, blocked };
}
