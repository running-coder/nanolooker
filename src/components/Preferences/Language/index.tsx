import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Col, Row, Select, Typography } from "antd";

import { LOCALSTORAGE_KEYS } from "api/contexts/Preferences";
import i18next from "i18next";

const { Option } = Select;
const { Text } = Typography;
interface Props {
  isDetailed?: boolean;
}

const LanguagePreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();

  return (
    <Row style={{ alignItems: !isDetailed ? "center" : "flex-start" }}>
      <Col xs={isDetailed ? 24 : undefined}>
        <Text className={isDetailed ? "preference-detailed-title" : ""}>
          {t("preferences.language")}
        </Text>
      </Col>
      {isDetailed ? (
        <Col xs={16}>
          <Trans i18nKey="preferences.languageDetailed" style={{ marginLeft: "12px" }}>
            <a
              href="https://github.com/running-coder/nanolooker/tree/master/src/i18n/locales"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("preferences.contribute")}
            </a>
          </Trans>
        </Col>
      ) : null}

      <Col xs={isDetailed ? 8 : undefined} style={{ textAlign: "right" }} flex="auto">
        <Select
          value={i18next.language}
          onChange={value => {
            i18next.changeLanguage(value);
            localStorage.setItem(LOCALSTORAGE_KEYS.LANGUAGE, value);
          }}
          style={{ width: 120 }}
        >
          <Option value="en">English</Option>
          <Option value="fr">Français</Option>
          <Option value="es">Español</Option>
          <Option value="ar">العربية</Option>
          <Option value="de">Deutsch</Option>
          <Option value="fa">فارسی</Option>
          <Option value="hi">हिन्दी</Option>
          <Option value="it">Italiano</Option>
          <Option value="ja">日本語</Option>
          <Option value="ko">한국어</Option>
          <Option value="nl">Nederlands</Option>
          <Option value="pl">Polski</Option>
          <Option value="pt">Português</Option>
          <Option value="ru">Pусский</Option>
          <Option value="tr">Türkçe</Option>
          <Option value="vi">Tiếng Việt</Option>
          <Option value="zh">中文</Option>
        </Select>
      </Col>
    </Row>
  );
};

export default LanguagePreferences;
