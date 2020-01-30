import React from "react";
import BigNumber from "bignumber.js";
import { rpc } from "api/rpc";
import { ConfirmationQuorumContext } from "./ConfirmationQuorum";
import { rawToRai } from "components/utils";

export interface RepresentativesReturn {
  representatives: string[];
  principalRepresentatives: any;
  isError: boolean;
}

export const RepresentativesContext = React.createContext<
  RepresentativesReturn
>({
  representatives: [],
  principalRepresentatives: {},
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [representatives, setRepresentatives] = React.useState<string[]>([]);
  const { confirmationQuorum } = React.useContext(ConfirmationQuorumContext);
  const [
    principalRepresentatives,
    setPrincipalRepresentatives
  ] = React.useState({});
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

  React.useEffect(() => {
    if (
      confirmationQuorum?.online_stake_total &&
      Object.keys(representatives).length
    ) {
      const minWeight = rawToRai(
        new BigNumber(confirmationQuorum.online_stake_total)
          .times(0.001)
          .toString()
      );

      // @TODO this needs to be node-cached
      const principalRepresentatives = Object.entries(representatives).reduce(
        (acc, [account, weight]: [string, string]) => {
          if (rawToRai(weight) >= minWeight) {
            // @ts-ignore
            acc[account] = weight;
          }

          return acc;
        },
        {}
      );

      setPrincipalRepresentatives(principalRepresentatives);
    }
  }, [confirmationQuorum, representatives]);

  return (
    <RepresentativesContext.Provider
      value={{ representatives, principalRepresentatives, isError }}
    >
      {children}
    </RepresentativesContext.Provider>
  );
};

export default Provider;
