import * as React from "react";
import differenceBy from "lodash/differenceBy";
import { useTranslation } from "react-i18next";
import { Tooltip, Typography } from "antd";
import { ExclamationCircleTwoTone } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import usePending, { PendingBlock } from "api/hooks/use-pending";
import useBlocksInfo from "api/hooks/use-blocks-info";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import TransactionsTable from "pages/Account/Transactions";
import { toBoolean } from "components/utils";
import QuestionCircle from "components/QuestionCircle";

import type { Subtype, Transaction } from "types/transaction";

const MAX_PENDING_TRANSACTIONS = 50;
const TRANSACTIONS_PER_PAGE = 5;
const { Title } = Typography;

interface PendingHistoryBlock extends PendingBlock {
  hash: string;
  account: string;
  subtype: Subtype;
  confirmed: boolean;
  local_timestamp: String;
}

// 0.000001 Nano
const PENDING_MIN_THRESHOLD = new BigNumber(1e24).toFixed();
// 0.001 Nano
const PENDING_MIN_EXCHANGE_THRESHOLD = new BigNumber(1e27).toFixed();

interface Props {
  socketTransactions: Transaction[];
  pendingSocketTransactions: Transaction[];
}

const AccountPendingHistory: React.FC<Props> = ({
  socketTransactions,
  pendingSocketTransactions,
}) => {
  const { t } = useTranslation();
  const [knownExchangesList, setKnownExchangesList] = React.useState<
    undefined | string[]
  >();
  const { account } = React.useContext(AccountInfoContext);
  const {
    pending: { blocks = {} } = {},
    isLoading: isAccountHistoryLoading,
  } = usePending(
    typeof knownExchangesList?.length === "number" ? account : "",
    {
      count: String(MAX_PENDING_TRANSACTIONS),
      sorting: true,
      source: true,
      threshold: knownExchangesList?.includes(account)
        ? PENDING_MIN_EXCHANGE_THRESHOLD
        : PENDING_MIN_THRESHOLD,
      include_only_confirmed: false,
    },
  );
  const {
    knownExchangeAccounts,
    isLoading: isKnownAccountsLoading,
  } = React.useContext(KnownAccountsContext);

  React.useEffect(() => {
    if (!isKnownAccountsLoading) {
      setKnownExchangesList(
        knownExchangeAccounts.map(({ account }) => account),
      );
    }
  }, [knownExchangeAccounts, isKnownAccountsLoading]);

  const [hashes, setHashes] = React.useState<string[]>([]);
  const { blocks: blocksInfo } = useBlocksInfo(hashes);

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
        // @NOTE "hack" to easily filter out socketTransactions
        // @ts-ignore
        link: block,
        amount,
        local_timestamp: blocksInfo.blocks?.[block]?.local_timestamp,
        confirmed: toBoolean(blocksInfo.blocks?.[block]?.confirmed),
        account: source,
        subtype: "pending",
      }),
    );

    pendingHistory = differenceBy(pendingHistory, socketTransactions, "link");
  }

  const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;
  let data = pendingHistory?.slice(start, start + TRANSACTIONS_PER_PAGE) || [];
  if (currentPage === 1) {
    // @ts-ignore
    data = pendingSocketTransactions.concat(data);
  }

  React.useEffect(() => {
    const hashes = Object.keys(blocks);
    if (!hashes.length) return;
    setHashes(hashes?.slice(start, start + TRANSACTIONS_PER_PAGE));
  }, [blocks, start]);

  // const accountPending = accountInfo?.pending
  //   ? new BigNumber(rawToRai(accountInfo?.pending)).toNumber()
  //   : 0;

  // return accountPending > PENDING_MIN_THRESHOLD ? (

  let count = (pendingHistory?.length || 0) + pendingSocketTransactions.length;

  return count ? (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
        }}
      >
        <Title level={3}>
          {count}{" "}
          {t(`pages.account.pendingTransaction${count !== 1 ? "s" : ""}`)}
        </Title>

        <Tooltip placement="right" title={t("tooltips.pendingTransaction")}>
          <QuestionCircle />
        </Tooltip>

        {pendingHistory?.length === MAX_PENDING_TRANSACTIONS ? (
          <Tooltip
            placement="right"
            title={t("tooltips.pendingTransactionCount", {
              count: MAX_PENDING_TRANSACTIONS,
            })}
          >
            <ExclamationCircleTwoTone twoToneColor={"orange"} />
          </Tooltip>
        ) : null}
      </div>

      <TransactionsTable
        data={data}
        isLoading={isAccountHistoryLoading}
        isPaginated={isPaginated}
        showPaginate={showPaginate}
        pageSize={TRANSACTIONS_PER_PAGE}
        currentPage={currentPage}
        totalPages={pendingHistory?.length}
        setCurrentPage={setCurrentPage}
      />
    </>
  ) : null;
};

export default AccountPendingHistory;
