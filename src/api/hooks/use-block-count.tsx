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
  isError: boolean;
}

const useBlockCount = (): UseBlockCountReturn => {
  const [blockCount, setBlockCount] = React.useState({} as BlockCountResponse);
  const [isError, setIsError] = React.useState(false);

  const getBlockCount = async () => {
    const json = await rpc("block_count");

    !json || json.error ? setIsError(true) : setBlockCount(json);
  };

  React.useEffect(() => {
    getBlockCount();
  }, []);

  return { blockCount, getBlockCount, isError };
};

export default useBlockCount;
