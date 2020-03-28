import React from "react";
import { Link } from "react-router-dom";
import { Table, Typography } from "antd";
import BigNumber from "bignumber.js";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Title } = Typography;

const KnownAccountsPage = () => {
  const { knownAccounts, isLoading } = React.useContext(KnownAccountsContext);

  return (
    <>
      <Title level={3} style={{ marginTop: "0.5em" }}>
        {knownAccounts.length} Total Known Accounts
      </Title>
      <Table
        pagination={false}
        loading={isLoading}
        columns={[
          {
            title: "Balance",
            dataIndex: "balance",
            // @ts-ignore
            defaultSortOrder: "descend",
            // @ts-ignore
            sorter: {
              compare: (a, b) => a.balance - b.balance
            },
            render: (text: string) => <>{new BigNumber(text).toFormat()} NANO</>
          },
          {
            title: "Alias",
            dataIndex: "alias",
            // @ts-ignore
            sorter: {
              compare: ({ alias: a }, { alias: b }) => {
                const aLowerCase = a.toLowerCase();
                const bLowerCase = b.toLowerCase();

                if (aLowerCase < bLowerCase) {
                  return -1;
                }
                if (aLowerCase > bLowerCase) {
                  return 1;
                }
                return 0;
              }
            },
            render: (text: string) => <>{text}</>
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
            )
          }
        ]}
        dataSource={knownAccounts}
      />
    </>
  );
};

export default KnownAccountsPage;
