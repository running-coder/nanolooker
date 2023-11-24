import * as React from "react";

import uniq from "lodash/uniq";

import { rpc } from "api/rpc";

import KnownAccounts from "../../knownAccounts.json";

const { NANOLOOKER } = KnownAccounts;
export interface RepresentativesOnlineReturn {
  representatives: string[];
  isLoading: boolean;
  isError: boolean;
}

export const RepresentativesOnlineContext = React.createContext<RepresentativesOnlineReturn>({
  representatives: [],
  isLoading: false,
  isError: false,
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getRepresentativesOnline = async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      const json = await rpc("representatives_online");

      !json || json.error
        ? setIsError(true)
        : setRepresentatives(uniq(json.representatives.concat([NANOLOOKER])));
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getRepresentativesOnline();
  }, []);

  return (
    <RepresentativesOnlineContext.Provider value={{ representatives, isLoading, isError }}>
      {children}
    </RepresentativesOnlineContext.Provider>
  );
};

export default Provider;
