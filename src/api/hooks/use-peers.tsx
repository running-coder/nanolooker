import React from "react";
import { rpc } from "api/rpc";

export interface PeersResponse {
  peers: any;
}

export interface UsePeersReturn {
  peers: PeersResponse;
  count: number;
}

const usePeers = (): UsePeersReturn => {
  const [peers, setPeers] = React.useState({} as PeersResponse);

  const getPeers = async () => {
    const json = (await rpc("peers")) || {};
    setPeers(json);
  };

  React.useEffect(() => {
    getPeers();
  }, []);

  return { peers, count: Object.keys(peers?.peers || {}).length };
};

export default usePeers;
