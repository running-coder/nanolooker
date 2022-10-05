import * as React from "react";
import qs from "qs";
// import useDeepCompareEffect from "use-deep-compare-effect";
import { isValidAccountAddress } from "components/utils";

import type { History } from "./AccountHistory";
import type { HistoryFilters } from "pages/Account/History/Filters";
import { AccountInfoContext } from "./AccountInfo";

interface Return {
  history: History[];
  filters: HistoryFilters | null;
  setFilters: Function;
  isLoading: boolean;
  isError: boolean;
}

export const AccountHistoryFilterContext = React.createContext<Return>({
  history: [],
  filters: {} as HistoryFilters | null,
  setFilters: () => {},
  isLoading: false,
  isError: false,
});

const Provider: React.FC = ({ children }) => {
  const [history, setHistory] = React.useState([] as History[]);
  const [filters, setFilters] = React.useState<HistoryFilters | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const { account } = React.useContext(AccountInfoContext);

  const getHistory = async (filters: HistoryFilters) => {
    setIsError(false);
    setIsLoading(true);

    try {
      const query = qs.stringify(
        { account, filters },
        {
          addQueryPrefix: true,
        },
      );

      console.log("~~~~DO QUERY!!");

      const res = await fetch(`/api/transaction-filters${query}`);
      const data = await res.json();

      setHistory(data);
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  // useDeepCompareEffect(() => {
  React.useEffect(() => {
    if (!isValidAccountAddress(account) || filters === null) return;

    getHistory(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, filters]);

  return (
    <AccountHistoryFilterContext.Provider
      value={{ history, filters, setFilters, isLoading, isError }}
    >
      {children}
    </AccountHistoryFilterContext.Provider>
  );
};

export default Provider;
