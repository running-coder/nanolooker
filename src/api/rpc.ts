// @TODO complete the RPC types...
export const rpc = async (action: string, params?: any) => {
  let res;
  let json;

  try {
    res = await fetch(`/api/rpc`, {
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

    // console.log("~~action", action, json);
  } catch (e) {
    // silence error
  }

  return json;
};
