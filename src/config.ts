// need to use "REACT_APP_" so we can use it directly on the client side
// "REACT_APP_" is just a prefix that React uses to avoid accidental secret leaks
// https://create-react-app.dev/docs/adding-custom-environment-variables/

export const isLiveNetwork =
  (process.env.REACT_APP_LIVE_NETWORK || "true") === "true";

export const defaultNanoWebsocketUrl = process.env.REACT_APP_NANO_WEBSOCKET_URL;
