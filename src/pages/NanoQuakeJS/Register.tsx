import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { CameraOutlined, CheckCircleTwoTone } from "@ant-design/icons";
import { Alert, Button, Col, Input, Modal, Row, Space, Typography } from "antd";

import { PreferencesContext } from "api/contexts/Preferences";
import QRCodeModal from "components/QRCode/Modal";
import { getPrefixedAccount, isValidAccountAddress } from "components/utils";
import { Tracker } from "components/utils/analytics";

import Play from "./Play";

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
  const { nanoQuakeJSUsername, setNanoQuakeJSUsername, nanoQuakeJSAccount, setNanoQuakeJSAccount } =
    React.useContext(PreferencesContext);

  const {
    control,
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
  const onSubmit = async ({ username, account }: { username: string; account: string }) => {
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
        Tracker.ga4?.gtag("event", "NanoQuakeJS - Register");
      } else {
        setRegisterError(
          (json.error === "already_registered"
            ? t("pages.nanoquakejs.registerErrorUsername")
            : t("pages.nanoquakejs.registerError")) as string,
        );
      }
    } catch (err) {
      setRegisterError(t("pages.nanoquakejs.registerError") as string);
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

    const html5QrcodeScanner = new window.Html5QrcodeScanner("qrcode-reader", {
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
              <Play />
            ) : (
              <Button type="primary" size="large" shape="round" onClick={() => setIsOpen(true)}>
                {t("pages.nanoquakejs.register")}
              </Button>
            )}

            <QRCodeModal account={NANOQUAKEJS_DONATION_ACCOUNT} header={<Text>NanoQuakeJS</Text>}>
              <Button ghost type="primary" size="small" shape="round">
                {t("pages.nanoquakejs.donatePrizePool")}
              </Button>
            </QRCodeModal>

            <p className="default-color" style={{ textAlign: "left" }}>
              {t("pages.nanoquakejs.payoutDescription")}
            </p>
          </Space>
        </Col>
      </Row>

      <Modal
        title={
          section === Sections.REGISTER
            ? t("pages.nanoquakejs.register")
            : t("pages.nanoquakejs.scanWallet")
        }
        open={isOpen}
        // @ts-ignore
        onOk={Sections.REGISTER ? handleSubmit(onSubmit) : setSection(Sections.REGISTER)}
        okText={t("pages.nanoquakejs.register")}
        okButtonProps={{
          disabled: !isValid,
        }}
        confirmLoading={isSending}
        onCancel={() => {
          section === Sections.REGISTER ? setIsOpen(false) : setSection(Sections.REGISTER);
        }}
        cancelText={t("common.cancel")}
      >
        {section === Sections.REGISTER ? (
          <>
            {registerError ? (
              <Alert message={registerError} type="error" showIcon style={{ marginBottom: 12 }} />
            ) : null}
            <form onSubmit={handleSubmit(onSubmit)}>
              <Space size={12} direction="vertical" style={{ width: "100%" }}>
                <Text>{t("pages.nanoquakejs.registerDescription")}</Text>

                <Space size={3} direction="vertical" style={{ width: "100%" }}>
                  <Text>{t("pages.nanoquakejs.inGameUsername")}</Text>
                  <Controller
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="text"
                        readOnly={isSending}
                        maxLength={32}
                        autoFocus={!!getValues("username")}
                        suffix={
                          getValues("username") && !errors?.username ? (
                            <CheckCircleTwoTone twoToneColor={"#52c41a"} />
                          ) : (
                            " "
                          )
                        }
                      />
                    )}
                    rules={{
                      validate: (value: string) => value.length >= 3 && !/\s/.test(value),
                    }}
                    control={control}
                    name="username"
                    defaultValue={getValues("username")}
                  />
                </Space>
                <Space size={3} direction="vertical" style={{ width: "100%" }}>
                  <Text>{t("pages.nanoquakejs.accountReceivePayouts")}</Text>
                  <Controller
                    render={({ field }) => (
                      <Input
                        {...field}
                        readOnly={isSending}
                        placeholder="nano_"
                        suffix={
                          getValues("account") && !errors?.account ? (
                            <CheckCircleTwoTone twoToneColor={"#52c41a"} />
                          ) : (
                            <Button
                              size="small"
                              type="text"
                              style={{ margin: "-1px -7px -1px" }}
                              onClick={() => setSection(Sections.SCAN)}
                            >
                              <CameraOutlined />
                            </Button>
                          )
                        }
                      />
                    )}
                    rules={{
                      validate: (value: string) => isValidAccountAddress(value),
                    }}
                    control={control}
                    name="account"
                    defaultValue={getValues("account")}
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
            <div id="qrcode-reader" className="qrcode-reader"></div>
          </>
        ) : null}
      </Modal>
    </>
  );
};

export default Register;
