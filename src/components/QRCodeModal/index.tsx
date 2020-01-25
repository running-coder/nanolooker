import React from "react";
import { Button, Modal } from "antd";

interface QRCodeModalProps {
  Component: any;
}

const QRCodeModal = ({ Component }: QRCodeModalProps) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const Hello = React.cloneElement(Component, {
    onClick: () => {
      setIsVisible(true);
    }
  });

  return (
    <>
      {Hello}
      <Modal
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
        <p>Generate QRCode</p>
      </Modal>
    </>
  );
};

export default QRCodeModal;
