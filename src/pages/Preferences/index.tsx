import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { Card, Typography } from "antd";

import ConnectionPreferences from "components/Preferences/Connection";
import CryptocurrencyPreferences from "components/Preferences/Cryptocurrency";
import FiatPreferences from "components/Preferences/Fiat";
import FilterTransactionsRangePreferences from "components/Preferences/FilterTransactions/Range";
import LanguagePreferences from "components/Preferences/Language";
import LiveTransactionsPreferences from "components/Preferences/LiveTransactions";
import NatriconsPreferences from "components/Preferences/Natricons";
import ThemePreference from "components/Preferences/Theme";

const { Title } = Typography;

const PreferencesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("menu.preferences")}</title>
      </Helmet>
      <Title level={3}>{t("menu.preferences")}</Title>
      <Card size="small" style={{ marginBottom: "12px" }} className="detail-layout">
        <Title level={4}>{t("pages.preferences.general")}</Title>
        <ThemePreference isDetailed />
        <LanguagePreferences isDetailed />
        <CryptocurrencyPreferences isDetailed />
        <FiatPreferences isDetailed />
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }} className="detail-layout">
        <Title level={4}>{t("transaction.accountAndBlock")}</Title>
        <NatriconsPreferences isDetailed />
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }} className="detail-layout">
        <Title level={4}>{t("pages.home.recentTransactions")}</Title>
        <LiveTransactionsPreferences isDetailed />
        <FilterTransactionsRangePreferences isDetailed />
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }} className="detail-layout">
        <Title level={4}>{t("pages.preferences.nodeConnection")}</Title>
        <ConnectionPreferences isDetailed />
      </Card>
    </>
  );
};

export default PreferencesPage;
