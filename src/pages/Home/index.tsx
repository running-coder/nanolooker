import React from "react";
import { Link } from "react-router-dom";
import { Skeleton, Tag, Timeline, Typography } from "antd";
import BigNumber from "bignumber.js";
import useSockets from "api/hooks/use-socket";
import { TypeColors } from "pages/Account/Transactions";
import { Color } from "components/Price";
import { rawToRai } from "components/utils";

const { Text, Title } = Typography;

const HomePage = () => {
  const { recentTransactions, isConnected } = useSockets();

  console.log("~~~loading", !isConnected);
  console.log("~~~recentTransactions", recentTransactions);

  // account: "nano_1smntg4beob1jp6muzityz9rjr68xns88r8i84jto8emtdtc16ksbno9pbse"
  // amount: "1000000000000000000000000000000"
  // hash: "C7BDAF74FB613DCC497D060E4A47D30EE752CD7281C84D6F7234015A4D61B296"
  // confirmation_type: "active_quorum"
  // block:
  // type: "state"
  // account: "nano_1smntg4beob1jp6muzityz9rjr68xns88r8i84jto8emtdtc16ksbno9pbse"
  // previous: "1113FB76A1F8A1202203BE6609A9BB04FB4BC6C51CFF3A4D9FB43F75DCDDAE0C"
  // representative: "nano_1natrium1o3z5519ifou7xii8crpxpk8y65qmkih8e8bpsjri651oza8imdd"
  // balance: "7030000000000000000000000000000"
  // link: "D6DEB4E0A70993929450674EC4B57E8F368CE845B84C93375431EDB41479790D"
  // link_as_account: "nano_3opypmicg4emkcc71stgrktqx5spjmn6dg4ekeuoaehfpic9kyaffnanhifr"
  // signature: "9796176BD77DF55201999DF2F1EF7DD0D6D7BB941148BF08F03AE230854764D0A9F75D42E566F17C75595448197D55861DFD20AA8C44EC062889A7F1BA438C02"
  // work: "387fc3d99dc66611"
  // subtype: "send"

  return (
    <>
      <Title level={3}>Recent Transactions</Title>
      <Skeleton active={true} loading={!isConnected}>
        {recentTransactions.length ? (
          <Timeline>
            {recentTransactions.map(
              ({ account, amount, hash, block: { subtype } }) => {
                let color = undefined;
                // const subtype = recordSubtype || type;
                if (!account) {
                  color = subtype === "change" ? "#722ed1" : undefined;
                } else {
                  color = subtype === "send" ? Color.NEGATIVE : Color.POSITIVE;
                }

                const position = subtype === "send" ? "left" : "right";
                console.log("~position", position);

                return (
                  <Timeline.Item color={color} key={hash} position={position}>
                    <Tag
                      // @ts-ignore
                      color={TypeColors[subtype.toUpperCase()]}
                      style={{ textTransform: "capitalize" }}
                    >
                      {subtype}
                    </Tag>
                    <Text style={{ color }}>
                      {amount
                        ? `${new BigNumber(rawToRai(amount)).toFormat()} NANO`
                        : "N/A"}
                    </Text>
                    <br />
                    <Link to={`/account/${account}`} className="link-normal">
                      {account}
                    </Link>
                    <br />
                    <Link to={`/block/${hash}`} className="link-muted">
                      {hash}
                    </Link>
                  </Timeline.Item>
                );
              }
            )}
          </Timeline>
        ) : (
          <p>Waiting for transactions...</p>
        )}
      </Skeleton>
    </>
  );
};

export default HomePage;
