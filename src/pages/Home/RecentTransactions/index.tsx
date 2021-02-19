import React from "react";
import { Link } from "react-router-dom";
import { Card, List, Popover, Switch, Tag, Timeline, Typography } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  SettingOutlined,
  CloseCircleFilled,
  CloseCircleTwoTone,
  SyncOutlined,
} from "@ant-design/icons";

import useMediaQuery from "@material-ui/core/useMediaQuery";
import TimeAgo from "timeago-react";
import BigNumber from "bignumber.js";
import { Colors, TwoToneColors } from "components/utils";
import useSockets from "api/hooks/use-socket";
import { rawToRai } from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { Theme, PreferencesContext } from "api/contexts/Preferences";

const { Text } = Typography;

const RecentTransactions = () => {
  const {
    theme,
    hideTransactionsUnderOneNano,
    disableLiveTransactions,
    setHideTransactionsUnderOneNano,
    setDisableLiveTransactions,
  } = React.useContext(PreferencesContext);
  const { recentTransactions, isConnected } = useSockets();
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isMediumAndLower = !useMediaQuery("(min-width: 768px)");

  return (
    <Card
      size="small"
      title="Recent Transactions"
      extra={
        <Popover
          placement="left"
          content={
            <List size="small">
              <List.Item>
                <Text style={{ marginRight: "16px" }}>Enable live updates</Text>
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
                  Include amounts under 1 NANO
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
      <div style={{ margin: "1em 0" }}>
        {disableLiveTransactions ? (
          <div style={{ textAlign: "center" }}>
            {theme === Theme.DARK ? (
              <CloseCircleFilled style={{ color: TwoToneColors.SEND_DARK }} />
            ) : (
              <CloseCircleTwoTone twoToneColor={TwoToneColors.SEND} />
            )}
            <Text style={{ marginLeft: "8px" }}>Live updates disabled</Text>
          </div>
        ) : null}
        {isConnected &&
        !disableLiveTransactions &&
        !recentTransactions.length ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>
              Waiting for transactions ...
            </Text>
          </div>
        ) : null}
        {!isConnected && !disableLiveTransactions ? (
          <div style={{ textAlign: "center" }}>
            <SyncOutlined spin />
            <Text style={{ marginLeft: "8px" }}>
              Connecting to the NANO blockchain ...
            </Text>
          </div>
        ) : null}
        {recentTransactions.length ? (
          <Timeline
            mode={isMediumAndLower ? "left" : "alternate"}
            style={{ marginTop: disableLiveTransactions ? "24px" : 0 }}
          >
            {recentTransactions.map(
              ({ account, amount, hash, timestamp, block: { subtype } }) => {
                const color =
                  // @ts-ignore
                  Colors[
                    `${subtype.toUpperCase()}${
                      theme === Theme.DARK ? "_DARK" : ""
                    }`
                  ];
                const alias = knownAccounts.find(
                  ({ account: knownAccount }) => knownAccount === account,
                )?.alias;

                return (
                  <Timeline.Item
                    color={color}
                    key={hash}
                    className={`fadein ${
                      subtype === "send" ? "right" : "left"
                    }`}
                  >
                    <div className="first-row">
                      <Tag
                        color={
                          // @ts-ignore
                          TwoToneColors[
                            `${subtype.toUpperCase()}${
                              theme === Theme.DARK ? "_DARK" : ""
                            }`
                          ]
                        }
                        className={`tag-${subtype} timeline-tag`}
                      >
                        {subtype}
                      </Tag>
                      {subtype !== "change" ? (
                        <Text style={{ color }} className="timeline-amount">
                          {amount
                            ? `${new BigNumber(
                                rawToRai(amount),
                              ).toFormat()} NANO`
                            : "N/A"}
                        </Text>
                      ) : null}
                      <TimeAgo
                        datetime={timestamp}
                        live={true}
                        className="timeline-timeago color-muted"
                        style={{
                          marginLeft: subtype === "change" ? "6px" : 0,
                        }}
                      />
                    </div>
                    {alias ? (
                      <div className="color-important">{alias}</div>
                    ) : null}
                    <Link to={`/account/${account}`} className="color-normal">
                      {account}
                    </Link>
                    <br />
                    <Link to={`/block/${hash}`} className="color-muted">
                      {hash}
                    </Link>
                  </Timeline.Item>
                );
              },
            )}
          </Timeline>
        ) : null}
      </div>
    </Card>
  );
};

export default RecentTransactions;
