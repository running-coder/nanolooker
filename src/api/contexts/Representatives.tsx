import React from "react";
import { rpc } from "api/rpc";

export interface RepresentativesReturn {
  representatives: any;
  isError: boolean;
}

export const RepresentativesContext = React.createContext<
  RepresentativesReturn
>({
  representatives: [],
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<string[]>([]);
  const [isError, setIsError] = React.useState(false);

  const getRepresentatives = async () => {
    const json = await rpc("representatives");

    !json || json.error
      ? setIsError(true)
      : setRepresentatives(json.representatives);
  };

  React.useEffect(() => {
    getRepresentatives();
  }, []);

  return (
    <RepresentativesContext.Provider value={{ representatives, isError }}>
      {children}
    </RepresentativesContext.Provider>
  );
};

export default Provider;
