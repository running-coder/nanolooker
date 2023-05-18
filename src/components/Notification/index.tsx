import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Alert } from "antd";

import { PreferencesContext } from "api/contexts/Preferences";

const Notification: React.FC = () => {
  const { t } = useTranslation();
  const { rpcDomain, websocketDomain } = React.useContext(PreferencesContext);

  return (
    <>
      {rpcDomain ? (
        <Alert
          message={`${rpcDomain ? `Reading RPC from: ${rpcDomain}.` : ""}${
            websocketDomain ? `Reading Websocket from: ${websocketDomain}.` : ""
          }`}
          type="warning"
          style={{ margin: 12 }}
          action={<Link to="/preferences">{t("transaction.change")}</Link>}
        ></Alert>
      ) : null}
    </>
  );
};

export default Notification;
