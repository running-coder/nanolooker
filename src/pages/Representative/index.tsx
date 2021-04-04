import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { isValidAccountAddress } from "components/utils";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import AccountDetails from "pages/Account/Details";
import Delegators from "./Delegators";

import type { PageParams } from "types/page";

const { Title } = Typography;

const Representative = () => {
  const { t } = useTranslation();
  const { account = "" } = useParams<PageParams>();
  const { setAccount, isError: isAccountInfoError } = React.useContext(
    AccountInfoContext,
  );
  const isValid = isValidAccountAddress(account);

  React.useEffect(() => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    setAccount(account);

    return () => setAccount("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      <Title level={3}>{t("common.representative")}</Title>
      {isValid && !isAccountInfoError ? <AccountDetails /> : null}
      <Title level={3}>{t("common.delegators")}</Title>
      <Delegators />
    </>
  );
};

export default Representative;
