/**
 * collectClientDetails
 * Gathers most client-side signals browsers expose, handles permission failures/timeouts,
 * and returns a single object { data: {...}, errors: [...], deviceFingerprint }.
 *
 * Notes:
 * - Some APIs require secure context (https / localhost).
 * - Geolocation requires user permission.
 * - RTCPeerConnection trick for local IPs may not work in all browsers.
 * - Keep privacy & compliance in mind.
 */
export async function collectClientDetails(opts = {}) {
  const {
    geoTimeout = 10000,
    audioTimeout = 3000,
    rtcTimeout = 3000,
    canvasSliceLen = 200, // partial canvas data used in fingerprint seed
  } = opts;

  const errors = [];

  // small helper: SHA-256 hex
  async function sha256hex(str) {
    try {
      const buf = new TextEncoder().encode(str || '');
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      return Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch (e) {
      errors.push({ fn: 'sha256hex', message: String(e) });
      return null;
    }
  }

  // 1. Geolocation (with timeout)
  const getGeo = () =>
    new Promise(resolve => {
      if (!('geolocation' in navigator)) return resolve(null);
      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        errors.push({ fn: 'geolocation', message: 'timeout' });
        resolve({ error: 'timeout' });
      }, geoTimeout);

      navigator.geolocation.getCurrentPosition(
        pos => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            altitudeAccuracy: pos.coords.altitudeAccuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            timestamp: new Date(pos.timestamp).toISOString(),
          });
        },
        err => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          errors.push({ fn: 'geolocation', message: err && err.message ? err.message : String(err) });
          resolve({ error: err && err.message ? err.message : String(err) });
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: geoTimeout }
      );
    });

  // 2. Navigator / Browser info
  function getNavigatorInfo() {
    try {
      return {
        userAgent: navigator.userAgent || null,
        platform: navigator.platform || null,
        language: navigator.language || null,
        languages: navigator.languages || null,
        vendor: navigator.vendor || null,
        doNotTrack: navigator.doNotTrack || navigator.msDoNotTrack || null,
        cookieEnabled: navigator.cookieEnabled || null,
        product: navigator.product || null,
      };
    } catch (e) {
      errors.push({ fn: 'getNavigatorInfo', message: String(e) });
      return null;
    }
  }

  // 3. Screen info
  function getScreenInfo() {
    try {
      const scr = window.screen || {};
      return {
        width: scr.width || null,
        height: scr.height || null,
        availWidth: scr.availWidth || null,
        availHeight: scr.availHeight || null,
        colorDepth: scr.colorDepth || null,
        pixelRatio: window.devicePixelRatio || null,
      };
    } catch (e) {
      errors.push({ fn: 'getScreenInfo', message: String(e) });
      return null;
    }
  }

  // 4. Battery
  async function tryGetBattery() {
    try {
      if (!('getBattery' in navigator)) return null;
      const bat = await navigator.getBattery();
      return {
        charging: bat.charging,
        level: typeof bat.level === 'number' ? bat.level : null,
        chargingTime: bat.chargingTime,
        dischargingTime: bat.dischargingTime,
      };
    } catch (e) {
      errors.push({ fn: 'getBattery', message: String(e) });
      return null;
    }
  }

  // 5. Hardware info
  function getHardwareInfo() {
    try {
      return {
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory || null,
        maxTouchPoints: navigator.maxTouchPoints || null,
        timezone: (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
          } catch {
            return null;
          }
        })(),
        timezoneOffsetMin: new Date().getTimezoneOffset(),
      };
    } catch (e) {
      errors.push({ fn: 'getHardwareInfo', message: String(e) });
      return null;
    }
  }

  // 6. Storage support checks
  function checkStorage() {
    try {
      const local = (() => {
        try {
          localStorage.setItem('__cm', '1');
          localStorage.removeItem('__cm');
          return true;
        } catch {
          return false;
        }
      })();
      const sess = (() => {
        try {
          sessionStorage.setItem('__cm', '1');
          sessionStorage.removeItem('__cm');
          return true;
        } catch {
          return false;
        }
      })();
      return {
        localStorage: local,
        sessionStorage: sess,
        indexedDB: typeof window.indexedDB !== 'undefined',
      };
    } catch (e) {
      errors.push({ fn: 'checkStorage', message: String(e) });
      return null;
    }
  }

  // 7. Canvas fingerprint (dataURL)
  function getCanvasFp() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('ClientFingerprint-' + (navigator.platform || ''), 2, 15);
      const data = canvas.toDataURL();
      return data;
    } catch (e) {
      errors.push({ fn: 'getCanvasFp', message: String(e) });
      return null;
    }
  }

  // 8. WebGL info
  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      return {
        renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null,
        vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
      };
    } catch (e) {
      errors.push({ fn: 'getWebGLInfo', message: String(e) });
      return null;
    }
  }

  // 9. Audio fingerprint attempt (non-invasive)
  async function tryAudioFingerprint() {
    try {
      if (!window.OfflineAudioContext && !window.webkitOfflineAudioContext) return null;
      const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const ctx = new Ctx(1, 44100, 44100);
      const osc = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      osc.type = 'sine';
      osc.connect(analyser);
      analyser.connect(ctx.destination);
      osc.start(0);
      const renderPromise = ctx.startRendering ? ctx.startRendering() : Promise.resolve();
      const p = Promise.race([renderPromise, new Promise(r => setTimeout(r, audioTimeout))]);
      await p;
      return { audio: 'ok' };
    } catch (e) {
      errors.push({ fn: 'tryAudioFingerprint', message: String(e) });
      return null;
    }
  }

  // 10. RTCPeerConnection local IP discovery (may be blocked in some browsers)
  async function tryGetLocalIPs() {
    // gather local IPs via WebRTC; patched to be safe and timeout
    return new Promise(resolve => {
      if (!window.RTCPeerConnection && !window.webkitRTCPeerConnection && !window.mozRTCPeerConnection) {
        return resolve(null);
      }
      const ips = new Set();
      let finished = false;
      const pc = new (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)({
        iceServers: [],
      });
      // data channel to ensure candidate gathering
      try {
        pc.createDataChannel('');
      } catch (e) {
        /* ignore */
      }

      pc.onicecandidate = evt => {
        if (!evt || !evt.candidate) return;
        const parts = evt.candidate.candidate.split(' ');
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          // rudimentary IPv4/IPv6 check
          if (/(\d{1,3}\.){3}\d{1,3}/.test(p) || /([0-9a-fA-F:]{2,})/.test(p)) {
            ips.add(p);
          }
        }
      };

      // create offer and set local description to trigger ICE
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(e => {
          errors.push({ fn: 'tryGetLocalIPs.createOffer', message: String(e) });
        });

      // stop after timeout
      setTimeout(() => {
        if (finished) return;
        finished = true;
        try {
          pc.close();
        } catch {}
        resolve(Array.from(ips));
      }, rtcTimeout);
    });
  }

  // 12. Basic connectivity info
  function getConnectionInfo() {
    try {
      const navConn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
      return {
        effectiveType: navConn.effectiveType || null,
        downlink: navConn.downlink || null,
        rtt: navConn.rtt || null,
        saveData: navConn.saveData || null,
      };
    } catch (e) {
      errors.push({ fn: 'getConnectionInfo', message: String(e) });
      return null;
    }
  }

  // 13. Timestamp
  const timestamp = new Date().toISOString();

  // RUN all collectors (parallel where possible)
  const [geo, battery, audioFp, localIPs] = await Promise.all([
    getGeo(),
    tryGetBattery(),
    tryAudioFingerprint(),
    tryGetLocalIPs(),
  ]);

  const browser = getNavigatorInfo();
  const screen = getScreenInfo();
  const hardware = getHardwareInfo();
  const storage = checkStorage();
  const canvasFp = getCanvasFp();
  const webgl = getWebGLInfo();
  const connection = getConnectionInfo();

  // Build fingerprint seed from stable non-PII signals
  const seedParts = [
    browser.userAgent,
    browser.platform,
    JSON.stringify(screen),
    hardware.hardwareConcurrency,
    hardware.deviceMemory,
    webgl?.renderer,
    (canvasFp || '').slice(0, canvasSliceLen),
  ]
    .filter(Boolean)
    .join('||');

  const deviceFingerprint = await sha256hex(seedParts);

  // Final data object
  const data = {
    timestamp,
    geo,
    browser,
    screen,
    battery,
    hardware,
    storage,
    webgl,
    audioFp,
    localIPs,
    connection,
    deviceFingerprint,
  };

  return { data, errors };
}
