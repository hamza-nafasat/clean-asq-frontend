import { useState } from "react";

// filter values for a list page
const useListFilter = (initialFilters) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleChange = ({ target: { name, value } }) => setFilters((prev) => ({ ...prev, [name]: value }));
  const clearFilters = () => setFilters(initialFilters);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return { filters, handleChange, clearFilters, hasActiveFilters };
};

export default useListFilter;
