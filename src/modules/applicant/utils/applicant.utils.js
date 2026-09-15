import {
  checkClientVpn,
  getCanvasFp,
  getConnectionInfo,
  getWebGLInfo,
  sha256hex,
  tryAudioFingerprint,
  tryGetLocalIPs,
} from "./applicant.utils10";
import {
  checkStorage,
  getGeo,
  getHardwareInfo,
  getNavigatorInfo,
  getScreenInfo,
  tryGetBattery,
} from "./applicant.utils9";

// device, browser and network details saved with a draft
export const collectClientDetails = async (opts = {}) => {
  const { geoTimeout = 10000, audioTimeout = 3000, rtcTimeout = 3000, canvasSliceLen = 200 } = opts;
  const errors = [];
  const timestamp = new Date().toISOString();

  const [geo, battery, audioFp, localIPs, vpnResults] = await Promise.all([
    getGeo(errors, geoTimeout),
    tryGetBattery(errors),
    tryAudioFingerprint(errors, audioTimeout),
    tryGetLocalIPs(errors, rtcTimeout),
    checkClientVpn(),
  ]);

  const browser = getNavigatorInfo(errors);
  const screen = getScreenInfo(errors);
  const hardware = getHardwareInfo(errors);
  const storage = checkStorage(errors);
  const canvasFp = getCanvasFp(errors);
  const webgl = getWebGLInfo(errors);
  const connection = getConnectionInfo(errors);

  // fingerprint seed from stable non-PII signals
  const seedParts = [
    browser.userAgent,
    browser.platform,
    JSON.stringify(screen),
    hardware.hardwareConcurrency,
    hardware.deviceMemory,
    webgl?.renderer,
    (canvasFp || "").slice(0, canvasSliceLen),
  ]
    .filter(Boolean)
    .join("||");

  const deviceFingerprint = await sha256hex(errors, seedParts);

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
    vpnResults,
  };

  return { data, errors };
};
