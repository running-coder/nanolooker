import React from "react";
import { Button, Tooltip } from "antd";
import { CheckCircleFilled, CopyOutlined, CopyFilled } from "@ant-design/icons";
import CopyToClipboard from "react-copy-to-clipboard";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { Colors } from "components/utils";

let copiedTimeout: number | undefined;

const Copy = ({ text }: { text: string }) => {
  const { theme } = React.useContext(PreferencesContext);
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  return (
    <Tooltip title={isCopied ? "Copied!" : "Copy"}>
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
            <CheckCircleFilled
              style={{ fontSize: "24px", color: Colors.RECEIVE_DARK as string }}
            />
          ) : (
            <CheckCircleFilled
              style={{ fontSize: "24px", color: Colors.RECEIVE as string }}
            />
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
