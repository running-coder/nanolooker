import * as React from "react";
import qs from "qs";
import { isValidAccountAddress } from "components/utils";

interface Return {
  isFilterable: boolean | null;
  getIsFilterable: () => void;
  isLoading: boolean;
  isError: boolean;
}

export const useIsFilterable = (account: string): Return => {
  const [isFilterable, setIsFilterable] = React.useState<boolean | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getIsFilterable = async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      if (!isValidAccountAddress(account)) {
        throw new Error(`Invalid account: ${account}`);
      }

      const query = qs.stringify(
        { account },
        {
          addQueryPrefix: true,
        },
      );

      const res = await fetch(`/api/transaction-filters${query}`);
      const { isFilterable } = await res.json();

      setIsFilterable(isFilterable);
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    setIsFilterable(null);
  }, [account]);

  return { isFilterable, getIsFilterable, isLoading, isError };
};
