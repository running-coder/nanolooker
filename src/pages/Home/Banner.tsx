import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button, Space, Typography } from "antd";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import Search from "components/Search";
import { Tracker } from "components/utils/analytics";

const { Title } = Typography;

const Banner: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);

  return (
    <div
      className="home-banner"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        margin: "-12px -12px 12px -12px",
        backgroundColor: theme === Theme.DARK ? "#121212" : "#4A90E2",
        padding: "40px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "18px",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <img
          alt="Nano block explorer"
          height="24px"
          src={`/nano-${theme === Theme.DARK ? "dark" : "light"}.png`}
          style={{ marginRight: "12px" }}
        />
        <Title
          level={3}
          style={{
            display: "inline-block",
            color: "#fff",
            margin: 0,
            fontWeight: 200,
            fontSize: "28px",
            whiteSpace: "nowrap",
          }}
        >
          {t("common.blockExplorer")}
        </Title>
      </div>

      <div style={{ marginBottom: "18px" }}>
        <Search isHome />
      </div>

      <Space size={[6, 12]} wrap style={{ justifyContent: "center" }}>
        <Link to={"/what-is-nano"}>
          <Button ghost>{t("menu.whatIsNano")}</Button>
        </Link>

        <Link to={"/nanobrowserquest"}>
          <Button
            ghost
            style={{ padding: "0 10px" }}
            onClick={() => {
              Tracker.ga4?.gtag("event", "NanoBrowserQuest");
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                alt="Go to NanoBrowserQuest"
                src={`/nanobrowserquest.png`}
                height="16px"
                style={{ marginRight: "6px" }}
              />
              NanoBrowserQuest
            </div>
          </Button>
        </Link>

        <Link to={"/nanoquakejs"}>
          <Button ghost>
            <img
              alt="NanoQuakeJS"
              src={`/nanoquakejs/quake3-white.svg`}
              style={{
                height: "50px",
                margin: "-20px -6px -30px -20px",
              }}
            />{" "}
            NanoQuakeJS
          </Button>
        </Link>

        <Link to={"/raiblocksmc"}>
          <Button ghost>
            <img
              alt="RaiblocksMC"
              src={`/raiblocksmc/server-icon.svg`}
              style={{
                height: "18px",
                margin: "2px 4px 4px -6px",
                filter: "brightness(0) invert(1)",
              }}
            />{" "}
            RaiblocksMC
          </Button>
        </Link>

        {/* <Button
          ghost
          href="https://bananolooker.com"
          onClick={() => {
            Tracker.ga4?.gtag("event", "GoToBananoLooker");
          }}
        >
          <img alt="Go to BananoLooker" src={`/banano.svg`} height="12px" />
        </Button> */}
      </Space>
    </div>
  );
};

export default Banner;
