import React from "react";
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
}

const MAX_RECENT_TRANSACTIONS: number = 25;

const useSocket = () => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = React.useState<
    RecentTransaction[]
  >([]);

  React.useEffect(() => {
    const ws = new WebSocket("ws://68.183.110.185:7078");
    // const socket = new WebSocket('ws://[::1]:7078');

    ws.onopen = () => {
      setIsConnected(true);
      const confirmation_subscription = {
        action: "subscribe",
        topic: Topic.CONFIRMATION
      };
      ws.send(JSON.stringify(confirmation_subscription));
    };

    ws.onmessage = (msg: any) => {
      try {
        const json = JSON.parse(msg.data);
        if (json.topic === Topic.CONFIRMATION) {
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
    };

    return () => ws.close();
  }, []);

  return { recentTransactions, isConnected };
};

export default useSocket;
