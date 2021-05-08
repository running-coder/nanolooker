import * as React from "react";
import { rpc } from "api/rpc";
import { rawToRai } from "components/utils";

interface AvailableSupply {
  rawAvailableSupply: string;
  availableSupply: number;
}
export interface Return extends AvailableSupply {
  isLoading: boolean;
  isError: boolean;
}

const useAvailableSupply = (): Return => {
  const [availableSupply, setAvailableSupply] = React.useState(
    {} as AvailableSupply,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getAvailableSupply = async () => {
    setIsError(false);
    setIsLoading(true);

    const json = await rpc("available_supply");

    if (!json || json.error) {
      setIsError(true);
    } else {
      setAvailableSupply({
        rawAvailableSupply: json.available,
        availableSupply: rawToRai(json.available),
      });
    }

    setIsLoading(false);
  };

  React.useEffect(() => {
    getAvailableSupply();
  }, []);

  return { ...availableSupply, isLoading, isError };
};

export default useAvailableSupply;
