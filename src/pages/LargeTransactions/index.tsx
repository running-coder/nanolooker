import React from "react";
import { Tooltip, Typography } from "antd";
import useLargeTransactions from "api/hooks/use-large-transactions";
import TransactionsTable from "pages/Account/Transactions";
import QuestionCircle from "components/QuestionCircle";

const TRANSACTIONS_PER_PAGE = 25;
const { Text, Title } = Typography;

const LargeTransactions = () => {
  const { largeTransactions, isLoading } = useLargeTransactions();
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const showPaginate = largeTransactions.length > TRANSACTIONS_PER_PAGE;
  const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const data = largeTransactions
    ?.slice(start, start + TRANSACTIONS_PER_PAGE)
    .map(({ timestamp, block, amount }) => ({
      ...block,
      amount,
      local_timestamp: Math.floor(timestamp / 1000),
    }));

  return (
    <>
      <Title level={3}>Large Transactions</Title>

      <div style={{ marginBottom: "12px" }}>
        <Text style={{ marginRight: "6px" }}>
          Large transactions happening on the NANO blockchain.
        </Text>
        <Tooltip
          placement="right"
          title={`Send only transactions of 10,000 NANO or more are temporarily saved for 1 week.`}
        >
          <QuestionCircle />
        </Tooltip>
      </div>

      <TransactionsTable
        data={data}
        isLoading={isLoading}
        isPaginated={true}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={largeTransactions.length}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default LargeTransactions;
