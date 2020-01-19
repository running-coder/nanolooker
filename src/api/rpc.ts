// @TODO complete the RPC types...
export const rpc = async (action: string, params?: any) => {
  let res;
  let json;

  try {
    res = await fetch(`${process.env.REACT_APP_RPC_PROXY || ""}/api/rpc`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action,
        ...params
      })
    });

    json = await res.json();
  } catch (e) {
    // throw e;
    // @TODO Set global error
  }

  return json;
};
