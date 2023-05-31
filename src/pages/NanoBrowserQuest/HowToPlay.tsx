import * as React from "react";
import { useTranslation } from "react-i18next";

import { Card, Typography } from "antd";

const { Text, Title } = Typography;

const HowToPlay: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Title level={3}>{t("pages.nanobrowserquest.howToPlay")}</Title>
      <Card size="small" className="detail-layout">
        <Title level={4}>{t("pages.nanobrowserquest.itemUpgrade")}</Title>
        <Text>{t("pages.nanobrowserquest.itemUpgradeDescription")}</Text>
        <img
          src="/nanobrowserquest/upgrade-and-equip.gif"
          alt="Upgrade your items at the Anvil"
          width="100%"
          style={{
            maxWidth: "600px",
            display: "block",
            pointerEvents: "none",
            margin: "12px 0",
          }}
        />

        <Title level={5}>{t("pages.nanobrowserquest.upgradeSuccessRate")}</Title>
        <ul>
          <li>+1 → +2, 100%</li>
          <li>+2 → +3, 100%</li>
          <li>+3 → +4, 90%</li>
          <li>+4 → +5, 80%</li>
          <li>+5 → +6, 55%</li>
          <li>+6 → +7, 30%</li>
          <li>+7 → +8, 7%</li>
          <li>+8 → +9, 4%</li>
          <li>+9 → +10, 1%</li>
        </ul>

        <Title level={4}>{t("pages.nanobrowserquest.playerLevel")}</Title>
        <Text>{t("pages.nanobrowserquest.playerLevelDescription")}</Text>
        <br />
        <Text>{t("pages.nanobrowserquest.playerLevelDescription2")}</Text>

        <Title level={4}>{t("pages.nanobrowserquest.shortcuts")}</Title>
        <ul>
          <li>{t("pages.nanobrowserquest.shortcut.i")}</li>
          <li>{t("pages.nanobrowserquest.shortcut.c")}</li>
          <li>{t("pages.nanobrowserquest.shortcut.p")}</li>
          <li>{t("pages.nanobrowserquest.shortcut.enter")}</li>
          <li>{t("pages.nanobrowserquest.shortcut.q")}</li>
          <li>{t("pages.nanobrowserquest.shortcut.m")}</li>
        </ul>
      </Card>
    </>
  );
};

export default HowToPlay;
