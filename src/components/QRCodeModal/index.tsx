import React from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Modal, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import QRCode from "qrcode";
import Copy from "components/Copy";
import { DONATION_ACCOUNT } from "components/AppFooter";

import type { PageParams } from "types/page";

interface QRCodeModalProps {
  children: any;
  account: string;
  header?: React.ReactNode;
}

const { Text } = Typography;

const QRCodeModal = ({ header, account, children }: QRCodeModalProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [base64Image, setBase64Image] = React.useState<string>("");
  const { account: accountParam = "" } = useParams<PageParams>();

  const generateQR = async (text: string) => {
    try {
      setBase64Image(await QRCode.toDataURL(text));
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (isVisible && !base64Image) {
      generateQR(account);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, base64Image]);

  return (
    <>
      {React.cloneElement(children, {
        onClick: () => {
          setIsVisible(true);
        },
      })}
      <Modal
        width="300px"
        visible={isVisible}
        onCancel={() => setIsVisible(false)}
        footer={[
          <Button
            key="submit"
            type="primary"
            onClick={() => setIsVisible(false)}
          >
            Ok
          </Button>,
        ]}
      >
        {header}
        <div style={{ textAlign: "center" }}>
          {base64Image ? <img src={base64Image} alt="QR code" /> : null}
        </div>
        <>
          {account === DONATION_ACCOUNT && accountParam !== DONATION_ACCOUNT ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <Copy text={DONATION_ACCOUNT} />
              <Link
                to={`/account/${DONATION_ACCOUNT}`}
                style={{ marginLeft: "12px" }}
              >
                <Button
                  shape="circle"
                  size="small"
                  icon={<SearchOutlined />}
                  onClick={() => setIsVisible(false)}
                />
              </Link>
            </div>
          ) : null}
          <Text>{DONATION_ACCOUNT}</Text>
        </>
      </Modal>
    </>
  );
};

export default QRCodeModal;
