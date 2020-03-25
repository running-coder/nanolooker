import React from "react";
import PriceProvider from "./Price";
import NodeStatusProvider from "./NodeStatus";
import AccountInfoProvider from "./AccountInfo";
import BlockInfoProvider from "./BlockInfo";
import BlocksInfoProvider from "./BlocksInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";
import BlockCountProvider from "./BlockCount";
import CoingeckoProvider from "./Coingecko";
import ConfirmationHistoryProvider from "./ConfirmationHistory";

const IndexProvider: React.FC = ({ children }) => {
  return (
    <PriceProvider>
      <NodeStatusProvider>
        <AccountInfoProvider>
          <BlockInfoProvider>
            <BlocksInfoProvider>
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
            </BlocksInfoProvider>
          </BlockInfoProvider>
        </AccountInfoProvider>
      </NodeStatusProvider>
    </PriceProvider>
  );
};

export default IndexProvider;
