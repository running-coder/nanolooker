import * as React from "react";

export interface CryptoCurrency {
  id: string;
  symbol: string;
  name: string;
  image: string;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation: null;
  twitterFollowers: number | null;
  redditSubscribers: number | null;
  githubStars: number | null;
  twitterFollowersPerBillion: number | null;
  redditSubscribersPerBillion: number | null;
  githubStarsPerBillion: number | null;
  rank?: number;
}

const useStatisticsSocial = () => {
  const [statistics, setStatistics] = React.useState([] as CryptoCurrency[]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getStatistics = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/statistics-social", {
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

export default useStatisticsSocial;
