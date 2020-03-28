import React from "react";
import { Link } from "react-router-dom";
import { Card, Descriptions, Skeleton, Tag, Typography } from "antd";
import BigNumber from "bignumber.js";
import { MarketStatisticsContext } from "api/contexts/MarketStatistics";
import { BlocksInfoContext } from "api/contexts/BlocksInfo";
import {
  TwoToneColors,
  rawToRai,
  timestampToDate,
  isValidAccountAddress,
  isValidBlockHash,
  isOpenAccountBlockHash
} from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Title } = Typography;

const BlockDetails = () => {
  const {
    marketStatistics: { usdCurrentPrice, usdBtcCurrentPrice },
    isInitialLoading: isMarketStatisticsInitialLoading
  } = React.useContext(MarketStatisticsContext);
  const {
    blocks,
    blocksInfo,
    isLoading: isBlocksInfoLoading
  } = React.useContext(BlocksInfoContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);

  const skeletonProps = {
    active: true,
    paragraph: false,
    loading: isBlocksInfoLoading || isMarketStatisticsInitialLoading
  };

  const blockInfo = blocksInfo?.blocks?.[blocks[0]];

  const {
    subtype,
    block_account: blockAccount,
    source_account: sourceAccount,
    contents: {
      type = "",
      representative = "",
      link_as_account: linkAsAccount = "",
      previous = "",
      signature = "",
      work = ""
    } = {}
  } = blockInfo || {};

  const modifiedTimestamp = Number(blockInfo?.local_timestamp) * 1000;

  const amount = new BigNumber(rawToRai(blockInfo?.amount || 0)).toNumber();
  const usdAmount = new BigNumber(amount).times(usdCurrentPrice).toFormat(2);
  const btcAmount = new BigNumber(amount)
    .times(usdCurrentPrice)
    .dividedBy(usdBtcCurrentPrice)
    .toFormat(12);

  const balance = new BigNumber(rawToRai(blockInfo?.balance || 0)).toNumber();
  const usdBalance = new BigNumber(balance).times(usdCurrentPrice).toFormat(2);
  const btcBalance = new BigNumber(balance)
    .times(usdCurrentPrice)
    .dividedBy(usdBtcCurrentPrice)
    .toFormat(12);

  let linkAccountLabel = "";
  if (subtype === "send") {
    linkAccountLabel = "Receiver";
  } else if (subtype === "receive") {
    linkAccountLabel = "Sender";
  }

  const secondAccount = isValidAccountAddress(sourceAccount || "")
    ? sourceAccount
    : linkAsAccount;

  const blockAccountAlias = knownAccounts.find(
    ({ account: knownAccount }) => knownAccount === blockAccount
  )?.alias;
  const secondAccountAlias = knownAccounts.find(
    ({ account: knownAccount }) => knownAccount === secondAccount
  )?.alias;
  const representativeAlias = knownAccounts.find(
    ({ account: knownAccount }) => knownAccount === representative
  )?.alias;

  // @TODO COMPLETE FOR BLOCK
  // FAC080FA957BEA21C6059C4D47E479D8B6AB8A11C781416FBE8A41CF4CBD67B2

  /// prevous == None (this block opened the account)

  // missing "source_account": "nano_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est",

  return (
    <>
      <Card
        size="small"
        bodyStyle={{ padding: 0, marginBottom: "10px" }}
        bordered={false}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Block subtype">
            <Tag
              // @ts-ignore
              color={TwoToneColors[(subtype || type).toUpperCase()]}
              className="timeline-tag"
            >
              {subtype || type}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Account">
            {blockAccountAlias ? (
              <strong style={{ marginRight: "6px" }}>
                {blockAccountAlias}
              </strong>
            ) : null}
            <Link to={`/account/${blockAccount}`} className="break-word">
              {blockAccount}
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
          {linkAccountLabel ? (
            <Descriptions.Item label={linkAccountLabel}>
              {secondAccountAlias ? (
                <strong style={{ marginRight: "6px" }}>
                  {secondAccountAlias}
                </strong>
              ) : null}
              <Link to={`/account/${secondAccount}`} className="break-word">
                {secondAccount}
              </Link>
            </Descriptions.Item>
          ) : null}
          {representative ? (
            <Descriptions.Item label="Representative">
              {representativeAlias ? (
                <strong style={{ marginRight: "6px" }}>
                  {representativeAlias}
                </strong>
              ) : null}
              <Link to={`/account/${representative}`} className="break-word">
                {representative}
              </Link>
            </Descriptions.Item>
          ) : null}
          {modifiedTimestamp ? (
            <Descriptions.Item label="Date">
              {timestampToDate(modifiedTimestamp)}
            </Descriptions.Item>
          ) : null}
          {isValidBlockHash(previous) ? (
            <Descriptions.Item label="Previous block">
              <span className="break-word">{previous}</span>
            </Descriptions.Item>
          ) : null}
          {isOpenAccountBlockHash(previous) ? (
            <Descriptions.Item label="Previous block">
              This Block opened the account
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item label="Signature">
            <span className="break-word">{signature}</span>
          </Descriptions.Item>
          <Descriptions.Item label="Work">{work}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={3}>Original Block Content</Title>
      <Card>
        <pre>{JSON.stringify(blockInfo, null, 2)}</pre>
      </Card>
    </>
  );
};

export default BlockDetails;
