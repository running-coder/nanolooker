import * as React from "react";
import { useTranslation } from "react-i18next";

import { Skeleton, Statistic, Tooltip, Typography } from "antd";

import useConfirmationsPerSecond from "api/hooks/use-confirmations-per-second";
import QuestionCircle from "components/QuestionCircle";

const { Text } = Typography;

const ConfirmationsPerSecond = () => {
  const { t } = useTranslation();
  const { confirmationsPerSecond: nodeCps } = useConfirmationsPerSecond();

  return nodeCps ? (
    <>
      {nodeCps ? (
        <Text style={{ fontSize: 13, textAlign: "center", display: "block" }}>
          {t("pages.home.cpsLocal")}
        </Text>
      ) : null}
      <div className="cps-container">
        {!nodeCps || !parseFloat(nodeCps) ? (
          <Skeleton paragraph={false} active />
        ) : (
          <Statistic
            suffix={t("transaction.cps")}
            value={nodeCps}
            style={{ display: "inline-block" }}
          />
        )}
        <Tooltip placement="right" title={t("tooltips.cps")}>
          <QuestionCircle />
        </Tooltip>
      </div>
    </>
  ) : null;
};

export default ConfirmationsPerSecond;
