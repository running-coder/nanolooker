import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Col, Row } from "antd";

export const ACCOUNT_NANOBROWSERQUEST =
  "ban_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay";

interface Props {
  account: string;
}

const ExtraRow: React.FC<Props> = ({ account }) => {
  const { t } = useTranslation();

  return (
    <>
      {account === ACCOUNT_NANOBROWSERQUEST ? (
        <Row gutter={6}>
          <Col xs={24} sm={6} md={4}>
            {t("common.link")}
          </Col>
          <Col xs={24} sm={18} md={20}>
            <Link to="/bananobrowserquest">
              {t("pages.nanobrowserquest.playNanoBrowserQuest")}
            </Link>
          </Col>
        </Row>
      ) : null}
    </>
  );
};

export default ExtraRow;
