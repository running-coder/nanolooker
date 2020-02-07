import React from "react";
import { Button, Icon, Tooltip, Typography } from "antd";
import { useParams } from "react-router-dom";
import CopyToClipboard from "react-copy-to-clipboard";
import QRCodeModal from "components/QRCodeModal";
import { RepresentativesContext } from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";

const { Title } = Typography;
let copiedTimeout: number | undefined;

const AccountHeader = () => {
  const { account = "" } = useParams();
  const [isCopied, setIsCopied] = React.useState<boolean>(false);
  const { representatives } = React.useContext(RepresentativesContext);
  const {
    confirmationQuorum: { principal_representative_min_weight: minWeight }
  } = React.useContext(ConfirmationQuorumContext);

  return (
    <>
      {representatives?.[account] && minWeight ? (
        <>
          <Title level={3}>
            {representatives[account] >= minWeight ? "Principal " : ""}
            Representative
          </Title>
        </>
      ) : null}
      <p
        style={{
          fontSize: "16px",
          marginRight: "6px",
          wordWrap: "break-word",
          position: "relative"
        }}
        className="clearfix"
      >
        <Icon
          type="wallet"
          style={{
            fontSize: "18px",
            marginTop: "4px",
            marginRight: "6px",
            float: "left"
          }}
        />
        <span style={{ marginRight: "6px" }}>
          <span>
            {account.substr(account.length * -1, account.length - 60)}
          </span>
          <span style={{ color: "#1890ff" }}>{account.substr(-60, 7)}</span>
          <span>{account.substr(-53, 46)}</span>
          <span style={{ color: "#1890ff" }}>{account.substr(-7)}</span>
        </span>
        <Tooltip
          title={isCopied ? "Copied!" : "Copy"}
          overlayClassName="tooltip-sm"
        >
          <CopyToClipboard
            text={account}
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
                borderColor: isCopied ? "#52c41a" : undefined
              }}
            >
              {isCopied ? (
                <Icon type="check" style={{ color: "#52c41a" }} />
              ) : (
                <Icon type="copy" />
              )}
            </Button>
          </CopyToClipboard>
        </Tooltip>
        <Tooltip title="QR code" overlayClassName="tooltip-sm">
          <QRCodeModal
            Component={
              <Button
                shape="circle"
                icon="qrcode"
                size="small"
                style={{ marginRight: "6px" }}
              />
            }
            text={account}
          />
        </Tooltip>
      </p>
    </>
  );
};

export default AccountHeader;
