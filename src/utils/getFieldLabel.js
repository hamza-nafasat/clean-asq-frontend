// "searchObjectKey" -> "Search Object Key"
const getFieldLabel = (field) =>
  field
    .split(/(?=[A-Z])/)
    .join(" ")
    .replace(/^\w/, (c) => c.toUpperCase());

export default getFieldLabel;
