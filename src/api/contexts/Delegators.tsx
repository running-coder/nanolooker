import * as React from "react";

interface Delegator {
  [key: string]: number;
}

export interface Return {
  delegators: Delegator;
  getDelegators: Function;
  isLoading: boolean;
  isError: boolean;
}

export const DelegatorsContext = React.createContext<Return>({
  delegators: {},
  getDelegators: () => {},
  isLoading: false,
  isError: false,
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [delegators, setDelegators] = React.useState({} as Delegator);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getDelegators = async () => {
    if (Object.keys(delegators).length) return;

    try {
      setIsError(false);
      setIsLoading(true);
      const res = await fetch("/api/delegators");
      const json = await res.json();

      !json || json.error ? setIsError(true) : setDelegators(json);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  return (
    <DelegatorsContext.Provider value={{ delegators, getDelegators, isLoading, isError }}>
      {children}
    </DelegatorsContext.Provider>
  );
};

export default Provider;
