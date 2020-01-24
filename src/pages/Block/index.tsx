import React from "react";
import { useParams } from "react-router-dom";

const BlockPage = () => {
  let { block } = useParams();

  return <>Block page - {block || "Missing"}</>;
};

export default BlockPage;
