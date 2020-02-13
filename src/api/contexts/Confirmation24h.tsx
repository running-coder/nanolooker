import React from "react";

export const TOTAL_CONFIRMATION_KEY_24H = "total_confirmations_24h";
export const TOTAL_NANO_VOLUME_KEY_24H = "total_nano_volume_24h";
export const TOTAL_CONFIRMATION_KEY_48H = "total_confirmations_48h";
export const TOTAL_NANO_VOLUME_KEY_48H = "total_nano_volume_48h";

export interface Response {
  [TOTAL_CONFIRMATION_KEY_24H]: number;
  [TOTAL_NANO_VOLUME_KEY_24H]: number;
  [TOTAL_CONFIRMATION_KEY_48H]: number;
  [TOTAL_NANO_VOLUME_KEY_48H]: number;
}

export interface Return {
  getConfirmation24h: Function;
  isError: boolean;
}

export const Confirmation24hContext = React.createContext<
  Return & Response
>({
  [TOTAL_CONFIRMATION_KEY_24H]: 0,
  [TOTAL_NANO_VOLUME_KEY_24H]: 0,
  [TOTAL_CONFIRMATION_KEY_48H]: 0,
  [TOTAL_NANO_VOLUME_KEY_48H]: 0,
  getConfirmation24h: () => { },
  isError: false
});

const Provider: React.FunctionComponent = ({ children }) => {
  const [confirmation24h, setConfirmation24h] = React.useState(
    {} as Response
  );
  const [isError, setIsError] = React.useState(false);

  const getConfirmation24h = async () => {
    const res = await fetch('/api/statistics');
    const json = await res.json();

    !json ? setIsError(true) : setConfirmation24h(json);
  };

  React.useEffect(() => {
    getConfirmation24h();
    const getConfirmation24hInterval = setInterval(getConfirmation24h, 5000);

    return () => clearInterval(getConfirmation24hInterval)
  }, []);

  return (
    <Confirmation24hContext.Provider
      value={{ ...confirmation24h, getConfirmation24h, isError }}
    >
      {children}
    </Confirmation24hContext.Provider>
  );
};

export default Provider;
