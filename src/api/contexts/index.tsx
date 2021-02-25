import React from "react";
import PreferencesProvider from "./Preferences";
import MarketStatisticsProvider from "./MarketStatistics";
import NodeStatusProvider from "./NodeStatus";
import KnownAccountsProvider from "./KnownAccounts";
import LargeTransactionsProvider from "./LargeTransactions";
import AccountInfoProvider from "./AccountInfo";
import BlockInfoProvider from "./BlockInfo";
import BlocksInfoProvider from "./BlocksInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import ConfirmationHistoryProvider from "./ConfirmationHistory";

const IndexProvider: React.FC = ({ children }) => {
  return (
    <PreferencesProvider>
      <MarketStatisticsProvider>
        <NodeStatusProvider>
          <KnownAccountsProvider>
            <LargeTransactionsProvider>
              <AccountInfoProvider>
                <BlockInfoProvider>
                  <BlocksInfoProvider>
                    <ConfirmationQuorumProvider>
                      <RepresentativesProvider>
                        <RepresentativesOnlineProvider>
                          <BlockCountProvider>
                            <ConfirmationHistoryProvider>
                              {children}
                            </ConfirmationHistoryProvider>
                          </BlockCountProvider>
                        </RepresentativesOnlineProvider>
                      </RepresentativesProvider>
                    </ConfirmationQuorumProvider>
                  </BlocksInfoProvider>
                </BlockInfoProvider>
              </AccountInfoProvider>
            </LargeTransactionsProvider>
          </KnownAccountsProvider>
        </NodeStatusProvider>
      </MarketStatisticsProvider>
    </PreferencesProvider>
  );
};

export default IndexProvider;
