import * as React from "react";

import { rpc } from "api/rpc";
import { isValidBlockHash } from "components/utils";

import type { Subtype, Type } from "types/transaction";

export interface BlockInfo {
  block_account: string;
  amount: string;
  balance: string;
  height: string;
  local_timestamp: string;
  confirmed: string;
  contents?: {
    type: Type;
    account: string;
    previous: string;
    representative: string;
    balance: string;
    link: string;
    link_as_account: string;
    signature: string;
    work: string;
  };
  subtype: Subtype;
  successor: string;
}

export interface Return {
  block: string;
  setBlock: Function;
  blockInfo: BlockInfo;
  isLoading: boolean;
  isError: boolean;
}

export const BlockInfoContext = React.createContext<Return>({
  block: "",
  setBlock: () => {},
  blockInfo: {} as BlockInfo,
  isLoading: false,
  isError: false,
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [block, setBlock] = React.useState<string>("");
  const [blockInfo, setBlockInfo] = React.useState({} as BlockInfo);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getBlockInfo = async (block: string) => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("block_info", {
      hash: block,
      json_block: "true",
    });

    !json || json.error ? setIsError(true) : setBlockInfo(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (block && isValidBlockHash(block)) {
      getBlockInfo(block);
    }
  }, [block]);
  return (
    <BlockInfoContext.Provider value={{ block, setBlock, blockInfo, isLoading, isError }}>
      {children}
    </BlockInfoContext.Provider>
  );
};

export default Provider;
