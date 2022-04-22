import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Typography } from "antd";
import { Tracker } from "components/utils/analytics";

const { Text } = Typography;

const Play: React.FC = () => {
  const { t } = useTranslation();
  // const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "70%",
          border: "solid 1px #f0f2f5",
          margin: "12px auto",
          padding: 12,
        }}
      >
        <img
          alt="NanoBrowserQuest Promotion 50% off Freezing Lands expansion"
          src={`/nanobrowserquest/50-off.png`}
          height="62px"
          width="100px"
        />
        <Text strong style={{ textAlign: "left", marginLeft: 12 }}>
          Speak to the Wizard in town to purchase the Freezing Lands expansion.
          Other store items are also on sale!
        </Text>
      </div>
      <Button
        type="primary"
        size="large"
        shape="round"
        href={`https://www.nanobrowserquest.com`}
        target={"_blank"}
        onClick={() => {
          Tracker.ga4?.gtag("event", "NanoBrowserQuest - Play", t);
        }}
      >
        {t("pages.nanobrowserquest.playNow")}
      </Button>
    </>
  );
};

export default Play;
