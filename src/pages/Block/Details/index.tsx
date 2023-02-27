import * as React from "react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, Col, Row, Skeleton, Tag, Tooltip, Typography } from "antd";
import { CheckCircleOutlined, SyncOutlined } from "@ant-design/icons";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import TimeAgo from "timeago-react";
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
  isNullAccountBlockHash,
} from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import LoadingStatistic from "components/LoadingStatistic";
import BlockHeader from "../Header";

const { Text, Title } = Typography;

const BlockDetails: React.FC = () => {
  const { t } = useTranslation();
  const { theme, fiat } = React.useContext(PreferencesContext);
  const {
    marketStatistics: { currentPrice, priceStats },
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
    loading: isBlocksInfoLoading,
  };

  const blockInfo = blocksInfo?.blocks?.[blocks[0]];

  const {
    subtype,
    block_account: blockAccount,
    source_account: sourceAccount,
    height,
    contents: {
      type = "",
      representative = "",
      link = "",
      link_as_account: linkAsAccount = "",
      previous = "",
      signature = "",
      work = "",
    } = {},
    successor,
  } = blockInfo || {};

  const modifiedTimestamp = Number(blockInfo?.local_timestamp) * 1000;
  const btcCurrentPrice = priceStats?.bitcoin?.[fiat] || 0;
  const amount = new BigNumber(rawToRai(blockInfo?.amount || 0)).toNumber();
  const fiatAmount = new BigNumber(amount)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcAmount = btcCurrentPrice
    ? new BigNumber(amount)
        .times(currentPrice)
        .dividedBy(btcCurrentPrice)
        .toFormat(12)
    : null;

  const balance = new BigNumber(rawToRai(blockInfo?.balance || 0)).toNumber();
  const fiatBalance = new BigNumber(balance)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcBalance = btcCurrentPrice
    ? new BigNumber(balance)
        .times(currentPrice)
        .dividedBy(btcCurrentPrice)
        .toFormat(12)
    : null;

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
                <Skeleton
                  {...skeletonProps}
                  title={{ width: isSmallAndLower ? "50%" : "20%" }}
                >
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
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("common.account")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton {...skeletonProps}>
                  {blockAccountAlias ? (
                    <strong style={{ display: "block" }}>
                      {blockAccountAlias}
                    </strong>
                  ) : null}
                  <Link to={`/account/${blockAccount}`} className="break-word">
                    {blockAccount}
                  </Link>
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("transaction.amount")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <LoadingStatistic
                  isLoading={skeletonProps.loading}
                  prefix="Ӿ"
                  value={
                    amount >= 1 ? amount : new BigNumber(amount).toFormat()
                  }
                />
                <Skeleton
                  {...skeletonProps}
                  loading={
                    skeletonProps.loading || isMarketStatisticsInitialLoading
                  }
                  title={{ width: isSmallAndLower ? "100%" : "33%" }}
                >
                  {`${CurrencySymbol?.[fiat]} ${fiatAmount}${
                    btcAmount ? ` / ${btcAmount} BTC` : ""
                  }`}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("common.balance")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton
                  {...skeletonProps}
                  title={{ width: isSmallAndLower ? "100%" : "33%" }}
                >
                  Ӿ {new BigNumber(balance).toFormat()}
                  <br />
                </Skeleton>
                <Skeleton
                  {...skeletonProps}
                  loading={
                    skeletonProps.loading || isMarketStatisticsInitialLoading
                  }
                  title={{ width: isSmallAndLower ? "100%" : "33%" }}
                >
                  {`${CurrencySymbol?.[fiat]} ${fiatBalance}${
                    btcBalance ? ` / ${btcBalance} BTC` : ""
                  }`}
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
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.height")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton {...skeletonProps}>{height}</Skeleton>
              </Col>
            </Row>
            {modifiedTimestamp ? (
              <Row gutter={6}>
                <Col xs={24} sm={6} xl={4}>
                  {t("common.date")}
                </Col>
                <Col xs={24} sm={18} xl={20}>
                  {timestampToDate(modifiedTimestamp)}{" "}
                  <span className="color-muted" style={{ fontSize: "12px" }}>
                    (
                    <TimeAgo
                      locale={i18next.language}
                      datetime={modifiedTimestamp}
                      live={false}
                    />
                    )
                  </span>
                </Col>
              </Row>
            ) : null}
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.previousBlock")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton
                  {...skeletonProps}
                  title={{ width: isSmallAndLower ? "100%" : "50%" }}
                >
                  {isValidBlockHash(previous) ? (
                    <Link to={`/block/${previous}`} className="break-word">
                      {previous}
                    </Link>
                  ) : null}
                  {isNullAccountBlockHash(previous) ? (
                    <Text>{t("pages.block.openAccountBlock")}</Text>
                  ) : null}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.successorBlock")}
              </Col>
              <Skeleton
                {...skeletonProps}
                title={{ width: isSmallAndLower ? "100%" : "50%" }}
              ></Skeleton>
              <Col xs={24} sm={18} xl={20}>
                {isValidBlockHash(successor) ? (
                  <Link to={`/block/${successor}`} className="break-word">
                    {successor}
                  </Link>
                ) : null}
                {isNullAccountBlockHash(successor) ? (
                  <Text>{t("pages.block.lastAccountBlock")}</Text>
                ) : null}
              </Col>
            </Row>
            {link && subtype === "receive" ? (
              <Row gutter={6}>
                <Col xs={24} sm={6} xl={4}>
                  {t("pages.block.matchingSendBlock")}
                </Col>
                <Skeleton
                  {...skeletonProps}
                  title={{ width: isSmallAndLower ? "100%" : "50%" }}
                ></Skeleton>
                <Col xs={24} sm={18} xl={20}>
                  {isValidBlockHash(link) ? (
                    <Link to={`/block/${link}`} className="break-word">
                      {link}
                    </Link>
                  ) : (
                    t("pages.block.noMatchingSendBlock")
                  )}
                </Col>
              </Row>
            ) : null}
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.signature")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton {...skeletonProps}>
                  <span className="break-word">{signature}</span>
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={6} xl={4}>
                {t("pages.block.work")}
              </Col>
              <Col xs={24} sm={18} xl={20}>
                <Skeleton
                  {...skeletonProps}
                  title={{ width: isSmallAndLower ? "100%" : "33%" }}
                >
                  {work}
                </Skeleton>
              </Col>
            </Row>
          </Card>

          <Title level={3}>{t("pages.block.originalBlockContent")}</Title>
          <Card size="small">
            <Skeleton {...skeletonProps} paragraph>
              <pre style={{ fontSize: "12px", marginBottom: 0 }}>
                {JSON.stringify(blockInfo, null, 2)}
              </pre>
            </Skeleton>
          </Card>
        </>
      ) : null}
    </>
  );
};

export default BlockDetails;
