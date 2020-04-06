import React from "react";
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
import { QuestionCircleTwoTone } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import { RepresentativesContext } from "api/contexts/Representatives";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";
import { rawToRai } from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Title } = Typography;

const Representatives = () => {
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
        ({ weight }) => weight >= principalRepresentativeMinWeight
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
          <Title level={3}>Representatives</Title>
          <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item
                label={
                  <>
                    Total Representatives
                    <Tooltip
                      placement="right"
                      title={`To optimize performances, only accounts with voting weight >= 1000 NANO are considered but normally any account with > 0 voting weight, but < 0.1% of the online voting weight.`}
                      overlayClassName="tooltip-sm"
                    >
                      <QuestionCircleTwoTone style={{ marginLeft: "6px" }} />
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
                    Total Principal Representatives
                    <Tooltip
                      placement="right"
                      title={`An account with a minimum of ${principalRepresentativeMinWeight} NANO or >= 0.1% of the online voting weight delegated to it is required to get the Principal Representative status. When configured on a node which is voting, the votes it produces will be rebroadcasted by other nodes to who receive them, helping the network reach consensus more quickly.`}
                      overlayClassName="tooltip-sm"
                    >
                      <QuestionCircleTwoTone style={{ marginLeft: "6px" }} />
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
                    Online Representatives
                    <Tooltip
                      placement="right"
                      title={`Online representative accounts that have voted recently.`}
                      overlayClassName="tooltip-sm"
                    >
                      <QuestionCircleTwoTone style={{ marginLeft: "6px" }} />
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
          <Title level={3}>Confirmation Quorum</Title>
          <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item
                label={<>Principal Representative min weight</>}
              >
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(principalRepresentativeMinWeight).toFormat()}{" "}
                  NANO
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item label={<>Online weight quorum percent</>}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {onlineWeightQuorumPercent}%
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item label={<>Minimum online weight</>}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineWeightMinimum)).toFormat()} NANO
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item label={<>Total online stake</>}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(onlineStakeTotal)).toFormat(0)} NANO
                </Skeleton>
              </Descriptions.Item>
              <Descriptions.Item label={<>Total peer stake</>}>
                <Skeleton {...confirmationQuorumSkeletonProps}>
                  {new BigNumber(rawToRai(peersStakeTotal)).toFormat(0)} NANO
                </Skeleton>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      <Title level={3}>Principal Representatives</Title>
      <Table
        size="small"
        loading={
          isRepresentativesLoading ||
          isRepresentativesOnlineLoading ||
          isConfirmationQuorumLoading
        }
        pagination={false}
        rowKey={(record) => record.account}
        columns={[
          {
            title: "Weight",
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
            title: "Account",
            dataIndex: "account",
            render: (text: string) => {
              const alias = knownAccounts.find(
                ({ account: knownAccount }) => knownAccount === text
              )?.alias;
              return (
                <>
                  <Badge
                    style={{ float: "left" }}
                    status={
                      representativesOnline.includes(text) ? "success" : "error"
                    }
                  />
                  {alias ? (
                    <span
                      className="color-important"
                      style={{ marginRight: "6px" }}
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
                </>
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
