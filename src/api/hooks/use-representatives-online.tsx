import React from "react";
import { rpc } from "api/rpc";

export interface RepresentativesOnlineReturn {
  representatives: string[];
}

const useRepresentativesOnline = (): RepresentativesOnlineReturn => {
  const [representatives, setRepresentatives] = React.useState<string[]>([]);

  const getBlockCount = async () => {
    const { representatives } = (await rpc("representatives_online")) || {};
    setRepresentatives(representatives);
  };

  React.useEffect(() => {
    getBlockCount();
  }, []);

  return { representatives };
};

export default useRepresentativesOnline;
