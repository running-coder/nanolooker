import React from "react";

export interface DistributionIndex {
  accounts: number;
  balance: number;
}

interface Data {
  distribution: DistributionIndex[];
  dormantFunds: any;
  knownExchanges: { [key: string]: number };
  status: {
    executionTime: number;
    date: string;
  };
}

export interface Return {
  data: Data;
  isLoading: boolean;
  isError: boolean;
}

const useDistribution = (): Return => {
  const [data, setData] = React.useState({} as Data);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getDistribution = async () => {
    setIsError(false);
    setIsLoading(true);

    const res = await fetch("/api/distribution");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setData(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getDistribution();
  }, []);

  return { data, isLoading, isError };
};

export default useDistribution;
