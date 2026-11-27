'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

/** Show the store badge in browsers, never inside the Capacitor app. */
export default function StoreDownload() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!Capacitor.isNativePlatform());
  }, []);

  if (!show) return null;

  return (
    <div className="footer-app-download">
      <span>Shop on the go</span>
      <a
        href="https://play.google.com/store/apps/details?id=in.prakruthiaqua.app"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Download Prakruthi Aqua on Google Play"
      >
        <img src="/images/google-play-badge.png" alt="Get it on Google Play" width={180} height={70} loading="lazy" />
      </a>
    </div>
  );
}
