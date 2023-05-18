import * as React from "react";

import { rpc } from "api/rpc";
import { rawToRai } from "components/utils";

export interface Return extends Supply {
  isLoading: boolean;
  isError: boolean;
}

interface Supply {
  rawAvailableSupply: number;
  availableSupply: number;
}

const useAvailableSupply = (): Return => {
  const [availableSupply, setAvailableSupply] = React.useState({} as Supply);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getAvailableSupply = async () => {
    setIsLoading(true);
    try {
      const json = await rpc("available_supply");

      if (!json || json.error) {
        setIsError(true);
      } else {
        const rawAvailableSupply = parseInt(json.available);
        setAvailableSupply({
          rawAvailableSupply,
          availableSupply: rawToRai(rawAvailableSupply),
        });
      }
    } catch (err) {
      setIsError(true);
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getAvailableSupply();
  }, []);

  return { ...availableSupply, isLoading, isError };
};

export default useAvailableSupply;
