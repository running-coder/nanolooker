import * as React from "react";
import { useTranslation } from "react-i18next";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Pie } from "@antv/g2plot";
import { Card, Col, Row, Skeleton, Switch, Tooltip, Typography } from "antd";
import BigNumber from "bignumber.js";
import orderBy from "lodash/orderBy";

import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai } from "components/utils";

const { Title } = Typography;

let versionsChart: any = null;

interface Props {
  versions: {
    [key: string]: {
      weight: number;
      count: number;
    };
  };
}

const Representatives: React.FC<Props> = ({ versions }) => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const [isVersionByWeight, setIsVersionByWeight] = React.useState(true);
  const [isVersionByMajor, setIsVersionByMajor] = React.useState(true);
  const {
    confirmationQuorum: {
      online_weight_quorum_percent: onlineWeightQuorumPercent = 0,
      online_weight_minimum: onlineWeightMinimum = 0,
    },
  } = React.useContext(ConfirmationQuorumContext);

  React.useEffect(() => {
    if (!Object.keys(versions).length) return;
    let rawData: { [key: string]: { weight: number; count: number } } = {};
    let data: { version: string; weight: number; count: number }[];

    if (isVersionByMajor) {
      Object.entries(versions).forEach(([version, { weight, count }]) => {
        const [majorVersion] = version.split(".");
        if (!rawData[majorVersion]) {
          rawData[majorVersion] = { weight: 0, count: 0 };
        }

        rawData[majorVersion].weight = new BigNumber(rawData[majorVersion].weight)
          .plus(weight)
          .toNumber();
        rawData[majorVersion].count += count;
      });
    }

    data = orderBy(
      Object.entries(Object.keys(rawData).length ? rawData : versions).map(
        ([version, { weight, count }]) => ({
          version,
          weight,
          count,
        }),
      ),
      ["version"],
      ["desc"],
    );

    let totalWeight = 0;
    if (isVersionByWeight) {
      data = data.filter(({ weight }) => {
        totalWeight += weight;
        return !!weight;
      });
    }

    const config = {
      padding: -12,
      data,
      angleField: isVersionByWeight ? "weight" : "count",
      colorField: "version",
      radius: 0.8,
      label: {
        visible: true,
        type: "outer",
        // @ts-ignore
        formatter: (text, item, index) => {
          return `${item._origin.version}`;
        },
        style:
          theme === Theme.DARK
            ? {
                fill: "white",
                stroke: "none",
              }
            : {
                fill: "black",
                stroke: "#fff",
              },
      },
      legend: {
        visible: false,
      },
      tooltip: {
        showTitle: false,
        formatter: ({
          weight,
          count,
          version,
        }: {
          weight: number;
          count: number;
          version: string;
        }) => ({
          name: version,
          value: isVersionByWeight
            ? `Ӿ ${new BigNumber(weight).toFormat(2)} - ${new BigNumber(weight)
                .times(100)
                .dividedBy(totalWeight)
                .toFormat(2)}%`
            : `${count} ${t("common.nodes")}`,
        }),
      },
      interactions: [{ type: "element-active" }],
    };

    if (!versionsChart) {
      versionsChart = new Pie(
        document.getElementById("versions-chart") as HTMLElement,
        // @ts-ignore
        config,
      );
      versionsChart.render();
    } else {
      versionsChart.update(config);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, versions, isVersionByWeight, isVersionByMajor]);

  React.useEffect(() => {
    return () => {
      versionsChart?.destroy();
      versionsChart = null;
    };
  }, []);

  return (
    <>
      <Title level={3}>{t("pages.status.nodeVersions")}</Title>

      <Card size="small" className="detail-layout">
        <Row gutter={6}>
          <Col xs={20} md={12}>
            {t("pages.status.versionsByWeight")}
            <Tooltip
              placement="right"
              title={t("tooltips.versionsByWeight", {
                onlineWeightMinimum: new BigNumber(rawToRai(onlineWeightMinimum)).toFormat(),
                onlineWeightQuorumPercent,
              })}
            >
              <QuestionCircle />
            </Tooltip>
          </Col>
          <Col xs={4} md={12}>
            <Switch
              disabled={!Object.keys(versions).length}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked: boolean) => {
                setIsVersionByWeight(checked);
              }}
              defaultChecked={isVersionByWeight}
            />
          </Col>
        </Row>
        <Row gutter={6}>
          <Col xs={20} md={12}>
            {t("pages.status.versionsByMajor")}
          </Col>
          <Col xs={4} md={12}>
            <Switch
              disabled={!Object.keys(versions).length}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked: boolean) => {
                setIsVersionByMajor(checked);
              }}
              defaultChecked={isVersionByMajor}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <Skeleton loading={!Object.keys(versions).length} active>
              <div id="versions-chart" />
            </Skeleton>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default Representatives;
