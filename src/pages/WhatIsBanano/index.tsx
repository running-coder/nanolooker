import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Card, Typography } from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";

const { Title } = Typography;

const WhatIsBananoPage: React.FC = () => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");

  return (
    <>
      <Helmet>
        <title>{t("menu.whatIsBanano")}</title>
      </Helmet>
      <Card
        size="small"
        bordered={false}
        className="what-is-card"
        style={{
          fontSize: isSmallAndLower ? "14px" : "18px",
          paddingBottom: "24px",
        }}
      >
        <Title level={3}>Banano</Title>
        <p>
          BANANO was forked in April 2018 from NANO. BANANO offers instant,
          feeless and rich in potassium 🍌 transactions, thanks to the fact that
          BANANO developers (several of them having being involved in NANO
          itself) have kept big portions of the original code unchanged to keep
          cross-chain compatibility between existing code libraries. However,
          they have fined-tuned some parameters, such as Proof of Work
          requirements and currency units. While the focus for now is on having
          an ongoing free and fair distribution, BANANO is also experimenting
          with feature additions such as a privacy layer (Camo BANANO), on-chain
          messaging (MonkeyTalks) and more. In context of distribution, we aim
          to use our meanwhile ready-to-strike infrastructure with easy-to-use
          mobile wallets (Kalium) and tipbots on several major social media
          platforms to onboard normies and crypto-noobs who have no idea yet
          what a cryptocurrency is. We also might do IRL airdrops at some point.
          Of note, key here is to make the start with crypto as easy as
          possible, use a fun attitude and gamification to get new users started
          without all the usual hassle, and then educate them to handle crypto
          in general in a responsible way.
        </p>
      </Card>
    </>
  );
};

export default WhatIsBananoPage;
