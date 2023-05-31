import * as React from "react";

export interface Return {
  developerFundTransactions: any;
  isLoading: boolean;
  isError: boolean;
}

const useDeveloperFundTransactions = (): Return => {
  const [developerFundTransactions, setDeveloperFundTransactions] = React.useState([] as any);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getDeveloperFundTransactions = async () => {
    setIsError(false);
    setIsLoading(true);

    const res = await fetch("/api/developer-fund/transactions");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setDeveloperFundTransactions(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (Object.keys(developerFundTransactions).length) return;

    getDeveloperFundTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { developerFundTransactions, isLoading, isError };
};

export default useDeveloperFundTransactions;
