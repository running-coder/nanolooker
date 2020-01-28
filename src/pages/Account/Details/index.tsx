import React from "react";
import { Link, useParams } from "react-router-dom";
import { Badge, Card, Col, Descriptions, Icon, Row, Tooltip } from "antd";
import BigNumber from "bignumber.js";
import { format } from "timeago.js";
import usePrice from "api/hooks/use-price";
import useRepresentativesOnline from "api/hooks/use-representatives-online";
import { rawToRai } from "components/utils";
import useAccountInfo from "api/hooks/use-account-info";

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
  const { account = "" } = useParams();
  const { usd = 0, btc = 0 } = usePrice();
  const { accountInfo } = useAccountInfo(account);
  const { representatives } = useRepresentativesOnline();
  const balance = new BigNumber(rawToRai(accountInfo?.balance || 0)).toNumber();
  const balancePending = new BigNumber(
    rawToRai(accountInfo?.pending || 0)
  ).toFormat(8);
  const usdBalance = new BigNumber(balance).times(usd).toFormat(2);
  const btcBalance = new BigNumber(balance).times(btc).toFormat(12);
  const modifiedTimestamp = Number(accountInfo?.modified_timestamp) * 1000;
  const modifiedDate = new Date(modifiedTimestamp);

  return (
    <AccountDetailsLayout>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Balance">
          {balance} NANO
          <br />
          {`$${usdBalance} / ${btcBalance} BTC`}
        </Descriptions.Item>
        <Descriptions.Item label="Representative">
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
          {balancePending} NANO
        </Descriptions.Item>

        <Descriptions.Item label="Transactions">
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
        </Descriptions.Item>
      </Descriptions>
    </AccountDetailsLayout>
  );
};

export default AccountDetails;
