import * as React from "react";
import { useTranslation } from "react-i18next";
import { Typography } from "antd";
import BigNumber from "bignumber.js";
import usePending, { PendingBlock } from "api/hooks/use-pending";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import TransactionsTable from "pages/Account/Transactions";
import { raiToRaw } from "components/utils";

import type { Subtype } from "types/transaction";

const MAX_PENDING_TRANSACTIONS = 1000;
const TRANSACTIONS_PER_PAGE = 5;
const { Title } = Typography;

interface PendingHistoryBlock extends PendingBlock {
  hash: string;
  account: string;
  subtype: Subtype;
  sorting: boolean;
}

const PENDING_MIN_THRESHOLD = new BigNumber(raiToRaw(0.000001)).toFixed();

const AccountPendingHistory: React.FC = () => {
  const { t } = useTranslation();
  const { account } = React.useContext(AccountInfoContext);
  const {
    pending: { blocks = {} } = {},
    isLoading: isAccountHistoryLoading,
  } = usePending(account, {
    count: String(MAX_PENDING_TRANSACTIONS),
    sorting: true,
    source: true,
    threshold: PENDING_MIN_THRESHOLD,
    // @Note Add an preference?
    include_only_confirmed: true,
  });
  const totalPending = Object.keys(blocks).length;
  const isPaginated = true;
  const showPaginate = totalPending > TRANSACTIONS_PER_PAGE;
  const [currentPage, setCurrentPage] = React.useState<number>(1);

  let pendingHistory: PendingHistoryBlock[] | undefined = undefined;

  if (totalPending) {
    pendingHistory = Object.entries(blocks).map(
      // @ts-ignore
      ([block, { amount, source }]): PendingHistoryBlock => ({
        hash: block,
        amount,
        account: source,
        subtype: "pending",
        sorting: true,
      }),
    );
  }

  const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  const data = pendingHistory?.slice(start, start + TRANSACTIONS_PER_PAGE);

  return pendingHistory ? (
    <>
      <Title level={3}>
        {isAccountHistoryLoading ? "" : pendingHistory?.length}{" "}
        {t("pages.account.pendingTransactions")}
      </Title>

      <TransactionsTable
        data={data}
        isLoading={isAccountHistoryLoading}
        isPaginated={isPaginated}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={pendingHistory.length}
        setCurrentPage={setCurrentPage}
      />
    </>
  ) : null;
};

export default AccountPendingHistory;
