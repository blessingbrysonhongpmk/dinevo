/**
 * Formats table code cleanly into standard format (e.g. '01' or 'DINEVO-T01')
 */
export function formatTableCode(tableInput) {
  if (!tableInput) return '01';
  const str = String(tableInput).trim().toUpperCase();
  if (/^\d+$/.test(str)) {
    return str.padStart(2, '0');
  }
  return str;
}

/**
 * Returns production-grade QR target URL using VITE_PUBLIC_APP_URL or custom domain override.
 */
export function getQrTargetUrl(tableInput, customHost = null) {
  const code = formatTableCode(tableInput);

  // 1. Explicit customHost / domain override passed to function
  if (customHost && customHost.trim()) {
    const cleanHost = customHost.trim().replace(/\/+$/, '');
    return `${cleanHost}/table/${code}`;
  }

  // 2. Saved production public domain in localStorage
  const savedPublicHost = typeof window !== 'undefined' && localStorage.getItem('dinevo_public_domain');
  if (savedPublicHost && savedPublicHost.trim()) {
    const cleanHost = savedPublicHost.trim().replace(/\/+$/, '');
    return `${cleanHost}/table/${code}`;
  }

  // 3. Environment Variable: VITE_PUBLIC_APP_URL || VITE_PUBLIC_URL || VITE_APP_URL
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_PUBLIC_APP_URL || import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL));
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    if (!envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return `${envUrl.replace(/\/+$/, '')}/table/${code}`;
    }
  }

  // 4. Dynamic browser LAN IP or origin fallback for local development
  if (typeof window !== 'undefined') {
    const { origin, hostname, port } = window.location;
    const dynamicLanIp = sessionStorage.getItem('dinevo_lan_ip');
    const p = port || '3000';

    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${origin}/table/${code}`;
    }

    if (dynamicLanIp && dynamicLanIp !== 'localhost' && dynamicLanIp !== '127.0.0.1') {
      const proto = window.location.protocol === 'https:' ? 'https' : 'http';
      return `${proto}://${dynamicLanIp}:${p}/table/${code}`;
    }

    return `${origin}/table/${code}`;
  }

  return `http://localhost:3000/table/${code}`;
}

/**
 * Returns high-resolution WhatsApp-resilient QR Image API URL (ECC Level H, 450x450, high contrast)
 */
export function getQrImageUrl(targetUrl) {
  const encoded = encodeURIComponent(targetUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=450x450&ecc=H&margin=15&color=0-0-0&bgcolor=255-255-255&data=${encoded}`;
}



