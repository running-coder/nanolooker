import React from "react";
import { rpc } from "api/rpc";

export interface Representative {
  account: string;
  weight: number;
  isOnline?: boolean;
  alias?: string;
}
export interface RepresentativesReturn {
  representatives: Representative[];
  isLoading: boolean;
  isError: boolean;
}

export const RepresentativesContext = React.createContext<RepresentativesReturn>(
  {
    representatives: [],
    isLoading: false,
    isError: false,
  },
);

const Provider: React.FC = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<
    Representative[]
  >([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getRepresentatives = async () => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("representatives");

    !json || json.error
      ? setIsError(true)
      : setRepresentatives(json.representatives);

    setIsLoading(false);
  };

  React.useEffect(() => {
    getRepresentatives();
  }, []);

  return (
    <RepresentativesContext.Provider
      value={{ representatives, isLoading, isError }}
    >
      {children}
    </RepresentativesContext.Provider>
  );
};

export default Provider;
