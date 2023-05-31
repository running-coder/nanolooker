import * as React from "react";
import { useParams } from "react-router-dom";

import Header from "./Account";
import AccountRepresentative from "./Representative";

import type { PageParams } from "types/page";

const AccountHeader: React.FC = () => {
  const { account = "" } = useParams<PageParams>();

  return (
    <>
      <AccountRepresentative account={account} />
      <Header account={account} />
    </>
  );
};

export default AccountHeader;
