import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Descriptions,
  Row,
  Skeleton,
  Table,
  Typography
} from "antd";
import BigNumber from "bignumber.js";
import { PriceContext } from "api/contexts/Price";
import useAccountsBalances from "api/hooks/use-accounts-balances";
import useAvailableSupply from "api/hooks/use-available-supply";
import {
  GENESIS_ACCOUNT,
  BURN_ACCOUNT,
  DEVELOPER_FUND_ACCOUNTS,
  ORIGINAL_DEVELOPER_FUND_BLOCK,
  ORIGINAL_DEVELOPER_FUND_ACCOUNT,
  DEVELOPER_FUND_CHANGE_LINK,
  DEVELOPER_FUND_ORIGINAL_LINK
} from "./utils";
import { rawToRai } from "components/utils";

const { Title } = Typography;

const DeveloperFund = () => {
  let totalBalance: number = 0;
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const {
    accountsBalances,
    isLoading: isAccountsBalancesLoading
  } = useAccountsBalances(DEVELOPER_FUND_ACCOUNTS);
  const {
    availableSupply: { available = 0 }
  } = useAvailableSupply();

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
        balance: calculatedBalance
      });

      return accounts;
    },
    [] as any
  );

  const usdBalance = new BigNumber(totalBalance).times(usd).toFormat(2);
  const btcBalance = new BigNumber(totalBalance).times(btc).toFormat(12);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountsBalancesLoading
  };

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
                  {`$${usdBalance} / ${btcBalance} BTC`}
                </Skeleton>
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
              <Link to={`/account/${BURN_ACCOUNT}`}>burnt.</Link>
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
                    .dividedBy(rawToRai(available))
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
        pagination={false}
        columns={[
          {
            title: "Balance",
            dataIndex: "balance",
            defaultSortOrder: "descend",
            sorter: {
              compare: (a, b) => a.balance - b.balance,
              multiple: 3
            },
            render: (text: string) => <>{new BigNumber(text).toFormat()} NANO</>
          },
          {
            title: "Account",
            dataIndex: "account",
            render: (text: string) => (
              <>
                <Link to={`/account/${text}`} className="color-normal">
                  {text}
                </Link>
              </>
            )
          }
        ]}
        dataSource={data}
      />
    </>
  );
};

export default DeveloperFund;
