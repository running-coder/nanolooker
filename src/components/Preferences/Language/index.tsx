import React from "react";
import i18next from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { Select, Typography } from "antd";

const { Option } = Select;
const { Text } = Typography;

export enum Language {
  EN = "en",
  FR = "fr",
  PT = "pt",
}

interface Props {
  isDetailed?: boolean;
}
//https://github.com/running-coder/nanolooker/tree/master/src/utils/locales
const LanguagePreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();

  return (
    <>
      <Text className={isDetailed ? "preference-detailed-title" : ""}>
        {t("preferences.language")}
      </Text>
      <div style={{ display: "flex" }}>
        <div>
          <Select
            value={i18next.language}
            onChange={value => {
              i18next.changeLanguage(value);
              localStorage.setItem("LANGUAGE", value);
            }}
          >
            <Option value="en">English</Option>
            <Option value="fr">Français</Option>
            <Option value="pt">Português</Option>
          </Select>
        </div>
        {isDetailed ? (
          <Text style={{ marginLeft: "12px", alignSelf: "center" }}>
            <Trans
              i18nKey="preferences.languageDetailed"
              style={{ marginLeft: "12px" }}
            >
              <a
                href="https://github.com/running-coder/nanolooker"
                rel="noopener noreferrer"
                target="_blank"
              >
                Contribute
              </a>
            </Trans>
          </Text>
        ) : null}
      </div>
    </>
  );
};

export default LanguagePreferences;
