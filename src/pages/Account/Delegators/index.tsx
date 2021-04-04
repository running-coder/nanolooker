import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, Col, Row, Skeleton, Statistic, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { DelegatorsContext } from "api/contexts/Delegators";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Title } = Typography;

const Delegators: React.FC = () => {
  const { t } = useTranslation();
  const { account } = React.useContext(AccountInfoContext);
  const {
    delegators: allDelegators,
    getDelegators,
    isLoading,
  } = React.useContext(DelegatorsContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");

  React.useEffect(() => {
    getDelegators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const delegators = allDelegators[account];

  return (
    <>
      <Title level={3} style={{ marginTop: "0.5em" }}>
        {t("common.delegators")}
      </Title>
      <Card size="small" bordered={false} className="detail-layout">
        {!isLoading && !isSmallAndLower ? (
          <>
            <Row gutter={6}>
              <Col sm={10} md={10} xl={6}>
                {t("pages.representative.votingWeight")}
              </Col>
              <Col sm={10} md={10} xl={14}>
                {t("common.account")}
              </Col>
            </Row>
          </>
        ) : null}
        <Skeleton loading={isLoading}>
          {delegators
            ? Object.entries(delegators?.delegators || []).map(
                ([account, weight]) => {
                  const alias = knownAccounts.find(
                    ({ account: knownAccount }) => account === knownAccount,
                  )?.alias;

                  return (
                    <Row gutter={6} key={account}>
                      <Col xs={24} sm={12} md={8} lg={6}>
                        <Statistic suffix="NANO" value={weight} />
                        {new BigNumber(weight)
                          .times(100)
                          .dividedBy(delegators.weight)
                          .toFormat(2)}
                        %
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
                },
              )
            : null}
          {!delegators ? (
            <Row>
              <Col xs={24} style={{ textAlign: "center" }}>
                {t("pages.representative.noDelegatorsFound")}
              </Col>
            </Row>
          ) : null}
        </Skeleton>
      </Card>
    </>
  );
};

export default Delegators;
