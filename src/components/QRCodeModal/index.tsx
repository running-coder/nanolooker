import React from "react";
import { Button, Modal } from "antd";
import QRCode from "qrcode";

interface QRCodeModalProps {
  children: any;
  text: string;
}

const QRCodeModal = ({ text, children }: QRCodeModalProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [base64Image, setBase64Image] = React.useState<string>("");

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
      {React.cloneElement(children, {
        onClick: () => {
          setIsVisible(true);
        }
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
          </Button>
        ]}
      >
        <div style={{ textAlign: "center" }}>
          {base64Image ? <img src={base64Image} alt="QR code" /> : null}
        </div>
        <p>{text}</p>
      </Modal>
    </>
  );
};

export default QRCodeModal;
