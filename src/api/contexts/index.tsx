import React from "react";
import PriceProvider from "./Price";
import AccountInfoProvider from "./AccountInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import CoingeckoProvider from "./Coingecko";
import ConfirmationHistoryProvider from "./ConfirmationHistory";

const IndexProvider: React.FunctionComponent = ({ children }) => {
  return (
    <PriceProvider>
      <AccountInfoProvider>
        <ConfirmationQuorumProvider>
          <RepresentativesProvider>
            <RepresentativesOnlineProvider>
              <BlockCountProvider>
                <ConfirmationHistoryProvider>
                  <CoingeckoProvider>{children}</CoingeckoProvider>
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
