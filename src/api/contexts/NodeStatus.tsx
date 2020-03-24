import React from "react";

interface NodeStatus {
  memory: {
    free: number;
    total: number;
  };
  ledgerSize: number;
  nodeStats: {
    cpu: number;
    memory: number;
    elapsed: number;
  };
}

export interface Return {
  nodeStatus: NodeStatus;
  isLoading: boolean;
  isError: boolean;
}

export const NodeStatusContext = React.createContext<Return>({
  nodeStatus: {} as NodeStatus,
  isLoading: false,
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [nodeStatus, setNodeStatus] = React.useState<NodeStatus>(
    {} as NodeStatus
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getStats = async () => {
    setIsError(false);
    setIsLoading(true);

    const res = await fetch("https://www.nanolooker.com/api/node-status");
    const json = await res.json();

    !json || json.error ? setIsError(true) : setNodeStatus(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getStats();
  }, []);

  return (
    <NodeStatusContext.Provider value={{ nodeStatus, isLoading, isError }}>
      {children}
    </NodeStatusContext.Provider>
  );
};

export default Provider;
