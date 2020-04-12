import React from "react";
import { Helmet } from "react-helmet";
import { Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import { GithubOutlined } from "@ant-design/icons";
import { PreferencesContext } from "api/contexts/Preferences";
import AppHeader from "components/AppHeader";
import HomePage from "pages/Home";
import RepresentativesPage from "pages/Representatives";
import DeveloperFundPage from "pages/DeveloperFund";
import DeveloperFundTransactionsPage from "pages/DeveloperFund/Transactions";
import DistributionPage from "pages/Distribution";
import KnownAccountsPage from "pages/KnownAccounts";
import AccountPage from "pages/Account";
import BlockPage from "pages/Block";
import NewsPage from "pages/News";
import StatusPage from "pages/Status";

import "antd/dist/antd.css";
import "./App.css";
import "./Theme.css";

const { Content, Footer } = Layout;

const App: React.FC = props => {
  const { theme } = React.useContext(PreferencesContext);

  return (
    <>
      <Helmet></Helmet>
      <Layout
        style={{ minHeight: "100vh" }}
        className={theme ? `theme-${theme}` : undefined}
      >
        <AppHeader />
        <Content style={{ padding: "20px" }}>
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
            <Route path="/account/:account?" component={AccountPage} />
            <Route path="/block/:block?" component={BlockPage} />
            <Route path="/news" component={NewsPage} />
            <Route path="/status" component={StatusPage} />
          </Switch>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          <a
            href="https://github.com/running-coder/nanolooker"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubOutlined /> Nano Looker
          </a>{" "}
          ©2020 Created by RunningCoder
        </Footer>
      </Layout>
    </>
  );
};

export default App;
