import * as React from "react";

import BigNumber from "bignumber.js";

import { PreferencesContext } from "api/contexts/Preferences";
import { rawToRai } from "components/utils";

import { usePrevious } from "./use-previous";

import type { Transaction } from "types/transaction";

enum Topic {
  CONFIRMATION = "confirmation",
}

interface MessageData {
  message: Transaction;
  time: string;
  topic: Topic;
}

let ws: WebSocket | undefined;
let isForcedClosed = false;
let isMounted: boolean = false;

const KEEP_ALIVE = 30000;

const useSocket = ({ account }: { account?: string }) => {
  const { websocketDomain } = React.useContext(PreferencesContext);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [pendingTransactions, setPendingTransactions] = React.useState<Transaction[]>([]);
  const [balance, setBalance] = React.useState(0);
  const [pendingBalance, setPendingBalance] = React.useState(0);
  const [isConnected, setIsConnected] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const prevAccount = usePrevious(account);

  let pingInterval: number | undefined;

  const visibilityChange = () => {
    if (document.visibilityState !== "visible") {
      isForcedClosed = true;
      ws?.close();
    } else {
      isForcedClosed = false;
      connect();
    }
  };

  React.useEffect(() => {
    connect();

    isMounted = true;
    window.addEventListener("visibilitychange", visibilityChange);

    return () => {
      isMounted = false;
      window.removeEventListener("visibilitychange", visibilityChange);

      ws?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!prevAccount || prevAccount === account) return;

    setTransactions([]);
    setPendingTransactions([]);
    setBalance(0);
    setPendingBalance(0);

    const confirmation_subscription = {
      action: "update",
      topic: Topic.CONFIRMATION,
      options: {
        // confirmation_type: "active_quorum",
        // all_local_accounts: true,
        accounts_add: [account],
        accounts_del: [prevAccount],
      },
    };

    ws?.send(JSON.stringify(confirmation_subscription));
    if (ws) {
      ws.onmessage = onMessage;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const onMessage = React.useCallback(
    (msg: MessageEvent) => {
      try {
        const { message, topic }: MessageData = JSON.parse(msg.data);

        if (topic === Topic.CONFIRMATION) {
          const { block, ...rest } = message;
          const flatMessage = {
            ...block,
            ...rest,
            local_timestamp: Date.now() / 1000,
          };

          if (account === flatMessage.link_as_account) {
            flatMessage.subtype = "pending";

            // @ts-ignore
            setPendingTransactions(prevPendingTransactions => [
              flatMessage,
              ...prevPendingTransactions,
            ]);
            setPendingBalance(prevPendingBalance =>
              new BigNumber(prevPendingBalance).plus(rawToRai(flatMessage.amount)).toNumber(),
            );
          } else if (account === flatMessage.account) {
            if (flatMessage.subtype === "send") {
              flatMessage.account = flatMessage.link_as_account;
            } else if (flatMessage.subtype === "change") {
              flatMessage.amount = "0";
            } else if (flatMessage.subtype === "receive") {
              // @TODO Check why a receive transaction has an invalid link_as_account!? and a not defined source_account
              // https://github.com/nanocurrency/nano-node/issues/3523
              flatMessage.account = "";
            }

            setPendingTransactions(prevPendingTransactions =>
              prevPendingTransactions.filter(({ hash }) => hash !== flatMessage.link),
            );

            // @NOTE pending are only for receive transactions
            if (flatMessage.subtype === "receive") {
              setPendingBalance(prevPendingBalance =>
                new BigNumber(prevPendingBalance).minus(rawToRai(flatMessage.amount)).toNumber(),
              );
            }
            // @ts-ignore
            setTransactions(prevTransactions => [flatMessage, ...prevTransactions]);
            setBalance(prevBalance =>
              new BigNumber(prevBalance)
                .plus(rawToRai(flatMessage.amount) * (flatMessage.subtype === "receive" ? 1 : -1))
                .toNumber(),
            );
          }
        }
      } catch (_e) {
        // silence error
      }
    },
    [account],
  );

  const connect = () => {
    isForcedClosed = false;
    setIsConnected(false);

    ws = new WebSocket(websocketDomain || "wss://www.nanolooker.com/ws");

    ws.onopen = () => {
      clearInterval(pingInterval);
      setIsError(false);
      setIsConnected(true);

      const confirmation_subscription = {
        action: "subscribe",
        topic: Topic.CONFIRMATION,
        options: {
          confirmation_type: "active_quorum",
          all_local_accounts: true,
          accounts: [account],
        },
      };

      ws?.send(JSON.stringify(confirmation_subscription));

      pingInterval = window.setInterval(() => {
        if (!ws || ws.readyState !== ws.OPEN) return;
        ws.send(
          JSON.stringify({
            action: "ping",
          }),
        );
      }, KEEP_ALIVE);
    };

    ws.onclose = () => {
      ws = undefined;
      clearInterval(pingInterval);
      if (!isMounted) return;
      setIsConnected(false);
      if (isForcedClosed) return;
      setTimeout(() => {
        connect();
      }, 1000);
    };

    ws.onerror = () => {
      setIsError(true);
    };

    ws.onmessage = onMessage;
  };

  return {
    transactions,
    pendingTransactions,
    balance,
    pendingBalance,
    isConnected,
    isError,
  };
};

export default useSocket;
