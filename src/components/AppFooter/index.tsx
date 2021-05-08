import * as React from "react";
import { useTranslation } from "react-i18next";
import { Tag, Layout, Typography } from "antd";
import { GithubOutlined, HeartTwoTone } from "@ant-design/icons";
import QRCodeModal from "components/QRCodeModal";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { TwoToneColors } from "components/utils";

const { Text } = Typography;
const { Footer } = Layout;

export const DONATION_ACCOUNT =
  "ban_1gxx3dbrprrh9ycf1p5wo9qgmftppg6z7688njum14aybjkaiweqmwpuu9py";

const AppFooter: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);

  const donateColor =
    theme === Theme.DARK ? TwoToneColors.DONATE_DARK : TwoToneColors.DONATE;

  return (
    <Footer style={{ textAlign: "center" }}>
      <div>
        <a
          href="https://github.com/running-coder/nanolooker/tree/bananolooker"
          rel="noopener noreferrer"
          target="_blank"
        >
          <GithubOutlined /> BananoLooker
        </a>{" "}
        ©{new Date().getFullYear()}{" "}
        {t("footer.createdBy", { creator: "RunningCoder" })}
      </div>

      <QRCodeModal
        account={DONATION_ACCOUNT}
        header={<Text>{t("footer.donations.title")}</Text>}
      >
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
