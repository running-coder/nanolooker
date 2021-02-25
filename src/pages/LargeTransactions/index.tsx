import React from "react";
import { Typography } from "antd";
import { LargeTransactionsContext } from "api/contexts/LargeTransactions";

const { Title } = Typography;

const LargeTransactions = () => {
  const { getLargeTransactions, largeTransactions } = React.useContext(
    LargeTransactionsContext,
  );

  console.log("largeTransactions", largeTransactions);

  React.useEffect(() => {
    getLargeTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Title level={3}>Large Transactions</Title>
    </>
  );
};

export default LargeTransactions;
