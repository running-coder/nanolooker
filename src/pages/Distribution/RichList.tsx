import * as React from "react";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";

import { Card, Col, Pagination, Row, Skeleton, Typography } from "antd";
import BigNumber from "bignumber.js";
import KnownAccounts from "knownAccounts.json";

import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { CurrencyDecimal, CurrencySymbol, PreferencesContext } from "api/contexts/Preferences";
import useAvailableSupply from "api/hooks/use-available-supply";
import useRichList from "api/hooks/use-rich-list";
import { roundOff } from "components/utils";

const { BURN_ACCOUNT } = KnownAccounts;
const { Title } = Typography;

const RichList: React.FC = () => {
  const { t } = useTranslation();
  // @TODO Add search input
  // const [search, setSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const {
    data,
    meta: { total, perPage },
    isLoading: isRichListLoading,
  } = useRichList({
    // account: search,
    page: currentPage,
  });
  const { fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics: { currentPrice, priceStats },
  } = React.useContext(MarketStatisticsContext);
  const { availableSupply = 123123123 } = useAvailableSupply();
  const isSmallAndLower = !useMediaQuery({ query: "(min-width: 576px)" });

  const btcCurrentPrice = priceStats?.bitcoin?.[fiat] || 0;
  const startIndex = (currentPage - 1) * perPage + 1;

  return (
    <>
      <Title level={3} id="rich-list-title">
        {t("pages.distribution.richList")}
      </Title>
      <Card size="small" className="detail-layout">
        {!isSmallAndLower ? (
          <>
            <Row gutter={6}>
              <Col sm={2} md={2} xl={2}>
                #
              </Col>
              <Col sm={12} md={12} xl={14}>
                {t("common.account")}
              </Col>
              <Col sm={6} md={6} xl={4}>
                {t("common.balance")}
              </Col>
              <Col sm={4} md={4} xl={2}></Col>
            </Row>
          </>
        ) : null}
        {isRichListLoading
          ? Array.from(Array(5).keys()).map(index => (
              <Row gutter={6} key={index}>
                <Col sm={2} md={2} xl={2}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col sm={12} md={12} xl={14}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col sm={6} md={6} xl={4}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col sm={4} md={4} xl={2}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
              </Row>
            ))
          : null}

        {!isRichListLoading && data.length ? (
          <>
            {data.map(({ account, balance, alias }, index) => (
              <Row gutter={6} key={account}>
                <Col sm={2} md={2} xl={2}>
                  <strong>{startIndex + index}</strong>
                </Col>
                <Col sm={12} md={12} xl={14}>
                  {alias ? <div className="color-important">{alias}</div> : null}
                  <Link to={`/account/${account}`} className="break-word">
                    {account}
                  </Link>
                </Col>
                <Col sm={6} md={6} xl={4}>
                  Ӿ {new BigNumber(balance).toFormat()}
                  <span
                    className="color-muted"
                    style={{
                      fontSize: 12,
                      display: "block",
                    }}
                  >
                    {availableSupply && account !== BURN_ACCOUNT
                      ? `${roundOff(
                          new BigNumber(balance).times(100).dividedBy(availableSupply).toNumber(),
                        )}%`
                      : null}
                  </span>
                </Col>
                <Col sm={4} md={4} xl={4}>
                  {currentPrice && btcCurrentPrice ? (
                    <>
                      {`${CurrencySymbol?.[fiat]} ${new BigNumber(balance)
                        .times(currentPrice)
                        .toFormat(CurrencyDecimal?.[fiat])}`}
                      <span
                        className="color-muted"
                        style={{
                          fontSize: 12,
                          display: "block",
                        }}
                      >
                        {`${new BigNumber(balance)
                          .times(currentPrice)
                          .dividedBy(btcCurrentPrice)
                          .toFormat(12)} BTC`}
                      </span>
                    </>
                  ) : null}
                </Col>
              </Row>
            ))}
            <Row className="row-pagination">
              <Col xs={24} style={{ textAlign: "right" }}>
                <Pagination
                  size="small"
                  {...{
                    total,
                    pageSize: perPage,
                    current: currentPage,
                    disabled: false,
                    onChange: (page: number) => {
                      const element = document.getElementById("rich-list-title");
                      element?.scrollIntoView();

                      setCurrentPage?.(page);
                    },
                    showSizeChanger: false,
                  }}
                />
              </Col>
            </Row>
          </>
        ) : null}
      </Card>
    </>
  );
};

export default RichList;
