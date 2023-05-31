import * as React from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";

import { QrcodeOutlined, WalletOutlined } from "@ant-design/icons";
import { Button, Col, Row } from "antd";

import { PreferencesContext } from "api/contexts/Preferences";
import Bookmark from "components/Bookmark";
import Copy from "components/Copy";
import { Natricon } from "components/Preferences/Natricons/Natricon";
import QRCodeModal from "components/QRCode/Modal";

interface Props {
  account: string;
  isLink?: boolean;
  hideOptions?: boolean;
}

const AccountHeader: React.FC<Props> = ({ account, isLink = false, hideOptions = false }) => {
  const { natricons } = React.useContext(PreferencesContext);
  const isSmallAndLower = !useMediaQuery({ query: "(min-width: 576px)" });

  return (
    <div
      style={{
        display: "flex",
        alignItems: natricons ? "center" : "",
        fontSize: "16px",
        wordWrap: "break-word",
        position: "relative",
      }}
      className="color-normal"
    >
      {natricons ? (
        <Natricon
          account={account}
          style={{
            margin: "-12px -6px -18px -18px",
            width: "80px",
            height: "80px",
          }}
        />
      ) : (
        <div style={{ alignSelf: "baseline" }}>
          <WalletOutlined
            style={{
              fontSize: "18px",
              marginRight: "6px",
            }}
          />
        </div>
      )}

      {!isLink ? (
        <span className="break-word" style={{ marginRight: "6px" }}>
          <span>{account.substr(account.length * -1, account.length - 60)}</span>
          <span style={{ color: "#1890ff" }}>{account.substr(-60, 7)}</span>
          <span>{account.substr(-53, 46)}</span>
          <span style={{ color: "#1890ff" }}>{account.substr(-7)}</span>
        </span>
      ) : (
        <Link
          to={`/account/${account}`}
          style={{ fontSize: "14px", marginRight: "6px" }}
          className="break-word"
        >
          {account}
        </Link>
      )}

      {!hideOptions ? (
        <Row gutter={6} justify="start" className="options-wrapper">
          <Col style={{ fontSize: 0, alignSelf: "center" }}>
            <Copy text={account} />
          </Col>
          <Col>
            <Bookmark
              type="account"
              bookmark={account}
              placement={isSmallAndLower ? "left" : "top"}
            />
          </Col>
          <Col>
            <QRCodeModal account={account}>
              <Button shape="circle" icon={<QrcodeOutlined />} size="small" />
            </QRCodeModal>
          </Col>
        </Row>
      ) : null}
    </div>
  );
};

export default AccountHeader;
