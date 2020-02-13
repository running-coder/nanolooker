import React from "react";
import PriceProvider from "./Price";
import AccountInfoProvider from "./AccountInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import CoingeckoProvider from "./Coingecko";
import ConfirmationHistoryProvider from "./ConfirmationHistory";
import Confirmation24hProvider from "./Confirmation24h";

const IndexProvider: React.FunctionComponent = ({ children }) => {
  return (
    <PriceProvider>
      <AccountInfoProvider>
        <ConfirmationQuorumProvider>
          <RepresentativesProvider>
            <RepresentativesOnlineProvider>
              <BlockCountProvider>
                <ConfirmationHistoryProvider>
                  <Confirmation24hProvider>
                    <CoingeckoProvider>{children}</CoingeckoProvider>
                  </Confirmation24hProvider>
                </ConfirmationHistoryProvider>
              </BlockCountProvider>
            </RepresentativesOnlineProvider>
          </RepresentativesProvider>
        </ConfirmationQuorumProvider>
      </AccountInfoProvider>
    </PriceProvider>
  );
};

export default IndexProvider;
