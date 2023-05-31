import * as React from "react";

import { rpc } from "api/rpc";

import { ConfirmationQuorumContext } from "./ConfirmationQuorum";
import { KnownAccountsContext } from "./KnownAccounts";
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

export const RepresentativesContext = React.createContext<RepresentativesReturn>({
  representatives: [],
  isLoading: true,
  isError: false,
});

let isEnhancedRepresentativeDone = false;

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<Representative[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [isError, setIsError] = React.useState<boolean>(false);
  const {
    confirmationQuorum: {
      principal_representative_min_weight: principalRepresentativeMinWeight = 0,
    },
  } = React.useContext(ConfirmationQuorumContext);
  const { representatives: representativesOnline } = React.useContext(RepresentativesOnlineContext);
  const { knownAccounts, isLoading: isKnownAccountsLoading } =
    React.useContext(KnownAccountsContext);

  const getRepresentatives = async () => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("representatives");

    isEnhancedRepresentativeDone = false;

    !json || json.error ? setIsError(true) : setRepresentatives(json.representatives || []);

    setIsLoading(false);
  };

  React.useEffect(() => {
    getRepresentatives();
  }, []);

  React.useEffect(() => {
    if (
      isEnhancedRepresentativeDone ||
      isKnownAccountsLoading ||
      !representatives.length ||
      !principalRepresentativeMinWeight ||
      !representativesOnline.length
    )
      return;

    isEnhancedRepresentativeDone = true;

    setRepresentatives(representatives =>
      representatives.map(({ account, weight }) => ({
        account,
        weight,
        isOnline: representativesOnline.includes(account),
        isPrincipal: weight >= principalRepresentativeMinWeight,
        alias: knownAccounts.find(({ account: knownAccount }) => account === knownAccount)?.alias,
      })),
    );

    setIsLoading(false);
  }, [
    representatives,
    principalRepresentativeMinWeight,
    representativesOnline,
    knownAccounts,
    isKnownAccountsLoading,
  ]);

  return (
    <RepresentativesContext.Provider value={{ representatives, isLoading, isError }}>
      {children}
    </RepresentativesContext.Provider>
  );
};

export default Provider;
