import { useEffect } from 'react';

/**
 * Keeping an always-on wall display awake.
 *
 * Guided Access stops anyone wandering out of the app, but it does not stop the
 * screen dimming, and iOS drops the wake lock every time the display sleeps or
 * the app loses focus. Re-acquiring on every visibility change is what makes it
 * stick over days rather than minutes.
 *
 * The lock needs a secure context, so over plain http on a tailnet address this
 * quietly does nothing — the iPad's own "Auto-Lock: Never" is the fallback, and
 * the README says so.
 */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      try {
        sentinel = await navigator.wakeLock.request('screen');
        // Released by the system on sleep or backgrounding; the visibility
        // handler below takes it again on the way back.
        sentinel.addEventListener('release', () => {
          sentinel = null;
        });
      } catch {
        // Denied, unsupported, or not a secure context — nothing to do.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === 'visible' && !sentinel) void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [enabled]);
}

/**
 * Stop the two gestures that break a kiosk layout: pinch-zoom, and the
 * double-tap-to-zoom that a fast double press on a card would otherwise
 * trigger. `touch-action: manipulation` in the reset handles most of it; these
 * cover the multi-touch cases Safari still honours.
 */
export function usePinchLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const stop = (event: Event) => event.preventDefault();
    const onTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener('gesturestart', stop);
    document.addEventListener('touchmove', onTouch, { passive: false });

    return () => {
      document.removeEventListener('gesturestart', stop);
      document.removeEventListener('touchmove', onTouch);
    };
  }, [enabled]);
}
