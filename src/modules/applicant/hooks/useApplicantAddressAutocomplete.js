import { useRef } from "react";
import { parseAddressComponents, parseAddressResults } from "@/modules/applicant/utils/applicant.utils7";

const NEXT_FIELD_ID = "companyTitle";

// google places autocomplete that fills the ID Mission address fields
const useApplicantAddressAutocomplete = (setIdMissionVerifiedData) => {
  const autocompleteRef = useRef(null);

  const applyParsedAddress = (parsed) => {
    setIdMissionVerifiedData((prev) => ({
      ...prev,
      streetAddress: { name: "streetAddress", value: parsed.streetAddress },
      city: { name: "city", value: parsed.city },
      state: { name: "state", value: parsed.state },
      country: { name: "country", value: parsed.country },
      zipCode: { name: "zipCode", value: parsed.zipCode },
    }));
    setTimeout(() => document.getElementById(NEXT_FIELD_ID)?.focus(), 50);
  };

  // fill only the parts the place did not have
  const reverseGeocode = (lat, lng) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status !== "OK" || !results?.length) return;
      const parsed = parseAddressResults(results);
      setIdMissionVerifiedData((prev) => ({
        ...prev,
        streetAddress: { name: "streetAddress", value: prev.streetAddress?.value || parsed.streetAddress },
        city: { name: "city", value: prev.city?.value || parsed.city },
        state: { name: "state", value: prev.state?.value || parsed.state },
        country: { name: "country", value: prev.country?.value || parsed.country },
        zipCode: { name: "zipCode", value: prev.zipCode?.value || parsed.zipCode },
        lat: { name: "lat", value: parsed.lat ?? prev.lat },
        lng: { name: "lng", value: parsed.lng ?? prev.lng },
      }));
    });
  };

  const onLoad = (autocompleteInstance) => {
    autocompleteRef.current = autocompleteInstance;
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;

    if (!place.address_components?.length && place.place_id) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ placeId: place.place_id }, (results, status) => {
        if (status === "OK" && results?.length) applyParsedAddress(parseAddressResults(results));
        else applyParsedAddress(parseAddressComponents(place.address_components || [], place.geometry));
      });
      return;
    }

    applyParsedAddress(parseAddressComponents(place.address_components || [], place.geometry));
    const hasPostal = (place.address_components || []).some((c) => c.types.includes("postal_code"));
    if (!hasPostal && place.geometry?.location) {
      reverseGeocode(place.geometry.location.lat(), place.geometry.location.lng());
    }
  };

  return { onLoad, onPlaceChanged };
};

export default useApplicantAddressAutocomplete;
