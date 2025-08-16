// src/pages/TelegramCallback.jsx
import { useEffect } from 'react';

export default function TelegramCallback() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const payload = {};
      params.forEach((v, k) => (payload[k] = v));
      if (window.opener) {
        window.opener.postMessage({ type: 'tg_oauth', payload }, '*'); // xohlasang originni cheklaysan
        window.close();
      }
    } catch (_) {}
  }, []);

  return <div style={{ padding: 16 }}>Processing Telegram… You can close this tab.</div>;
}
