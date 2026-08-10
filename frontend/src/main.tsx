import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './design/tokens.css';
import { StoreProvider } from './api/store';
import { HubApp } from './hub/HubApp';
import { PhoneApp } from './phone/PhoneApp';
import { usePinchLock, useWakeLock } from './lib/kiosk';

/**
 * Two surfaces, one bundle.
 *
 * `/phone` is the companion; everything else is the kitchen display. Each is
 * installed to a home screen separately, so a path rather than a router is all
 * the routing this needs — and it keeps the kiosk from ever navigating.
 */
function App() {
  const [isPhone, setIsPhone] = useState(() => location.pathname.startsWith('/phone'));

  useEffect(() => {
    const onPop = () => setIsPhone(location.pathname.startsWith('/phone'));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // The wall display stays lit and stays put; the phone behaves like a phone.
  useWakeLock(!isPhone);
  usePinchLock(!isPhone);

  useEffect(() => {
    document.title = isPhone ? 'Family Hub' : 'Family Hub — Kitchen';
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isPhone ? '#FCF7EF' : '#1E1A17');
    document.documentElement.style.background = isPhone ? '#FCF7EF' : '#14110F';
  }, [isPhone]);

  return (
    <StoreProvider>{isPhone ? <PhoneApp /> : <HubApp />}</StoreProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
