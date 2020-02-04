import React from "react";
import { Typography } from "antd";
import BigNumber from "bignumber.js";
import useAccountHistory from "api/hooks/use-account-history";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import TransactionsTable from "pages/Account/Transactions";

const TRANSACTIONS_PER_PAGE = 25;
const { Title } = Typography;

const AccountPendingHistory = () => {
  const { account, accountInfo } = React.useContext(AccountInfoContext);
  const isPaginated = Number(accountInfo?.block_count) <= 100;
  const showPaginate = Number(accountInfo?.block_count) > TRANSACTIONS_PER_PAGE;
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [currentHead, setCurrentHead] = React.useState<string | undefined>();
  const {
    accountHistory: { history, previous: previousHead },
    isLoading: isAccountHistoryLoading
  } = useAccountHistory(account, {
    count: String(TRANSACTIONS_PER_PAGE),
    raw: true,
    offset: isPaginated ? (currentPage - 1) * TRANSACTIONS_PER_PAGE : undefined,
    head: !isPaginated ? currentHead || accountInfo?.frontier : undefined
  });

  return (
    <>
      <Title level={3} style={{ marginTop: "0.5em" }}>
        {new BigNumber(accountInfo?.block_count).toFormat()} Total Transactions
      </Title>

      <TransactionsTable
        data={history}
        isLoading={isAccountHistoryLoading}
        isPaginated={isPaginated}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={Number(accountInfo?.block_count) || 0}
        setCurrentPage={setCurrentPage}
        setCurrentHead={
          previousHead ? () => setCurrentHead(previousHead) : null
        }
      />
    </>
  );
};

export default AccountPendingHistory;
