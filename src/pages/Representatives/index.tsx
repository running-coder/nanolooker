import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Skeleton,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import BigNumber from "bignumber.js";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { RepresentativesContext } from "api/contexts/Representatives";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai, TwoToneColors } from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Title } = Typography;

const Representatives = () => {
  const { t } = useTranslation();
  const isSmallAndLower = !useMediaQuery("(min-width: 576px)");
  const { theme } = React.useContext(PreferencesContext);
  const {
    representatives,
    isLoading: isRepresentativesLoading,
  } = React.useContext(RepresentativesContext);
  const {
    representatives: representativesOnline,
    isLoading: isRepresentativesOnlineLoading,
  } = React.useContext(RepresentativesOnlineContext);

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

  const { knownAccounts } = React.useContext(KnownAccountsContext);

  const principalRepresentatives = principalRepresentativeMinWeight
    ? representatives?.filter(
        ({ weight }) => weight >= principalRepresentativeMinWeight,
      )
    : undefined;

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

  const representativesOnlineSkeletonProps = {
    active: true,
    paragraph: false,
    loading: isRepresentativesOnlineLoading,
  };

  return (
    <>
      <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
        <Col xs={24} md={12}>
          <Title level={3}>{t("menu.representatives")}</Title>
          <Card
            size="small"
            bordered={false}
            className="detail-layout"
            style={{ marginBottom: "12px" }}
          >
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={8}>
                {t("pages.representatives.totalRepresentatives")}
                <Tooltip
                  placement="right"
                  title={t("tooltips.totalRepresentatives")}
                >
                  <QuestionCircle />
                </Tooltip>
              </Col>
              <Col xs={24} sm={12} xl={16}>
                <Skeleton {...representativesSkeletonProps}>
                  {representatives?.length || 0}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={8}>
                {t("pages.representatives.totalPrincipalRepresentatives")}
                <Tooltip
                  placement="right"
                  title={t("tooltips.totalPrincipalRepresentatives", {
                    principalRepresentativeMinWeight,
                  })}
                >
                  <QuestionCircle />
                </Tooltip>
              </Col>
              <Col xs={24} sm={12} xl={16}>
                <Skeleton {...representativesSkeletonProps}>
                  {principalRepresentatives?.length}
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={12} xl={8}>
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
              <Col xs={24} sm={12} xl={16}>
                <Skeleton {...representativesOnlineSkeletonProps}>
                  {representativesOnline?.length}
                </Skeleton>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={12}>
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
                  NANO
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
                  {new BigNumber(rawToRai(onlineWeightMinimum)).toFormat()} NANO
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.totalOnlineStake")}
              </Col>
              <Col xs={24} sm={16}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineStakeTotal)).toFormat(0)} NANO
                </Skeleton>
              </Col>
            </Row>
            <Row gutter={6}>
              <Col xs={24} sm={8}>
                {t("pages.representatives.totalPeerStake")}
              </Col>
              <Col xs={24} sm={16}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(peersStakeTotal)).toFormat(0)} NANO
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
              <Col sm={12} md={10} xl={6}>
                {t("pages.account.votingWeight")}
              </Col>
              <Col sm={12} md={14} xl={18}>
                {t("common.account")}
              </Col>
            </Row>
          </>
        ) : null}
        {representatives?.map(({ account, weight }) => {
          const isOnline = representativesOnline.includes(account);
          const alias = knownAccounts.find(
            ({ account: knownAccount }) => account === knownAccount,
          )?.alias;

          return (
            <Row gutter={6}>
              <Col
                xs={{ span: 24, order: 2 }}
                sm={{ span: 12, order: 1 }}
                md={10}
                xl={6}
              >
                <Statistic suffix="NANO" value={weight} />
                {weight >= principalRepresentativeMinWeight ? (
                  <>
                    {new BigNumber(weight)
                      .times(100)
                      .dividedBy(rawToRai(onlineStakeTotal))
                      .toFormat(2)}
                    {isSmallAndLower
                      ? t("pages.account.percentVotingWeight")
                      : "%"}
                  </>
                ) : null}
              </Col>
              <Col
                xs={{ span: 24, order: 1 }}
                sm={{ span: 12, order: 2 }}
                md={14}
                xl={18}
              >
                <div style={{ display: "flex", margin: "3px 0" }}>
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
                  {weight >= principalRepresentativeMinWeight ? (
                    <Tag>{t("common.principalRepresentative")}</Tag>
                  ) : null}
                </div>

                {alias ? <div className="color-important">{alias}</div> : null}

                <Link to={`/account/${account}`} className="break-word">
                  {account}
                </Link>
              </Col>
            </Row>
          );
        })}
      </Card>
    </>
  );
};

export default Representatives;
