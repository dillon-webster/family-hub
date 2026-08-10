import { useEffect, useRef, useState } from 'react';
import { ScanLine } from 'lucide-react';

/** Long edge of the image actually sent. Well above what is needed to read a
 *  page and well below the point where the upload starts to cost anything. */
const MAX_EDGE = 1600;

function downscale(source: HTMLVideoElement | HTMLImageElement, width: number, height: number) {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d')?.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * The camera frame, with a graceful answer to a real deployment problem.
 *
 * `getUserMedia` only exists in a secure context. Reached over plain http on a
 * Tailscale IP — the obvious way to open this on a phone — Safari does not
 * provide it, so rather than showing a dead viewfinder we fall back to the
 * system camera via a file input, which works anywhere. Put the hub behind
 * `tailscale serve` for https and the live preview appears on its own.
 */
export function CameraFrame({
  height,
  onCapture,
  theme = 'dark',
}: {
  height: number;
  onCapture: (dataUrl: string) => void;
  theme?: 'dark' | 'light';
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setNote('Open the hub over https to use the live camera.');
      return;
    }

    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 } } })
      .then((granted) => {
        if (cancelled) {
          granted.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = granted;
        if (videoRef.current) {
          videoRef.current.srcObject = granted;
          void videoRef.current.play();
          setLive(true);
        }
      })
      .catch(() => setNote('The camera is not available. Take a photo instead.'));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const shoot = () => {
    const video = videoRef.current;
    if (live && video && video.videoWidth > 0) {
      onCapture(downscale(video, video.videoWidth, video.videoHeight));
      return;
    }
    fileRef.current?.click();
  };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => onCapture(downscale(image, image.width, image.height));
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
    // Allow re-picking the same file after a failed read.
    event.target.value = '';
  };

  const dark = theme === 'dark';

  return (
    <>
      <div
        style={{
          position: 'relative',
          height,
          borderRadius: dark ? 20 : 24,
          background: dark ? '#171412' : '#2B2521',
          border: dark ? '1px solid rgba(252,247,239,0.12)' : 'none',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: live ? 1 : 0,
          }}
        />
        <div
          style={{
            width: '74%',
            height: '78%',
            borderRadius: 12,
            border: '2px dashed rgba(252,247,239,0.28)',
            position: 'relative',
            zIndex: 1,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            background: '#E37A57',
            boxShadow: '0 0 18px rgba(227,122,87,0.9)',
            animation: 'fh-scan 2.2s ease-in-out infinite',
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            right: 16,
            textAlign: 'center',
            fontSize: 14,
            color: 'rgba(252,247,239,0.72)',
            zIndex: 3,
          }}
        >
          {note ?? 'Hold the page flat'}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onFile}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        className="pressable"
        onClick={shoot}
        style={
          {
            height: 64,
            borderRadius: 18,
            color: '#FFF8F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            fontSize: 18,
            fontWeight: 600,
            flex: '0 0 auto',
            '--bg': '#C8553D',
            '--bg-press': '#A23F29',
          } as React.CSSProperties
        }
      >
        <ScanLine size={22} strokeWidth={2} />
        {live ? 'Scan this page' : 'Take a photo'}
      </button>
    </>
  );
}
