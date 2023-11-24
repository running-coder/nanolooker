import * as React from "react";
import { Trans, useTranslation } from "react-i18next";

import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Menu, Row, Tooltip, Typography } from "antd";
import TimeAgo from "timeago-react";

import useTelemetry, { Percentiles } from "api/hooks/use-telemetry";
import LoadingStatistic from "components/LoadingStatistic";
import QuestionCircle from "components/QuestionCircle";
import { formatBytes, secondsToTime } from "components/utils";
import i18next from "i18next";

import PieChart from "./PieChart";

const { Title } = Typography;

const Telemetry: React.FC = () => {
  const { t } = useTranslation();
  const [currentPercentile, setCurrentPercentile] = React.useState(Percentiles.P95);
  const {
    telemetry,
    versions,
    status: { nodeCount, bandwidthCapGroups, date } = {},
    isLoading: isTelemetryLoading,
  } = useTelemetry();
  const [formattedMedianBandwidthCap, setFormattedMedianBandwidthCap] = React.useState(
    formatBytes(0),
  );
  const [unlimitedBandwidthCapCount, setUnlimitedBandwidthCapCount] = React.useState<number>();
  const [limitedBandwidthCapCount, setLimitedBandwidthCapCount] = React.useState<number>();
  const [limitedBandwidthCap, setLimitedBandwidthCap] = React.useState(formatBytes(0));

  React.useEffect(() => {
    if (!telemetry[currentPercentile]) return;
    setFormattedMedianBandwidthCap(formatBytes(telemetry[currentPercentile].bandwidthCap));
  }, [telemetry, currentPercentile]);

  const onPercentileClick = ({ key }: any) => {
    setCurrentPercentile(key);
  };

  React.useEffect(() => {
    if (!bandwidthCapGroups) return;
    setUnlimitedBandwidthCapCount(bandwidthCapGroups[0].count);
    setLimitedBandwidthCapCount(bandwidthCapGroups[1]?.count);
    setLimitedBandwidthCap(formatBytes(bandwidthCapGroups[1]?.bandwidthCap));
  }, [bandwidthCapGroups]);

  return (
    <Row gutter={12}>
      <Col xs={24} md={16}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "12px",
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            {t("pages.status.telemetry")}
          </Title>
          <div style={{ marginLeft: "12px" }}>
            <Dropdown
              overlay={
                <Menu onClick={onPercentileClick}>
                  {Object.values(Percentiles).map(percentile => (
                    <Menu.Item key={percentile}>{percentile}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <Button>
                {currentPercentile} <DownOutlined />
              </Button>
            </Dropdown>
          </div>
          <Tooltip placement="right" title={t("tooltips.telemetry")}>
            <QuestionCircle />
          </Tooltip>
        </div>

        <Card size="small" className="detail-layout" style={{ marginBottom: "12px" }}>
          <div style={{ marginBottom: "12px", fontSize: "12px" }}>
            {date ? (
              <>
                {t("common.executionTimeAgo")}{" "}
                <TimeAgo
                  locale={i18next.language}
                  datetime={date}
                  live={false}
                  style={{ fontWeight: "bold" }}
                />
              </>
            ) : null}
            {nodeCount ? (
              <>
                <br />
                <Trans i18nKey="pages.status.nodeCount">
                  <strong>
                    {{
                      // @ts-ignore
                      nodeCount,
                    }}
                  </strong>
                </Trans>
              </>
            ) : null}
            {unlimitedBandwidthCapCount ? (
              <>
                <br />
                <Trans i18nKey="pages.status.unlimitedBandwidthCap">
                  <strong>
                    {{
                      // @ts-ignore
                      unlimitedBandwidthCapCount,
                    }}
                  </strong>
                </Trans>
              </>
            ) : null}
            {limitedBandwidthCapCount && limitedBandwidthCap.value ? (
              <>
                {" "}
                <Trans i18nKey="pages.status.limitedBandwidthCap">
                  <strong>
                    {{
                      // @ts-ignore
                      limitedBandwidthCapCount,
                    }}
                  </strong>

                  <strong>
                    {{
                      // @ts-ignore
                      limitedBandwidthCap: `${limitedBandwidthCap.value} ${limitedBandwidthCap.suffix}`,
                    }}
                  </strong>
                </Trans>
              </>
            ) : null}
          </div>
          <Row gutter={6}>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("common.blocks")}
                value={telemetry[currentPercentile]?.blockCount}
              />
            </Col>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("pages.status.cemented")}
                tooltip={t<string>("tooltips.cemented")}
                value={telemetry[currentPercentile]?.cementedCount}
              />
            </Col>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("pages.status.unchecked")}
                tooltip={t<string>("tooltips.unchecked")}
                value={telemetry[currentPercentile]?.uncheckedCount}
              />
            </Col>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("common.accounts")}
                value={telemetry[currentPercentile]?.accountCount}
              />
            </Col>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("pages.status.bandwidthCap")}
                tooltip={t<string>("tooltips.bandwidthCap")}
                value={formattedMedianBandwidthCap.value || "∞"}
                suffix={
                  formattedMedianBandwidthCap.value ? formattedMedianBandwidthCap.suffix : null
                }
              />
            </Col>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("pages.status.peers")}
                value={telemetry[currentPercentile]?.peerCount}
              />
            </Col>
            <Col xs={12} lg={8} xl={6} style={{ margin: "12px 0" }}>
              <LoadingStatistic
                isLoading={isTelemetryLoading}
                title={t("pages.status.uptime")}
                tooltip={t<string>("tooltips.uptime")}
                value={secondsToTime(telemetry[currentPercentile]?.uptime || 0)}
              />
            </Col>
          </Row>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <PieChart versions={versions} />
      </Col>
    </Row>
  );
};

export default Telemetry;
