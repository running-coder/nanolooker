import React from "react";
import { Table } from "antd";
import { AccountHistoryLayout } from "./.";

const AccountHistoryEmpty = () => {
  return (
    <AccountHistoryLayout>
      <Table dataSource={undefined}></Table>
    </AccountHistoryLayout>
  );
};

export default AccountHistoryEmpty;
