import * as React from "react";
import { useTranslation } from "react-i18next";
import { Statistic, Tooltip } from "antd";
import QuestionCircle from "components/QuestionCircle";
import useConfirmationsPerSecond from "api/hooks/use-confirmations-per-second";

const ConfirmationsPerSecond = () => {
  const { t } = useTranslation();
  const { confirmationsPerSecond } = useConfirmationsPerSecond();

  return confirmationsPerSecond ? (
    <div className="cps-container">
      <Statistic
        suffix={t("transaction.cps")}
        value={confirmationsPerSecond}
        style={{ display: "inline-block", marginRight: "6px" }}
      ></Statistic>
      <Tooltip placement="right" title={t("tooltips.cps")}>
        <QuestionCircle />
      </Tooltip>
    </div>
  ) : null;
};

export default ConfirmationsPerSecond;
