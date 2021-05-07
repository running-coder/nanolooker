import React, { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Card, Col, Row, Skeleton, Tag, Tooltip } from "antd";
import find from "lodash/find";
import BigNumber from "bignumber.js";
import TimeAgo from "timeago-react";
import useAccountHistory from "api/hooks/use-account-history";
import {
  Theme,
  PreferencesContext,
  CurrencySymbol,
  CurrencyDecimal,
} from "api/contexts/Preferences";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import {
  Representative,
  RepresentativesContext,
} from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import LoadingStatistic from "components/LoadingStatistic";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai, timestampToDate, TwoToneColors } from "components/utils";
import AccountHeader from "../Header";
import { Sections } from "../.";

import type { PageParams } from "types/page";

interface AccountDetailsLayoutProps {
  bordered?: boolean;
  children?: ReactElement;
}

export const AccountDetailsLayout = ({
  bordered,
  children,
}: AccountDetailsLayoutProps) => (
  <Row>
    <Col xs={24} xl={12}>
      <Card size="small" bordered={bordered} className="detail-layout">
        {children}
      </Card>
    </Col>
  </Row>
);

const AccountDetails: React.FC = () => {
  const { t } = useTranslation();
  const { section = Sections.TRANSACTIONS } = useParams<PageParams>();
  const { theme, fiat } = React.useContext(PreferencesContext);
  const [representativeAccount, setRepresentativeAccount] = React.useState(
    {} as any,
  );
  const [accountsRepresentative, setAccountsRepresentative] = React.useState(
    {} as Representative,
  );

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
    account,
    accountInfo,
    isLoading: isAccountInfoLoading,
  } = React.useContext(AccountInfoContext);
  const {
    accountHistory: { history },
    isLoading: isAccountHistoryLoading,
  } = useAccountHistory(account, {
    count: "5",
    raw: true,
  });
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);
  const {
    confirmationQuorum: {
      principal_representative_min_weight: principalRepresentativeMinWeight,
      online_stake_total: onlineStakeTotal = 0,
    },
  } = React.useContext(ConfirmationQuorumContext);

  const balance = new BigNumber(rawToRai(accountInfo?.balance || 0)).toNumber();
  const balancePending = new BigNumber(
    rawToRai(accountInfo?.pending || 0),
  ).toFormat(8);
  const fiatBalance = new BigNumber(balance)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcBalance = new BigNumber(balance)
    .times(currentPrice)
    .dividedBy(btcCurrentPrice)
    .toFormat(12);

  const lastTransaction = (history || []).find(
    ({ local_timestamp, subtype = "" }) =>
      ["change", "send", "receive"].includes(subtype) &&
      parseInt(local_timestamp || "0"),
  );
  const modifiedTimestamp =
    Number(lastTransaction?.local_timestamp || 0) * 1000;

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountInfoLoading || isMarketStatisticsInitialLoading,
  };

  React.useEffect(() => {
    if (!account || isAccountInfoLoading || !representatives.length) return;

    setRepresentativeAccount(find(representatives, ["account", account]) || {});

    if (accountInfo.representative) {
      const accountsRepresentative: Representative = find(representatives, [
        "account",
        accountInfo.representative,
      ])!;

      setAccountsRepresentative(accountsRepresentative);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isAccountInfoLoading, representatives]);

  const votingWeight = new BigNumber(representativeAccount.weight)
    .times(100)
    .dividedBy(rawToRai(onlineStakeTotal))
    .toNumber();

  return (
    <AccountDetailsLayout bordered={false}>
      <>
        <Row gutter={6}>
          <Col xs={24}>
            <AccountHeader />
          </Col>
        </Row>
        <Row gutter={6}>
          <Col xs={24} sm={8} md={6}>
            {t("common.balance")}
          </Col>
          <Col xs={24} sm={16} md={18}>
            <LoadingStatistic
              isLoading={skeletonProps.loading}
              suffix="NANO"
              value={balance >= 1 ? balance : new BigNumber(balance).toFormat()}
            />
            <Skeleton {...skeletonProps}>
              {`${CurrencySymbol?.[fiat]}${fiatBalance} / ${btcBalance} BTC`}
            </Skeleton>
          </Col>
        </Row>
        {representativeAccount?.account ? (
          <Row gutter={6}>
            <Col xs={24} sm={8} md={6}>
              {t("pages.account.votingWeight")}
              <Tooltip
                placement="right"
                title={t("tooltips.votingWeight", {
                  minWeight: principalRepresentativeMinWeight,
                })}
              >
                <QuestionCircle />
              </Tooltip>
            </Col>
            <Col xs={24} sm={16} md={18}>
              <>
                {new BigNumber(representativeAccount.weight).toFormat()}
                <br />
                {new BigNumber(votingWeight).toFormat(
                  votingWeight > 0.01 ? 2 : 4,
                )}
                {t("pages.account.percentNetworkVotingWeight")}
              </>
            </Col>
          </Row>
        ) : null}
        <Row gutter={6}>
          <Col xs={24} sm={8} md={6}>
            {t("common.representative")}
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Skeleton
              {...skeletonProps}
              loading={isAccountInfoLoading || isRepresentativesLoading}
            >
              {accountsRepresentative?.account ? (
                <>
                  <div style={{ display: "flex", margin: "3px 0" }}>
                    {typeof accountsRepresentative.isOnline === "boolean" ? (
                      <Tag
                        color={
                          accountsRepresentative.isOnline
                            ? theme === Theme.DARK
                              ? TwoToneColors.RECEIVE_DARK
                              : TwoToneColors.RECEIVE
                            : theme === Theme.DARK
                            ? TwoToneColors.SEND_DARK
                            : TwoToneColors.SEND
                        }
                        className={`tag-${
                          accountsRepresentative.isOnline ? "online" : "offline"
                        }`}
                      >
                        {t(
                          `common.${
                            accountsRepresentative.isOnline
                              ? "online"
                              : "offline"
                          }`,
                        )}
                      </Tag>
                    ) : null}
                    {accountsRepresentative?.isPrincipal ? (
                      <Tag>{t("common.principalRepresentative")}</Tag>
                    ) : null}
                  </div>

                  {accountsRepresentative.alias ? (
                    <div className="color-important">
                      {accountsRepresentative.alias}
                    </div>
                  ) : null}

                  <Link
                    to={`/account/${accountInfo.representative}${
                      section === Sections.TRANSACTIONS ? "/delegators" : ""
                    }`}
                    className="break-word"
                  >
                    {accountInfo.representative}
                  </Link>
                </>
              ) : (
                t("pages.account.noRepresentative")
              )}
            </Skeleton>
          </Col>
        </Row>
        {parseFloat(accountInfo?.pending) ? (
          <Row gutter={6}>
            <Col xs={24} sm={8} md={6}>
              {t("transaction.pending")}
              <Tooltip placement="right" title={t("tooltips.pending")}>
                <QuestionCircle />
              </Tooltip>
            </Col>
            <Col xs={24} sm={16} md={18}>
              <Skeleton {...skeletonProps}>{balancePending} NANO</Skeleton>
            </Col>
          </Row>
        ) : null}
        <Row gutter={6}>
          <Col xs={24} sm={8} md={6}>
            {t("pages.account.confirmationHeight")}
            <Tooltip placement="right" title={t("tooltips.confirmationHeight")}>
              <QuestionCircle />
            </Tooltip>
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Skeleton {...skeletonProps}>
              {accountInfo.confirmation_height}
            </Skeleton>
          </Col>
        </Row>
        <Row gutter={6}>
          <Col xs={24} sm={8} md={6}>
            {t("pages.account.lastTransaction")}
          </Col>
          <Col xs={24} sm={16} md={18}>
            <Skeleton {...skeletonProps} loading={isAccountHistoryLoading}>
              {modifiedTimestamp ? (
                <>
                  <TimeAgo datetime={modifiedTimestamp} live={false} /> (
                  {timestampToDate(modifiedTimestamp)})
                </>
              ) : (
                <>
                  {t("common.unknown")}
                  <Tooltip
                    placement="right"
                    title={t("tooltips.unknownLastTransaction")}
                  >
                    <QuestionCircle />
                  </Tooltip>
                </>
              )}
            </Skeleton>
          </Col>
        </Row>
      </>
    </AccountDetailsLayout>
  );
};

export default AccountDetails;
