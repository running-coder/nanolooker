import * as React from "react";
// import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Input, Modal, Row, Space, Typography } from "antd";
import { CheckCircleTwoTone, CameraOutlined } from "@ant-design/icons";
import { PreferencesContext } from "api/contexts/Preferences";
import QRCodeModal from "components/QRCodeModal";
import { Natricon } from "components/Preferences/Natricons/Natricon";
import { isValidAccountAddress } from "components/utils";

const { Text } = Typography;

export const NANOQUAKEJS_DONATION_ACCOUNT =
  "nano_18rtodfdzxqprb5pamok8surdg91x7wys8yk47uk3xp7cyu3nuc44teysix1";

enum Sections {
  REGISTER = "REGISTER",
  SCAN = "SCAN",
}

const Register: React.FC = () => {
  // const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  // const [isSending, setIsSending] = React.useState(false);
  const [invalidQrCode, setInvalidQrCode] = React.useState("");
  const [section, setSection] = React.useState(Sections.REGISTER);
  const {
    nanoQuakeJSUsername,
    setNanoQuakeJSUsername,
    nanoQuakeJSAccount,
    setNanoQuakeJSAccount,
  } = React.useContext(PreferencesContext);
  // const isMediumAndHigher = !useMediaQuery("(max-width: 768px)");

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });
  const onSubmit = ({
    username,
    account,
  }: {
    username: string;
    account: string;
  }) => {
    // @TODO API call to register

    setNanoQuakeJSUsername(username);
    setNanoQuakeJSAccount(account);
    setIsOpen(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setSection(Sections.REGISTER);
      setInvalidQrCode("");
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (section !== Sections.SCAN) return;

    function onScanSuccess(qrMessage: any) {
      if (isValidAccountAddress(qrMessage)) {
        setValue("account", qrMessage);
        trigger("account");

        document.getElementById("html5-qrcode-scan-stop-btn")?.click();
        setSection(Sections.REGISTER);
      } else {
        setInvalidQrCode(qrMessage);
      }
    }

    const html5QrcodeScanner = new window.Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });
    html5QrcodeScanner.render(onScanSuccess);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  return (
    <div>
      {/* <Space size={12} align="center" direction="vertical" style={{ width: '100%'}}> */}
      <Row style={{ textAlign: "center", paddingBottom: '3px' }}>
        <Col xs={24}>
          <Space size={12} align="center" direction="vertical">
            {nanoQuakeJSUsername && nanoQuakeJSAccount ? (
              <Button
                type="primary"
                size="large"
                shape="round"
                onClick={() => console.log("API to quakejs")}
              >
                Play Now !
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                shape="round"
                onClick={() => setIsOpen(true)}
              >
                Register
              </Button>
            )}

            <QRCodeModal
              account={NANOQUAKEJS_DONATION_ACCOUNT}
              header={<Text>NanoQuakeJS Hot wallet</Text>}
            >
              <Button ghost type="primary" size="small" shape="round">
                Donate to NanoQuakeJS price pool
              </Button>
            </QRCodeModal>
          </Space>
        </Col>
      </Row>
      {nanoQuakeJSUsername && nanoQuakeJSAccount ? (
        <Row
          gutter={24}
          // style={{ borderTop: "solid 1px #f0f2f5", paddingTop: 12 }}
        >
          <Col xs={4} md={4} style={{ textAlign: "right" }}>
            <Natricon
              account={nanoQuakeJSAccount}
              style={{
                margin: "-12px -6px -18px -18px ",
                width: "80px",
                height: "80px",
              }}
            />
          </Col>
          <Col xs={20} md={20} style={{ textAlign: "left" }}>
            <div className="color-important">{nanoQuakeJSUsername}</div>
            <Link to={`/account/${nanoQuakeJSAccount}`} className="break-word">
              {nanoQuakeJSAccount}
            </Link>
          </Col>
        </Row>
      ) : null}

      <Modal
        title={
          section === Sections.REGISTER
            ? "Register"
            : "Scan your wallet address"
        }
        visible={isOpen}
        // @ts-ignore
        onOk={
          Sections.REGISTER
            ? handleSubmit(onSubmit)
            : setSection(Sections.REGISTER)
        }
        okText={"Register"}
        okButtonProps={{
          disabled: !isValid,
        }}
        // confirmLoading={isSending}
        onCancel={() => {
          section === Sections.REGISTER
            ? setIsOpen(false)
            : setSection(Sections.REGISTER);
        }}
        cancelText={section === Sections.REGISTER ? "Cancel" : "Back"}
      >
        {section === Sections.REGISTER ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Space size={12} direction="vertical" style={{ width: "100%" }}>
              <Text>
                NanoQuakeJS is free to play, forever. If you enjoy the service
                you can make a small contribution to the NanoQuakeJS price pool.
              </Text>
              <Text>Happy fragging!</Text>

              <Space size={3} direction="vertical" style={{ width: "100%" }}>
                <Text>In-game username</Text>
                <Input
                  autoFocus={!!getValues("username")}
                  {...register("username", {
                    required: true,
                    validate: (value: string) => value.length >= 3,
                  })}
                  maxLength={32}
                  onChange={e => {
                    setValue("username", e.target.value);
                    trigger("username");
                  }}
                  value={getValues("username")}
                  suffix={
                    getValues("username") && !errors?.username ? (
                      <CheckCircleTwoTone twoToneColor={"#52c41a"} />
                    ) : (
                      " "
                    )
                  }
                />
              </Space>
              <Space size={3} direction="vertical" style={{ width: "100%" }}>
                <Text>Account to receive payouts</Text>
                <Input
                  placeholder="nano_"
                  {...register("account", {
                    required: true,
                    validate: (value: string) => isValidAccountAddress(value),
                  })}
                  // @ts-ignore
                  onPaste={(e: ClipboardEvent<HTMLInputElement>) => {}}
                  onChange={e => {
                    setValue("account", e.target.value);
                    trigger("account");
                  }}
                  value={getValues("account")}
                  suffix={
                    getValues("account") && !errors?.account ? (
                      <CheckCircleTwoTone twoToneColor={"#52c41a"} />
                    ) : (
                      <Button
                        size="small"
                        type="text"
                        // style={{ margin: "-1px -8px -1px" }}
                        onClick={() => setSection(Sections.SCAN)}
                      >
                        <CameraOutlined />
                      </Button>
                    )
                  }
                />
              </Space>
              <Text style={{ fontSize: 12 }} className="color-muted">
                * The username and account are stored in the browser data.
              </Text>
            </Space>
          </form>
        ) : null}
        {section === Sections.SCAN ? (
          <>
            {invalidQrCode ? (
              <Alert
                message={"Invalid account"}
                description={invalidQrCode}
                type="error"
                showIcon
                style={{ marginBottom: 12 }}
              />
            ) : null}
            <div id="reader"></div>
          </>
        ) : null}
      </Modal>
    </div>
  );
};

export default Register;
