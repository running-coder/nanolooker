import * as React from "react";
import { useTranslation } from "react-i18next";

import { CloseCircleFilled, CloseCircleTwoTone, SyncOutlined } from "@ant-design/icons";
import { Card, Typography } from "antd";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import useSockets from "api/hooks/use-socket";
import ConfirmationsPerSecond from "components/ConfirmationsPerSecond";
import RecentTransactionsPreferences from "components/Preferences/RecentTransactions";
import { TwoToneColors } from "components/utils";

import Timeline from "./Timeline";

const { Text } = Typography;

const RecentTransactions: React.FC = () => {
  const { t } = useTranslation();
  const { theme, disableLiveTransactions } = React.useContext(PreferencesContext);

  const { recentTransactions, isConnected, isError } = useSockets();

  return (
    <Card
      size="small"
      title={t("pages.home.recentTransactions")}
      extra={<RecentTransactionsPreferences />}
    >
      <div
        className="sticky"
        style={{
          paddingBottom: "6px",
          zIndex: 1,
          background: theme === Theme.DARK ? "#1e1e1e" : "#fff",
        }}
      >
        <ConfirmationsPerSecond />
        {disableLiveTransactions ? (
          <div style={{ textAlign: "center" }}>
            {theme === Theme.DARK ? (
              <CloseCircleFilled style={{ color: TwoToneColors.SEND_DARK }} />
            ) : (
              <CloseCircleTwoTone twoToneColor={TwoToneColors.SEND} />
            )}
            <Text style={{ marginLeft: "8px" }} id="live-transactions-disabled">
              {t("pages.home.liveUpdatesDisabled")}
            </Text>
          </div>
        ) : null}
        {isConnected && !disableLiveTransactions && !recentTransactions.length ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>{t("pages.home.waitingForTransactions")} ...</Text>
          </div>
        ) : null}
        {!isConnected && !disableLiveTransactions ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>
              {isError
                ? t("pages.home.reconnectingToBlockchain")
                : t("pages.home.connectingToBlockchain")}
              ...
            </Text>
          </div>
        ) : null}
      </div>
      <div
        className="gradient-container"
        style={{
          maxHeight: "1260px",
          overflow: "hidden",
        }}
      >
        {recentTransactions.length ? (
          <>
            <Timeline recentTransactions={recentTransactions} />
            <div className="bottom-gradient" />
          </>
        ) : null}
      </div>
    </Card>
  );
};

export default RecentTransactions;
