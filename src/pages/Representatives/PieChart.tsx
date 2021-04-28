import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row, Skeleton, Switch, Tooltip, Typography } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Pie, PieConfig } from "@antv/g2plot";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import forEach from "lodash/forEach";
import orderBy from "lodash/orderBy";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import {
  Representative,
  RepresentativesContext,
} from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai } from "components/utils";

const { Text, Title } = Typography;

let representativesChart: any = null;

interface Props {
  isIncludeOfflineRepresentatives: boolean;
  setIsIncludeOfflineRepresentatives: Function;
  isGroupedByEntities: boolean;
  setIsGroupedByEntities: Function;
}

const Representatives: React.FC<Props> = ({
  isIncludeOfflineRepresentatives,
  setIsIncludeOfflineRepresentatives,
  isGroupedByEntities,
  setIsGroupedByEntities,
}) => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");
  const { theme } = React.useContext(PreferencesContext);
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);
  const [nakamotoCoefficient, setNakamotoCoefficient] = React.useState(
    [] as Representative[],
  );
  const [
    principalRepresentatives,
    setPrincipalRepresentatives,
  ] = React.useState([] as Representative[]);
  const {
    confirmationQuorum: {
      online_stake_total: onlineStakeTotal = 0,
      peers_stake_total: peersStakeTotal = 0,
    },
    isLoading: isConfirmationQuorumLoading,
  } = React.useContext(ConfirmationQuorumContext);

  const representativesSkeletonProps = {
    active: true,
    paragraph: true,
    loading: isRepresentativesLoading,
  };

  React.useEffect(() => {
    if (
      isRepresentativesLoading ||
      isConfirmationQuorumLoading ||
      !principalRepresentatives.length
    )
      return;

    const aliasSeparator = "|||";
    const stake = new BigNumber(
      rawToRai(
        !isIncludeOfflineRepresentatives ? onlineStakeTotal : peersStakeTotal,
      ),
    ).toNumber();

    let filteredRepresentatives = isIncludeOfflineRepresentatives
      ? principalRepresentatives
      : principalRepresentatives.filter(({ isOnline }) => isOnline);

    if (isGroupedByEntities) {
      let accumulatedWeight = 0;

      filteredRepresentatives = filteredRepresentatives.filter(
        ({ alias, weight }) => {
          const isNanoFoundation = alias?.startsWith("Nano Foundation");
          if (isNanoFoundation) {
            accumulatedWeight = new BigNumber(accumulatedWeight)
              .plus(weight)
              .toNumber();
          }

          return !isNanoFoundation;
        },
      );

      filteredRepresentatives.push({
        account: "",
        weight: accumulatedWeight,
        isOnline: true,
        isPrincipal: true,
        alias: "Nano Foundation",
      });

      filteredRepresentatives = orderBy(
        filteredRepresentatives,
        ["weight"],
        ["desc"],
      );
    }

    const nakamotoCoefficient: Representative[] = [];
    let nakamotoCoefficientWeight = 0;

    forEach(filteredRepresentatives, representative => {
      const nextWeight = new BigNumber(nakamotoCoefficientWeight)
        .plus(representative.weight)
        .toNumber();
      const percent = new BigNumber(nextWeight)
        .times(100)
        .dividedBy(stake)
        .toNumber();

      nakamotoCoefficientWeight = nextWeight;
      nakamotoCoefficient.push(representative);

      if (percent > 50) {
        return false;
      }
    });

    setNakamotoCoefficient(nakamotoCoefficient);

    const config: PieConfig = {
      data: filteredRepresentatives.map(({ weight, account, alias }) => {
        const value = new BigNumber(weight)
          .times(100)
          .dividedBy(stake)
          .toFixed(2);

        return {
          alias: `${alias || ""}${aliasSeparator}${account}`,
          value,
        };
      }),
      angleField: "value",
      colorField: "alias",
      radius: 0.8,
      label: {
        visible: true,
        type: "outer",
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
        visible: !isSmallAndLower,
        text: {
          formatter: text => {
            const [alias, account] = text.split(aliasSeparator);
            return alias || account || t("common.unknown");
          },
        },
      },
      tooltip: {
        style: {
          color: "green",
        },
        showTitle: false,
        // @ts-ignore
        formatter: (value, rawAlias) => {
          const [alias, account] = rawAlias.split(aliasSeparator);
          return {
            name: alias || account || t("common.unknown"),
            value: `${value}%`,
          };
        },
      },
      interactions: [{ type: "element-active" }],
    };

    if (!representativesChart) {
      representativesChart = new Pie(
        document.getElementById("representatives-chart") as HTMLElement,
        config,
      );
    } else {
      representativesChart.updateConfig(config);
    }

    representativesChart.render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme,
    principalRepresentatives,
    isRepresentativesLoading,
    isConfirmationQuorumLoading,
    isIncludeOfflineRepresentatives,
    isGroupedByEntities,
  ]);

  React.useEffect(() => {
    if (isRepresentativesLoading || !representatives.length) return;
    const filteredRepresentatives = representatives.filter(
      ({ isPrincipal }) => isPrincipal,
    );
    setPrincipalRepresentatives(filteredRepresentatives);
  }, [representatives, isRepresentativesLoading]);

  React.useEffect(() => {
    return () => {
      representativesChart = null;
    };
  }, []);

  return (
    <>
      <Title level={3}>{t("pages.representatives.voteDistribution")}</Title>
      <Card size="small" bordered={false} className="detail-layout">
        <Row gutter={6}>
          <Col xs={24} md={12}>
            {t("pages.representatives.includeOfflineRepresentatives")}
          </Col>
          <Col xs={24} md={12}>
            <Switch
              disabled={isRepresentativesLoading}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked: boolean) => {
                setIsIncludeOfflineRepresentatives(checked);
              }}
              defaultChecked={isIncludeOfflineRepresentatives}
            />
          </Col>
        </Row>
        <Row gutter={6}>
          <Col xs={24} md={12}>
            {t("pages.representatives.groupByEntities")}
            <Tooltip placement="right" title={t("tooltips.groupByEntities")}>
              <QuestionCircle />
            </Tooltip>
          </Col>
          <Col xs={24} md={12}>
            <Switch
              disabled={isRepresentativesLoading}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked: boolean) => {
                setIsGroupedByEntities(checked);
              }}
              defaultChecked={isGroupedByEntities}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24} md={12}>
            {t("pages.representatives.nakamotoCoefficient")}
            <Tooltip
              placement="right"
              title={t("tooltips.nakamotoCoefficient")}
            >
              <QuestionCircle />
            </Tooltip>
          </Col>
          <Col xs={24} md={12}>
            <Skeleton
              active
              paragraph={false}
              loading={!nakamotoCoefficient.length}
            >
              <Text>{nakamotoCoefficient.length}</Text>
            </Skeleton>
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <Text style={{ fontSize: "12px" }}>
              {t("pages.representatives.voteDistributionDescription")}
            </Text>
          </Col>
        </Row>

        <Skeleton {...representativesSkeletonProps}>
          <div id="representatives-chart" />
        </Skeleton>
      </Card>
    </>
  );
};

export default Representatives;
