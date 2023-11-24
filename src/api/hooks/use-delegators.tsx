import * as React from "react";

import qs from "qs";

import { isValidAccountAddress } from "components/utils";

export interface Return {
  delegators: { [key: string]: number };
  meta: Meta;
  isLoading: boolean;
  isError: boolean;
}

interface Meta {
  perPage: number;
  offset: number;
  total: number;
}

interface Params {
  account?: string;
  page?: number;
}

const useDelegators = ({ account, page }: Params): Return => {
  const [delegators, setDelegators] = React.useState({} as any);
  const [meta, setMeta] = React.useState({} as Meta);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getDelegators = async ({ account, page }: Params) => {
    setIsError(false);
    setIsLoading(true);

    const query = qs.stringify(
      { account, page },
      {
        addQueryPrefix: true,
      },
    );
    const res = await fetch(`/api/delegators${query}`);
    const json = await res.json();

    if (!json || json.error) {
      setIsError(true);
    } else {
      setDelegators(json.data);
      setMeta(json.meta);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    if (!account || !isValidAccountAddress(account)) return;

    getDelegators({ account, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, page]);

  return { delegators, meta, isLoading, isError };
};

export default useDelegators;
