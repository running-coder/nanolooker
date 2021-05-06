import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Card, Col, Row, Skeleton, Tooltip, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import TimeAgo from "timeago-react";
import { rpc } from "api/rpc";
import { AccountHistory } from "api/hooks/use-account-history";
import QuestionCircle from "components/QuestionCircle";
import faucets from "./faucets.json";

const { Title, Text } = Typography;

const FaucetsPage: React.FC = () => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");
  const [accountHistories, setAccountHistories] = React.useState(
    [] as AccountHistory[],
  );
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
      setAccountHistories(histories);
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
      <Card
        size="small"
        bordered={false}
        className="detail-layout"
        style={{ marginBottom: "12px" }}
      >
        {!isSmallAndLower ? (
          <Row gutter={6}>
            <Col xs={24} sm={6} xl={4}></Col>
            <Col xs={24} sm={4} xl={4}>
              {t("pages.account.confirmationHeight")}
              <Tooltip
                placement="right"
                title={t("tooltips.confirmationHeight")}
              >
                <QuestionCircle />
              </Tooltip>
            </Col>
            <Col xs={24} sm={14} xl={16}>
              {t("common.account")}
            </Col>
          </Row>
        ) : null}
        {faucets.map(({ name, account, link, byLink }) => {
          const { height, local_timestamp: localTimestamp = 0 } =
            accountHistories?.find(
              ({ account: historyAccount }) => historyAccount === account,
            )?.history[0] || {};

          const modifiedTimestamp = Number(localTimestamp) * 1000;
          return (
            <Row gutter={6} key={name}>
              <Col xs={24} sm={6} xl={4}>
                {name}
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
                      <Text
                        style={{ fontSize: "12px" }}
                        className="color-muted"
                      >
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
                    style={{ fontSize: "12px" }}
                    className="color-muted"
                    datetime={modifiedTimestamp}
                    live={false}
                  />
                </Skeleton>
              </Col>
              <Col xs={24} sm={14} xl={16}>
                <Link
                  to={`/account/${account}`}
                  className="break-word color-normal"
                >
                  {account}
                </Link>
                <br />
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-word"
                >
                  {link}
                </a>
              </Col>
            </Row>
          );
        })}
      </Card>
    </>
  );
};

export default FaucetsPage;
