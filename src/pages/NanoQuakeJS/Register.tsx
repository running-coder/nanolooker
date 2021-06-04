import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Button, Col, Input, Modal, Row, Space, Typography } from "antd";
import { CheckCircleTwoTone, CameraOutlined } from "@ant-design/icons";
import { PreferencesContext } from "api/contexts/Preferences";
import QRCodeModal from "components/QRCodeModal";
import { Natricon } from "components/Preferences/Natricons/Natricon";
import { isValidAccountAddress, getPrefixedAccount } from "components/utils";

const { Text } = Typography;

export const NANOQUAKEJS_DONATION_ACCOUNT =
  "nano_18rtodfdzxqprb5pamok8surdg91x7wys8yk47uk3xp7cyu3nuc44teysix1";

enum Sections {
  REGISTER = "REGISTER",
  SCAN = "SCAN",
}

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [registerError, setRegisterError] = React.useState("");
  const [invalidQrCode, setInvalidQrCode] = React.useState("");
  const [section, setSection] = React.useState(Sections.REGISTER);
  const {
    nanoQuakeJSUsername,
    setNanoQuakeJSUsername,
    nanoQuakeJSAccount,
    setNanoQuakeJSAccount,
  } = React.useContext(PreferencesContext);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      username: nanoQuakeJSUsername || "",
      account: nanoQuakeJSAccount || "",
    },
    mode: "onChange",
  });
  const onSubmit = async ({
    username,
    account,
  }: {
    username: string;
    account: string;
  }) => {
    setIsSending(true);
    setRegisterError("");

    // Prefix account with nano_
    const address = getPrefixedAccount(account);

    try {
      const res = await fetch("/api/nanoquakejs/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          address,
        }),
      });
      const json = await res.json();
      if (!json.error) {
        setNanoQuakeJSUsername(username);
        setNanoQuakeJSAccount(address);
        setIsOpen(false);
      } else {
        setRegisterError(
          json.error === "already_registered"
            ? t("pages.nanoquakejs.registerErrorUsername")
            : t("pages.nanoquakejs.registerError"),
        );
      }
    } catch (err) {
      setRegisterError(t("pages.nanoquakejs.registerError"));
    }

    setIsSending(false);
  };

  React.useEffect(() => {
    if (!isOpen) {
      setSection(Sections.REGISTER);
      setInvalidQrCode("");
      setRegisterError("");
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (section !== Sections.SCAN) return;

    function onScanSuccess(qrMessage: any) {
      if (isValidAccountAddress(qrMessage)) {
        setValue("account", getPrefixedAccount(qrMessage));
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
            {nanoQuakeJSUsername && nanoQuakeJSAccount ? (
              <Button
                type="primary"
                size="large"
                shape="round"
                href={`http://www.quakejs.com/play?connect%2078.129.253.179:27960&name%20${nanoQuakeJSUsername}`}
                target="_blank"
              >
                {t("pages.nanoquakejs.playNow")}
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                shape="round"
                onClick={() => setIsOpen(true)}
              >
                {t("pages.nanoquakejs.register")}
              </Button>
            )}

            <QRCodeModal
              account={NANOQUAKEJS_DONATION_ACCOUNT}
              header={<Text>NanoQuakeJS</Text>}
            >
              <Button ghost type="primary" size="small" shape="round">
                {t("pages.nanoquakejs.donatePricePool")}
              </Button>
            </QRCodeModal>
          </Space>
        </Col>
      </Row>
      {nanoQuakeJSUsername && nanoQuakeJSAccount ? (
        <Row gutter={6}>
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
            ? t("pages.nanoquakejs.register")
            : t("pages.nanoquakejs.scanWallet")
        }
        visible={isOpen}
        // @ts-ignore
        onOk={
          Sections.REGISTER
            ? handleSubmit(onSubmit)
            : setSection(Sections.REGISTER)
        }
        okText={t("pages.nanoquakejs.register")}
        okButtonProps={{
          disabled: !isValid,
        }}
        confirmLoading={isSending}
        onCancel={() => {
          section === Sections.REGISTER
            ? setIsOpen(false)
            : setSection(Sections.REGISTER);
        }}
        cancelText={
          section === Sections.REGISTER ? t("common.cancel") : t("common.back")
        }
      >
        {section === Sections.REGISTER ? (
          <>
            {registerError ? (
              <Alert
                message={registerError}
                type="error"
                showIcon
                style={{ marginBottom: 12 }}
              />
            ) : null}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Space size={12} direction="vertical" style={{ width: "100%" }}>
                <Text>{t("pages.nanoquakejs.registerDescription")}</Text>

                <Space size={3} direction="vertical" style={{ width: "100%" }}>
                  <Text>{t("pages.nanoquakejs.inGameUsername")}</Text>
                  <Input
                    readOnly={isSending}
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
                  <Text>{t("pages.nanoquakejs.accountReceivePayouts")}</Text>
                  <Input
                    readOnly={isSending}
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
                          onClick={() => setSection(Sections.SCAN)}
                        >
                          <CameraOutlined />
                        </Button>
                      )
                    }
                  />
                </Space>
                <Text style={{ fontSize: 12 }} className="color-muted">
                  * {t("pages.nanoquakejs.registerNote")}
                </Text>
              </Space>
            </form>
          </>
        ) : null}
        {section === Sections.SCAN ? (
          <>
            {invalidQrCode ? (
              <Alert
                message={t("pages.nanoquakejs.invalidAccount")}
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
    </>
  );
};

export default Register;
