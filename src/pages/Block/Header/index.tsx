import React from "react";
import { Button, Tooltip } from "antd";
import { BlockOutlined, CheckOutlined, CopyOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import CopyToClipboard from "react-copy-to-clipboard";
import { Colors } from "components/utils";

let copiedTimeout: number | undefined;

const BlockHeader = () => {
  const { block = "" } = useParams();
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  return (
    <>
      <p
        style={{
          fontSize: "16px",
          marginRight: "6px",
          wordWrap: "break-word",
          position: "relative"
        }}
        className="clearfix"
      >
        <BlockOutlined
          style={{
            fontSize: "18px",
            marginTop: "4px",
            marginRight: "6px",
            float: "left"
          }}
        />
        <span style={{ marginRight: "6px" }}>
          <span>{block.substr(block.length * -1, block.length - 64)}</span>
          <span style={{ color: "#1890ff" }}>{block.substr(-64, 7)}</span>
          <span>{block.substr(-57, 50)}</span>
          <span style={{ color: "#1890ff" }}>{block.substr(-7)}</span>
        </span>
        <Tooltip
          title={isCopied ? "Copied!" : "Copy"}
          overlayClassName="tooltip-sm"
        >
          <CopyToClipboard
            text={block}
            onCopy={() => {
              setIsCopied(true);
              clearTimeout(copiedTimeout);
              copiedTimeout = window.setTimeout(() => {
                setIsCopied(false);
              }, 2000);
            }}
          >
            <Button
              shape="circle"
              size="small"
              disabled={isCopied}
              style={{
                marginRight: "6px",
                borderColor: isCopied ? Colors.RECEIVE : undefined
              }}
            >
              {isCopied ? (
                <CheckOutlined style={{ color: Colors.RECEIVE }} />
              ) : (
                <CopyOutlined />
              )}
            </Button>
          </CopyToClipboard>
        </Tooltip>
      </p>
    </>
  );
};

export default BlockHeader;
