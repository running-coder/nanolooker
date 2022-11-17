import * as React from "react";
import PreferencesProvider from "./Preferences";
import MarketStatisticsProvider from "./MarketStatistics";
import NodeStatusProvider from "./NodeStatus";
import KnownAccountsProvider from "./KnownAccounts";
import BookmarksProvider from "./Bookmarks";
import AccountInfoProvider from "./AccountInfo";
import BlockInfoProvider from "./BlockInfo";
import BlocksInfoProvider from "./BlocksInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import ConfirmationHistoryProvider from "./ConfirmationHistory";
import AccountHistoryFilterProvider from "./AccountHistoryFilter";
import DelegatorsProvider from "./Delegators";

const IndexProvider: React.FC = ({ children }) => {
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
                                <DelegatorsProvider>
                                  {children}
                                </DelegatorsProvider>
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
