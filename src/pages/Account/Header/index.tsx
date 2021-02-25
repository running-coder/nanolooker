import React from "react";
import { Button, Typography } from "antd";
import { WalletOutlined, QrcodeOutlined } from "@ant-design/icons";
import find from "lodash/find";
import { useParams } from "react-router-dom";
import Copy from "components/Copy";
import QRCodeModal from "components/QRCodeModal";
import { RepresentativesContext } from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { KnownAccountsContext, KnownAccount } from "api/contexts/KnownAccounts";

import type { PageParams } from 'types/page'

const { Title } = Typography;


const AccountHeader = () => {
  const { account = "" } = useParams<PageParams>();
  const [knownAccount, setKnownAccount] = React.useState<KnownAccount>();
  const [representativeAccount, setRepresentativeAccount] = React.useState(
    {} as any,
  );
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);
  const {
    confirmationQuorum: { principal_representative_min_weight: minWeight },
  } = React.useContext(ConfirmationQuorumContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);

  React.useEffect(() => {
    if (!account || isRepresentativesLoading || !representatives.length) return;

    setRepresentativeAccount(find(representatives, ["account", account]) || {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isRepresentativesLoading, representatives.length]);

  React.useEffect(() => {
    if (!account || !knownAccounts.length) return;

    setKnownAccount(
      knownAccounts.find(
        ({ account: knownAccount }) => knownAccount === account,
      ),
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, knownAccounts.length]);

  return (
    <>
      {representativeAccount?.account && minWeight ? (
        <>
          <Title level={3}>
            {representativeAccount.weight >= minWeight ? "Principal " : ""}
            Representative
          </Title>
        </>
      ) : null}
      {knownAccount ? (
        <Title level={4} style={{ marginTop: 0 }}>
          {knownAccount.alias}
        </Title>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          fontSize: "16px",
          wordWrap: "break-word",
          position: "relative",
          marginBottom: "12px",
        }}
        className="color-normal"
      >
        <div>
          <WalletOutlined
            style={{
              fontSize: "18px",
              marginRight: "6px",
            }}
          />
        </div>
        <span className="break-word" style={{ marginRight: "6px" }}>
          <span>
            {account.substr(account.length * -1, account.length - 60)}
          </span>
          <span style={{ color: "#1890ff" }}>{account.substr(-60, 7)}</span>
          <span>{account.substr(-53, 46)}</span>
          <span style={{ color: "#1890ff" }}>{account.substr(-7)}</span>
        </span>
        <div style={{ whiteSpace: "nowrap", display: "inline-flex" }}>
          <span style={{ marginRight: "6px", display: "flex" }}>
            <Copy text={account} />
          </span>
          <QRCodeModal text={account}>
            <Button
              shape="circle"
              icon={<QrcodeOutlined />}
              size="small"
              style={{ marginRight: "6px" }}
            />
          </QRCodeModal>
        </div>
      </div>
    </>
  );
};

export default AccountHeader;
