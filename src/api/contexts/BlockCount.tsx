import React from "react";
import { rpc } from "api/rpc";

export interface Response {
  count: string;
  unchecked: string;
  cemented: string;
}

export interface Return {
  getBlockCount(): any;
  isError: boolean;
}

export const BlockCountContext = React.createContext<Return & Response>({
  count: "0",
  unchecked: "0",
  cemented: "0",
  getBlockCount: () => {},
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [blockCount, setBlockCount] = React.useState({} as Response);
  const [isError, setIsError] = React.useState(false);

  const getBlockCount = async () => {
    const json = await rpc("block_count");

    !json || json.error ? setIsError(true) : setBlockCount(json);
  };

  React.useEffect(() => {
    getBlockCount();
  }, []);

  return (
    <BlockCountContext.Provider
      value={{ ...blockCount, getBlockCount, isError }}
    >
      {children}
    </BlockCountContext.Provider>
  );
};

export default Provider;
