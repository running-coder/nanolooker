import React from "react";
import { Button, Modal } from "antd";
import QRCode from "qrcode";

interface QRCodeModalProps {
  Component: any;
  text: string;
}

const QRCodeModal = ({ Component, text }: QRCodeModalProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [base64Image, setBase64Image] = React.useState<string>("");

  const EnhancedComponent = React.cloneElement(Component, {
    onClick: () => {
      setIsVisible(true);
    }
  });

  const generateQR = async (text: string) => {
    try {
      setBase64Image(await QRCode.toDataURL(text));
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (isVisible && !base64Image) {
      generateQR(text);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, base64Image]);

  return (
    <>
      {EnhancedComponent}
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
          </Button>
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <img src={base64Image} alt="QR code" />
        </div>
        <p>{text}</p>
      </Modal>
    </>
  );
};

export default QRCodeModal;
