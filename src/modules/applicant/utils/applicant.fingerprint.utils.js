import getEnv from "@/utils/env";
import { detectVPN } from "@/utils/vpnDetection";

export const sha256hex = async (errors, str) => {
  try {
    const buf = new TextEncoder().encode(str || "");
    const hashBuf = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (e) {
    errors.push({ fn: "sha256hex", message: String(e) });
    return null;
  }
};

export const getCanvasFp = (errors) => {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("ClientFingerprint-" + (navigator.platform || ""), 2, 15);
    return canvas.toDataURL();
  } catch (e) {
    errors.push({ fn: "getCanvasFp", message: String(e) });
    return null;
  }
};

export const getWebGLInfo = (errors) => {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return null;
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null,
      vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
    };
  } catch (e) {
    errors.push({ fn: "getWebGLInfo", message: String(e) });
    return null;
  }
};

export const tryAudioFingerprint = async (errors, audioTimeout) => {
  try {
    if (!window.OfflineAudioContext && !window.webkitOfflineAudioContext) return null;
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const ctx = new Ctx(1, 44100, 44100);
    const osc = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    osc.type = "sine";
    osc.connect(analyser);
    analyser.connect(ctx.destination);
    osc.start(0);
    const renderPromise = ctx.startRendering ? ctx.startRendering() : Promise.resolve();
    await Promise.race([renderPromise, new Promise((r) => setTimeout(r, audioTimeout))]);
    return { audio: "ok" };
  } catch (e) {
    errors.push({ fn: "tryAudioFingerprint", message: String(e) });
    return null;
  }
};

// local IPs through WebRTC, may be blocked by the browser
export const tryGetLocalIPs = (errors, rtcTimeout) =>
  new Promise((resolve) => {
    if (!window.RTCPeerConnection && !window.webkitRTCPeerConnection && !window.mozRTCPeerConnection) {
      return resolve(null);
    }
    const ips = new Set();
    let finished = false;
    const pc = new (window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection)({
      iceServers: [],
    });
    // data channel starts candidate gathering
    try {
      pc.createDataChannel("");
    } catch {
      // ignore
    }

    pc.onicecandidate = (evt) => {
      if (!evt || !evt.candidate) return;
      evt.candidate.candidate.split(" ").forEach((part) => {
        if (/(\d{1,3}\.){3}\d{1,3}/.test(part) || /([0-9a-fA-F:]{2,})/.test(part)) ips.add(part);
      });
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch((e) => {
        errors.push({ fn: "tryGetLocalIPs.createOffer", message: String(e) });
      });

    setTimeout(() => {
      if (finished) return;
      finished = true;
      try {
        pc.close();
      } catch {
        // ignore
      }
      resolve(Array.from(ips));
    }, rtcTimeout);
  });

export const getConnectionInfo = (errors) => {
  try {
    const navConn = navigator.connection || navigator.mozConnection || navigator.webkitConnection || {};
    return {
      effectiveType: navConn.effectiveType || null,
      downlink: navConn.downlink || null,
      rtt: navConn.rtt || null,
      saveData: navConn.saveData || null,
    };
  } catch (e) {
    errors.push({ fn: "getConnectionInfo", message: String(e) });
    return null;
  }
};

export const checkClientVpn = async () => {
  try {
    const vpnData = await detectVPN();
    const resp = await fetch(`${getEnv("SERVER_URL")}/api/form/vpn-check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vpnData }),
    });
    return await resp.json();
  } catch (error) {
    console.error("Check VPN error:", error);
    return null;
  }
};
