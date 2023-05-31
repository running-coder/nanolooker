import * as React from "react";

import { Typography } from "antd";

import useDeveloperFundTransactions from "api/hooks/use-developer-fund-transactions";
import TransactionsTable from "pages/Account/Transactions";

const { Title } = Typography;

const TRANSACTIONS_PER_PAGE = 50;

const DeveloperFundTransaction: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const { developerFundTransactions = [], isLoading } = useDeveloperFundTransactions();

  const totalTransactions = developerFundTransactions.length;
  const isPaginated = totalTransactions > TRANSACTIONS_PER_PAGE;
  const showPaginate = totalTransactions > TRANSACTIONS_PER_PAGE;
  const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const data = developerFundTransactions?.slice(start, start + TRANSACTIONS_PER_PAGE);

  return (
    <>
      <Title level={3}>
        {isLoading ? "" : developerFundTransactions?.length} Developer Fund Send Transactions
      </Title>
      <TransactionsTable
        data={data}
        isLoading={isLoading}
        isPaginated={isPaginated}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={totalTransactions}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default DeveloperFundTransaction;
