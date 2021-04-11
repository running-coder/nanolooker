import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button, Typography } from "antd";
import BigNumber from "bignumber.js";
import useAccountHistory from "api/hooks/use-account-history";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { DelegatorsContext } from "api/contexts/Delegators";
import { RepresentativesContext } from "api/contexts/Representatives";
import TransactionsTable from "pages/Account/Transactions";

const TRANSACTIONS_PER_PAGE = 25;
const { Title } = Typography;

const AccountHistory: React.FC = () => {
  const { t } = useTranslation();
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
      ...(isPaginated
        ? { offset: (currentPage - 1) * TRANSACTIONS_PER_PAGE }
        : undefined),
      ...(!isPaginated && currentHead ? { head: currentHead } : undefined),
    },
    {
      concatHistory: !!accountInfo?.block_count && !isPaginated,
    },
  );
  const { representatives } = React.useContext(RepresentativesContext);
  const { delegators: allDelegators, getDelegators } = React.useContext(
    DelegatorsContext,
  );

  React.useEffect(() => {
    getDelegators();
    setCurrentPage(1);
    setCurrentHead(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const count = new BigNumber(accountInfo?.block_count || 0).toFormat();
  const delegatorsCount = allDelegators[account];
  const representative = representatives.find(
    ({ account: representativeAccount }) => representativeAccount === account,
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Title level={3} style={{ marginTop: "0.5em", marginRight: "6px" }}>
          {count} {t(`common.transaction${count !== "1" ? "s" : ""}`)}
        </Title>
        {representative ? (
          <Link to={`/account/${account}/delegators`}>
            <Button size="small" style={{ marginTop: "6px" }}>
              {t("pages.representatives.viewDelegators", {
                count: delegatorsCount,
              })}
            </Button>
          </Link>
        ) : null}
      </div>

      <TransactionsTable
        scrollTo="totalTransactions"
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

export default AccountHistory;
