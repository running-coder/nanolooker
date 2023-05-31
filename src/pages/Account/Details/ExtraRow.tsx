import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Col, Row } from "antd";

export const ACCOUNT_2MINERS = "nano_14uzbiw1euwicrt3gzwnpyufpa8td1uw8wbhyyrz5e5pnqitjfk1tb8xwgg4";
export const ACCOUNT_NANOBROWSERQUEST =
  "nano_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay";
export const ACCOUNT_NANOQUAKEJS =
  "nano_18rtodfdzxqprb5pamok8surdg91x7wys8yk47uk3xp7cyu3nuc44teysix1";

interface Props {
  account: string;
}

const ExtraRow: React.FC<Props> = ({ account }) => {
  const { t } = useTranslation();

  return (
    <>
      {account === ACCOUNT_2MINERS ? (
        <Row gutter={6}>
          <Col xs={24} sm={6} md={4}>
            {t("common.statistics")}
          </Col>
          <Col xs={24} sm={18} md={20}>
            <Link to="/statistics/2miners">
              {t("pages.statistics.2miners.viewPayoutStatistics")}
            </Link>
          </Col>
        </Row>
      ) : null}

      {account === ACCOUNT_NANOBROWSERQUEST ? (
        <Row gutter={6}>
          <Col xs={24} sm={6} md={4}>
            {t("common.link")}
          </Col>
          <Col xs={24} sm={18} md={20}>
            <Link to="/nanobrowserquest">{t("pages.nanobrowserquest.playNanoBrowserQuest")}</Link>
          </Col>
        </Row>
      ) : null}

      {account === ACCOUNT_NANOQUAKEJS ? (
        <Row gutter={6}>
          <Col xs={24} sm={6} md={4}>
            {t("common.link")}
          </Col>
          <Col xs={24} sm={18} md={20}>
            <Link to="/nanoquakejs">{t("pages.nanoquakejs.playNanoquakejs")}</Link>
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default ExtraRow;
