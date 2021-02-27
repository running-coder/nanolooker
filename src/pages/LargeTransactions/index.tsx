import React from "react";
import orderBy from "lodash/orderBy";
import BigNumber from "bignumber.js";
import { Button, Dropdown, Menu, Tooltip, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";
import useLargeTransactions from "api/hooks/use-large-transactions";
import TransactionsTable from "pages/Account/Transactions";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai } from "components/utils";
import { useParams, useHistory } from "react-router-dom";

import type { PageParams } from "types/page";
import { Transaction } from "types/transaction";

const TRANSACTIONS_PER_PAGE = 25;
const { Text, Title } = Typography;

export enum SORT_BY {
  LATEST = "latest",
  LARGEST = "largest",
}

const SORT_BY_MAPPING = {
  latest: "Latest transaction",
  largest: "Largest amount",
};

const LargeTransactions = () => {
  const history = useHistory();
  const { sortBy: paramSortBy = SORT_BY.LATEST } = useParams<PageParams>();
  const { largeTransactions, isLoading } = useLargeTransactions();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [orderedTransactions, setOrderedTransactions] = React.useState<
    Transaction[]
  >();
  const defaultSortBy = Object.values(SORT_BY).includes(paramSortBy)
    ? paramSortBy
    : SORT_BY.LATEST;
  const [sortBy, setSortBy] = React.useState(defaultSortBy);

  const showPaginate = largeTransactions.length > TRANSACTIONS_PER_PAGE;
  const start = 0 + (currentPage - 1) * TRANSACTIONS_PER_PAGE;

  React.useEffect(() => {
    const data = largeTransactions
      ?.slice(start, start + TRANSACTIONS_PER_PAGE)
      .map(({ timestamp, block, amount }) => ({
        ...block,
        amount,
        largest: new BigNumber(rawToRai(amount)).toNumber(),
        latest: timestamp,
        local_timestamp: Math.floor(timestamp / 1000),
      }));

    // @ts-ignore
    const orderedData: Transaction[] = orderBy(
      data,
      [sortBy.toLowerCase()],
      ["desc"],
    );

    setOrderedTransactions(orderedData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largeTransactions, sortBy]);

  const handleSortBy = ({ key }: any) => {
    history.replace(`/large-transactions/${key}`);
    setSortBy(key);
  };

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
      <div style={{ marginBottom: "12px" }}>
        <Dropdown
          overlay={
            <Menu onClick={handleSortBy}>
              {Object.values(SORT_BY).map(sortBy => (
                <Menu.Item key={sortBy}>{SORT_BY_MAPPING[sortBy]}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {SORT_BY_MAPPING[sortBy]} <DownOutlined />
          </Button>
        </Dropdown>
      </div>

      <TransactionsTable
        data={orderedTransactions}
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
