import * as React from "react";

import qrcode from "qrcode";

interface QRCodeProps {
  account: string;
}

const QRCode = ({ account }: QRCodeProps) => {
  const [base64Image, setBase64Image] = React.useState<string>("");

  const generateQR = async (text: string) => {
    try {
      setBase64Image(await qrcode.toDataURL(text));
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    generateQR(account);
  }, [account]);

  return (
    <>
      <div style={{ textAlign: "center" }}>
        {base64Image ? <img src={base64Image} alt="Nano account QR code" /> : null}
      </div>
    </>
  );
};

export default QRCode;
