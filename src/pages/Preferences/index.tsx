import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Card, Typography } from "antd";
import ThemePreference from "components/Preferences/Theme";
import LanguagePreferences from "components/Preferences/Language";
import CryptocurrencyPreferences from "components/Preferences/Cryptocurrency";
import FiatPreferences from "components/Preferences/Fiat";
import NatriconsPreferences from "components/Preferences/Natricons";
import LiveTransactionsPreferences from "components/Preferences/LiveTransactions";
import FilterTransactionsRangePreferences from "components/Preferences/FilterTransactions/Range";
import ConnectionPreferences from "components/Preferences/Connection";

const { Title } = Typography;

const PreferencesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("menu.preferences")}</title>
      </Helmet>
      <Title level={3}>{t("menu.preferences")}</Title>
      <Card
        size="small"
        style={{ marginBottom: "12px" }}
        className="detail-layout"
      >
        <Title level={4}>{t("pages.preferences.general")}</Title>
        <ThemePreference isDetailed />
        <LanguagePreferences isDetailed />
        <CryptocurrencyPreferences isDetailed />
        <FiatPreferences isDetailed />
      </Card>
      <Card
        size="small"
        style={{ marginBottom: "12px" }}
        className="detail-layout"
      >
        <Title level={4}>{t("transaction.accountAndBlock")}</Title>
        <NatriconsPreferences isDetailed />
      </Card>
      <Card
        size="small"
        style={{ marginBottom: "12px" }}
        className="detail-layout"
      >
        <Title level={4}>{t("pages.home.recentTransactions")}</Title>
        <LiveTransactionsPreferences isDetailed />
        <FilterTransactionsRangePreferences isDetailed />
      </Card>
      <Card
        size="small"
        style={{ marginBottom: "12px" }}
        className="detail-layout"
      >
        <Title level={4}>{t("pages.preferences.nodeConnection")}</Title>
        <ConnectionPreferences isDetailed />
      </Card>
    </>
  );
};

export default PreferencesPage;
