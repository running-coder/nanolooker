import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Typography } from "antd";
import ThemePreference from "components/Preferences/Theme";
import LanguagePreferences from "components/Preferences/Language";
import CryptocurrencyPreferences from "components/Preferences/Cryptocurrency";
import FiatPreferences from "components/Preferences/Fiat";

const { Title } = Typography;

const PreferencesPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title level={3}>{t("menu.preferences")}</Title>
      {/* <Text>{t("pages.preferences.description")}</Text> */}
      <Card size="small" style={{ marginBottom: "12px" }}>
        <Title level={4}>{t("pages.preferences.general")}</Title>
        <div className="detailed-preference">
          <ThemePreference isDetailed />
        </div>
        <div className="detailed-preference">
          <LanguagePreferences isDetailed />
        </div>
        <div className="detailed-preference">
          <CryptocurrencyPreferences isDetailed />
        </div>
        <div className="detailed-preference">
          <FiatPreferences isDetailed />
        </div>
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }}>
        <Title level={4}>{t("transaction.accountAndBlock")}</Title>
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }}>
        <Title level={4}>{t("pages.home.recentTransactions")}</Title>
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }}>
        <Title level={4}>{t("pages.preferences.bookmarks")}</Title>
      </Card>
      <Card size="small" style={{ marginBottom: "12px" }}>
        <Title level={4}>{t("pages.preferences.searchHistory")}</Title>
      </Card>
    </>
  );
};

export default PreferencesPage;
