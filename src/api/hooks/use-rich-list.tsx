import * as React from "react";

import qs from "qs";

import { KnownAccountsContext } from "api/contexts/KnownAccounts";

export interface Data {
  account: string;
  balance: number;
  alias?: string;
}

interface Meta {
  perPage: number;
  offset: number;
  total: number;
}

export interface Return {
  data: Data[];
  meta: Meta;
  isLoading: boolean;
  isError: boolean;
}

interface Params {
  account?: string;
  page?: number;
}

const useRichList = ({ account, page }: Params): Return => {
  const [data, setData] = React.useState([] as Data[]);
  const [meta, setMeta] = React.useState({} as Meta);
  const { knownAccounts, isLoading: isKnownAccountsLoading } =
    React.useContext(KnownAccountsContext);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getRichList = async ({ account, page }: Params) => {
    setIsError(false);
    setIsLoading(true);

    const query = qs.stringify(
      { account, page },
      {
        addQueryPrefix: true,
      },
    );
    const res = await fetch(`/api/rich-list${query}`);
    const json = await res.json();

    if (!json || json.error) {
      setIsError(true);
    } else {
      setData(json.data);
      setMeta(json.meta);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    if (isLoading || isKnownAccountsLoading || !data.length) return;

    const accounts = (data as Data[]).map(({ account, balance }) => {
      const alias = knownAccounts.find(
        ({ account: knownAccount }) => account === knownAccount,
      )?.alias;

      return {
        account,
        balance,
        alias,
      };
    });

    setData(accounts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, knownAccounts, isKnownAccountsLoading]);

  React.useEffect(() => {
    getRichList({ account, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, page]);

  return { data, meta, isLoading, isError };
};

export default useRichList;
