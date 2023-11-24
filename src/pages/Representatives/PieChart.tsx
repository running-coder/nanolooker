import * as React from "react";
import { useTranslation } from "react-i18next";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Pie } from "@antv/g2plot";
import { Card, Col, Row, Skeleton, Switch, Tooltip, Typography } from "antd";
import BigNumber from "bignumber.js";
import forEach from "lodash/forEach";
import orderBy from "lodash/orderBy";

import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { Representative, RepresentativesContext } from "api/contexts/Representatives";
import { KnownAccountsBalance } from "api/hooks/use-known-accounts-balance";
import QuestionCircle from "components/QuestionCircle";

const { Text, Title } = Typography;

const getDelegatedEntity = async (): Promise<any[] | undefined> => {
  try {
    const res = await fetch("/api/delegated-entity");
    const json = await res.json();

    return json;
  } catch (err) {}
};

let representativesChart: Pie | null = null;

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
  const { theme } = React.useContext(PreferencesContext);
  const { representatives, isLoading: isRepresentativesLoading } =
    React.useContext(RepresentativesContext);
  const [nakamotoCoefficient, setNakamotoCoefficient] = React.useState([] as Representative[]);
  const [principalRepresentatives, setPrincipalRepresentatives] = React.useState(
    [] as Representative[],
  );
  const {
    confirmationQuorum: {
      principal_representative_min_weight: principalRepresentativeMinWeight = 0,
      online_weight_quorum_percent: onlineWeightQuorumPercent,
    },
    isLoading: isConfirmationQuorumLoading,
  } = React.useContext(ConfirmationQuorumContext);

  const [delegatedEntities, setDelegatedEntities] = React.useState([] as KnownAccountsBalance[]);

  const representativesSkeletonProps = {
    active: true,
    paragraph: true,
    loading: isRepresentativesLoading,
  };

  React.useEffect(() => {
    getDelegatedEntity().then(delegatedEntities => {
      setDelegatedEntities(delegatedEntities || []);
    });
  }, []);

  React.useEffect(() => {
    if (
      isRepresentativesLoading ||
      isConfirmationQuorumLoading ||
      !principalRepresentatives.length ||
      !Array.isArray(delegatedEntities)
    )
      return;

    const aliasSeparator = "|||";
    // const stake = new BigNumber(rawToRai(onlineStakeTotal)).toNumber();

    let filteredRepresentatives = isIncludeOfflineRepresentatives
      ? [...principalRepresentatives]
      : [...principalRepresentatives].filter(({ isOnline }) => isOnline);

    let stake = 0;
    forEach(filteredRepresentatives, representative => {
      stake = new BigNumber(stake).plus(representative.weight).toNumber();
    });

    if (isGroupedByEntities && delegatedEntities.length) {
      // @TODO find a more scalable option
      const groups: { [key: string]: number } = {
        "Nano Foundation": 0,
        Binance: 0,
        Kraken: 0,
        Huobi: 0,
        Kucoin: 0,
      };

      // @ts-ignore added representative key
      delegatedEntities.forEach(({ alias, account, representative, total }) => {
        const accountIndex = filteredRepresentatives.findIndex(
          ({ account: representativeAccount }) => representativeAccount === account,
        );

        const representativeIndex = filteredRepresentatives.findIndex(
          ({ account }) => account === representative,
        );

        if (accountIndex > -1) {
          filteredRepresentatives[accountIndex] = {
            ...filteredRepresentatives[accountIndex],
            weight: filteredRepresentatives[accountIndex].weight + total,
          };
        } else {
          filteredRepresentatives.push({
            alias,
            account,
            isOnline: true,
            isPrincipal: true,
            weight: total,
          });
        }

        if (representativeIndex > -1) {
          filteredRepresentatives[representativeIndex] = {
            ...filteredRepresentatives[representativeIndex],
            weight: filteredRepresentatives[representativeIndex].weight - total,
          };
        }
      });

      filteredRepresentatives = filteredRepresentatives.filter(({ alias, weight }) => {
        const group = alias
          ? Object.keys(groups).find(group => alias.toLowerCase()?.includes(group.toLowerCase()))
          : null;

        if (group) {
          groups[group] = new BigNumber(groups[group]).plus(weight).toNumber();
        }

        return !group;
      });

      const groupedEntities = Object.entries(groups).map(([group, weight]) => ({
        account: "",
        weight: weight,
        isOnline: true,
        isPrincipal: true,
        alias: group,
      }));

      filteredRepresentatives = filteredRepresentatives
        .concat(groupedEntities)
        .filter(({ weight }) => weight >= principalRepresentativeMinWeight);

      filteredRepresentatives = orderBy(filteredRepresentatives, ["weight"], ["desc"]);
    }

    const nakamotoCoefficient: Representative[] = [];
    let nakamotoCoefficientWeight = 0;
    let totalWeight = 0;

    forEach(filteredRepresentatives, representative => {
      const nextWeight = new BigNumber(nakamotoCoefficientWeight)
        .plus(representative.weight)
        .toNumber();
      totalWeight = new BigNumber(totalWeight).plus(representative.weight).toNumber();
      const percent = new BigNumber(nextWeight).times(100).dividedBy(stake).toNumber();

      nakamotoCoefficientWeight = nextWeight;
      nakamotoCoefficient.push(representative);

      if (percent > parseInt(onlineWeightQuorumPercent)) {
        return false;
      }
    });

    setNakamotoCoefficient(nakamotoCoefficient);

    const data = filteredRepresentatives.map(({ weight, account, alias }) => {
      const value = parseFloat(new BigNumber(weight).times(100).dividedBy(stake).toFixed(2));

      return {
        // @NOTE Remove symbol characters as they are causing the chart to crash
        // on latest Safari & mobile chrome. Re-enable once it's fixed
        alias: `${alias?.replace(/\W/g, " ") || ""}${aliasSeparator}${account}`,
        value,
      };
    });

    const config = {
      data,
      angleField: "value",
      colorField: "alias",
      radius: 0.8,
      // theme: 'dark',
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
        visible: true,
        itemName: {
          // @ts-ignore
          formatter: (text: string) => {
            const [alias, account] = text.split(aliasSeparator);
            return alias || account || t("common.unknown");
          },
        },
      },
      tooltip: {
        showTitle: false,
        // @ts-ignore
        formatter: ({ value, alias: rawAlias }) => {
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
        // @ts-ignore
        config,
      );
      representativesChart.render();
    } else {
      // @ts-ignore
      representativesChart.update(config);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    theme,
    principalRepresentatives,
    isRepresentativesLoading,
    isConfirmationQuorumLoading,
    isIncludeOfflineRepresentatives,
    isGroupedByEntities,
    delegatedEntities,
  ]);

  React.useEffect(() => {
    if (isRepresentativesLoading || !representatives.length) return;
    const filteredRepresentatives = representatives.filter(({ isPrincipal }) => isPrincipal);

    setPrincipalRepresentatives(filteredRepresentatives);
  }, [representatives, isRepresentativesLoading]);

  React.useEffect(() => {
    return () => {
      representativesChart?.destroy();
      representativesChart = null;
    };
  }, []);

  return (
    <>
      <Title level={3}>{t("pages.representatives.voteDistribution")}</Title>
      <Card size="small" className="detail-layout">
        <Row gutter={6}>
          <Col xs={20} md={12}>
            {t("pages.representatives.includeOfflineRepresentatives")}
          </Col>
          <Col xs={4} md={12}>
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
          <Col xs={20} md={12}>
            {t("pages.representatives.groupByEntities")}
            <Tooltip placement="right" title={t("tooltips.groupByEntities")}>
              <QuestionCircle />
            </Tooltip>
          </Col>
          <Col xs={4} md={12}>
            <Switch
              disabled={isRepresentativesLoading || !delegatedEntities.length}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(checked: boolean) => {
                setIsGroupedByEntities(checked);
              }}
              checked={
                // Ensure the API returns delegatedEntities to enable the switch
                delegatedEntities.length ? isGroupedByEntities : false
              }
            />
          </Col>
        </Row>
        <Row>
          <Col xs={24} md={12}>
            {t("pages.representatives.nakamotoCoefficient")}
            {onlineWeightQuorumPercent ? (
              <Tooltip
                placement="right"
                title={t("tooltips.nakamotoCoefficient", {
                  onlineWeightQuorumPercent: onlineWeightQuorumPercent,
                })}
              >
                <QuestionCircle />
              </Tooltip>
            ) : null}
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active paragraph={false} loading={!nakamotoCoefficient.length}>
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
