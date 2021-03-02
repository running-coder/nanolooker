import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  Col,
  Descriptions,
  Row,
  Skeleton,
  Table,
  Tooltip,
  Typography,
} from "antd";
import BigNumber from "bignumber.js";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { RepresentativesContext } from "api/contexts/Representatives";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import QuestionCircle from "components/QuestionCircle";
import { rawToRai, Colors } from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Title } = Typography;

const Representatives = () => {
  const { t } = useTranslation();
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
      // peers_stake_required: peersStakeRequired,
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
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Title level={3}>{t("menu.representatives")}</Title>
          <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item
                label={
                  <>
                    <span style={{ marginRight: "6px" }}>
                      {t("pages.representatives.totalRepresentatives")}
                    </span>
                    <Tooltip
                      placement="right"
                      title={t("tooltips.totalRepresentatives")}
                    >
                      <QuestionCircle />
                    </Tooltip>
                  </>
                }
              >
                <Skeleton {...representativesSkeletonProps}>
                  {representatives?.length -
                    (principalRepresentatives?.length || 0)}
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <span style={{ marginRight: "6px" }}>
                      {t("pages.representatives.totalPrincipalRepresentatives")}
                    </span>
                    <Tooltip
                      placement="right"
                      title={t("tooltips.totalPrincipalRepresentatives", {
                        principalRepresentativeMinWeight,
                      })}
                    >
                      <QuestionCircle />
                    </Tooltip>
                  </>
                }
              >
                <Skeleton {...representativesSkeletonProps}>
                  {principalRepresentatives?.length}
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <span style={{ marginRight: "6px" }}>
                      {t("pages.representatives.onlineRepresentatives")}
                    </span>
                    <Tooltip
                      placement="right"
                      title={t("tooltips.onlineRepresentatives")}
                    >
                      <QuestionCircle />
                    </Tooltip>
                  </>
                }
              >
                <Skeleton {...representativesOnlineSkeletonProps}>
                  {representativesOnline?.length}
                </Skeleton>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Title level={3}>
            {t("pages.representatives.confirmationQuorum")}
          </Title>
          <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item
                label={t(
                  "pages.representatives.principalRepresentativeMinWeight",
                )}
              >
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(principalRepresentativeMinWeight).toFormat()}{" "}
                  NANO
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={t("pages.representatives.onlineWrightQuorumPercent")}
              >
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {onlineWeightQuorumPercent}%
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={t("pages.representatives.minimumOnlineWeight")}
              >
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineWeightMinimum)).toFormat()} NANO
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={t("pages.representatives.totalOnlineStake")}
              >
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineStakeTotal)).toFormat(0)} NANO
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item
                label={t("pages.representatives.totalPeerStake")}
              >
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(peersStakeTotal)).toFormat(0)} NANO
                </Skeleton>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Title level={3}>
        {t("pages.representatives.principalRepresentatives")}
      </Title>
      <Table
        size="small"
        loading={
          isRepresentativesLoading ||
          isRepresentativesOnlineLoading ||
          isConfirmationQuorumLoading
        }
        pagination={false}
        rowKey={record => record.account}
        columns={[
          {
            title: t("common.weight"),
            dataIndex: "weight",
            defaultSortOrder: "descend",
            sorter: {
              compare: (a, b) => a.weight - b.weight,
              multiple: 3,
            },
            render: (text: string) => (
              <>{new BigNumber(text).toFormat()} NANO</>
            ),
          },
          {
            title: t("common.account"),
            dataIndex: "account",
            render: (text: string) => {
              const alias = knownAccounts.find(
                ({ account: knownAccount }) => knownAccount === text,
              )?.alias;
              return (
                <div style={{ display: "flex" }}>
                  <Badge
                    color={
                      representativesOnline.includes(text)
                        ? theme === Theme.DARK
                          ? Colors.RECEIVE_DARK
                          : Colors.RECEIVE
                        : theme === Theme.DARK
                        ? Colors.SEND_DARK
                        : Colors.SEND
                    }
                  />
                  <div>
                    {alias ? (
                      <span
                        className="color-important"
                        style={{ marginRight: "6px", display: "block" }}
                      >
                        {alias}
                      </span>
                    ) : null}
                    <Link
                      to={`/account/${text}`}
                      className="color-normal break-word"
                    >
                      {text}
                    </Link>
                  </div>
                </div>
              );
            },
          },
        ]}
        dataSource={principalRepresentatives}
      />
    </>
  );
};

export default Representatives;
