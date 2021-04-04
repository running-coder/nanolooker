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

  try {
    res = await fetch(`/api/rpc`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        ...params,
      }),
    });

    json = await res.json();

    if (!json && isRPCAvailable) {
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
