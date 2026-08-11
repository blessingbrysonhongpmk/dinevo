// Helper function to resolve the target URL for Table QR codes.
// Supports Vercel production domain, custom environment host, and local LAN IP for physical phone camera testing.

export function getQrTargetUrl(tableCode, customHost = null) {
  const code = (tableCode || 'DINEVO-T01').trim().toUpperCase();

  if (customHost && customHost.trim()) {
    const cleanHost = customHost.trim().replace(/\/+$/, '');
    return `${cleanHost}/table/${code}`;
  }

  // Check VITE_PUBLIC_URL or VITE_APP_URL environment variables
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_PUBLIC_URL || import.meta.env.VITE_APP_URL));

  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
    return `${envUrl.replace(/\/+$/, '')}/table/${code}`;
  }

  if (typeof window !== 'undefined') {
    const { origin, hostname } = window.location;
    // If running locally on localhost/127.0.0.1, use active Wi-Fi LAN IP so mobile phones on the same Wi-Fi can scan & connect!
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const dynamicLanIp = sessionStorage.getItem('dinevo_lan_ip');
      const lanIp = dynamicLanIp || (import.meta && import.meta.env && import.meta.env.VITE_LAN_IP) || '10.115.242.218';
      const port = window.location.port || '3000';
      return `http://${lanIp}:${port}/table/${code}`;
    }
    return `${origin}/table/${code}`;
  }

  const fallbackLanIp = (typeof window !== 'undefined' && sessionStorage.getItem('dinevo_lan_ip')) || '10.115.242.218';
  return `http://${fallbackLanIp}:3000/table/${code}`;
}
