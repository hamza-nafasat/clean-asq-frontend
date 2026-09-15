const findComponent = (components, types) => {
  const typeList = Array.isArray(types) ? types : [types];
  return components.find((c) => typeList.some((x) => c.types.includes(x)));
};

const joinStreetAddress = (parts) => parts.filter(Boolean).join(" ").trim();

// address fields from one place's address components
export const parseAddressComponents = (components = [], geometry) => {
  const getLong = (types) => findComponent(components, types)?.long_name || "";
  const getShort = (types) => findComponent(components, types)?.short_name || "";

  const city =
    getLong("locality") ||
    getLong("postal_town") ||
    getLong("administrative_area_level_3") ||
    getLong("administrative_area_level_2") ||
    getLong(["sublocality", "sublocality_level_1"]) ||
    "";

  const postal = getLong("postal_code");
  const postalSuffix = getLong("postal_code_suffix");

  return {
    streetAddress: joinStreetAddress([getLong("premise"), getLong("street_number"), getLong("route"), getLong("subpremise")]),
    city,
    state: getShort("administrative_area_level_1") || getLong("administrative_area_level_1"),
    country: getLong("country"),
    zipCode: postalSuffix ? `${postal}-${postalSuffix}` : postal,
    lat: geometry?.location?.lat?.() ?? null,
    lng: geometry?.location?.lng?.() ?? null,
  };
};

// address fields merged from several geocoder results
export const parseAddressResults = (results) => {
  let city = "";
  let state = "";
  let postal = "";
  let suffix = "";
  let country = "";
  let lat, lng;
  let streetAddress = "";

  for (const result of results) {
    const comps = result.address_components || [];
    const find = (types) => findComponent(comps, types);

    if (!city) {
      city =
        find("locality")?.long_name ||
        find("postal_town")?.long_name ||
        find("administrative_area_level_3")?.long_name ||
        find("administrative_area_level_2")?.long_name ||
        "";
    }

    if (!state) {
      const s = find("administrative_area_level_1");
      if (s) state = s.short_name || s.long_name;
    }

    if (!postal) {
      const p = find("postal_code");
      if (p) postal = p.long_name;
    }

    if (!suffix) {
      const s = find("postal_code_suffix");
      if (s) suffix = s.long_name;
    }

    if (!country) {
      const c = find("country");
      if (c) country = c.long_name;
    }

    if (!lat && result.geometry?.location) {
      lat = result.geometry.location.lat();
      lng = result.geometry.location.lng();
    }

    if (!streetAddress) {
      const assembled = joinStreetAddress([
        find("premise")?.long_name || "",
        find("street_number")?.long_name || "",
        find("route")?.long_name || "",
        find("subpremise")?.long_name || "",
      ]);
      if (assembled) streetAddress = assembled;
    }

    if (city && state && postal && country) break;
  }

  return { streetAddress, city, state, country, zipCode: suffix ? `${postal}-${suffix}` : postal, lat, lng };
};

export const hasPostalCode = (place) =>
  (place.address_components || []).some((c) => c.types.includes("postal_code"));
