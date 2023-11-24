import * as React from "react";

import { rpc } from "api/rpc";

export interface Response {
  count: string;
  unchecked: string;
  cemented: string;
}

export interface Return {
  getBlockCount(): any;
  isLoading: boolean;
  isError: boolean;
}

export const BlockCountContext = React.createContext<Return & Response>({
  count: "0",
  unchecked: "0",
  cemented: "0",
  getBlockCount: () => {},
  isLoading: false,
  isError: false,
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [blockCount, setBlockCount] = React.useState({} as Response);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  const getBlockCount = async () => {
    setIsError(false);
    setIsLoading(true);
    const json = await rpc("block_count");

    !json || json.error ? setIsError(true) : setBlockCount(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getBlockCount();
  }, []);

  return (
    <BlockCountContext.Provider value={{ ...blockCount, getBlockCount, isLoading, isError }}>
      {children}
    </BlockCountContext.Provider>
  );
};

export default Provider;
