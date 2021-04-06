import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography } from "antd";
import { WalletOutlined, QrcodeOutlined } from "@ant-design/icons";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import find from "lodash/find";
import { useParams } from "react-router-dom";
import Copy from "components/Copy";
import QRCodeModal from "components/QRCodeModal";
import { Natricon } from "components/Preferences/Natricons/Natricon";
import { RepresentativesContext } from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { KnownAccountsContext, KnownAccount } from "api/contexts/KnownAccounts";

import type { PageParams } from "types/page";
import { PreferencesContext } from "api/contexts/Preferences";

const { Text, Title } = Typography;

const AccountHeader: React.FC = () => {
  const { t } = useTranslation();
  const { account = "" } = useParams<PageParams>();
  const [knownAccount, setKnownAccount] = React.useState<KnownAccount>();
  const [representativeAccount, setRepresentativeAccount] = React.useState(
    {} as any,
  );
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);
  const { natricons } = React.useContext(PreferencesContext);
  const {
    confirmationQuorum: { principal_representative_min_weight: minWeight },
  } = React.useContext(ConfirmationQuorumContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isMediumAndLower = !useMediaQuery("(min-width: 768px)");

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
          <Title level={3} style={{ margin: 0 }}>
            {representativeAccount.weight >= minWeight
              ? t("common.principalRepresentative")
              : t("common.representative")}
          </Title>
        </>
      ) : null}
      {knownAccount ? (
        <Title level={4} style={{ margin: 0 }}>
          {knownAccount.alias}
        </Title>
      ) : null}
      <div
        style={{
          display: "flex",
          alignItems: natricons ? "center" : "",
          fontSize: "16px",
          wordWrap: "break-word",
          position: "relative",
        }}
        className="color-normal"
      >
        {natricons ? (
          <Natricon
            account={account}
            style={{
              margin: "-12px -6px -18px -18px",
              width: "80px",
              height: "80px",
            }}
          />
        ) : (
          <div style={{ alignSelf: "baseline" }}>
            <WalletOutlined
              style={{
                fontSize: "18px",
                marginRight: "6px",
              }}
            />
          </div>
        )}
        <span className="break-word" style={{ marginRight: "6px" }}>
          <span>
            {account.substr(account.length * -1, account.length - 60)}
          </span>
          <span style={{ color: "#1890ff" }}>{account.substr(-60, 7)}</span>
          <span>{account.substr(-53, 46)}</span>
          <span style={{ color: "#1890ff" }}>{account.substr(-7)}</span>
        </span>
        <div
          style={{
            textAlign: "right",
            display: "flex",
            flexDirection: isMediumAndLower ? "column" : "row",
          }}
        >
          <Copy text={account} />
          <QRCodeModal account={account} body={<Text>{account}</Text>}>
            <Button
              shape="circle"
              icon={<QrcodeOutlined />}
              size="small"
              style={{
                marginTop: isMediumAndLower ? "3px" : 0,
                marginLeft: isMediumAndLower ? 0 : "6px",
              }}
            />
          </QRCodeModal>
        </div>
      </div>
    </>
  );
};

export default AccountHeader;
