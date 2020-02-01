import React from "react";
import { rpc } from "api/rpc";

export interface ConfirmationQuorumRPCResponse {
  quorum_delta: string;
  online_weight_quorum_percent: string;
  online_weight_minimum: string;
  online_stake_total: string;
  peers_stake_total: string;
  peers_stake_required: string;
  principal_representative_min_weight?: number;
}

export interface ConfirmationQuorumReturn {
  confirmationQuorum: ConfirmationQuorumRPCResponse;
  isError: boolean;
}

export const ConfirmationQuorumContext = React.createContext<
  ConfirmationQuorumReturn
>({
  confirmationQuorum: {} as ConfirmationQuorumRPCResponse,
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [confirmationQuorum, setConfirmationQuorum] = React.useState(
    {} as ConfirmationQuorumRPCResponse
  );
  const [isError, setIsError] = React.useState(false);

  const getConfirmationQuorum = async () => {
    const json = await rpc("confirmation_quorum");

    !json || json.error ? setIsError(true) : setConfirmationQuorum(json);
  };

  React.useEffect(() => {
    getConfirmationQuorum();
  }, []);

  return (
    <ConfirmationQuorumContext.Provider value={{ confirmationQuorum, isError }}>
      {children}
    </ConfirmationQuorumContext.Provider>
  );
};

export default Provider;
