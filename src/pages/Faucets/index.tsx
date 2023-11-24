import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";

import { Card, Col, Row, Skeleton, Tooltip, Typography } from "antd";
import reverse from "lodash/reverse";
import sortBy from "lodash/sortBy";
import TimeAgo from "timeago-react";

import { AccountHistory } from "api/hooks/use-account-history";
import { rpc } from "api/rpc";
import QuestionCircle from "components/QuestionCircle";
import i18next from "i18next";

import faucets from "./faucets.json";

const { Title, Text } = Typography;

const FaucetsPage: React.FC = () => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery({ query: "(min-width: 576px)" });
  const [accountHistories, setAccountHistories] = React.useState([] as AccountHistory[]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all(
      faucets.map(({ account }) =>
        rpc("account_history", {
          account,
          count: 1,
        }),
      ),
    ).then((histories: AccountHistory[]) => {
      const sortedHistories = reverse(
        sortBy(
          histories,
          function (o) {
            return parseInt(o.history[0].height);
          },
          ["desc"],
        ),
      );

      setAccountHistories(sortedHistories);
      setIsLoading(false);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.faucets")}</title>
      </Helmet>
      <Title level={3}>{t("menu.faucets")}</Title>
      <div style={{ marginBottom: "12px" }}>
        <Text>{t("pages.faucets.description")}</Text>
      </div>
      <Card size="small" className="detail-layout" style={{ marginBottom: "12px" }}>
        {!isSmallAndLower ? (
          <Row gutter={6}>
            <Col xs={24} sm={6} xl={4}></Col>
            <Col xs={24} sm={4} xl={4}>
              {t("pages.account.confirmationHeight")}
              <Tooltip placement="right" title={t("tooltips.confirmationHeight")}>
                <QuestionCircle />
              </Tooltip>
            </Col>
            <Col xs={24} sm={14} xl={16}>
              {t("common.account")}
            </Col>
          </Row>
        ) : null}
        {accountHistories.map(({ account: historyAccount, history }) => {
          const {
            alias,
            account,
            link,
            byLink,
          }: {
            alias: string;
            account: string;
            link: string;
            byLink?: string;
          } = faucets.find(({ account }) => account === historyAccount)!;

          const { height, local_timestamp: localTimestamp = 0 } = history[0] || {};

          const modifiedTimestamp = Number(localTimestamp) * 1000;

          return alias && account && link ? (
            <Row gutter={6} key={alias}>
              <Col xs={24} sm={6} xl={4}>
                {alias}
                {byLink ? (
                  <>
                    <br />
                    {t("common.by")}{" "}
                    <a href={byLink} target="_blank" rel="noopener noreferrer">
                      {byLink}
                    </a>
                  </>
                ) : null}
              </Col>
              <Col xs={24} sm={4} xl={4}>
                <Skeleton loading={isLoading} active paragraph={false}>
                  {isSmallAndLower ? (
                    <>
                      <Text style={{ fontSize: "12px" }} className="color-muted">
                        {t("pages.account.confirmationHeight")}
                      </Text>{" "}
                    </>
                  ) : null}
                  {height}
                  <br />
                  <Text style={{ fontSize: "12px" }} className="color-muted">
                    {t("pages.account.lastTransaction")}
                  </Text>{" "}
                  <TimeAgo
                    locale={i18next.language}
                    style={{ fontSize: "12px" }}
                    className="color-muted"
                    datetime={modifiedTimestamp}
                    live={false}
                  />
                </Skeleton>
              </Col>
              <Col xs={24} sm={14} xl={16}>
                <Link to={`/account/${account}`} className="break-word color-normal">
                  {account}
                </Link>
                <br />
                <a href={link} target="_blank" rel="noopener noreferrer" className="break-word">
                  {link}
                </a>
              </Col>
            </Row>
          ) : null;
        })}
      </Card>
    </>
  );
};

export default FaucetsPage;
