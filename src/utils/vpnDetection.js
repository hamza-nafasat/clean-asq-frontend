export async function detectVPN() {
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
    const resp = await fetch('https://api.ipify.org?format=json');
    const data = await resp.json();
    webrtcPublicIp = data.ip;
  } catch (e) {
    webrtcPublicIp = null;
    console.log('Browser IP lookup failed', e);
  }

  // 2. Collect WebRTC IPs
  try {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel('');
    const candPromise = new Promise(resolve => {
      pc.onicecandidate = event => {
        if (event.candidate) {
          const cand = event.candidate.candidate;
          const parts = cand.split(' ');
          const ip = parts[4];
          const type = parts[7];
          if (ip && !webrtcLocalIps.includes(ip)) webrtcLocalIps.push(ip);
          if (type === 'relay') proxyDetection = true;
        } else resolve(null);
      };
    });
    await pc.createOffer().then(o => pc.setLocalDescription(o));
    await candPromise;
    pc.close();
  } catch (e) {
    console.log('WebRTC IP collection failed', e);
  }

  // 3. Latency test
  try {
    const start = performance.now();
    await fetch('https://www.cloudflare.com/cdn-cgi/trace');
    connectionLatency = performance.now() - start;
  } catch (e) {
    connectionLatency = null;
    console.log('Latency test failed', e);
  }

  // 4. Timezone checks
  try {
    timezoneOffset = new Date().getTimezoneOffset();
    systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (webrtcPublicIp) {
      const geoResp = await fetch(`https://ipapi.co/${webrtcPublicIp}/json/`);
      const geoData = await geoResp.json();
      ipTimezoneMatch = geoData.timezone === systemTimezone;
    }
  } catch (e) {
    timezoneOffset = null;
    systemTimezone = null;
    ipTimezoneMatch = null;
    console.log('Timezone checks failed', e);
  }

  // 5. Suspicious headers
  try {
    const hdrResp = await fetch('https://httpbin.org/headers');
    const hdrs = await hdrResp.json();
    const headers = hdrs.headers || {};
    const vpnHeaders = ['x-forwarded-for', 'via', 'x-real-ip'];
    for (const h of vpnHeaders) {
      if (headers[h]) suspiciousHeaders.push(h);
    }
  } catch (e) {
    console.log('Suspicious headers check failed', e);
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
}
