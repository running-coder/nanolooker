import * as React from "react";
import { Link } from "react-router-dom";

import { Card, Typography } from "antd";

const { Text, Title } = Typography;

const Rules: React.FC = () => {
  return (
    <>
      <Title level={3}>Treasure Hunt Rules (Beta)</Title>
      <Card size="small">
        {/* <p>The treasure hunt is scheduled to last 24h (give exact time)</p> */}

        <Text
          style={{
            fontSize: "18px",
            display: "block",
            margin: "6px 0",
            fontWeight: "bold",
          }}
        >
          First:
        </Text>
        <ol>
          <li>
            Post your public address in the{" "}
            <a
              style={{
                display: "inline-block",
              }}
              href="https://twitter.com/runningcod3r/status/1423694607578288135"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter thread
            </a>{" "}
            to appear on this page and start the hunt!
            <ul>
              <li>It may take a few seconds for you account to appear in the participant list.</li>
            </ul>
          </li>
        </ol>

        <Text
          style={{
            fontSize: "18px",
            display: "block",
            margin: "6px 0",
            fontWeight: "bold",
          }}
        >
          Then:
        </Text>
        <ol>
          <li>
            Claim a payout from the{" "}
            <a
              style={{
                display: "inline-block",
              }}
              href="https://nanocafe.cc"
              target="_blank"
              rel="noopener noreferrer"
            >
              nanocafe.cc
            </a>{" "}
            faucet.
          </li>
          <li>
            Change your representative to one that is Online with less than{" "}
            <strong>3% weight</strong>.{" "}
            <Link to={"/representatives"} target="_blank">
              See Representatives
            </Link>
            <ul>
              <li>
                Choosing a representative and delegating your voting weight is important for
                decentralization and security over the network.
              </li>
              <li>
                After your representative is changed once and the objective is completed, you can
                change it back.
              </li>
              <li>
                Continue reading on{" "}
                <a
                  href={"https://nano.community/getting-started-users/choosing-a-representative"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  representatives
                </a>
                .
              </li>
            </ul>
          </li>
          <li>
            Complete{" "}
            <a
              style={{
                display: "inline-block",
              }}
              href="https://nanobrowserquest.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              NanoBrowserQuest
            </a>{" "}
            game (10-15 minutes)
            <ul>
              <li>
                Create your character with the <strong>same nano_ address</strong> you registered
                the treasure hunt.
              </li>
            </ul>
          </li>
          <li>Once all of the objectives are completed, you will receive a payout.</li>
        </ol>
      </Card>
    </>
  );
};

export default Rules;
