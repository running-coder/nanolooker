import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Tag, Layout, Typography, Button } from "antd";
import {
  GithubOutlined,
  HeartTwoTone,
  SearchOutlined,
} from "@ant-design/icons";
import Copy from "components/Copy";
import QRCodeModal from "components/QRCodeModal";

const { Text } = Typography;
const { Footer } = Layout;

export const DONATION_ACCOUNT =
  "nano_1gxx3dbrprrh9ycf1p5wo9qgmftppg6z7688njum14aybjkaiweqmwpuu9py";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Footer style={{ textAlign: "center" }}>
      <div>
        <a
          href="https://github.com/running-coder/nanolooker"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubOutlined /> Nano Looker
        </a>{" "}
        ©{new Date().getFullYear()}{" "}
        {t("footer.createdBy", { creator: "RunningCoder" })}
      </div>

      <QRCodeModal
        account={DONATION_ACCOUNT}
        header={<Text>{t("footer.donations.title")}</Text>}
        body={
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <Copy text={DONATION_ACCOUNT} />
              <Link
                to={`/account/${DONATION_ACCOUNT}`}
                style={{ marginLeft: "12px" }}
              >
                <Button shape="circle" size="small" icon={<SearchOutlined />} />
              </Link>
            </div>
            <Text>{DONATION_ACCOUNT}</Text>
          </>
        }
      >
        <Tag
          color="magenta"
          icon={<HeartTwoTone twoToneColor="#eb2f96" />}
          style={{ cursor: "pointer", marginTop: "6px" }}
        >
          {t("footer.donations.donate")}
        </Tag>
      </QRCodeModal>
    </Footer>
  );
};

export default AppFooter;
