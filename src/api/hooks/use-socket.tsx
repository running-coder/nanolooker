import React from "react";
import BigNumber from "bignumber.js";
import { rawToRai } from "components/utils";
import { Type, Subtype } from "types/Transaction";

enum Topic {
  CONFIRMATION = "confirmation"
}

interface Block {
  type: Type;
  account: string;
  previous: string;
  representative: string;
  balance: string;
  link: string;
  link_as_account: string;
  signature: string;
  work: string;
  subtype: Subtype;
}

interface RecentTransaction {
  account: string;
  amount: string;
  hash: string;
  confirmation_type: string;
  block: Block;
  timestamp: number;
}

const MAX_RECENT_TRANSACTIONS: number = 25;

let ws: any;

const useSocket = () => {
  const [isDisabled, setIsDisabled] = React.useState<boolean>(false);
  const [isMinAmount, setIsMinAmount] = React.useState<boolean>(false);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = React.useState<
    RecentTransaction[]
  >([]);

  React.useEffect(() => {
    ws = new WebSocket("wss://www.nanolooker.com/ws");

    ws.onopen = () => {
      setIsConnected(true);
      const confirmation_subscription = {
        action: "subscribe",
        topic: Topic.CONFIRMATION
      };
      ws.send(JSON.stringify(confirmation_subscription));
    };

    ws.onmessage = onMessage;

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    ws.onmessage = onMessage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMinAmount, isDisabled]);

  const onMessage = React.useCallback(
    (msg: any) => {
      try {
        const json = JSON.parse(msg.data);
        if (json.topic === Topic.CONFIRMATION) {
          if (
            isDisabled ||
            (isMinAmount &&
              new BigNumber(rawToRai(json.message.amount)).toNumber() < 1)
          ) {
            return;
          }
          json.message.timestamp = new Date().getTime();
          setRecentTransactions(prevRecentTransactions =>
            [
              json.message as RecentTransaction,
              ...prevRecentTransactions
            ].slice(0, MAX_RECENT_TRANSACTIONS)
          );
        }
      } catch (_e) {
        // silence error
      }
    },
    [isMinAmount, isDisabled]
  );

  return {
    recentTransactions,
    isConnected,
    setIsMinAmount,
    isDisabled,
    setIsDisabled
  };
};

export default useSocket;
