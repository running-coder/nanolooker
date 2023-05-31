import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Link, useHistory } from "react-router-dom";

import { Tag, Timeline, Typography } from "antd";
import BigNumber from "bignumber.js";
import TimeAgo from "timeago-react";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { Colors, TwoToneColors } from "components/utils";
import { rawToRai } from "components/utils";
import i18next from "i18next";
import { Transaction } from "types/transaction";

const { Text } = Typography;

interface Props {
  recentTransactions: Transaction[];
}

const RecentTransactions: React.FC<Props> = ({ recentTransactions }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const { theme, filterTransactions, disableLiveTransactions } =
    React.useContext(PreferencesContext);
  const isMediumAndLower = !useMediaQuery({ query: "(min-width: 768px)" });

  return (
    <Timeline className="sticky" mode={isMediumAndLower ? "left" : "alternate"}>
      {recentTransactions.map(({ account, amount, hash, timestamp, alias, block: { subtype } }) => {
        const color =
          // @ts-ignore
          Colors[`${subtype.toUpperCase()}${theme === Theme.DARK ? "_DARK" : ""}`];

        return (
          <Timeline.Item
            color={color}
            key={hash}
            className={`fadein ${subtype === "send" ? "right" : "left"}`}
          >
            <div className="first-row">
              <Tag
                color={
                  // @ts-ignore
                  TwoToneColors[`${subtype.toUpperCase()}${theme === Theme.DARK ? "_DARK" : ""}`]
                }
                className={`tag-${subtype} timeline-tag`}
              >
                {t(`transaction.${subtype}`)}
              </Tag>
              {subtype !== "change" ? (
                <Text style={{ color }} className="timeline-amount">
                  {amount
                    ? `Ӿ ${new BigNumber(rawToRai(amount)).toFormat()}`
                    : t("common.notAvailable")}
                </Text>
              ) : null}
              <TimeAgo
                locale={i18next.language}
                datetime={timestamp}
                live={true}
                className="timeline-timeago color-muted"
                style={{
                  marginLeft: subtype === "change" ? "6px" : 0,
                }}
              />
            </div>
            {alias ? <div className="color-important">{alias}</div> : null}
            {filterTransactions || disableLiveTransactions ? (
              <>
                <Link to={`/account/${account}`} className="color-normal">
                  {account}
                </Link>
                <br />
                <Link to={`/block/${hash}`} className="color-muted">
                  {hash}
                </Link>
              </>
            ) : (
              <>
                <span
                  className="link color-normal"
                  // iOS has difficulties when using <a> & onClick listeners when CPS are very high,
                  // the other page onClick events becomes unresponsive, using <span> & onMouseDown instead
                  // seems to remove that limitation :shrug:
                  onMouseDown={e => {
                    e.preventDefault();
                    history.push(`/account/${account}`);
                  }}
                >
                  {account}
                </span>
                <br />
                <span
                  className="link color-muted"
                  onMouseDown={e => {
                    e.preventDefault();
                    history.push(`/block/${hash}`);
                  }}
                >
                  {hash}
                </span>
              </>
            )}
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default RecentTransactions;
