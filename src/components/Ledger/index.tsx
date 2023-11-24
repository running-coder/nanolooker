import * as React from "react";
import { useTranslation } from "react-i18next";

import { Card } from "antd";
import BigNumber from "bignumber.js";

import { NodeStatusContext } from "api/contexts/NodeStatus";
import useAvailableSupply from "api/hooks/use-available-supply";
import useFrontierCount from "api/hooks/use-frontier-count";
import LoadingStatistic from "components/LoadingStatistic";
import { formatBytes } from "components/utils";

const Ledger: React.FC = () => {
  const { t } = useTranslation();
  const { availableSupply } = useAvailableSupply();
  const {
    frontierCount: { count: frontierCount },
  } = useFrontierCount();
  const {
    nodeStatus: { ledgerSize },
    isLoading: isNodeStatusLoading,
  } = React.useContext(NodeStatusContext);
  const [formattedLedgerSize, setFormattedLedgerSize] = React.useState(formatBytes(0));

  React.useEffect(() => {
    setFormattedLedgerSize(formatBytes(ledgerSize));
  }, [ledgerSize]);

  return (
    <Card size="small" title={t("pages.status.ledger")}>
      <LoadingStatistic
        title={t("pages.status.availableSupply")}
        value={availableSupply}
        isLoading={!availableSupply}
      />

      <LoadingStatistic
        title={t("common.accounts")}
        value={frontierCount}
        isLoading={!frontierCount}
      />

      <LoadingStatistic
        title={t("pages.status.ledgerSize")}
        tooltip={t<string>("tooltips.ledgerSize")}
        value={new BigNumber(formattedLedgerSize.value).toFormat(2)}
        suffix={formattedLedgerSize.suffix}
        isLoading={isNodeStatusLoading}
      />
    </Card>
  );
};

export default Ledger;
