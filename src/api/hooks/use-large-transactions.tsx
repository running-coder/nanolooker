import * as React from "react";

import type { Transaction } from "types/transaction";

interface Return {
  largeTransactions: Transaction[];
  isLoading: boolean;
  isError: boolean;
}

const useLargeTransactions = (): Return => {
  const [largeTransactions, setLargeTransactions] = React.useState([] as Transaction[]);
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

  React.useEffect(() => {
    getLargeTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { largeTransactions, isLoading, isError };
};

export default useLargeTransactions;
