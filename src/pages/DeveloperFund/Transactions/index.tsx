import React from "react";
import { Typography } from "antd";
import useDeveloperFundTransactions from "api/hooks/use-developer-fund-transactions";
import TransactionsTable from "pages/Account/Transactions";

const { Title } = Typography;

const DeveloperFundTransaction = () => {
  const {
    developerFundTransactions,
    isLoading
  } = useDeveloperFundTransactions();

  return (
    <>
      <Title level={3}>Developer Fund Send Transactions</Title>
      <TransactionsTable
        data={developerFundTransactions}
        isLoading={isLoading}
      />
    </>
  );
};

export default DeveloperFundTransaction;
