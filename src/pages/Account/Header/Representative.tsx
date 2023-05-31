import * as React from "react";
import { useTranslation } from "react-i18next";

import { Col, Row, Tag, Typography } from "antd";

import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { RepresentativesContext } from "api/contexts/Representatives";
import useRepresentative from "api/hooks/use-representative";
import { TwoToneColors } from "components/utils";

const { Text, Title } = Typography;

interface Props {
  account: string;
}

const AccountRepresentative: React.FC<Props> = ({ account }) => {
  const { t } = useTranslation();
  const [accountRepresentative, setAccountRepresentative] = React.useState({} as any);
  const [alias, setAlias] = React.useState("");
  const { representatives, isLoading: isRepresentativesLoading } =
    React.useContext(RepresentativesContext);
  const { theme } = React.useContext(PreferencesContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);

  const { representative } = useRepresentative(
    {
      account,
    },
    { skip: !accountRepresentative?.account },
  );

  React.useEffect(() => {
    if (!account || isRepresentativesLoading || !representatives.length) return;

    const representative = representatives.find(
      ({ account: accountRepresentative }) => accountRepresentative === account,
    );

    if (representative) {
      setAccountRepresentative(representative);
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
      setAccountRepresentative({});
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isRepresentativesLoading, representatives]);

  const { isOnline, isPrincipal } = accountRepresentative;

  return (
    <>
      {accountRepresentative?.account ? (
        <Row>
          <Col xs={24}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Title level={4} style={{ margin: "0 6px 0 0" }}>
                {isPrincipal ? t("common.principalRepresentative") : t("common.representative")}
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
              {representative?.version ? (
                <Tag
                  color={
                    !representative.isLatestVersion
                      ? theme === Theme.DARK
                        ? TwoToneColors.WARNING_DARK
                        : TwoToneColors.WARNING
                      : undefined
                  }
                >
                  v{representative.version}
                </Tag>
              ) : null}
            </div>
          </Col>
        </Row>
      ) : null}
      {accountRepresentative?.alias || alias ? (
        <Row>
          <Col xs={24}>
            <Text className="color-important" style={{ fontSize: "18px" }}>
              {accountRepresentative.alias || alias}
            </Text>
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default AccountRepresentative;
