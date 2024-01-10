// import "antd/dist/antd.css";
import "antd/dist/reset.css";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import "./App.css";
import "./Theme.css";

import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Route, Switch } from "react-router-dom";

import { ConfigProvider, Layout, theme } from "antd";

import "components/utils/analytics";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import AppFooter from "components/AppFooter";
import AppHeader from "components/AppHeader";
// import NodeHealth from "components/NodeHealth";
import Notification from "components/Notification";
import i18next from "i18next";
import AccountPage from "pages/Account";
import BlockPage from "pages/Block";
import BookmarksPage from "pages/Bookmarks";
import DeveloperFundPage from "pages/DeveloperFund";
import DeveloperFundTransactionsPage from "pages/DeveloperFund/Transactions";
import DistributionPage from "pages/Distribution";
import ExchangeTrackerPage from "pages/ExchangeTracker";
import FaucetsPage from "pages/Faucets";
import HomePage from "pages/Home";
import KnownAccountsPage from "pages/KnownAccounts";
import LargeTransactionsPage from "pages/LargeTransactions";
import NanoBrowserQuestPage from "pages/NanoBrowserQuest";
import NanoQuakeJSPage from "pages/NanoQuakeJS";
import NetworkStatusPage from "pages/NetworkStatus";
import NewsPage from "pages/News";
import NodeMonitorsPage from "pages/NodeMonitors";
import NodeStatusPage from "pages/NodeStatus";
import PreferencesPage from "pages/Preferences";
import RepresentativesPage from "pages/Representatives";
import Statistics2Miners from "pages/Statistics/2Miners";
import StatisticsSocial from "pages/Statistics/Social";
import TreasureHunt from "pages/TreasureHunt";
import WhatIsNanoPage from "pages/WhatIsNano";

const { Content } = Layout;

const App: React.FC = () => {
  const { t } = useTranslation();
  const { theme: themeContext } = React.useContext(PreferencesContext);

  return (
    <ConfigProvider
      theme={{
        algorithm: themeContext === Theme.DARK ? theme.darkAlgorithm : undefined,
      }}
    >
      <Helmet>
        <html lang={i18next.language} />
        <title>NanoLooker {t("common.blockExplorer")}</title>
        <meta name="description" content="Block explorer of the Nano cryptocurrency" />
        <meta name="theme-color" content={themeContext === Theme.DARK ? "#131313" : "#eff2f5"} />
      </Helmet>
      <Layout
        style={{ minHeight: "100vh" }}
        className={themeContext ? `theme-${themeContext}` : undefined}
      >
        {/* <NodeHealth /> */}
        <AppHeader />
        <Notification />
        <Content>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/representatives" component={RepresentativesPage} />
            <Route exact path="/developer-fund" component={DeveloperFundPage} />
            <Route path="/developer-fund/transactions" component={DeveloperFundTransactionsPage} />
            <Route path="/known-accounts" component={KnownAccountsPage} />
            <Route path="/distribution" component={DistributionPage} />
            <Route path="/exchange-tracker" component={ExchangeTrackerPage} />
            <Route path="/faucets" component={FaucetsPage} />
            <Route path="/large-transactions/:sortBy?" component={LargeTransactionsPage} />
            <Route path="/account/:account?/:section?" component={AccountPage} />
            <Route path="/block/:block?" component={BlockPage} />
            <Route path="/news/:feed?" component={NewsPage} />
            <Route path="/node-status" component={NodeStatusPage} />
            <Route path="/network-status" component={NetworkStatusPage} />
            <Route path="/node-monitors" component={NodeMonitorsPage} />
            <Route path="/what-is-nano" component={WhatIsNanoPage} />
            <Route path="/preferences" component={PreferencesPage} />
            <Route path="/bookmarks" component={BookmarksPage} />
            <Route path="/nanoquakejs" component={NanoQuakeJSPage} />
            <Route path="/nanobrowserquest/:section?" component={NanoBrowserQuestPage} />
            <Route path="/treasure-hunt/:account?" component={TreasureHunt} />
            <Route path="/statistics/social" component={StatisticsSocial} />
            <Route path="/statistics/2miners" component={Statistics2Miners} />
          </Switch>
        </Content>
        <AppFooter />
      </Layout>
    </ConfigProvider>
  );
};

export default App;
