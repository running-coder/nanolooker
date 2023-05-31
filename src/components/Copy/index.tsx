import * as React from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

import { CheckCircleFilled, CopyFilled, CopyOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { Colors } from "components/utils";

let copiedTimeout: number | undefined;

const Copy = ({ text }: { text: string }) => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  return (
    <Tooltip title={isCopied ? `${t("common.copied")}!` : t("common.copy")}>
      <CopyToClipboard
        text={text}
        onCopy={() => {
          setIsCopied(true);
          clearTimeout(copiedTimeout);
          copiedTimeout = window.setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      >
        {isCopied ? (
          theme === Theme.DARK ? (
            <CheckCircleFilled style={{ fontSize: "24px", color: Colors.PENDING_DARK as string }} />
          ) : (
            <CheckCircleFilled style={{ fontSize: "24px", color: Colors.PENDING as string }} />
          )
        ) : (
          <Button
            shape="circle"
            size="small"
            disabled={isCopied}
            style={{
              borderColor: isCopied ? (Colors.RECEIVE as string) : undefined,
            }}
          >
            {theme === Theme.DARK ? <CopyFilled /> : <CopyOutlined />}
          </Button>
        )}
      </CopyToClipboard>
    </Tooltip>
  );
};

export default Copy;
