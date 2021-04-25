import * as React from "react";

export enum SearchType {
  ACCOUNT = "account",
  BLOCK = "block",
}

export interface UseSearchReturn {
  searchValue: string | undefined;
  setSearchValue: Function;
  searchType: string | undefined;
  setSearchType: Function;
}

const useSearch = (): UseSearchReturn => {
  const [searchValue, setSearchValue] = React.useState<string>();
  const [searchType, setSearchType] = React.useState<string>();

  return { searchValue, setSearchValue, searchType, setSearchType };
};

export default useSearch;
