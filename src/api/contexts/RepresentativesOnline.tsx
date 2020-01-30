import React from "react";
import { rpc } from "api/rpc";

export interface RepresentativesOnlineReturn {
  representatives: string[];
  isError: boolean;
}

export const RepresentativesOnlineContext = React.createContext<
  RepresentativesOnlineReturn
>({
  representatives: [],
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<string[]>([]);
  const [isError, setIsError] = React.useState(false);

  const getRepresentativesOnline = async () => {
    const json = await rpc("representatives_online");

    !json || json.error
      ? setIsError(true)
      : setRepresentatives(json.representatives);
  };

  React.useEffect(() => {
    getRepresentativesOnline();
  }, []);

  return (
    <RepresentativesOnlineContext.Provider value={{ representatives, isError }}>
      {children}
    </RepresentativesOnlineContext.Provider>
  );
};

export default Provider;
