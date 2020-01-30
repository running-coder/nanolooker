import React from "react";
import PriceProvider from "./Price";
import AccountInfoProvider from "./AccountInfo";
import RepresentativesProvider from "./Representatives";
import RepresentativesOnlineProvider from "./RepresentativesOnline";
import ConfirmationQuorumProvider from "./ConfirmationQuorum";

const IndexProvider: React.FunctionComponent = ({ children }) => {
  return (
    <PriceProvider>
      <AccountInfoProvider>
        <ConfirmationQuorumProvider>
          <RepresentativesProvider>
            <RepresentativesOnlineProvider>
              {children}
            </RepresentativesOnlineProvider>
          </RepresentativesProvider>
        </ConfirmationQuorumProvider>
      </AccountInfoProvider>
    </PriceProvider>
  );
};

export default IndexProvider;
