import React from "react";
import { Link } from "react-router-dom";
import { Card, Descriptions, Skeleton, Typography } from "antd";
import BigNumber from "bignumber.js";
import { PriceContext } from "api/contexts/Price";
import { BlocksInfoContext } from "api/contexts/BlocksInfo";
import { AccountDetailsLayout } from "pages/Account/Details";
import { rawToRai, timestampToDate } from "components/utils";

const { Title } = Typography;

const BlockDetails = () => {
  const { usd = 0, btc = 0 } = React.useContext(PriceContext);
  const {
    blocks,
    blocksInfo,
    isLoading: isBlocksInfoLoading
  } = React.useContext(BlocksInfoContext);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isBlocksInfoLoading
  };

  const blockInfo = blocksInfo?.blocks?.[blocks[0]];

  const {
    subtype,
    block_account,
    contents: {
      type = "",
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

  // @TODO COMPLETE FOR BLOCK
  // FAC080FA957BEA21C6059C4D47E479D8B6AB8A11C781416FBE8A41CF4CBD67B2

  /// prevous == None (this block opened the account)

  // missing "source_account": "nano_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est",

  return (
    <>
      <AccountDetailsLayout bordered={false}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Block subtype">
            {subtype || type}
          </Descriptions.Item>
          <Descriptions.Item label="Account">
            <Link to={`/account/${block_account}`} className="break-word">
              {block_account}
            </Link>
          </Descriptions.Item>
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
            <Link to={`/account/${representative}`} className="break-word">
              {representative}
            </Link>
          </Descriptions.Item>
          {linkAccountLabel ? (
            <Descriptions.Item label={linkAccountLabel}>
              <Link to={`/account/${link_as_account}`} className="break-word">
                {link_as_account}
              </Link>
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="Date">
            {timestampToDate(modifiedTimestamp)}
          </Descriptions.Item>
          <Descriptions.Item label="Previous block">
            <span className="break-word">{previous}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Signature">
            <span className="break-word">{signature}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Work">{work}</Descriptions.Item>
        </Descriptions>
      </AccountDetailsLayout>

      <Title level={3}>Original Block Content</Title>
      <Card>
        <pre>{JSON.stringify(blockInfo, null, 2)}</pre>
      </Card>
    </>
  );
};

export default BlockDetails;
