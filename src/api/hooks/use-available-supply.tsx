import React from "react";
import { rawToRai } from "components/utils";

export interface Return {
  rawAvailableSupply: number;
  availableSupply: number;
}

const useAvailableSupply = (): Return => {
  const [availableSupply, setAvailableSupply] = React.useState({} as Return);

  const getAvailableSupply = async () => {
    const rawAvailableSupply = 133247751314337892790698507037689913088;

    setAvailableSupply({
      rawAvailableSupply,
      availableSupply: rawToRai(rawAvailableSupply),
    });
  };

  React.useEffect(() => {
    getAvailableSupply();
  }, []);

  return { ...availableSupply };
};

export default useAvailableSupply;
