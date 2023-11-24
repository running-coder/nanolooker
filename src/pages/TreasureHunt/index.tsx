import * as React from "react";
import { Helmet } from "react-helmet";
import { Redirect, useParams } from "react-router-dom";

import { isValidAccountAddress } from "components/utils";

import Participants from "./Participants";

import type { PageParams } from "types/page";

const TreasureHunt: React.FC = () => {
  const { account = "" } = useParams<PageParams>();

  return account && !isValidAccountAddress(account) ? (
    <Redirect to="/treasure-hunt" />
  ) : (
    <>
      <Helmet>
        {isValidAccountAddress(account) ? (
          <title>Treasure Hunt {account}</title>
        ) : (
          <title>Nano Treasure Hunt Participants</title>
        )}
      </Helmet>

      <Participants />
    </>
  );
};

export default TreasureHunt;
