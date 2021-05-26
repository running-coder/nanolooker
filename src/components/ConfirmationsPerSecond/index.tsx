import * as React from "react";
import { useTranslation } from "react-i18next";
import { Skeleton, Statistic, Tooltip } from "antd";
import useConfirmationsPerSecond from "api/hooks/use-confirmations-per-second";
import QuestionCircle from "components/QuestionCircle";

const ConfirmationsPerSecond = () => {
  const { t } = useTranslation();
  const { confirmationsPerSecond } = useConfirmationsPerSecond();

  return confirmationsPerSecond ? (
    <div className="cps-container">
      {!confirmationsPerSecond || !parseFloat(confirmationsPerSecond) ? (
        <Skeleton paragraph={false} active />
      ) : (
        <Statistic
          suffix={t("transaction.cps")}
          value={confirmationsPerSecond}
          style={{ display: "inline-block" }}
        />
      )}
      <Tooltip placement="right" title={t("tooltips.cps")}>
        <QuestionCircle />
      </Tooltip>
    </div>
  ) : null;
};

export default ConfirmationsPerSecond;
