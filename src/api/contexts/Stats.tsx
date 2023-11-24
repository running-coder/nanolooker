import * as React from "react";

import { rpc } from "api/rpc";

export interface Return {
  stats: any;
  isLoading: boolean;
  isError: boolean;
}

export const StatsContext = React.createContext<Return>({
  stats: {},
  isLoading: false,
  isError: false,
});

// type Types = 'counters' | 'samples' | 'objects';

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [stats, setStats] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getStats = async () => {
    setIsError(false);
    setIsLoading(true);

    const json = await rpc("stats", { type: "counters" });

    !json || json.error ? setIsError(true) : setStats(json);
    setIsLoading(false);
  };

  React.useEffect(() => {
    getStats();
  }, []);

  return (
    <StatsContext.Provider value={{ stats, isLoading, isError }}>{children}</StatsContext.Provider>
  );
};

export default Provider;
