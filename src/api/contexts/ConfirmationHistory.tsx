import * as React from "react";

import { rpc } from "api/rpc";

export interface Response {
  confirmation_stats: {
    count: string;
    average: string;
  };
  confirmations: any[];
}

export interface Return {
  getConfirmationHistory: Function;
  isError: boolean;
}

export const ConfirmationHistoryContext = React.createContext<Return & Response>({
  confirmation_stats: {
    count: "0",
    average: "0",
  },
  confirmations: [],
  getConfirmationHistory: () => {},
  isError: false,
});

interface Props {
  children: React.ReactNode;
}

const Provider: React.FC<Props> = ({ children }) => {
  const [confirmationHistory, setConfirmationHistory] = React.useState({} as Response);
  const [isError, setIsError] = React.useState(false);

  const getConfirmationHistory = async () => {
    const json = await rpc("confirmation_history");

    !json || json.error ? setIsError(true) : setConfirmationHistory(json);
  };

  React.useEffect(() => {
    getConfirmationHistory();
  }, []);

  return (
    <ConfirmationHistoryContext.Provider
      value={{ ...confirmationHistory, getConfirmationHistory, isError }}
    >
      {children}
    </ConfirmationHistoryContext.Provider>
  );
};

export default Provider;
