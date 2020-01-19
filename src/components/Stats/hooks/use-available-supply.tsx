import React from "react";
import { rpc } from "api/rpc";

export interface AvailableSupplyResponse {
  available: string;
}

export interface UseAvailableSupplyReturn {
  availableSupply: AvailableSupplyResponse;
}

const useAvailableSupply = (): UseAvailableSupplyReturn => {
  const [availableSupply, setAvailableSupply] = React.useState(
    {} as AvailableSupplyResponse
  );

  const getVersion = async () => {
    const json = (await rpc("available_supply")) || {};

    setAvailableSupply(json);
  };

  React.useEffect(() => {
    getVersion();
  }, []);

  return { availableSupply };
};

export default useAvailableSupply;
