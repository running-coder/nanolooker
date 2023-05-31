import * as React from "react";
import { useTranslation } from "react-i18next";

import { GithubOutlined, HeartTwoTone } from "@ant-design/icons";
import { Layout, Tag, Typography } from "antd";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import QRCodeModal from "components/QRCode/Modal";
import { TwoToneColors } from "components/utils";

const { Text } = Typography;
const { Footer } = Layout;

export const DONATION_ACCOUNT = "nano_1gxx3dbrprrh9ycf1p5wo9qgmftppg6z7688njum14aybjkaiweqmwpuu9py";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);

  const donateColor = theme === Theme.DARK ? TwoToneColors.DONATE_DARK : TwoToneColors.DONATE;

  return (
    <Footer style={{ textAlign: "center" }}>
      <div>
        <a
          href="https://github.com/running-coder/nanolooker"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubOutlined /> NanoLooker
        </a>{" "}
        ©{new Date().getFullYear()} {t("footer.createdBy", { creator: "RunningCoder" })}
      </div>

      <QRCodeModal account={DONATION_ACCOUNT} header={<Text>{t("footer.donations.title")}</Text>}>
        <Tag
          color={donateColor}
          icon={<HeartTwoTone twoToneColor={donateColor} />}
          style={{ cursor: "pointer", marginTop: "6px" }}
        >
          {t("footer.donations.donate")}
        </Tag>
      </QRCodeModal>
    </Footer>
  );
};

export default AppFooter;
