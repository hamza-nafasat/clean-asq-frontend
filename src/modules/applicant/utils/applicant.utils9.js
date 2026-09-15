// geolocation with a timeout
export const getGeo = (errors, geoTimeout) =>
  new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      errors.push({ fn: "geolocation", message: "timeout" });
      resolve({ error: "timeout" });
    }, geoTimeout);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
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
      (err) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        errors.push({ fn: "geolocation", message: err && err.message ? err.message : String(err) });
        resolve({ error: err && err.message ? err.message : String(err) });
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: geoTimeout },
    );
  });

export const getNavigatorInfo = (errors) => {
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
    errors.push({ fn: "getNavigatorInfo", message: String(e) });
    return null;
  }
};

export const getScreenInfo = (errors) => {
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
    errors.push({ fn: "getScreenInfo", message: String(e) });
    return null;
  }
};

export const tryGetBattery = async (errors) => {
  try {
    if (!("getBattery" in navigator)) return null;
    const bat = await navigator.getBattery();
    return {
      charging: bat.charging,
      level: typeof bat.level === "number" ? bat.level : null,
      chargingTime: bat.chargingTime,
      dischargingTime: bat.dischargingTime,
    };
  } catch (e) {
    errors.push({ fn: "getBattery", message: String(e) });
    return null;
  }
};

const getTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
};

export const getHardwareInfo = (errors) => {
  try {
    return {
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      deviceMemory: navigator.deviceMemory || null,
      maxTouchPoints: navigator.maxTouchPoints || null,
      timezone: getTimezone(),
      timezoneOffsetMin: new Date().getTimezoneOffset(),
    };
  } catch (e) {
    errors.push({ fn: "getHardwareInfo", message: String(e) });
    return null;
  }
};

const canUseStorage = (storage) => {
  try {
    storage.setItem("__cm", "1");
    storage.removeItem("__cm");
    return true;
  } catch {
    return false;
  }
};

export const checkStorage = (errors) => {
  try {
    return {
      localStorage: canUseStorage(localStorage),
      sessionStorage: canUseStorage(sessionStorage),
      indexedDB: typeof window.indexedDB !== "undefined",
    };
  } catch (e) {
    errors.push({ fn: "checkStorage", message: String(e) });
    return null;
  }
};
