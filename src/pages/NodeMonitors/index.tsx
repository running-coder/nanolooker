import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { Representative, RepresentativesContext } from "api/contexts/Representatives";
import useNodeMonitors, { NodeMonitor } from "api/hooks/use-node-monitors";

import NodeMonitors from "./NodeMonitors";

export interface Node extends NodeMonitor {}
export interface Node extends Representative {}

const NetworkStatusPage: React.FC = () => {
  const { t } = useTranslation();
  const [nodes, setNodes] = React.useState([] as Node[]);

  const { representatives, isLoading: isRepresentativesLoading } =
    React.useContext(RepresentativesContext);
  const { isLoading: isNodeMonitorsLoading, nodeMonitors } = useNodeMonitors();

  React.useEffect(() => {
    if (isRepresentativesLoading || isNodeMonitorsLoading) return;

    try {
      const nodes = nodeMonitors
        .filter(({ monitor }) => !!Object.keys(monitor).length)
        .map(node => {
          const representative = representatives.find(({ account }) => account === node.account);

          return {
            ...node,
            ...representative,
          };
        });

      setNodes(nodes);
    } catch (err) {}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRepresentativesLoading, isNodeMonitorsLoading]);

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.nodeMonitors")}</title>
      </Helmet>

      <NodeMonitors
        nodeMonitors={nodes}
        isLoading={isRepresentativesLoading || isNodeMonitorsLoading}
      />
    </>
  );
};

export default NetworkStatusPage;
