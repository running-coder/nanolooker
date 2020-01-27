import React from "react";
import { rpc } from "api/rpc";

export interface VersionResponse {
  rpc_version: string;
  store_version: string;
  protocol_version: string;
  node_vendor: string;
  store_vendor: string;
  network: string;
  network_identifier: string;
  build_info: string;
}

export interface UseVersionReturn {
  version: VersionResponse;
}

const useVersion = (): UseVersionReturn => {
  const [version, setVersion] = React.useState({} as VersionResponse);

  const getVersion = async () => {
    const json = (await rpc("version")) || {};
    setVersion(json);
  };

  React.useEffect(() => {
    getVersion();
  }, []);

  return { version };
};

export default useVersion;
