import React from "react";
import { useParams } from "react-router-dom";
import { BlocksInfoContext } from "api/contexts/BlocksInfo";
import BlockHeader from "./Header";
import BlockDetails from "./Details";
import { isValidBlockHash } from "components/utils";

const BlockPage = () => {
  const { block = "" } = useParams();
  const { setBlocks } = React.useContext(BlocksInfoContext);

  const isValid = isValidBlockHash(block);

  React.useEffect(() => {
    setBlocks([block]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  return (
    <>
      {isValid ? <BlockHeader /> : null}
      {isValid ? <BlockDetails /> : null}
      {!isValid || !block ? "Missing block" : null}
    </>
  );
};

export default BlockPage;
