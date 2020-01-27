import React from "react";

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

  const getAvailableSupply = async () => {
    // const json = await rpc("available_supply");
    // !json || json.error ? setIsError(true) : setAvailableSupply(json);

    // @Note: This value shouldn't change
    setAvailableSupply({
      available: "133247751314337892790698507037689913088"
    });
  };

  React.useEffect(() => {
    getAvailableSupply();
  }, []);

  return { availableSupply };
};

export default useAvailableSupply;
