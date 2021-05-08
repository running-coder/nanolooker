import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Card, Col, Empty, Row, Skeleton, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { DelegatorsContext } from "api/contexts/Delegators";
import useDelegators from "api/hooks/use-delegators";

const { Title } = Typography;

const Delegators: React.FC = () => {
  const { t } = useTranslation();
  const { account } = React.useContext(AccountInfoContext);
  const { delegators: allDelegators, getDelegators } = React.useContext(
    DelegatorsContext,
  );
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const { delegators, isLoading: isDelegatorsLoading } = useDelegators(account);
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");

  React.useEffect(() => {
    getDelegators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const count = new BigNumber(allDelegators[account] || 0).toFormat();

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Title level={3}>
          {count} {t(`common.delegator${count !== "1" ? "s" : ""}`)}
        </Title>

        <Link to={`/account/${account}`}>
          <Button size="small" style={{ marginTop: "6px" }}>
            {t("pages.account.viewTransactions")}
          </Button>
        </Link>
      </div>

      <Card size="small" bordered={false} className="detail-layout">
        {!isDelegatorsLoading && !isSmallAndLower ? (
          <>
            <Row gutter={6}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <span className="default-color">
                  {t("pages.representative.votingWeight")}
                </span>
              </Col>
              <Col xs={24} sm={12} md={16} lg={18}>
                {t("common.account")}
              </Col>
            </Row>
          </>
        ) : null}

        {isDelegatorsLoading
          ? Array.from(Array(3).keys()).map(index => (
              <Row gutter={6} key={index}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col xs={24} sm={12} md={16} lg={18}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
              </Row>
            ))
          : null}

        {!isDelegatorsLoading && Object.keys(delegators).length
          ? Object.entries(delegators || []).map(([account, weight]) => {
              const alias = knownAccounts.find(
                ({ account: knownAccount }) => account === knownAccount,
              )?.alias;

              return (
                <Row gutter={6} key={account}>
                  <Col xs={24} sm={12} md={8} lg={6}>
                    <span
                      style={{
                        display: "block",
                      }}
                    >
                      {new BigNumber(weight).toFormat()} BAN
                    </span>
                  </Col>
                  <Col xs={24} sm={12} md={16} lg={18}>
                    {alias ? (
                      <div className="color-important">{alias}</div>
                    ) : null}
                    <Link to={`/account/${account}`} className="break-word">
                      {account}
                    </Link>
                  </Col>
                </Row>
              );
            })
          : null}

        {!isDelegatorsLoading && !Object.keys(delegators).length ? (
          <Row>
            <Col xs={24} style={{ textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("pages.representative.noDelegatorsFound")}
                style={{ padding: "12px" }}
              />
            </Col>
          </Row>
        ) : null}
      </Card>
    </>
  );
};

export default Delegators;
