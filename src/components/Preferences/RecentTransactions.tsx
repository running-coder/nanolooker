import React from "react";
import { Card, Popover } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import LiveTransactionsPreferences from "./LiveTransactions";
import FilterTransactionsPreferences from "./FilterTransactions";

const RecentTransactionsPreferences: React.FC = () => {
  return (
    <>
      <Popover
        placement="left"
        content={
          <Card size="small" bordered={false} className="detail-layout">
            <LiveTransactionsPreferences />
            <FilterTransactionsPreferences />
          </Card>
        }
        trigger="click"
      >
        <SettingOutlined />
      </Popover>
    </>
  );
};

export default RecentTransactionsPreferences;
