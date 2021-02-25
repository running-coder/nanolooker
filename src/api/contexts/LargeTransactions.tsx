import React from "react";

import { Transaction } from "types/transaction";

export interface Context {
  getLargeTransactions: () => void;
  largeTransactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
}

export const LargeTransactionsContext = React.createContext<Context>({
  getLargeTransactions: () => {},
  largeTransactions: [],
  isLoading: false,
  isError: false,
});

const Provider: React.FC = ({ children }) => {
  const [largeTransactions, setLargeTransactions] = React.useState(
    [] as Transaction[],
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getLargeTransactions = async () => {
    setIsError(false);
    setIsLoading(true);
    const res = await fetch("/api/large-transactions");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setLargeTransactions(json);

    setIsLoading(false);
  };

  // React.useEffect(() => {
  //   getLargeTransactions();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  return (
    <LargeTransactionsContext.Provider
      value={{
        getLargeTransactions,
        largeTransactions,
        isLoading,
        isError,
      }}
    >
      {children}
    </LargeTransactionsContext.Provider>
  );
};

export default Provider;
