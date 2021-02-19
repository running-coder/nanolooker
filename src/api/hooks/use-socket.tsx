import React from "react";
import BigNumber from "bignumber.js";
import { rawToRai } from "components/utils";
import { Type, Subtype } from "types/Transaction";
import { PreferencesContext } from "../contexts/Preferences";

enum Topic {
  CONFIRMATION = "confirmation",
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
let isForcedClosed = false;

const useSocket = () => {
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [recentTransactions, setRecentTransactions] = React.useState<
    RecentTransaction[]
  >([]);

  const {
    hideTransactionsUnderOneNano,
    disableLiveTransactions,
  } = React.useContext(PreferencesContext);

  const connect = () => {
    isForcedClosed = false;
    setIsConnected(false);
    ws = new WebSocket("wss://www.nanolooker.com/ws");

    ws.onopen = () => {
      setIsConnected(true);
      const confirmation_subscription = {
        action: "subscribe",
        topic: Topic.CONFIRMATION,
      };
      ws.send(JSON.stringify(confirmation_subscription));
    };

    ws.onclose = function() {
      if (isForcedClosed) return;
      setTimeout(() => {
        connect();
      }, 1000);
    };

    ws.onmessage = onMessage;
  };

  React.useEffect(() => {
    // connect();

    return () => {
      isForcedClosed = true;
      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (disableLiveTransactions) {
      isForcedClosed = true;
      ws?.close();
    } else {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableLiveTransactions]);

  React.useEffect(() => {
    if (!ws) return;
    ws.onmessage = onMessage;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hideTransactionsUnderOneNano]);

  const onMessage = React.useCallback(
    (msg: any) => {
      try {
        const json = JSON.parse(msg.data);
        if (json.topic === Topic.CONFIRMATION) {
          if (
            hideTransactionsUnderOneNano &&
            new BigNumber(rawToRai(json.message.amount)).toNumber() < 1
          ) {
            return;
          }
          json.message.timestamp = new Date().getTime();

          setRecentTransactions(prevRecentTransactions =>
            [
              json.message as RecentTransaction,
              ...prevRecentTransactions,
            ].slice(0, MAX_RECENT_TRANSACTIONS),
          );
        }
      } catch (_e) {
        // silence error
      }
    },
    [hideTransactionsUnderOneNano],
  );

  return {
    recentTransactions,
    isConnected,
  };
};

export default useSocket;
