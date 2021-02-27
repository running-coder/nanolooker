import React from "react";
import { Card, Descriptions, Typography } from "antd";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const faucets = [
  {
    name: "nano-faucet",
    account:
      "nano_34prihdxwz3u4ps8qjnn14p7ujyewkoxkwyxm3u665it8rg5rdqw84qrypzk",
    link: "https://nano-faucet.org/",
  },
  {
    name: "FreeNanoFaucet",
    account:
      "nano_3kwppxjcggzs65fjh771ch6dbuic3xthsn5wsg6i5537jacw7m493ra8574x",
    link: "https://www.freenanofaucet.com/",
  },
  {
    name: "Apollo Faucet",
    account:
      "nano_1tyd79peyzk4bs5ok1enb633dqsrxou91k7y4zzo1oegw4s75bokmj1pey4s",
    link: "https://twitter.com/ApolloNano/status/1365520666137481220",
  },
  {
    name: "LuckyNano",
    account:
      "nano_1oenixj4qtpfcembga9kqwggkb87wooicfy5df8nhdywrjrrqxk7or4gz15b",
    link: "https://luckynano.com/",
  },
];

const FaucetsPage = () => {
  return (
    <>
      <Title level={3}>Faucets</Title>
      <div style={{ marginBottom: "12px" }}>
        <Text>
          Faucets allows you to claim small amounts of NANO for free. These
          faucets are for you to experience how easy it is to send and receive
          NANO across the world.
        </Text>
      </div>
      <Card size="small" bodyStyle={{ padding: 0 }} bordered={false}>
        <Descriptions bordered column={1} size="small">
          {faucets.map(({ name, account, link }) => (
            <Descriptions.Item label={name}>
              <Link
                to={`/account/${account}`}
                className="break-word color-normal"
              >
                {account}
              </Link>
              <br />
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-word"
              >
                {link}
              </a>
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Card>
    </>
  );
};

export default FaucetsPage;
