import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Col, Row, Space, Typography } from "antd";
import QRCodeModal from "components/QRCode/Modal";
import Play from "./Play";

const { Text } = Typography;

export const NANOBROWSERQUEST_DONATION_ACCOUNT =
  "nano_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay";

const Register: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Row
        style={{
          textAlign: "center",
          paddingBottom: "3px",
          border: "none",
          marginTop: -12,
        }}
      >
        <Col xs={24}>
          <Space size={12} align="center" direction="vertical">
            <Play />

            <QRCodeModal
              account={NANOBROWSERQUEST_DONATION_ACCOUNT}
              header={<Text>NanoBrowserQuest</Text>}
            >
              <Button ghost type="primary" size="small" shape="round">
                {t("pages.nanobrowserquest.donatePrizePool")}
              </Button>
            </QRCodeModal>

            <p className="default-color" style={{ textAlign: "left" }}>
              {t("pages.nanobrowserquest.payoutDescription")}
            </p>
          </Space>
        </Col>
      </Row>
    </>
  );
};

export default Register;
