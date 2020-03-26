import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Col, Descriptions, Row, Skeleton, Tooltip } from "antd";
import { QuestionCircleTwoTone } from "@ant-design/icons";
import find from "lodash/find";
import BigNumber from "bignumber.js";
import TimeAgo from "timeago-react";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { rawToRai, timestampToDate } from "components/utils";
import { RepresentativesContext } from "api/contexts/Representatives";
import { ConfirmationQuorumContext } from "api/contexts/ConfirmationQuorum";

interface AccountDetailsLayoutProps {
  bordered?: boolean;
  children?: ReactElement;
}

export const AccountDetailsLayout = ({
  bordered,
  children
}: AccountDetailsLayoutProps) => (
  <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
      <Card size="small" bodyStyle={{ padding: 0 }} bordered={bordered}>
        {children}
      </Card>
    </Col>
  </Row>
);

const AccountDetails = () => {
  const [representativeAccount, setRepresentativeAccount] = React.useState(
    {} as any
  );
  const {
    marketStatistics: { usdCurrentPrice, usdBtcCurrentPrice },
    isLoading: isMarketStatisticsLoading
  } = React.useContext(MarketStatisticsContext);
  const {
    account,
    accountInfo,
    isLoading: isAccountInfoLoading
  } = React.useContext(AccountInfoContext);
  const {
    representatives,
    isLoading: isRepresentativesLoading
  } = React.useContext(RepresentativesContext);
  const { confirmationQuorum } = React.useContext(ConfirmationQuorumContext);
  const { representatives: representativesOnline } = React.useContext(
    RepresentativesOnlineContext
  );
  const balance = new BigNumber(rawToRai(accountInfo?.balance || 0)).toNumber();
  const balancePending = new BigNumber(
    rawToRai(accountInfo?.pending || 0)
  ).toFormat(8);
  const usdBalance = new BigNumber(balance).times(usdCurrentPrice).toFormat(2);
  const btcBalance = new BigNumber(balance)
    .times(usdBtcCurrentPrice)
    .toFormat(12);
  const modifiedTimestamp = Number(accountInfo?.modified_timestamp) * 1000;

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountInfoLoading || isMarketStatisticsLoading
  };

  React.useEffect(() => {
    if (!account || isRepresentativesLoading || !representatives.length) return;

    setRepresentativeAccount(find(representatives, ["account", account]) || {});

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isRepresentativesLoading, representatives.length]);

  const minWeight = confirmationQuorum?.online_stake_total
    ? new BigNumber(
        rawToRai(
          new BigNumber(confirmationQuorum.online_stake_total)
            .times(0.001)
            .toString()
        )
      ).toFormat(0)
    : "100000";

  return (
    <AccountDetailsLayout bordered={false}>
      <Descriptions bordered column={1} size="small">
        {representativeAccount?.account ? (
          <Descriptions.Item
            label={
              <>
                Voting weight
                <Tooltip
                  placement="right"
                  title={`An account with a minimum of ${minWeight} NANO or >= 0.1% of the online voting weight delegated to it is required to get the Principal Representative status. When configured on a node which is voting, the votes it produces will be rebroadcasted by other nodes to who receive them, helping the network reach consensus more quickly.`}
                  overlayClassName="tooltip-sm"
                  style={{ marginLeft: "6px" }}
                >
                  <QuestionCircleTwoTone />
                </Tooltip>
              </>
            }
          >
            {new BigNumber(representativeAccount.weight).toFormat()} NANO
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Balance">
          <Skeleton {...skeletonProps}>
            {new BigNumber(balance).toFormat()} NANO
            <br />
          </Skeleton>
          <Skeleton {...skeletonProps}>
            {`$${usdBalance} / ${btcBalance} BTC`}
          </Skeleton>
        </Descriptions.Item>
        <Descriptions.Item label="Representative">
          <Skeleton {...skeletonProps}>
            {accountInfo?.representative ? (
              <div className="clearfix">
                <Badge
                  style={{ float: "left" }}
                  status={
                    representativesOnline.includes(
                      accountInfo?.representative || ""
                    )
                      ? "success"
                      : "error"
                  }
                />
                <Link
                  to={`/account/${accountInfo.representative}`}
                  className="break-word"
                >
                  {accountInfo.representative}
                </Link>
              </div>
            ) : (
              "No Representative"
            )}
          </Skeleton>
        </Descriptions.Item>
        <Descriptions.Item
          label={
            <>
              <span style={{ marginRight: "6px" }}>Pending</span>
              <Tooltip
                placement="right"
                title={
                  "A transaction state where a block sending funds was published and confirmed by the network, but a matching block receiving those funds has not yet been sent or confirmed."
                }
                overlayClassName="tooltip-sm"
              >
                <QuestionCircleTwoTone />
              </Tooltip>
            </>
          }
        >
          <Skeleton {...skeletonProps}>{balancePending} NANO</Skeleton>
        </Descriptions.Item>

        <Descriptions.Item label="Last transaction">
          <Skeleton {...skeletonProps}>
            {modifiedTimestamp ? (
              <>
                <TimeAgo datetime={modifiedTimestamp} live={false} /> (
                {timestampToDate(modifiedTimestamp)})
              </>
            ) : null}
          </Skeleton>
        </Descriptions.Item>
      </Descriptions>
    </AccountDetailsLayout>
  );
};

export default AccountDetails;
