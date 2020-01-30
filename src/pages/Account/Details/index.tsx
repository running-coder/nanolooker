import React from "react";
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

export const AccountDetailsLayout: React.FunctionComponent = ({ children }) => (
  <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
    <Col xs={24} sm={24} md={12} lg={12} xl={12}>
      <Card size="small" bodyStyle={{ padding: 0 }}>
        {children}
      </Card>
    </Col>
  </Row>
);

const AccountDetails = () => {
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const { accountInfo, isLoading: isAccountInfoLoading } = React.useContext(
    AccountInfoContext
  );
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

  return (
    <AccountDetailsLayout>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Balance">
          <Skeleton {...skeletonProps}>
            {balance} NANO
            <br />
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
              Pending{" "}
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
            {accountInfo?.block_count ? (
              <>
                Total {new BigNumber(accountInfo.block_count).toFormat()}
                <br />
                {modifiedTimestamp ? (
                  <>
                    Last transaction {format(modifiedTimestamp)} (
                    {modifiedDate.getFullYear()}/
                    {String(modifiedDate.getMonth() + 1).padStart(2, "0")}/
                    {String(modifiedDate.getDate()).padStart(2, "0")})
                  </>
                ) : null}
              </>
            ) : (
              "No transactions yet."
            )}
          </Skeleton>
        </Descriptions.Item>
      </Descriptions>
    </AccountDetailsLayout>
  );
};

export default AccountDetails;
