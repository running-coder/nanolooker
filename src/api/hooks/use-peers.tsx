import React from "react";

import { rpc } from "api/rpc";

interface Peer {
  protocol_version: string;
  node_id: string;
  type: "tcp" | "udp";
}

interface Peers {
  [key: string]: Peer;
}

export interface UsePeersReturn {
  peers: Peers;
  getPeers: () => {};
  count: number;
  isLoading: boolean;
  isError: boolean;
}

const usePeers = (): UsePeersReturn => {
  const [peers, setPeers] = React.useState({} as Peers);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getPeers = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const json = await rpc("peers", { peer_details: true });

      !json || json.error || !json.peers ? setIsError(true) : setPeers(json.peers);
    } catch (err) {
      setIsError(true);
    }
    setIsLoading(false);
  };

  React.useEffect(() => {
    getPeers();
  }, []);

  return {
    peers,
    getPeers,
    count: Object.keys(peers).length,
    isLoading,
    isError,
  };
};

export default usePeers;
