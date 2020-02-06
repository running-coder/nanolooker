import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Icon,
  List,
  Popover,
  Skeleton,
  Switch,
  Tag,
  Timeline,
  Typography
} from "antd";
import BigNumber from "bignumber.js";
import useSockets from "api/hooks/use-socket";
import { TypeColors } from "pages/Account/Transactions";
import { Color } from "components/Price";
import { rawToRai } from "components/utils";

const { Text } = Typography;

const HomePage = () => {
  const {
    recentTransactions,
    isConnected,
    setIsMinAmount,
    isDisabled,
    setIsDisabled
  } = useSockets();

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
                <Text style={{ marginRight: "16px" }}>Enable Live updates</Text>
                <Switch
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="close" />}
                  onChange={(checked: boolean) => {
                    setIsDisabled(!checked);
                  }}
                  defaultChecked
                />
              </List.Item>
              <List.Item>
                <Text style={{ marginRight: "16px" }}>
                  Include amounts under 1 NANO
                </Text>
                <Switch
                  checkedChildren={<Icon type="check" />}
                  unCheckedChildren={<Icon type="close" />}
                  onChange={(checked: boolean) => {
                    setIsMinAmount(!checked);
                  }}
                  defaultChecked
                />
              </List.Item>
            </List>
          }
          trigger="click"
        >
          <Icon type="setting" />
        </Popover>
      }
    >
      <Skeleton active={true} loading={!isConnected}>
        {recentTransactions.length ? (
          <Timeline mode="alternate">
            {recentTransactions.map(
              ({ account, amount, hash, block: { subtype } }) => {
                let color = undefined;
                if (!account) {
                  color = subtype === "change" ? "#722ed1" : undefined;
                } else {
                  color = subtype === "send" ? Color.NEGATIVE : Color.POSITIVE;
                }

                const position = subtype === "send" ? "right" : "left";

                return (
                  <Timeline.Item
                    color={color}
                    key={hash}
                    className={`fadein ${position}`}
                  >
                    <Tag
                      // @ts-ignore
                      color={TypeColors[subtype.toUpperCase()]}
                      style={{ textTransform: "capitalize" }}
                    >
                      {subtype}
                    </Tag>
                    <Text style={{ color }}>
                      {amount
                        ? `${new BigNumber(rawToRai(amount)).toFormat()} NANO`
                        : "N/A"}
                    </Text>
                    <br />
                    <Link to={`/account/${account}`} className="link-normal">
                      {account}
                    </Link>
                    <br />
                    <Link to={`/block/${hash}`} className="link-muted">
                      {hash}
                    </Link>
                  </Timeline.Item>
                );
              }
            )}
          </Timeline>
        ) : (
          <p style={{ marginTop: "1em", textAlign: "center" }}>
            {isDisabled ? (
              <>
                <Icon
                  type="close-circle"
                  theme="twoTone"
                  twoToneColor={Color.NEGATIVE}
                />
                <Text style={{ marginLeft: "8px" }}>Live updates disabled</Text>
              </>
            ) : (
              <>
                <Icon type="sync" spin />
                <Text style={{ marginLeft: "8px" }}>
                  Waiting for transactions ...
                </Text>
              </>
            )}
          </p>
        )}
      </Skeleton>
    </Card>
  );
};

export default HomePage;
