import * as React from "react";

import qs from "qs";

import { isValidAccountAddress } from "components/utils";

export interface RepresentativeReturn {
  isLoading: boolean;
  isError: boolean;
  representative: any;
}

interface Params {
  account?: string;
}

interface Options {
  skip?: boolean;
}

const useRepresentative = ({ account }: Params = {}, options?: Options): RepresentativeReturn => {
  const [representative, setRepresentative] = React.useState();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getRepresentative = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const query = account
        ? qs.stringify(
            { account },
            {
              addQueryPrefix: true,
            },
          )
        : "";

      const res = await fetch(`/api/representative${query}`);
      const json = await res.json();

      !json || json.error ? setIsError(true) : setRepresentative(json);

      setIsLoading(false);
    } catch (err) {
      setIsError(true);
    }
  };

  React.useEffect(() => {
    if ((account && !isValidAccountAddress(account)) || options?.skip) return;

    getRepresentative();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, options?.skip]);

  return { representative, isLoading, isError };
};

export default useRepresentative;
