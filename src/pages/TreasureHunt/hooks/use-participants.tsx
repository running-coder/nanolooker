import * as React from "react";

import qs from "qs";

interface Participant {
  account: string;
  twitter: string | undefined;
  nanoCafe: string | undefined;
  representative: string | undefined;
  nanoBrowserQuest: string | undefined;
  payout: string | undefined;
}

interface Meta {
  perPage: number;
  offset: number;
  total: number;
}

export interface Return {
  participants: Participant[];
  meta: Meta;
  isLoading: boolean;
  isError: boolean;
}

interface Params {
  account?: string;
  page?: number;
}

const useParticipants = ({ account, page }: Params): Return => {
  const [participants, setParticipants] = React.useState([] as Participant[]);
  const [meta, setMeta] = React.useState({} as Meta);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getParticipants = async ({ account, page }: Params) => {
    setIsLoading(true);
    setIsError(false);

    const query = qs.stringify(
      { account, page },
      {
        addQueryPrefix: true,
      },
    );
    const res = await fetch(`/api/participants${query}`);
    const json = await res.json();

    if (!json || json.error) {
      setIsError(true);
    } else {
      if (account) {
        setParticipants(Object.keys(json).length ? [json] : []);
        setMeta({} as Meta);
      } else {
        setParticipants(json.data);
        setMeta(json.meta);
      }
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getParticipants({ account, page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, page]);

  return { participants, meta, isLoading, isError };
};

export default useParticipants;
