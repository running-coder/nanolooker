import * as React from "react";

import { Transaction } from "types/transaction";

interface Blocks extends Transaction {
  price: number;
}
export interface Entry {
  totalPayouts: number;
  totalAccounts: number;
  totalUniqueAccounts: number;
  totalAccountsHolding: number;
  totalBalanceHolding: number;
  totalFiatPayouts: number;
  blocks: Blocks[];
  date: string;
}

const useStatistics2Miners = () => {
  const [statistics, setStatistics] = React.useState([] as Entry[]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getStatistics = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/statistics/2miners", {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      setStatistics(json);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getStatistics();
  }, []);

  return { statistics, isLoading, isError };
};

export default useStatistics2Miners;
