import React from "react";
import BigNumber from "bignumber.js";
import { rawToRai } from "components/utils";
import { Type, Subtype } from "types/Transaction";
import { PreferencesContext } from "../contexts/Preferences";

enum Topic {
  CONFIRMATION = "confirmation",
}

type ConfirmationType = "active_quorum";

interface MessageData {
  message: RecentTransaction;
  time: string;
  topic: Topic;
}

interface RecentTransaction {
  account: string;
  amount: string;
  block: Block;
  confirmation_type: ConfirmationType;
  hash: string;
  timestamp: number;
}

interface Block {
  account: string;
  balance: string;
  link: string;
  link_as_account: string;
  previous: string;
  representative: string;
  signature: string;
  subtype: Subtype;
  type: Type;
  work: string;
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
    (msg: MessageEvent) => {
      try {
        const { message, topic }: MessageData = JSON.parse(msg.data);

        if (topic === Topic.CONFIRMATION) {
          if (
            hideTransactionsUnderOneNano &&
            ["send", "receive"].includes(message.block.subtype) &&
            new BigNumber(rawToRai(message.amount)).toNumber() < 1
          ) {
            return;
          }

          message.timestamp = Date.now();

          setRecentTransactions(prevRecentTransactions =>
            [message, ...prevRecentTransactions].slice(
              0,
              MAX_RECENT_TRANSACTIONS,
            ),
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
