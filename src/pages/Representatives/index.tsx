import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Row,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import {
  Representative,
  RepresentativesContext,
} from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { DelegatorsContext } from "api/contexts/Delegators";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai, TwoToneColors } from "components/utils";
import PieChart from "./PieChart";

const { Title } = Typography;

const Representatives = () => {
  const { t } = useTranslation();
  const [
    isIncludeOfflineRepresentatives,
    setIsIncludeOfflineRepresentatives,
  ] = React.useState(false);
  const [isGroupedByEntities, setIsGroupedByEntities] = React.useState(true);
  const [
    isShowingNonVotingRepresentatives,
    setIsShowingNonVotingRepresentatives,
  ] = React.useState(false);
  const [filteredRepresentatives, setFilteredRepresentatives] = React.useState(
    [] as Representative[],
  );
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");
  const { theme } = React.useContext(PreferencesContext);
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);

  const {
    confirmationQuorum: {
      online_weight_quorum_percent: onlineWeightQuorumPercent = 0,
      online_weight_minimum: onlineWeightMinimum = 0,
      online_stake_total: onlineStakeTotal = 0,
      peers_stake_total: peersStakeTotal = 0,
      principal_representative_min_weight: principalRepresentativeMinWeight = 0,
    },
    isLoading: isConfirmationQuorumLoading,
  } = React.useContext(ConfirmationQuorumContext);

  const {
    delegators: allDelegators,
    getDelegators,
    isLoading: isAllDelegatorsLoading,
  } = React.useContext(DelegatorsContext);

  const confirmationQuorumSkeletonProps = {
    active: true,
    paragraph: false,
    loading: isConfirmationQuorumLoading,
  };

  const representativesSkeletonProps = {
    active: true,
    paragraph: false,
    loading: isRepresentativesLoading,
  };

  const stake = new BigNumber(
    rawToRai(
      !isIncludeOfflineRepresentatives ? onlineStakeTotal : peersStakeTotal,
    ),
  ).toNumber();

  React.useEffect(() => {
    getDelegators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const filteredRepresentatives = representatives?.filter(
      ({ isOnline, isPrincipal }) =>
        (!isIncludeOfflineRepresentatives ? isOnline : true) &&
        (isShowingNonVotingRepresentatives ? true : isPrincipal),
    );

    setFilteredRepresentatives(filteredRepresentatives);
  }, [
    representatives,
    isIncludeOfflineRepresentatives,
    isShowingNonVotingRepresentatives,
  ]);

  return (
    <>
      <Helmet>
        <title>Banano {t("menu.representatives")}</title>
      </Helmet>
      <Row gutter={[12, 0]}>
        <Col xs={24} md={12}>
          <PieChart
            isIncludeOfflineRepresentatives={isIncludeOfflineRepresentatives}
            setIsIncludeOfflineRepresentatives={
              setIsIncludeOfflineRepresentatives
            }
            isGroupedByEntities={isGroupedByEntities}
            setIsGroupedByEntities={setIsGroupedByEntities}
          />
        </Col>
        <Col xs={24} md={12}>
          <Title level={3}>{t("menu.representatives")}</Title>
          <Card
            size="small"
            bordered={false}
            className="detail-layout"
            style={{ marginBottom: "12px" }}
          >
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={10}>
                {t("common.representatives")}
                <Tooltip
                  placement="right"
                  title={t("tooltips.representatives")}
                >
                  <QuestionCircle />
                </Tooltip>
              </Col>
              <Col xs={24} sm={12} xl={14}>
                <Skeleton {...representativesSkeletonProps}>
                  {representatives?.length || 0}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={10}>
                {t("pages.representatives.onlineRepresentatives")}
              </Col>
              <Col xs={24} sm={12} xl={14}>
                <Skeleton {...representativesSkeletonProps}>
                  {representatives.filter(({ isOnline }) => isOnline)?.length ||
                    0}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={10}>
                {t("common.principalRepresentatives")}
                <Tooltip
                  placement="right"
                  title={t("tooltips.principalRepresentatives", {
                    principalRepresentativeMinWeight,
                  })}
                >
                  <QuestionCircle />
                </Tooltip>
              </Col>
              <Col xs={24} sm={12} xl={14}>
                <Skeleton {...representativesSkeletonProps}>
                  {
                    representatives.filter(({ isPrincipal }) => isPrincipal)
                      ?.length
                  }
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={10}>
                <>
                  {t("pages.representatives.onlinePrincipalRepresentatives")}
                  <Tooltip
                    placement="right"
                    title={t("tooltips.onlinePrincipalRepresentatives")}
                  >
                    <QuestionCircle />
                  </Tooltip>
                </>
              </Col>
              <Col xs={24} sm={12} xl={14}>
                <Skeleton {...representativesSkeletonProps}>
                  {
                    representatives.filter(
                      ({ isOnline, isPrincipal }) => isOnline && isPrincipal,
                    )?.length
                  }
                </Skeleton>
              </Col>
            </Row>
          </Card>
          <Title level={3}>
            {t("pages.representatives.confirmationQuorum")}
          </Title>
          <Card
            size="small"
            bordered={false}
            className="detail-layout"
            style={{ marginBottom: "12px" }}
          >
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.principalRepresentativeMinWeight")}
              </Col>
              <Col xs={24} sm={16}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(principalRepresentativeMinWeight).toFormat()}{" "}
                  BAN
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.onlineWrightQuorumPercent")}
              </Col>
              <Col xs={24} sm={16}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {onlineWeightQuorumPercent}%
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.minimumOnlineWeight")}
              </Col>
              <Col xs={24} sm={16}>
                {" "}
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineWeightMinimum)).toFormat()} BAN
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.totalOnlineStake")}
              </Col>
              <Col xs={24} sm={16}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineStakeTotal)).toFormat(0)} BAN
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.totalPeerStake")}
              </Col>
              <Col xs={24} sm={16}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(peersStakeTotal)).toFormat(0)} BAN
                </Skeleton>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card
        size="small"
        bordered={false}
        className="detail-layout"
        style={{ marginBottom: "12px" }}
      >
        {!isSmallAndLower ? (
          <>
            <Row gutter={6}>
              <Col sm={6} md={6} xl={6}>
                {t("pages.account.votingWeight")}
              </Col>
              <Col sm={12} md={12} xl={14}>
                {t("common.account")}
              </Col>
              <Col sm={6} md={6} xl={4}>
                {t("common.delegators")}
              </Col>
            </Row>
          </>
        ) : null}
        {isRepresentativesLoading
          ? Array.from(Array(3).keys()).map(index => (
              <Row gutter={6} key={index}>
                <Col
                  xs={{ span: 24, order: 2 }}
                  sm={{ span: 6, order: 1 }}
                  md={6}
                  xl={6}
                >
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col
                  xs={{ span: 24, order: 1 }}
                  sm={{ span: 12, order: 2 }}
                  md={12}
                  xl={14}
                >
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col
                  xs={{ span: 24, order: 3 }}
                  sm={{ span: 6, order: 3 }}
                  md={6}
                  xl={4}
                >
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
              </Row>
            ))
          : null}
        {!isRepresentativesLoading ? (
          <>
            {filteredRepresentatives.map(
              ({ account, weight, isOnline, isPrincipal, alias }) => {
                const delegatorsCount = allDelegators[account];
                return (
                  <Row gutter={6} key={account}>
                    <Col
                      xs={{ span: 24, order: 2 }}
                      sm={{ span: 6, order: 1 }}
                      md={6}
                      xl={6}
                    >
                      <span
                        className="default-color"
                        style={{
                          display: "block",
                        }}
                      >
                        {weight} BAN
                      </span>

                      {isPrincipal ? (
                        <>
                          {new BigNumber(weight)
                            .times(100)
                            .dividedBy(stake)
                            .toFormat(2)}
                          {isSmallAndLower
                            ? t("pages.account.percentNetworkVotingWeight")
                            : "%"}
                        </>
                      ) : null}
                    </Col>
                    <Col
                      xs={{ span: 24, order: 1 }}
                      sm={{ span: 12, order: 2 }}
                      md={12}
                      xl={14}
                    >
                      <div style={{ display: "flex", margin: "3px 0" }}>
                        {typeof isOnline === "boolean" ? (
                          <Tag
                            color={
                              isOnline
                                ? theme === Theme.DARK
                                  ? TwoToneColors.RECEIVE_DARK
                                  : TwoToneColors.RECEIVE
                                : theme === Theme.DARK
                                ? TwoToneColors.SEND_DARK
                                : TwoToneColors.SEND
                            }
                            className={`tag-${isOnline ? "online" : "offline"}`}
                          >
                            {t(`common.${isOnline ? "online" : "offline"}`)}
                          </Tag>
                        ) : null}
                        {isPrincipal ? (
                          <Tag>{t("common.principalRepresentative")}</Tag>
                        ) : null}
                      </div>

                      {alias ? (
                        <div className="color-important">{alias}</div>
                      ) : null}

                      <Link to={`/account/${account}`} className="break-word">
                        {account}
                      </Link>
                    </Col>
                    <Col
                      xs={{ span: 24, order: 3 }}
                      sm={{ span: 6, order: 3 }}
                      md={6}
                      xl={4}
                    >
                      <Skeleton
                        loading={isAllDelegatorsLoading}
                        paragraph={false}
                      >
                        {delegatorsCount ? (
                          <Link to={`/account/${account}/delegators`}>
                            <Button
                              ghost={theme === Theme.DARK}
                              size="small"
                              style={{ marginTop: "6px" }}
                            >
                              {t("pages.representatives.viewDelegators", {
                                count: delegatorsCount,
                              })}
                            </Button>
                          </Link>
                        ) : null}
                        {!delegatorsCount
                          ? t("pages.representative.noDelegatorsFound")
                          : null}
                      </Skeleton>
                    </Col>
                  </Row>
                );
              },
            )}
            {!isShowingNonVotingRepresentatives ? (
              <Row gutter={6}>
                <Col xs={24} style={{ textAlign: "center" }}>
                  <Button
                    // @ts-ignore
                    onClick={() => setIsShowingNonVotingRepresentatives(true)}
                    type={theme === Theme.DARK ? "primary" : "default"}
                  >
                    {t("pages.representatives.loadAllRepresentatives")}
                  </Button>
                </Col>
              </Row>
            ) : null}
          </>
        ) : null}
      </Card>
    </>
  );
};

export default Representatives;
