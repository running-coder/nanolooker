import React from "react";
import { Card, Descriptions, Skeleton, Typography } from "antd";
import BigNumber from "bignumber.js";
import { PriceContext } from "api/contexts/Price";
import { BlockInfoContext } from "api/contexts/BlockInfo";
import { rawToRai, timestampToDate } from "components/utils";

const { Title } = Typography;

const BlockDetails = () => {
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const { blockInfo, isLoading: isBlockInfoLoading } = React.useContext(
    BlockInfoContext
  );

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isBlockInfoLoading
  };

  const {
    subtype,
    block_account,
    contents: {
      representative = "",
      link_as_account = "",
      previous = "",
      signature = "",
      work = ""
    } = {}
  } = blockInfo || {};

  const modifiedTimestamp = Number(blockInfo?.local_timestamp) * 1000;

  const amount = new BigNumber(rawToRai(blockInfo?.amount || 0)).toNumber();
  const usdAmount = new BigNumber(amount).times(usd).toFormat(2);
  const btcAmount = new BigNumber(amount).times(btc).toFormat(12);

  const balance = new BigNumber(rawToRai(blockInfo?.balance || 0)).toNumber();
  const usdBalance = new BigNumber(balance).times(usd).toFormat(2);
  const btcBalance = new BigNumber(balance).times(btc).toFormat(12);

  let linkAccountLabel = "";
  if (subtype === "send") {
    linkAccountLabel = "Receiver";
  } else if (subtype === "receive") {
    linkAccountLabel = "Sender";
  }

  return (
    <>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Block subtype">{subtype}</Descriptions.Item>
        <Descriptions.Item label="Account">{block_account}</Descriptions.Item>
        <Descriptions.Item label="Amount">
          <Skeleton {...skeletonProps}>
            {new BigNumber(amount).toFormat()} NANO
            <br />
          </Skeleton>
          <Skeleton {...skeletonProps}>
            {`$${usdAmount} / ${btcAmount} BTC`}
          </Skeleton>
        </Descriptions.Item>
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
          {representative}
        </Descriptions.Item>
        {linkAccountLabel ? (
          <Descriptions.Item label={linkAccountLabel}>
            {link_as_account}
          </Descriptions.Item>
        ) : null}
        <Descriptions.Item label="Date">
          {timestampToDate(modifiedTimestamp)}
        </Descriptions.Item>
        <Descriptions.Item label="Previous block">
          <p className="break-word">{previous}</p>
        </Descriptions.Item>
        <Descriptions.Item label="Signature">
          <p className="break-word">{signature}</p>
        </Descriptions.Item>
        <Descriptions.Item label="Work">{work}</Descriptions.Item>
      </Descriptions>

      <Title level={3}>Original Block Content</Title>
      <Card>
        <pre>{JSON.stringify(blockInfo, null, 2)}</pre>
      </Card>
    </>
  );
};

export default BlockDetails;
