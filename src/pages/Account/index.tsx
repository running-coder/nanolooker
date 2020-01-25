import React from "react";
import { Button, Icon, Tooltip } from "antd";
import { useParams } from "react-router-dom";
import CopyToClipboard from "react-copy-to-clipboard";
import { rpc } from "api/rpc";
import { rawToRai, colorizeAccountAddress } from "components/utils";
import QRCodeModal from "components/QRCodeModal";
import usePrice from "components/Price/hooks/use-price";

interface AccountInfo {
  frontier: string;
  open_block: string;
  representative_block: string;
  balance: string;
  modified_timestamp: string;
  block_count: string;
  confirmation_height: string;
  account_version: string;
}

let copiedTimeout: number | undefined;

const AccountPage = () => {
  let { account } = useParams();
  const { usd } = usePrice();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [accountInfo, setAccountInfo] = React.useState<AccountInfo>();
  const [isCopied, setIsCopied] = React.useState<boolean>(false);

  React.useEffect(() => {
    const getAccount = async () => {
      try {
        const json = await rpc("account_info", {
          account
        });

        console.log("~~~~json", json);

        setAccountInfo(json);
        setIsLoading(true);
      } catch (e) {}
    };

    getAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return (
    <>
      {account ? (
        <p
          style={{
            fontSize: "16px",
            marginRight: "6px",
            wordWrap: "break-word",
            position: "relative"
          }}
        >
          <Icon
            type="wallet"
            style={{ fontSize: "18px", marginRight: "6px", float: "left" }}
          />
          <span style={{ marginRight: "6px" }}>
            {colorizeAccountAddress(account)}
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
                style={{ marginRight: "6px" }}
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
            />
          </Tooltip>
        </p>
      ) : (
        "Missing account"
      )}

      {accountInfo ? (
        <>
          <div>balance - {rawToRai(accountInfo.balance)}</div>
          {usd ? <div>usd - ${rawToRai(accountInfo.balance) * usd}</div> : null}
          <div>Total transactions - {accountInfo.block_count}</div>
          <div>Last transaction - {accountInfo.modified_timestamp}</div>
        </>
      ) : null}
    </>
  );
};

export default AccountPage;
