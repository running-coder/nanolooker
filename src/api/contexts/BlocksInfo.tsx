import React from "react";
import useDeepCompareEffect from "use-deep-compare-effect";
import { rpc } from "api/rpc";
import { BlockInfo } from "./BlockInfo";
import { isValidBlockHash } from "components/utils";

export interface Response {
  blocks: {
    [key: string]: BlocksInfo;
  };
}

export interface BlocksInfo extends BlockInfo {
  pending?: string;
  source_account?: string;
}

export interface Return {
  blocks: string[];
  setBlocks: Function;
  blocksInfo: Response;
  isLoading: boolean;
  isError: boolean;
}

export const BlocksInfoContext = React.createContext<Return>({
  blocks: [],
  setBlocks: () => {},
  blocksInfo: {} as Response,
  isLoading: false,
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [blocks, setBlocks] = React.useState<string[]>([]);
  const [blocksInfo, setBlocksInfo] = React.useState({} as Response);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);

  const getBlocksInfo = async (blocks: string[]) => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("blocks_info", {
      hashes: blocks,
      pending: "true",
      source: "true",
      balance: "true",
      json_block: "true"
    });

    !json || json.error ? setIsError(true) : setBlocksInfo(json);
    setIsLoading(false);
  };

  useDeepCompareEffect(() => {
    const filteredBlocks = (blocks || []).filter(block =>
      isValidBlockHash(block)
    );

    if (filteredBlocks.length) {
      getBlocksInfo(blocks);
    }
  }, [blocks]);
  return (
    <BlocksInfoContext.Provider
      value={{ blocks, setBlocks, blocksInfo, isLoading, isError }}
    >
      {children}
    </BlocksInfoContext.Provider>
  );
};

export default Provider;
