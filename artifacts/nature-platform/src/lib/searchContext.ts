import { createContext, useContext } from "react";

export interface SearchContextValue {
  open: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const SearchContext = createContext<SearchContextValue>({
  open: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export function useSearchContext() {
  return useContext(SearchContext);
}
