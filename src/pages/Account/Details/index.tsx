import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  Col,
  Descriptions,
  Icon,
  Row,
  Skeleton,
  Tooltip
} from "antd";
import BigNumber from "bignumber.js";
import { format } from "timeago.js";
import { PriceContext } from "api/contexts/Price";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { RepresentativesOnlineContext } from "api/contexts/RepresentativesOnline";
import { rawToRai } from "components/utils";
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
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const {
    account,
    accountInfo,
    isLoading: isAccountInfoLoading
  } = React.useContext(AccountInfoContext);
  const { principalRepresentatives } = React.useContext(RepresentativesContext);
  const { confirmationQuorum } = React.useContext(ConfirmationQuorumContext);
  const { representatives } = React.useContext(RepresentativesOnlineContext);
  const balance = new BigNumber(rawToRai(accountInfo?.balance || 0)).toNumber();
  const balancePending = new BigNumber(
    rawToRai(accountInfo?.pending || 0)
  ).toFormat(8);
  const usdBalance = new BigNumber(balance).times(usd).toFormat(2);
  const btcBalance = new BigNumber(balance).times(btc).toFormat(12);
  const modifiedTimestamp = Number(accountInfo?.modified_timestamp) * 1000;
  const modifiedDate = new Date(modifiedTimestamp);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isAccountInfoLoading
  };

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
        {principalRepresentatives[account] ? (
          <Descriptions.Item
            label={
              <>
                <span style={{ marginRight: "6px" }}>Voting weight</span>
                <Tooltip
                  placement="right"
                  title={`An account with a minimum of ${minWeight} NANO or >= 0.1% of the online voting weight delegated to it is required to get the Principal Representative status. When configured on a node which is voting, the votes it produces will be rebroadcasted by other nodes to who receive them, helping the network reach consensus more quickly.`}
                  overlayClassName="tooltip-sm"
                >
                  <Icon type="question-circle" theme="twoTone" />
                </Tooltip>
              </>
            }
          >
            {rawToRai(principalRepresentatives[account])}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Balance">
          <Skeleton {...skeletonProps}>
            {balance} NANO
            <br />
          </Skeleton>
          <Skeleton {...skeletonProps}>
            {`$${usdBalance} / ${btcBalance} BTC`}
          </Skeleton>
        </Descriptions.Item>
        <Descriptions.Item label="Representative">
          <Skeleton {...skeletonProps}>
            {accountInfo?.representative ? (
              <>
                <Badge
                  status={
                    representatives.includes(accountInfo?.representative || "")
                      ? "success"
                      : "error"
                  }
                />
                <Link to={`/account/${accountInfo.representative}`}>
                  <span>
                    {accountInfo.representative.substr(
                      accountInfo.representative.length * -1,
                      accountInfo.representative.length - 60 + 10
                    )}
                  </span>
                  <span>...</span>
                  <span>{accountInfo.representative.substr(-10)}</span>
                </Link>
              </>
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
                  "A transaction state where a block sending funds was published and confirmed by the network, but a matching block receiving those funds has not yet been confirmed."
                }
                overlayClassName="tooltip-sm"
              >
                <Icon type="question-circle" theme="twoTone" />
              </Tooltip>
            </>
          }
        >
          <Skeleton {...skeletonProps}>{balancePending} NANO</Skeleton>
        </Descriptions.Item>

        <Descriptions.Item label="Transactions">
          <Skeleton {...skeletonProps}>
            Total {new BigNumber(accountInfo.block_count).toFormat()}
            <br />
          </Skeleton>
          <Skeleton {...skeletonProps}>
            {modifiedTimestamp ? (
              <>
                Last transaction {format(modifiedTimestamp)} (
                {modifiedDate.getFullYear()}/
                {String(modifiedDate.getMonth() + 1).padStart(2, "0")}/
                {String(modifiedDate.getDate()).padStart(2, "0")})
              </>
            ) : null}
          </Skeleton>
        </Descriptions.Item>
      </Descriptions>
    </AccountDetailsLayout>
  );
};

export default AccountDetails;
