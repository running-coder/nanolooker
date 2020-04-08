import React from "react";
import { Typography } from "antd";
import { AccountDetailsLayout } from "./.";

const { Title } = Typography;

const AccountDetailsUnopened = () => {
  return (
    <AccountDetailsLayout>
      <div style={{ padding: "12px" }}>
        <Title level={3}>This account hasn't been opened yet</Title>
        <p className="color-muted">
          While the account address is valid, no blocks have been published to
          its chain yet. If NANO has been sent to this account, it still needs
          to publish a corresponding block to pocket the funds.
        </p>
      </div>
    </AccountDetailsLayout>
  );
};

export default AccountDetailsUnopened;
