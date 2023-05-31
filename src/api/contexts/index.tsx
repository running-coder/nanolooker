import * as React from "react";

import AccountHistoryFilterProvider from "./AccountHistoryFilter";
import AccountInfoProvider from "./AccountInfo";
import BlockCountProvider from "./BlockCount";
import BlockInfoProvider from "./BlockInfo";
import BlocksInfoProvider from "./BlocksInfo";
import BookmarksProvider from "./Bookmarks";
import ConfirmationHistoryProvider from "./ConfirmationHistory";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import DelegatorsProvider from "./Delegators";
import KnownAccountsProvider from "./KnownAccounts";
import MarketStatisticsProvider from "./MarketStatistics";
import NodeStatusProvider from "./NodeStatus";
import PreferencesProvider from "./Preferences";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";

interface Props {
  children: React.ReactNode;
}

const IndexProvider: React.FC<Props> = ({ children }) => {
  return (
    <PreferencesProvider>
      <MarketStatisticsProvider>
        <NodeStatusProvider>
          <BookmarksProvider>
            <KnownAccountsProvider>
              <AccountInfoProvider>
                <AccountHistoryFilterProvider>
                  <BlockInfoProvider>
                    <BlocksInfoProvider>
                      <ConfirmationQuorumProvider>
                        <RepresentativesOnlineProvider>
                          <RepresentativesProvider>
                            <BlockCountProvider>
                              <ConfirmationHistoryProvider>
                                <DelegatorsProvider>{children}</DelegatorsProvider>
                              </ConfirmationHistoryProvider>
                            </BlockCountProvider>
                          </RepresentativesProvider>
                        </RepresentativesOnlineProvider>
                      </ConfirmationQuorumProvider>
                    </BlocksInfoProvider>
                  </BlockInfoProvider>
                </AccountHistoryFilterProvider>
              </AccountInfoProvider>
            </KnownAccountsProvider>
          </BookmarksProvider>
        </NodeStatusProvider>
      </MarketStatisticsProvider>
    </PreferencesProvider>
  );
};

export default IndexProvider;
