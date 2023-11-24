import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { FilterOutlined } from "@ant-design/icons";
import { Button, Tooltip, Typography } from "antd";
import BigNumber from "bignumber.js";
import chunk from "lodash/chunk";
import differenceBy from "lodash/differenceBy";

import { AccountHistoryFilterContext } from "api/contexts/AccountHistoryFilter";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { DelegatorsContext } from "api/contexts/Delegators";
import { RepresentativesContext } from "api/contexts/Representatives";
import useAccountHistory from "api/hooks/use-account-history";
import Filters from "pages/Account/History/Filters";
import TransactionsTable from "pages/Account/Transactions";

import type { Transaction } from "types/transaction";

const TRANSACTIONS_PER_PAGE = 25;
const MAX_TRANSACTION_FILTERS = 5_000;
const { Title } = Typography;

interface Props {
  socketTransactions: Transaction[];
}

const AccountHistory: React.FC<Props> = ({ socketTransactions }) => {
  const { t } = useTranslation();
  const [isInitialHistoryFilterLoading, setIsInitialHistoryFilterLoading] = React.useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = React.useState(false);
  const { account, accountInfo } = React.useContext(AccountInfoContext);
  const isPaginated = Number(accountInfo?.block_count) <= 250;
  const showPaginate = Number(accountInfo?.block_count) > TRANSACTIONS_PER_PAGE;
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [currentHead, setCurrentHead] = React.useState<string | undefined>();
  const {
    accountHistory: { history, previous: previousHead },
    isLoading: isAccountHistoryLoading,
  } = useAccountHistory(
    account,
    {
      count: String(TRANSACTIONS_PER_PAGE),
      raw: true,
      ...(isPaginated ? { offset: (currentPage - 1) * TRANSACTIONS_PER_PAGE } : undefined),
      ...(!isPaginated && currentHead ? { head: currentHead } : undefined),
    },
    {
      concatHistory: !!accountInfo?.block_count && !isPaginated,
    },
  );
  const { representatives } = React.useContext(RepresentativesContext);
  const { delegators: allDelegators, getDelegators } = React.useContext(DelegatorsContext);
  const isTransactionFiltersEnabled =
    parseInt(accountInfo.confirmation_height) <= MAX_TRANSACTION_FILTERS;
  const {
    sum: sumAmount,
    history: historyFilter,
    isLoading: isFiltersLoading,
    setFilters,
  } = React.useContext(AccountHistoryFilterContext);

  React.useEffect(() => {
    getDelegators();
    setCurrentPage(1);
    setCurrentHead(undefined);
    setIsFiltersVisible(false);
    setFilters(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  React.useEffect(() => {
    if (!isFiltersLoading) {
      setCurrentPage(1);
      setIsInitialHistoryFilterLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFiltersLoading]);

  let count =
    isFiltersVisible && !isInitialHistoryFilterLoading
      ? historyFilter.length
      : new BigNumber(accountInfo?.block_count || 0).toNumber();
  const delegatorsCount = allDelegators[account];
  const representative = representatives.find(
    ({ account: representativeAccount }) => representativeAccount === account,
  );

  let data = history || [];
  if (currentPage === 1 && socketTransactions.length) {
    const diff = differenceBy(socketTransactions, data, "hash");
    if (diff) {
      // @ts-ignore
      data = diff.concat(data);
      count += diff.length;
    }
  }

  const dataFilter = isFiltersVisible
    ? chunk(historyFilter, TRANSACTIONS_PER_PAGE)[currentPage - 1]
    : [];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Title level={3}>
            {count} {t(`common.transaction${count !== 1 ? "s" : ""}`)}
          </Title>

          <Tooltip title={!isTransactionFiltersEnabled ? t("tooltips.filterTransactions") : ""}>
            <Button
              loading={isFiltersLoading && isInitialHistoryFilterLoading}
              size="small"
              disabled={!isTransactionFiltersEnabled}
              type={isFiltersVisible ? "primary" : "default"}
              onClick={() => {
                if (!isFiltersVisible) {
                  setFilters({});
                  setIsInitialHistoryFilterLoading(true);
                }
                setIsFiltersVisible(!isFiltersVisible);
              }}
              style={{ marginLeft: "12px", marginBottom: "0.5em" }}
              icon={<FilterOutlined />}
            />
          </Tooltip>
        </div>

        {representative && delegatorsCount ? (
          <Link to={`/account/${account}/delegators`}>
            <Button size="small" style={{ marginTop: "6px" }}>
              {t("pages.representatives.viewDelegators", {
                count: delegatorsCount,
              })}
            </Button>
          </Link>
        ) : null}
      </div>

      {isFiltersVisible ? <Filters /> : null}

      {isFiltersVisible ? (
        <TransactionsTable
          scrollTo="totalTransactions"
          data={dataFilter}
          sumAmount={sumAmount}
          isLoading={isFiltersLoading}
          isPaginated={true}
          showPaginate={historyFilter.length >= TRANSACTIONS_PER_PAGE}
          pageSize={TRANSACTIONS_PER_PAGE}
          currentPage={currentPage}
          totalPages={historyFilter.length || 0}
          setCurrentPage={setCurrentPage}
        />
      ) : (
        <TransactionsTable
          scrollTo="totalTransactions"
          data={data}
          isLoading={isAccountHistoryLoading}
          isPaginated={isPaginated}
          showPaginate={showPaginate}
          pageSize={TRANSACTIONS_PER_PAGE}
          currentPage={currentPage}
          totalPages={Number(accountInfo?.block_count) || 0}
          setCurrentPage={setCurrentPage}
          setCurrentHead={previousHead ? () => setCurrentHead(previousHead) : null}
        />
      )}
    </>
  );
};

export default AccountHistory;
