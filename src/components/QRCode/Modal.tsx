import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { SearchOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";

import { DONATION_ACCOUNT } from "components/AppFooter";
import Copy from "components/Copy";
import { NANOBROWSERQUEST_DONATION_ACCOUNT } from "pages/NanoBrowserQuest/Register";
import { NANOQUAKEJS_DONATION_ACCOUNT } from "pages/NanoQuakeJS/Register";

import QRCode from ".";

import type { PageParams } from "types/page";

interface QRCodeModalProps {
  children: any;
  account: string;
  header?: React.ReactNode;
}

const { Text } = Typography;

const QRCodeModal = ({ header, account, children }: QRCodeModalProps) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = React.useState(false);
  const { account: accountParam = "" } = useParams<PageParams>();

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          setIsVisible(true);
        },
      })}
      <Modal
        width="300px"
        open={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={[
          <Button key="submit" type="primary" onClick={() => setIsVisible(false)}>
            {t("common.ok")}
          </Button>,
        ]}
      >
        {header}
        <div style={{ textAlign: "center", margin: "10px 0" }}>
          <QRCode account={account} />
        </div>
        <>
          {(account === DONATION_ACCOUNT && accountParam !== DONATION_ACCOUNT) ||
          [NANOBROWSERQUEST_DONATION_ACCOUNT, NANOQUAKEJS_DONATION_ACCOUNT].includes(account) ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <Copy text={account} />
              <Link to={`/account/${account}`} style={{ marginLeft: "12px" }}>
                <Button
                  shape="circle"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={() => setIsVisible(false)}
                />
              </Link>
            </div>
          ) : null}
          <Text>{account}</Text>
        </>
      </Modal>
    </>
  );
};

export default QRCodeModal;
