import React from "react";
import { rpc } from "api/rpc";
import { ConfirmationQuorumContext } from "./ConfirmationQuorum";
import { RepresentativesOnlineContext } from "./RepresentativesOnline";

export interface Representative {
  account: string;
  weight: number;
  isOnline?: boolean;
  isPrincipal?: boolean;
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

let isEnhancedRepresentativeDone = false;

const Provider: React.FC = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<
    Representative[]
  >([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const {
    confirmationQuorum: {
      principal_representative_min_weight: principalRepresentativeMinWeight = 0,
    },
  } = React.useContext(ConfirmationQuorumContext);
  const { representatives: representativesOnline } = React.useContext(
    RepresentativesOnlineContext,
  );

  const getRepresentatives = async () => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("representatives");

    isEnhancedRepresentativeDone = false;

    !json || json.error
      ? setIsError(true)
      : setRepresentatives(json.representatives);
  };

  React.useEffect(() => {
    getRepresentatives();
  }, []);

  React.useEffect(() => {
    if (
      isEnhancedRepresentativeDone ||
      !representatives.length ||
      !principalRepresentativeMinWeight ||
      !representativesOnline.length
    )
      return;

    const formattedRepresentatives = representatives.map(
      ({ account, weight }) => ({
        account,
        weight,
        isOnline: representativesOnline.includes(account),
        isPrincipal: weight >= principalRepresentativeMinWeight,
      }),
    );

    isEnhancedRepresentativeDone = true;

    setRepresentatives(formattedRepresentatives);

    setIsLoading(false);
  }, [
    representatives,
    principalRepresentativeMinWeight,
    representativesOnline,
  ]);

  return (
    <RepresentativesContext.Provider
      value={{ representatives, isLoading, isError }}
    >
      {children}
    </RepresentativesContext.Provider>
  );
};

export default Provider;
