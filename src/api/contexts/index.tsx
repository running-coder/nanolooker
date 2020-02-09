import React from "react";
import PriceProvider from "./Price";
import AccountInfoProvider from "./AccountInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import CoingeckoProvider from "./Coingecko";

const IndexProvider: React.FunctionComponent = ({ children }) => {
  return (
    <PriceProvider>
      <AccountInfoProvider>
        <ConfirmationQuorumProvider>
          <RepresentativesProvider>
            <RepresentativesOnlineProvider>
              <BlockCountProvider>
                <CoingeckoProvider>{children}</CoingeckoProvider>
              </BlockCountProvider>
            </RepresentativesOnlineProvider>
          </RepresentativesProvider>
        </ConfirmationQuorumProvider>
      </AccountInfoProvider>
    </PriceProvider>
  );
};

export default IndexProvider;
