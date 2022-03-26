import * as React from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import NodeHealth from "components/NodeHealth";
import Notification from "components/Notification";
import AppHeader from "components/AppHeader";
import AppFooter from "components/AppFooter";
import HomePage from "pages/Home";
import RepresentativesPage from "pages/Representatives";
import DeveloperFundPage from "pages/DeveloperFund";
import DeveloperFundTransactionsPage from "pages/DeveloperFund/Transactions";
import DistributionPage from "pages/Distribution";
import ExchangeTrackerPage from "pages/ExchangeTracker";
import FaucetsPage from "pages/Faucets";
import LargeTransactionsPage from "pages/LargeTransactions";
import KnownAccountsPage from "pages/KnownAccounts";
import AccountPage from "pages/Account";
import BlockPage from "pages/Block";
import NewsPage from "pages/News";
import NodeStatusPage from "pages/NodeStatus";
import NetworkStatusPage from "pages/NetworkStatus";
import WhatIsNanoPage from "pages/WhatIsNano";
import PreferencesPage from "pages/Preferences";
import BookmarksPage from "pages/Bookmarks";
import NanoQuakeJSPage from "pages/NanoQuakeJS";
import NanoBrowserQuestPage from "pages/NanoBrowserQuest";
import TreasureHunt from "pages/TreasureHunt";
import StatisticsSocial from "pages/Statistics/Social";
import Statistics2Miners from "pages/Statistics/2Miners";
import "components/utils/analytics";

import "antd/dist/antd.css";
import "leaflet/dist/leaflet.css";
import "leaflet-extra-markers/dist/css/leaflet.extra-markers.min.css";
import "./App.css";
import "./Theme.css";

const { Content } = Layout;

const App: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);

  return (
    <>
      <Helmet>
        <html lang={i18next.language} />
        <title>NanoLooker {t("common.blockExplorer")}</title>
        <meta
          name="description"
          content="Block explorer of the Nano cryptocurrency"
        />
        <meta
          name="theme-color"
          content={theme === Theme.DARK ? "#131313" : "#eff2f5"}
        />
      </Helmet>
      <Layout
        style={{ minHeight: "100vh" }}
        className={theme ? `theme-${theme}` : undefined}
      >
        <NodeHealth />
        <AppHeader />
        <Notification />
        <Content>
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/representatives" component={RepresentativesPage} />
            <Route exact path="/developer-fund" component={DeveloperFundPage} />
            <Route
              path="/developer-fund/transactions"
              component={DeveloperFundTransactionsPage}
            />
            <Route path="/known-accounts" component={KnownAccountsPage} />
            <Route path="/distribution" component={DistributionPage} />
            <Route path="/exchange-tracker" component={ExchangeTrackerPage} />
            <Route path="/faucets" component={FaucetsPage} />
            <Route
              path="/large-transactions/:sortBy?"
              component={LargeTransactionsPage}
            />
            <Route
              path="/account/:account?/:section?"
              component={AccountPage}
            />
            <Route path="/block/:block?" component={BlockPage} />
            <Route path="/news/:feed?" component={NewsPage} />
            <Route path="/node-status" component={NodeStatusPage} />
            <Route path="/network-status" component={NetworkStatusPage} />
            <Route path="/what-is-nano" component={WhatIsNanoPage} />
            <Route path="/preferences" component={PreferencesPage} />
            <Route path="/bookmarks" component={BookmarksPage} />
            <Route path="/nanoquakejs" component={NanoQuakeJSPage} />
            <Route
              path="/nanobrowserquest/:section?"
              component={NanoBrowserQuestPage}
            />
            <Route path="/treasure-hunt/:account?" component={TreasureHunt} />
            <Route path="/statistics/social" component={StatisticsSocial} />
            <Route path="/statistics/2miners" component={Statistics2Miners} />
          </Switch>
        </Content>
        <AppFooter />
      </Layout>
    </>
  );
};

export default App;
