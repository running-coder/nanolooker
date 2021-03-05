import React from "react";
import { useTranslation } from "react-i18next";
import { Card, List, Popover, Switch, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  CloseCircleFilled,
  CloseCircleTwoTone,
  SyncOutlined,
} from "@ant-design/icons";
import { TwoToneColors } from "components/utils";
import ConfirmationsPerSecond from "components/ConfirmationsPerSecond";
import useSockets from "api/hooks/use-socket";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import Timeline from "./Timeline";

const { Text } = Typography;

const RecentTransactions = () => {
  const { t } = useTranslation();
  const {
    theme,
    hideTransactionsUnderOneNano,
    disableLiveTransactions,
    setHideTransactionsUnderOneNano,
    setDisableLiveTransactions,
  } = React.useContext(PreferencesContext);
  const { recentTransactions, isConnected, isError } = useSockets();

  return (
    <Card
      size="small"
      title={t("pages.home.recentTransactions")}
      extra={
        <Popover
          placement="left"
          content={
            <List size="small">
              <List.Item>
                <Text style={{ marginRight: "16px" }}>
                  {t("pages.home.preferences.enableLiveUpdates")}
                </Text>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={(checked: boolean) => {
                    setDisableLiveTransactions(!checked);
                  }}
                  defaultChecked={!disableLiveTransactions}
                />
              </List.Item>
              <List.Item>
                <Text style={{ marginRight: "16px" }}>
                  {t("pages.home.preferences.includeAmountsUnder1")}
                </Text>
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                  onChange={(checked: boolean) => {
                    setHideTransactionsUnderOneNano(!checked);
                  }}
                  defaultChecked={!hideTransactionsUnderOneNano}
                />
              </List.Item>
            </List>
          }
          trigger="click"
        >
          <SettingOutlined />
        </Popover>
      }
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
            <Text style={{ marginLeft: "8px" }}>
              {t("pages.home.liveUpdatesDisabled")}
            </Text>
          </div>
        ) : null}
        {isConnected &&
        !disableLiveTransactions &&
        !recentTransactions.length ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>
              {t("pages.home.waitingForTransactions")} ...
            </Text>
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
