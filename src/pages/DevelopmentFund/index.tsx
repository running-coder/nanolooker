import React from "react";
import { Link } from "react-router-dom";
import { Descriptions, Skeleton, Table, Typography } from "antd";
import BigNumber from "bignumber.js";
import { PriceContext } from "api/contexts/Price";
import useAccountsBalances from "api/hooks/use-accounts-balances";
import useAvailableSupply from "api/hooks/use-available-supply";
import {
  DEVELOPMENT_FUND_ACCOUNTS,
  ORIGINAL_DEVELOPMENT_FUND_BLOCK,
  ORIGINAL_DEVELOPMENT_FUND_ACCOUNT
} from "./utils";
import { AccountDetailsLayout } from "pages/Account/Details";
import { rawToRai } from "components/utils";

const { Title } = Typography;

const DevelopmentFund = () => {
  let totalBalance: number = 0;
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const {
    accountsBalances,
    isLoading: isAccountsBalancesLoading
  } = useAccountsBalances(DEVELOPMENT_FUND_ACCOUNTS);
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
      <Title level={3}>Development Fund</Title>
      <AccountDetailsLayout bordered={false}>
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
          <Descriptions.Item label="Original Address">
            <Link
              to={`/account/${ORIGINAL_DEVELOPMENT_FUND_ACCOUNT}`}
              className="break-word"
            >
              {ORIGINAL_DEVELOPMENT_FUND_ACCOUNT}
            </Link>
          </Descriptions.Item>
          <Descriptions.Item label="Original Balance">
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
              to={`/block/${ORIGINAL_DEVELOPMENT_FUND_BLOCK}`}
              className="break-word"
            >
              {ORIGINAL_DEVELOPMENT_FUND_BLOCK}
            </Link>
          </Descriptions.Item>
        </Descriptions>
      </AccountDetailsLayout>
      <Title level={3} style={{ marginTop: "0.5em" }}>
        {data.length} Total Accounts
      </Title>
      <Table
        pagination={false}
        columns={[
          {
            title: "Balance",
            dataIndex: "balance",
            sorter: {
              compare: (a, b) => a.balance - b.balance,
              multiple: 3
            },
            render: (text: string) => <>{text} NANO</>
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

export default DevelopmentFund;
