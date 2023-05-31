import * as React from "react";

import { rpc } from "api/rpc";

export interface RepresentativesOnlineReturn {
  representatives: string[];
  isError: boolean;
}

const useRepresentativesOnline = (): RepresentativesOnlineReturn => {
  const [representatives, setRepresentatives] = React.useState<string[]>([]);
  const [isError, setIsError] = React.useState(false);

  const getBlockCount = async () => {
    try {
      const json = await rpc("representatives_online");

      !json || json.error ? setIsError(true) : setRepresentatives(json.representatives);
    } catch (err) {
      setIsError(true);
    }
  };

  React.useEffect(() => {
    getBlockCount();
  }, []);

  return { representatives, isError };
};

export default useRepresentativesOnline;
