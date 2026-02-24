const convertObjectToArray = (obj, sectionKey) => {
  // is null return an empty array
  if (obj === null) return [];
  if (obj === undefined) return [];
  if (Array.isArray(obj)) return obj;
  const array = [sectionKey];
  for (const key in obj) {
    if (key !== "updatedBy") {
      array.push({ key, value: obj[key], source: sectionKey, result: true, comment: "" });
    }
  }
  return array;
};

export default convertObjectToArray;
