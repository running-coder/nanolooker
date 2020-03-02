import React from "react";
import { useParams } from "react-router-dom";
import { BlockInfoContext } from "api/contexts/BlockInfo";
import BlockHeader from "./Header";
import BlockDetails from "./Details";
import { isValidBlockHash } from "components/utils";

const BlockPage = () => {
  const { block = "" } = useParams();
  const { setBlock } = React.useContext(BlockInfoContext);

  const isValid = isValidBlockHash(block);

  React.useEffect(() => {
    setBlock(block);
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
