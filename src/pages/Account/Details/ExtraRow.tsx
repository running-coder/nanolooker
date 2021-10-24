import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Col, Row } from "antd";

interface Props {
  account: string;
}

export const ACCOUNT_2MINERS =
  "nano_14uzbiw1euwicrt3gzwnpyufpa8td1uw8wbhyyrz5e5pnqitjfk1tb8xwgg4";

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
    </>
  );
};

export default ExtraRow;
