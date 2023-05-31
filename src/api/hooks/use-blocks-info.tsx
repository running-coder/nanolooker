import * as React from "react";

import { rpc } from "api/rpc";

import type { Block, Subtype } from "types/transaction";

interface BlocksInfo {
  [key: string]: {
    subtype: Subtype;
    block_account: string;
    amount: string;
    balance: string;
    height: string;
    local_timestamp: string;
    confirmed: string;
    contents: Block;
  };
}

interface Response {
  blocks: BlocksInfo;
}

export interface Return {
  blocks: Response;
  isLoading: boolean;
  isError: boolean;
}

const useBlocksInfo = (hashes: string[]): Return => {
  const [blocks, setBlocks] = React.useState({} as Response);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getBlocksInfo = async () => {
    setIsError(false);
    setIsLoading(true);

    const json = await rpc("blocks_info", {
      hashes,
    });

    !json || json.error ? setIsError(true) : setBlocks(json as Response);
    setIsLoading(false);
  };

  React.useEffect(() => {
    // Reset on account change
    setBlocks({} as Response);

    if (!hashes.length) return;
    getBlocksInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hashes]);

  return { blocks, isLoading, isError };
};

export default useBlocksInfo;
