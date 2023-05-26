import * as React from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Card, Popover } from "antd";

import FilterTransactionsPreferences from "./FilterTransactions";
import LiveTransactionsPreferences from "./LiveTransactions";

const RecentTransactionsPreferences: React.FC = () => {
  return (
    <>
      <Popover
        placement="left"
        content={
          <Card size="small" className="detail-layout">
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
