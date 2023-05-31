import { LOCALSTORAGE_KEYS } from "api/contexts/Preferences";

let isRPCAvailable = true;

const dispatchRPCStateChange = () => {
  isRPCAvailable = false;
  const event = new Event("rpcStateChange", {
    bubbles: false,
  });
  window.dispatchEvent(event);
};

export const rpc = async (action: string, params?: any) => {
  let res;
  let json;
  let rpcDomain = localStorage.getItem(LOCALSTORAGE_KEYS.RPC_DOMAIN) || undefined;

  try {
    res = await fetch(`/api/rpc`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(rpcDomain
          ? {
              "x-rpc": rpcDomain,
            }
          : null),
      },
      body: JSON.stringify({
        action,
        ...params,
      }),
    });

    json = await res.json();

    if (!json && isRPCAvailable) {
      console.log("Invalid RPC response for ", { action, params });
      dispatchRPCStateChange();
    } else if (!isRPCAvailable) {
      isRPCAvailable = true;
    }
  } catch (err) {
    if (isRPCAvailable) {
      dispatchRPCStateChange();
    }
  }

  return json;
};
