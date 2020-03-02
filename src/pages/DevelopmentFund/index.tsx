import React from 'react';
import { Link } from "react-router-dom";
import { Descriptions, Skeleton, Table } from 'antd';
import BigNumber from 'bignumber.js';
import { PriceContext } from 'api/contexts/Price';
import useAccountsBalances from 'api/hooks/use-accounts-balances';
import { getDevelopmentFundAccounts } from './utils';
import { AccountDetailsLayout } from 'pages/Account/Details';
import { rawToRai } from 'components/utils';

const DevelopmentFund = () => {
  let totalBalance: number = 0;
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const { accountsBalances, isLoading: isAccountsBalancesLoading } = useAccountsBalances(getDevelopmentFundAccounts());

  // @ts-ignore
  const data = Object.entries(accountsBalances?.balances || []).reduce((accounts, [account, { balance, pending }]) => {
    const calculatedBalance = new BigNumber(rawToRai(balance || 0)).plus(rawToRai(pending || 0)).toNumber()

    totalBalance = new BigNumber(totalBalance).plus(calculatedBalance).toNumber();

    accounts.push({
      account,
      balance: calculatedBalance
    });

    return accounts;
  }, [] as any);

  const usdBalance = new BigNumber(totalBalance).times(usd).toFormat(2);
  const btcBalance = new BigNumber(totalBalance).times(btc).toFormat(12);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountsBalancesLoading
  };

  return <>
    <AccountDetailsLayout bordered={false}>
      <Descriptions bordered column={1} size="small">

        <Descriptions.Item label="Total Accounts">
          <Skeleton {...skeletonProps}>
            {data.length}
          </Skeleton>
        </Descriptions.Item>
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
    </AccountDetailsLayout>
    <Table
      pagination={false}
      columns={[
        {
          title: 'Balance',
          dataIndex: 'balance',
          sorter: {
            compare: (a, b) => a.balance - b.balance,
            multiple: 3,
          },
          render: (text: string, { representative, hash }) => (
            <>
              {text} NANO
            </>
          )
        },
        {
          title: 'Account',
          dataIndex: 'account',
          sorter: {
            compare: (a, b) => a.account - b.account,
            multiple: 3,
          },
          render: (text: string) => (
            <>
              <Link
                to={`/account/${text}`}
                className="color-normal"
              >
                {text}
              </Link>

            </>
          )
        }]}
      dataSource={data}
    />
  </>
}

export default DevelopmentFund;