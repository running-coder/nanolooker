import React from "react";
import { useParams } from "react-router-dom";

const AccountPage = () => {
  let { account } = useParams();

  return <>Account page - {account || "Missing"}</>;
};

export default AccountPage;
