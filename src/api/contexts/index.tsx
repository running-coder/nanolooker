import React from "react";
import PriceProvider from "./Price";
import AccountInfoProvider from "./AccountInfo";
import RepresentativesOnlineProvider from "./RepresentativesOnline";

const IndexProvider: React.FunctionComponent = ({ children }) => {
  return (
    <PriceProvider>
      <AccountInfoProvider>
        <RepresentativesOnlineProvider>
          {children}
        </RepresentativesOnlineProvider>
      </AccountInfoProvider>
    </PriceProvider>
  );
};

export default IndexProvider;
