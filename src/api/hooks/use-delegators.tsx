import React from "react";
import qs from "qs";
import { isValidAccountAddress } from "components/utils";

export interface Return {
  delegators: { [key: string]: number };
  isLoading: boolean;
  isError: boolean;
}

const useDelegators = (account: string): Return => {
  const [delegators, setDelegators] = React.useState({} as any);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getDelegators = async (account: string) => {
    setIsError(false);
    setIsLoading(true);

    const query = qs.stringify(
      { account },
      {
        addQueryPrefix: true,
      },
    );
    const res = await fetch(`/api/delegators${query}`);
    const json = await res.json();

    !json || json.error ? setIsError(true) : setDelegators(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!isValidAccountAddress(account)) return;

    getDelegators(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return { delegators, isLoading, isError };
};

export default useDelegators;
