import React from "react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { Select, Typography } from "antd";

const { Option } = Select;
const { Text } = Typography;

export enum Language {
  EN = "en",
  FR = "fr",
  PT = "pt",
}

const LanguagePreferences: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Text style={{ marginRight: "12px" }}>{t("preferences.language")}</Text>
      <Select
        defaultValue={i18next.language}
        onChange={value => {
          i18next.changeLanguage(value);
          localStorage.setItem("LANGUAGE", value);
        }}
      >
        <Option value="en">English</Option>
        <Option value="fr">Français</Option>
        <Option value="pt">Português</Option>
      </Select>
    </>
  );
};

export default LanguagePreferences;
