import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, Col, Row, Skeleton, Tag, Tooltip, Typography } from "antd";
import { CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import {
  Theme,
  PreferencesContext,
  CurrencySymbol,
  CurrencyDecimal,
} from "api/contexts/Preferences";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { BlocksInfoContext } from "api/contexts/BlocksInfo";
import {
  toBoolean,
  TwoToneColors,
  rawToRai,
  timestampToDate,
  isValidAccountAddress,
  isValidBlockHash,
  isOpenAccountBlockHash,
} from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import LoadingStatistic from "components/LoadingStatistic";
import BlockHeader from "../Header";

const { Text, Title } = Typography;

const BlockDetails = () => {
  const { t } = useTranslation();
  const { theme, fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics: {
      currentPrice,
      priceStats: { bitcoin: { [fiat]: btcCurrentPrice = 0 } } = {
        bitcoin: { [fiat]: 0 },
      },
    },
    isInitialLoading: isMarketStatisticsInitialLoading,
  } = React.useContext(MarketStatisticsContext);
  const {
    blocks,
    blocksInfo,
    isLoading: isBlocksInfoLoading,
  } = React.useContext(BlocksInfoContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isBlocksInfoLoading || isMarketStatisticsInitialLoading,
  };

  const blockInfo = blocksInfo?.blocks?.[blocks[0]];

  const {
    subtype,
    block_account: blockAccount,
    source_account: sourceAccount,
    contents: {
      type = "",
      representative = "",
      link_as_account: linkAsAccount = "",
      previous = "",
      signature = "",
      work = "",
    } = {},
  } = blockInfo || {};

  const modifiedTimestamp = Number(blockInfo?.local_timestamp) * 1000;

  const amount = new BigNumber(rawToRai(blockInfo?.amount || 0)).toNumber();
  const fiatAmount = new BigNumber(amount)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcAmount = new BigNumber(amount)
    .times(currentPrice)
    .dividedBy(btcCurrentPrice)
    .toFormat(12);

  const balance = new BigNumber(rawToRai(blockInfo?.balance || 0)).toNumber();
  const fiatBalance = new BigNumber(balance)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcBalance = new BigNumber(balance)
    .times(currentPrice)
    .dividedBy(btcCurrentPrice)
    .toFormat(12);

  let linkAccountLabel = "";
  if (subtype === "send") {
    linkAccountLabel = t("pages.block.receiver");
  } else if (subtype === "receive") {
    linkAccountLabel = t("pages.block.sender");
  }

  const secondAccount = isValidAccountAddress(sourceAccount || "")
    ? sourceAccount
    : linkAsAccount;

  const blockAccountAlias = knownAccounts.find(
    ({ account: knownAccount }) => knownAccount === blockAccount,
  )?.alias;
  const secondAccountAlias = knownAccounts.find(
    ({ account: knownAccount }) => knownAccount === secondAccount,
  )?.alias;
  const representativeAlias = knownAccounts.find(
    ({ account: knownAccount }) => knownAccount === representative,
  )?.alias;

  const isConfirmed = toBoolean(blockInfo?.confirmed);

  return (
    <>
      {!isBlocksInfoLoading && !blockInfo ? (
        <Card bordered={false}>
          <Title level={3}>{t("pages.block.blockNotFound")}</Title>
          <Text>{t("pages.block.blockNotFoundInfo")}</Text>
        </Card>
      ) : null}
      {isBlocksInfoLoading || blockInfo ? (
        <>
          <Card
            size="small"
            bordered={false}
            className="detail-layout"
            style={{ marginBottom: "12px" }}
          >
            <Row gutter={6}>
              <Col xs={24}>
                <BlockHeader />
              </Col>
            </Row>
            <Row gutter={6}>
              {isSmallAndLower ? null : (
                <Col xs={24} sm={6} xl={4}>
                  {t("pages.block.blockSubtype")}
                </Col>
              )}
              <Col xs={24} sm={18} xl={20}>
                <Tooltip
                  placement={isSmallAndLower ? "right" : "top"}
                  title={t(
                    `pages.block.${
                      isConfirmed ? "confirmed" : "pending"
                    }Status`,
                  )}
                >
                  <Tag
                    icon={
                      isConfirmed ? (
                        <CheckCircleOutlined />
                      ) : (
                        <SyncOutlined spin />
                      )
                    }
                    color={
                      // @ts-ignore
                      TwoToneColors[
                        `${(subtype || type).toUpperCase()}${
                          theme === Theme.DARK ? "_DARK" : ""
                        }`
                      ]
                    }
                    className={`tag-${subtype || type}`}
                  >
                    {t(`transaction.${subtype || type}`)}
                  </Tag>
                </Tooltip>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("common.account")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                {blockAccountAlias ? (
                  <strong style={{ marginRight: "6px" }}>
                    {blockAccountAlias}
                  </strong>
                ) : null}
                <Link to={`/account/${blockAccount}`} className="break-word">
                  {blockAccount}
                </Link>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("transaction.amount")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <LoadingStatistic
                  isLoading={skeletonProps.loading}
                  suffix={
                    isSmallAndLower &&
                    new BigNumber(amount).toFormat().length >= 25
                      ? ""
                      : "NANO"
                  }
                  value={
                    amount >= 1 ? amount : new BigNumber(amount).toFormat()
                  }
                />
                <Skeleton {...skeletonProps}>
                  {`${CurrencySymbol?.[fiat]}${fiatAmount} / ${btcAmount} BTC`}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("common.balance")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton {...skeletonProps}>
                  {new BigNumber(balance).toFormat()} NANO
                  <br />
                </Skeleton>
                <Skeleton {...skeletonProps}>
                  {`${CurrencySymbol?.[fiat]}${fiatBalance} / ${btcBalance} BTC`}
                </Skeleton>
              </Col>
            </Row>
            {linkAccountLabel ? (
              <Row gutter={6}>
                <Col xs={24} sm={6} xl={4}>
                  {linkAccountLabel}
                </Col>
                <Col xs={24} sm={18} xl={20}>
                  {secondAccountAlias ? (
                    <strong
                      style={{
                        display: "block",
                      }}
                    >
                      {secondAccountAlias}
                    </strong>
                  ) : null}
                  <Link to={`/account/${secondAccount}`} className="break-word">
                    {secondAccount}
                  </Link>
                </Col>
              </Row>
            ) : null}
            {representative ? (
              <Row gutter={6}>
                <Col xs={24} sm={6} xl={4}>
                  {t("common.representative")}
                </Col>
                <Col xs={24} sm={18} xl={20}>
                  {representativeAlias ? (
                    <strong
                      style={{
                        display: "block",
                      }}
                    >
                      {representativeAlias}
                    </strong>
                  ) : null}
                  <Link
                    to={`/account/${representative}`}
                    className="break-word"
                  >
                    {representative}
                  </Link>
                </Col>
              </Row>
            ) : null}
            {modifiedTimestamp ? (
              <Row gutter={6}>
                <Col xs={24} sm={6} xl={4}>
                  {t("common.date")}
                </Col>
                <Col xs={24} sm={18} xl={20}>
                  {timestampToDate(modifiedTimestamp)}
                </Col>
              </Row>
            ) : null}
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.previousBlock")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                {isValidBlockHash(previous) ? (
                  <Link to={`/block/${previous}`} className="break-word">
                    {previous}
                  </Link>
                ) : null}
                {isOpenAccountBlockHash(previous) ? (
                  <Text>{t("pages.block.openAccountBlock")}</Text>
                ) : null}
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.signature")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <span className="break-word">{signature}</span>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.work")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                {work}
              </Col>
            </Row>
          </Card>

          <Title level={3}>{t("pages.block.originalBlockContent")}</Title>
          <Card size="small">
            <pre style={{ fontSize: "12px", marginBottom: 0 }}>
              {JSON.stringify(blockInfo, null, 2)}
            </pre>
          </Card>
        </>
      ) : null}
    </>
  );
};

export default BlockDetails;
