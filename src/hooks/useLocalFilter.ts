import { useState, useMemo } from "react";

interface FilterConfig<T> {
  data: T[];
  searchKeys: (keyof T)[];
  initialSort?: { key: keyof T; direction: "asc" | "desc" };
}

export function useLocalFilter<T>({ data, searchKeys, initialSort }: FilterConfig<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState(initialSort);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(query);
        })
      );
    }

    // Category Filter (assumes item has a 'status' or 'category' field)
    if (activeCategory && activeCategory !== "All") {
      result = result.filter((item: any) => 
        (item.status === activeCategory) || 
        (item.category === activeCategory) ||
        (item.type === activeCategory)
      );
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, activeCategory, sortConfig, searchKeys]);

  return {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortConfig,
    setSortConfig,
    filteredData,
  };
}
