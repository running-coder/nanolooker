import * as React from "react";

const SEARCH_HISTORY_KEY: string = "SEARCH_HISTORY";
const MAX_HISTORY = 10;

interface UseSearchHistoryReturn {
  searchHistory: string[];
  addSearchHistory: Function;
  removeSearchHistory: Function;
}

const getSearchHistory = (): string[] => {
  let searchHistory;
  try {
    searchHistory = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) || "");
  } catch (_e) {}

  return searchHistory || [];
};

const useSearchHistory = (): UseSearchHistoryReturn => {
  const [searchHistory, setSearchHistory] = React.useState<string[]>(getSearchHistory());

  const addSearchHistory = React.useCallback(
    (value: string) => {
      if (searchHistory.includes(value)) return;

      const newSearchHistory = [value].concat(searchHistory).slice(0, MAX_HISTORY);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newSearchHistory));

      setSearchHistory(newSearchHistory);
    },
    [searchHistory],
  );

  const removeSearchHistory = React.useCallback(
    (value: string) => {
      const newSearchHistory = searchHistory.filter(h => h !== value);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newSearchHistory));

      setSearchHistory(newSearchHistory);
    },
    [searchHistory],
  );

  return { searchHistory, addSearchHistory, removeSearchHistory };
};

export default useSearchHistory;
