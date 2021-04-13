import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Tag, Typography } from "antd";
import { WalletOutlined, QrcodeOutlined } from "@ant-design/icons";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useParams } from "react-router-dom";
import Copy from "components/Copy";
import QRCodeModal from "components/QRCodeModal";
import { Natricon } from "components/Preferences/Natricons/Natricon";
import { RepresentativesContext } from "api/contexts/Representatives";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { TwoToneColors } from "components/utils";

import type { PageParams } from "types/page";

const { Text, Title } = Typography;

const AccountHeader: React.FC = () => {
  const { t } = useTranslation();
  const { account = "" } = useParams<PageParams>();
  const [representativeAccount, setRepresentativeAccount] = React.useState(
    {} as any,
  );
  const [alias, setAlias] = React.useState("");
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);
  const { natricons, theme } = React.useContext(PreferencesContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isMediumAndLower = !useMediaQuery("(min-width: 768px)");

  React.useEffect(() => {
    if (!account || isRepresentativesLoading || !representatives.length) return;

    const representative = representatives.find(
      ({ account: representativeAccount }) => representativeAccount === account,
    );

    if (representative) {
      setRepresentativeAccount(representative);
    } else {
      const alias = knownAccounts.find(
        ({ account: knownAccount }) => knownAccount === account,
      )?.alias;
      if (alias) {
        setAlias(alias);
      }
    }

    return () => {
      setAlias("");
      setRepresentativeAccount({});
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isRepresentativesLoading, representatives]);

  const { isOnline, isPrincipal } = representativeAccount;

  return (
    <>
      {representativeAccount?.account ? (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Title level={4} style={{ margin: "0 6px 0 0" }}>
            {isPrincipal
              ? t("common.principalRepresentative")
              : t("common.representative")}
          </Title>
          {typeof isOnline === "boolean" ? (
            <Tag
              color={
                isOnline
                  ? theme === Theme.DARK
                    ? TwoToneColors.RECEIVE_DARK
                    : TwoToneColors.RECEIVE
                  : theme === Theme.DARK
                  ? TwoToneColors.SEND_DARK
                  : TwoToneColors.SEND
              }
              className={`tag-${isOnline ? "online" : "offline"}`}
            >
              {t(`common.${isOnline ? "online" : "offline"}`)}
            </Tag>
          ) : null}
        </div>
      ) : null}
      {representativeAccount?.alias || alias ? (
        <Text className="color-important" style={{ fontSize: "18px" }}>
          {representativeAccount.alias || alias}
        </Text>
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
          <QRCodeModal account={account}>
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
