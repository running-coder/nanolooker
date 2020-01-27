import React from "react";
import { rpc } from "api/rpc";

export interface PeersResponse {
  peers: any;
}

export interface UsePeersReturn {
  peers: PeersResponse;
  count: number;
  isError: boolean;
}

const usePeers = (): UsePeersReturn => {
  const [peers, setPeers] = React.useState({} as PeersResponse);
  const [isError, setIsError] = React.useState(false);

  const getPeers = async () => {
    const json = await rpc("peers");

    !json || json.error ? setIsError(true) : setPeers(json);
  };

  React.useEffect(() => {
    getPeers();
  }, []);

  return { peers, count: Object.keys(peers?.peers || {}).length, isError };
};

export default usePeers;
