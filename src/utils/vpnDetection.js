const VPN_FETCH_TIMEOUT_MS = 5000;

export const detectVPN = async () => {
  const webrtcLocalIps = [];
  let webrtcPublicIp;
  let connectionLatency;
  let timezoneOffset;
  let systemTimezone;
  let ipTimezoneMatch;
  const suspiciousHeaders = [];
  let proxyDetection = false;

  // 1. Get browser IP
  try {
    const resp = await fetch("https://api.ipify.org?format=json", {
      signal: AbortSignal.timeout(VPN_FETCH_TIMEOUT_MS),
    });
    const data = await resp.json();
    webrtcPublicIp = data.ip;
  } catch (e) {
    webrtcPublicIp = null;
    console.error("Browser IP lookup error:", e);
  }

  // 2. Collect WebRTC IPs
  try {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("");
    const candPromise = new Promise((resolve) => {
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const cand = event.candidate.candidate;
          const parts = cand.split(" ");
          const ip = parts[4];
          const type = parts[7];
          if (ip && !webrtcLocalIps.includes(ip)) webrtcLocalIps.push(ip);
          if (type === "relay") proxyDetection = true;
        } else resolve(null);
      };
    });
    await pc.createOffer().then((o) => pc.setLocalDescription(o));
    await candPromise;
    pc.close();
  } catch (e) {
    console.error("WebRTC IP collection error:", e);
  }

  // 3. Latency test
  try {
    const start = performance.now();
    await fetch("https://www.cloudflare.com/cdn-cgi/trace", { signal: AbortSignal.timeout(VPN_FETCH_TIMEOUT_MS) });
    connectionLatency = performance.now() - start;
  } catch (e) {
    connectionLatency = null;
    console.error("Latency test error:", e);
  }

  // 4. Timezone checks
  try {
    timezoneOffset = new Date().getTimezoneOffset();
    systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (webrtcPublicIp) {
      const geoResp = await fetch(`https://ipapi.co/${webrtcPublicIp}/json/`, {
        signal: AbortSignal.timeout(VPN_FETCH_TIMEOUT_MS),
      });
      const geoData = await geoResp.json();
      ipTimezoneMatch = geoData.timezone === systemTimezone;
    }
  } catch (e) {
    timezoneOffset = null;
    systemTimezone = null;
    ipTimezoneMatch = null;
    console.error("Timezone check error:", e);
  }

  // 5. Suspicious headers
  try {
    const hdrResp = await fetch("https://httpbin.org/headers", { signal: AbortSignal.timeout(VPN_FETCH_TIMEOUT_MS) });
    const hdrs = await hdrResp.json();
    const headers = hdrs.headers || {};
    const vpnHeaders = ["x-forwarded-for", "via", "x-real-ip"];
    for (const h of vpnHeaders) {
      if (headers[h]) suspiciousHeaders.push(h);
    }
  } catch (e) {
    console.error("Headers check error:", e);
  }

  return {
    webrtcLocalIps,
    webrtcPublicIp,
    connectionLatency,
    timezoneOffset,
    systemTimezone,
    ipTimezoneMatch,
    suspiciousHeaders,
    proxyDetection,
  };
};
