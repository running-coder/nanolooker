import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Card, Typography } from "antd";

import { BlocksInfoContext } from "api/contexts/BlocksInfo";
import { isValidBlockHash } from "components/utils";

import BlockDetails from "./Details";

import type { PageParams } from "types/page";

const { Text, Title } = Typography;

const BlockPage: React.FC = () => {
  const { t } = useTranslation();
  const { block = "" } = useParams<PageParams>();
  const { setBlocks } = React.useContext(BlocksInfoContext);

  const isValid = isValidBlockHash(block);

  React.useEffect(() => {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    setBlocks([block]);

    return () => setBlocks([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block]);

  return (
    <>
      <Helmet>
        <title>
          {t("common.block")} {block}
        </title>
      </Helmet>
      <Title level={3}>{t("common.block")}</Title>
      {isValid ? <BlockDetails /> : null}
      {!isValid || !block ? (
        <Card>
          <Title level={3}>{t("pages.block.missingBlock")}</Title>
          <Text>{t("pages.block.missingBlockInfo")}</Text>
        </Card>
      ) : null}
    </>
  );
};

export default BlockPage;
