import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Skeleton,
  Table,
  Tooltip,
  Typography,
} from "antd";
import TimeAgo from "timeago-react";
import BigNumber from "bignumber.js";
import {
  PreferencesContext,
  CurrencySymbol,
  CurrencyDecimal,
} from "api/contexts/Preferences";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import useAccountsBalances from "api/hooks/use-accounts-balances";
import useAvailableSupply from "api/hooks/use-available-supply";
import useDeveloperAccountFund from "api/hooks/use-developer-fund-transactions";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai, timestampToDate } from "components/utils";
import {
  GENESIS_ACCOUNT,
  DEVELOPER_FUND_ACCOUNTS,
  ORIGINAL_DEVELOPER_FUND_BLOCK,
  ORIGINAL_DEVELOPER_FUND_BURN_BLOCK,
  ORIGINAL_DEVELOPER_FUND_ACCOUNT,
} from "../../knownAccounts.json";

const DEVELOPER_FUND_CHANGE_LINK =
  "https://medium.com/nanocurrency/announcement-changes-to-nano-foundation-development-fund-account-43f8f340a841";
const DEVELOPER_FUND_ORIGINAL_LINK =
  "https://docs.nano.org/protocol-design/distribution-and-units/#distribution";

const { Title } = Typography;

const DeveloperFund = () => {
  let totalBalance: number = 0;
  const { fiat } = React.useContext(PreferencesContext);
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
    accountsBalances,
    isLoading: isAccountsBalancesLoading,
  } = useAccountsBalances(DEVELOPER_FUND_ACCOUNTS);
  const { availableSupply } = useAvailableSupply();
  const { developerFundTransactions } = useDeveloperAccountFund();

  const data = Object.entries(accountsBalances?.balances || []).reduce(
    // @ts-ignore
    (accounts, [account, { balance, pending }]) => {
      const calculatedBalance = new BigNumber(rawToRai(balance || 0))
        .plus(rawToRai(pending || 0))
        .toNumber();

      totalBalance = new BigNumber(totalBalance)
        .plus(calculatedBalance)
        .toNumber();

      accounts.push({
        account,
        balance: calculatedBalance,
      });

      return accounts;
    },
    [] as any,
  );

  const fiatBalance = new BigNumber(totalBalance)
    .times(currentPrice)
    .toFormat(CurrencyDecimal?.[fiat]);
  const btcBalance = new BigNumber(totalBalance)
    .times(currentPrice)
    .dividedBy(btcCurrentPrice)
    .toFormat(12);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountsBalancesLoading || isMarketStatisticsInitialLoading,
  };

  const { amount, local_timestamp = 0, hash: lastTransactionHash } =
    developerFundTransactions?.[0] || {};
  const modifiedTimestamp = Number(local_timestamp) * 1000;
  const lastTransactionAmount = new BigNumber(rawToRai(amount || 0)).toNumber();

  return (
    <>
      <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Title level={3}>Developer Fund</Title>
          <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
            <div style={{ padding: "8px 16px" }}>
              As of 11/25/19 the developer fund has been split up into 48
              accounts following a review of internal security policy and
              representative voting weights.
              <br />
              <a
                style={{ display: "inline-block", marginTop: "10px" }}
                href={DEVELOPER_FUND_CHANGE_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue reading
              </a>
            </div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Total Balances">
                <Skeleton {...skeletonProps}>
                  {new BigNumber(totalBalance).toFormat()} NANO
                  <br />
                </Skeleton>
                <Skeleton {...skeletonProps}>
                  {`${CurrencySymbol?.[fiat]}${fiatBalance} / ${btcBalance} BTC`}
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <span style={{ marginRight: "6px" }}>Last Transaction</span>
                    <Tooltip
                      placement="right"
                      title={`Last send transaction from any of the 48 accounts.`}
                    >
                      <QuestionCircle />
                    </Tooltip>
                  </>
                }
              >
                <Skeleton active loading={!modifiedTimestamp} paragraph={false}>
                  <TimeAgo datetime={modifiedTimestamp} live={false} /> (
                  {timestampToDate(modifiedTimestamp)})
                  <br />
                </Skeleton>
                <Skeleton
                  active
                  loading={!lastTransactionAmount}
                  paragraph={false}
                >
                  {lastTransactionAmount} NANO
                  <br />
                </Skeleton>
                <Skeleton
                  active
                  loading={!lastTransactionHash}
                  paragraph={false}
                >
                  <Link
                    to={`/block/${lastTransactionHash}`}
                    className="break-word"
                  >
                    {lastTransactionHash}
                  </Link>
                  <br />
                </Skeleton>
                <Link to={`/developer-fund/transactions`}>
                  <Button
                    type="primary"
                    size="small"
                    style={{ marginTop: "6px" }}
                  >
                    View all send transactions
                  </Button>
                </Link>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Title level={3}>Original Developer Fund</Title>
          <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
            <div style={{ padding: "8px 16px" }}>
              The distribution of Nano (formerly RaiBlocks) was performed
              through solving manual captchas starting in late 2015 and ending
              in October 2017. Distribution stopped after ~39% of the{" "}
              <Link to={`/account/${GENESIS_ACCOUNT}`}>Genesis</Link> amount was
              distributed and the rest of the supply was{" "}
              <Link to={`/block/${ORIGINAL_DEVELOPER_FUND_BURN_BLOCK}`}>
                burnt.
              </Link>
              <br />
              <a
                style={{ display: "inline-block", marginTop: "10px" }}
                href={DEVELOPER_FUND_ORIGINAL_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Continue reading
              </a>
            </div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Address">
                <Link
                  to={`/account/${ORIGINAL_DEVELOPER_FUND_ACCOUNT}`}
                  className="break-word"
                >
                  {ORIGINAL_DEVELOPER_FUND_ACCOUNT}
                </Link>
              </Descriptions.Item>
              <Descriptions.Item label="Balance">
                <>
                  {new BigNumber("7000000").toFormat()} NANO
                  <br />
                  {new BigNumber(7000000 * 100)
                    .dividedBy(availableSupply)
                    .toFormat(2)}
                  % of the circulating supply
                </>
              </Descriptions.Item>
              <Descriptions.Item label="Block">
                <Link
                  to={`/block/${ORIGINAL_DEVELOPER_FUND_BLOCK}`}
                  className="break-word"
                >
                  {ORIGINAL_DEVELOPER_FUND_BLOCK}
                </Link>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Title level={3} style={{ marginTop: "0.5em" }}>
        {data.length} Total Accounts
      </Title>
      <Table
        size="small"
        pagination={false}
        loading={isAccountsBalancesLoading}
        rowKey={record => record.account}
        columns={[
          {
            title: "Balance",
            dataIndex: "balance",
            defaultSortOrder: "descend",
            sorter: {
              compare: (a, b) => a.balance - b.balance,
              multiple: 3,
            },
            render: (text: string) => (
              <>{new BigNumber(text).toFormat()} NANO</>
            ),
          },
          {
            title: "Account",
            dataIndex: "account",
            render: (text: string) => (
              <>
                <Link
                  to={`/account/${text}`}
                  className="color-normal break-word"
                >
                  {text}
                </Link>
              </>
            ),
          },
        ]}
        dataSource={data}
      />
    </>
  );
};

export default DeveloperFund;
