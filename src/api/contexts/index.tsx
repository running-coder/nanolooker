import React from "react";
import PriceProvider from "./Price";
import StatsProvider from "./Stats";
import AccountInfoProvider from "./AccountInfo";
import BlockInfoProvider from "./BlockInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import CoingeckoProvider from "./Coingecko";
import ConfirmationHistoryProvider from "./ConfirmationHistory";
import Statistics24hProvider from "./Statistics24h";

const IndexProvider: React.FunctionComponent = ({ children }) => {
  return (
    <PriceProvider>
      <StatsProvider>
        <AccountInfoProvider>
          <BlockInfoProvider>
            <ConfirmationQuorumProvider>
              <RepresentativesProvider>
                <RepresentativesOnlineProvider>
                  <BlockCountProvider>
                    <ConfirmationHistoryProvider>
                      <Statistics24hProvider>
                        <CoingeckoProvider>{children}</CoingeckoProvider>
                      </Statistics24hProvider>
                    </ConfirmationHistoryProvider>
                  </BlockCountProvider>
                </RepresentativesOnlineProvider>
              </RepresentativesProvider>
            </ConfirmationQuorumProvider>
          </BlockInfoProvider>
        </AccountInfoProvider>
      </StatsProvider>
    </PriceProvider>
  );
};

export default IndexProvider;
