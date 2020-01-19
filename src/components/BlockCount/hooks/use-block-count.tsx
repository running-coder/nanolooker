import React from "react";
import { rpc } from "api/rpc";

export interface BlockCountResponse {
  count: string;
  unchecked: string;
  cemented: string;
}

export interface UseBlockCountReturn {
  blockCount: BlockCountResponse;
  getBlockCount(): any;
}

const useBlockCount = (): UseBlockCountReturn => {
  const [blockCount, setBlockCount] = React.useState({} as BlockCountResponse);

  const getBlockCount = async () => {
    const json = (await rpc("block_count")) || {};
    setBlockCount(json);
  };

  React.useEffect(() => {
    getBlockCount();
  }, []);

  return { blockCount, getBlockCount };
};

export default useBlockCount;
