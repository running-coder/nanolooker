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
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import TimeAgo from "timeago-react";
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
        <div style={{ margin: "1em 0" }}>
          {isDisabled ? (
            <div style={{ textAlign: "center" }}>
              <Icon
                type="close-circle"
                theme="twoTone"
                twoToneColor={Color.NEGATIVE}
              />
              <Text style={{ marginLeft: "8px" }}>Live updates disabled</Text>
            </div>
          ) : null}
          {!isDisabled && !recentTransactions.length ? (
            <div style={{ textAlign: "center" }}>
              <Icon type="sync" spin />
              <Text style={{ marginLeft: "8px" }}>
                Waiting for transactions ...
              </Text>
            </div>
          ) : null}
          {recentTransactions.length ? (
            <Timeline
              mode={isMediumAndLower ? "left" : "alternate"}
              style={{ marginTop: isDisabled ? "24px" : 0 }}
            >
              {recentTransactions.map(
                ({ account, amount, hash, timestamp, block: { subtype } }) => {
                  let color = undefined;
                  if (!account) {
                    color = subtype === "change" ? "#722ed1" : undefined;
                  } else {
                    color =
                      subtype === "send" ? Color.NEGATIVE : Color.POSITIVE;
                  }

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
                          // @ts-ignore
                          color={TypeColors[subtype.toUpperCase()]}
                          className="timeline-tag"
                        >
                          {subtype}
                        </Tag>
                        <Text style={{ color }} className="timeline-amount">
                          {amount
                            ? `${new BigNumber(
                                rawToRai(amount)
                              ).toFormat()} NANO`
                            : "N/A"}
                        </Text>
                        <TimeAgo
                          datetime={timestamp}
                          live={true}
                          className="timeline-timeago color-muted"
                        />
                      </div>
                      <Link to={`/account/${account}`} className="color-normal">
                        {account}
                      </Link>
                      <br />
                      <Link to={`/block/${hash}`} className="color-muted">
                        {hash}
                      </Link>
                    </Timeline.Item>
                  );
                }
              )}
            </Timeline>
          ) : null}
        </div>
      </Skeleton>
    </Card>
  );
};

export default HomePage;
