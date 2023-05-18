import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "antd";

import { Tracker } from "components/utils/analytics";

const Play: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
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
      <br />
    </>
  );
};

export default Play;
