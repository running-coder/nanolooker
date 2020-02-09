import React from "react";
import { Typography } from "antd";
import BigNumber from "bignumber.js";
import usePending, { PendingBlock } from "api/hooks/use-pending";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import TransactionsTable from "pages/Account/Transactions";
import { raiToRaw } from "components/utils";
import { Subtype } from "types/Transaction";

const MAX_PENDING_TRANSACTIONS = 15;
const TRANSACTIONS_PER_PAGE = 5;
const { Title } = Typography;

interface PendingHistoryBlock extends PendingBlock {
  hash: string;
  account: string;
  subtype: Subtype;
}

const AccountPendingHistory = () => {
  const { account, accountInfo } = React.useContext(AccountInfoContext);
  const isPaginated = Number(accountInfo?.block_count) <= 100;
  const showPaginate = Number(accountInfo?.block_count) > TRANSACTIONS_PER_PAGE;
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  const {
    pending: { blocks = {} } = {},
    isLoading: isAccountHistoryLoading
  } = usePending(account, {
    count: String(MAX_PENDING_TRANSACTIONS),
    sorting: true,
    source: true,
    threshold: new BigNumber(raiToRaw(0.000001)).toFixed()
  });

  let pendingHistory = undefined;
  if (Object.values(blocks)[0]) {
    pendingHistory = Object.entries(blocks).map(
      // @ts-ignore
      ([block, { amount, source }]): PendingHistoryBlock => ({
        hash: block,
        amount,
        account: source,
        subtype: "pending"
      })
    );
  }

  //@TODO check why it doesnt paginate on nano_1111111111111111111111111111111111111111111111111111hifc8npp
  // console.log("`~~TRANSACTIONS_PER_PAGE", TRANSACTIONS_PER_PAGE);

  return pendingHistory ? (
    <>
      <Title level={3} style={{ marginTop: "0.5em" }}>
        {pendingHistory.length} Pending Transactions
      </Title>

      <TransactionsTable
        data={pendingHistory}
        isLoading={isAccountHistoryLoading}
        isPaginated={isPaginated}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={pendingHistory.length || 0}
        setCurrentPage={setCurrentPage}
      />
    </>
  ) : null;
};

export default AccountPendingHistory;
