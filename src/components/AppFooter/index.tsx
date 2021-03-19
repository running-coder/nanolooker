import * as React from "react";
import { useTranslation } from "react-i18next";
import { Tag, Layout, Typography } from "antd";
import { GithubOutlined, HeartTwoTone } from "@ant-design/icons";
import QRCodeModal from "components/QRCodeModal";

const { Text } = Typography;
const { Footer } = Layout;

const DONATION_ACCOUNT =
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
        body={<Text>{DONATION_ACCOUNT}</Text>}
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
