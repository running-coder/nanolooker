import * as React from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { CheckCircleTwoTone, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Space, Switch, Typography } from "antd";

import { PreferencesContext } from "api/contexts/Preferences";

const { Text } = Typography;
interface Props {
  isDetailed?: boolean;
}

const ConnectionPreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { rpcDomain, setRpcDomain, websocketDomain, setWebsocketDomain } =
    React.useContext(PreferencesContext);
  const [isEnabled, setIsEnabled] = React.useState(!!rpcDomain);
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      rpcDomain: rpcDomain || "",
      websocketDomain: websocketDomain || "",
    },
    mode: "onChange",
  });

  const onSubmit = async ({
    rpcDomain,
    websocketDomain,
  }: {
    rpcDomain?: string;
    websocketDomain?: string;
  }) => {
    if (rpcDomain) {
      setRpcDomain(rpcDomain);
    }
    if (websocketDomain) {
      setWebsocketDomain(websocketDomain);
    }
    window.location.reload();
  };

  return (
    <>
      <Row style={{ alignItems: !isDetailed ? "center" : "flex-start" }}>
        <Col xs={18}>
          <Text>{t("pages.preferences.connectionDetailed")}</Text>
        </Col>

        <Col xs={6} style={{ textAlign: "right" }}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={(checked: boolean) => {
              setIsEnabled(checked);
              if (!checked) {
                setRpcDomain("");
                setWebsocketDomain("");
                setValue("rpcDomain", "");
                setValue("websocketDomain", "");
              }
            }}
            checked={isEnabled}
          />
        </Col>

        {isEnabled ? (
          <Col xs={24}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 12,
                }}
              >
                <Space size={12} direction="vertical">
                  <Space size={3} direction="vertical">
                    <Text>{t("pages.preferences.rpcDomain")}</Text>
                    <Controller
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          style={{ width: "400px", maxWidth: "100%" }}
                          placeholder={`http://127.0.0.1:7076`}
                          maxLength={255}
                          suffix={
                            getValues("rpcDomain") && !errors?.rpcDomain ? (
                              <CheckCircleTwoTone twoToneColor={"#52c41a"} />
                            ) : (
                              " "
                            )
                          }
                        />
                      )}
                      rules={{
                        // @ts-ignore
                        validate: (value: string) => {
                          return !value || value.length >= 15;
                        },
                      }}
                      control={control}
                      name="rpcDomain"
                      defaultValue={getValues("rpcDomain")}
                    />
                  </Space>
                  <Space size={3} direction="vertical">
                    <Text>{t("pages.preferences.websocketDomain")}</Text>
                    <Controller
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="text"
                          style={{ width: "400px", maxWidth: "100%" }}
                          placeholder={`wss://www.nanolooker.com/ws`}
                          maxLength={255}
                          suffix={
                            getValues("websocketDomain") && !errors?.websocketDomain ? (
                              <CheckCircleTwoTone twoToneColor={"#52c41a"} />
                            ) : (
                              " "
                            )
                          }
                        />
                      )}
                      rules={{
                        // @ts-ignore
                        validate: (value: string) => {
                          return !value || value.length >= 15;
                        },
                      }}
                      control={control}
                      name="websocketDomain"
                      defaultValue={getValues("websocketDomain")}
                    />
                  </Space>
                </Space>
              </div>
              <div style={{ textAlign: "right", marginTop: 12 }}>
                <Button type="primary" disabled={!isValid} onClick={handleSubmit(onSubmit)}>
                  Save
                </Button>
              </div>
            </form>
          </Col>
        ) : null}
      </Row>
    </>
  );
};

export default ConnectionPreferences;
