import React from "react";
import { rpc } from "api/rpc";

export interface AvailableSupplyResponse {
  available: string;
}

export interface UseAvailableSupplyReturn {
  availableSupply: AvailableSupplyResponse;
  isError: boolean;
}

const useAvailableSupply = (): UseAvailableSupplyReturn => {
  const [availableSupply, setAvailableSupply] = React.useState(
    {} as AvailableSupplyResponse
  );
  const [isError, setIsError] = React.useState(false);

  const getVersion = async () => {
    const json = await rpc("available_supply");

    !json || json.error ? setIsError(true) : setAvailableSupply(json);
  };

  React.useEffect(() => {
    getVersion();
  }, []);

  return { availableSupply, isError };
};

export default useAvailableSupply;
