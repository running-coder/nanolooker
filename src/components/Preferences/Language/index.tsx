import React from "react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { Select, Typography } from "antd";

const { Option } = Select;
const { Text } = Typography;

export enum Language {
  EN = "en",
  FR = "fr",
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
        }}
      >
        <Option value="en">English</Option>
        <Option value="fr">Français</Option>
      </Select>
    </>
  );
};

export default LanguagePreferences;
