import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";

import { GithubOutlined, RedditOutlined, TwitterOutlined } from "@ant-design/icons";
import { Bar, G2 } from "@antv/g2plot";
import { Card, Col, Radio, Row, Skeleton, Tooltip, Typography } from "antd";
import BigNumber from "bignumber.js";
import orderBy from "lodash/orderBy";

import QuestionCircle from "components/QuestionCircle";

import useStatisticsSocial, { CryptoCurrency } from "./hooks/use-statistics-social";

const { Text, Title } = Typography;
const G = G2.getEngine("canvas");

let socialChart: any = null;

enum Filter {
  TWITTER = "TWITTER",
  REDDIT = "REDDIT",
  GITHUB = "GITHUB",
}

type PerBillion =
  | "twitterFollowersPerBillion"
  | "redditSubscribersPerBillion"
  | "githubStarsPerBillion";

const filterPerBillionToKeyMap: { [key in Filter]: PerBillion } = {
  [Filter.TWITTER]: "twitterFollowersPerBillion",
  [Filter.REDDIT]: "redditSubscribersPerBillion",
  [Filter.GITHUB]: "githubStarsPerBillion",
};

type TotalEngagement = "twitterFollowers" | "redditSubscribers" | "githubStars";

const filterTotalToKeyMap: { [key in Filter]: TotalEngagement } = {
  [Filter.TWITTER]: "twitterFollowers",
  [Filter.REDDIT]: "redditSubscribers",
  [Filter.GITHUB]: "githubStars",
};

const StatisticsSocialPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics, isLoading } = useStatisticsSocial();
  const [filter, setFilter] = React.useState(Filter.REDDIT);

  React.useEffect(() => {
    if (isLoading || !statistics.length) return;

    const data = orderBy(
      statistics.filter(statistic => !!statistic[filterPerBillionToKeyMap[filter]]),
      [filterPerBillionToKeyMap[filter]],
      ["desc"],
    ).map((statistic, index) => {
      statistic.rank = index + 1;
      return statistic;
    });

    const config = {
      data,
      xField: filterPerBillionToKeyMap[filter],
      yField: "name",
      seriesField: "name",
      height: data.length * 40,
      legend: {
        visible: false,
      },
      label: {
        content: (data: CryptoCurrency) => {
          const group = new G.Group({});
          group.addShape({
            type: "image",
            attrs: {
              x: 0,
              y: 0,
              width: 20,
              height: 20,
              img: `/cryptocurrencies/logo/${data.symbol}.png`,
            },
          });

          group.addShape({
            type: "text",
            attrs: {
              x: 25,
              y: 5,
              text: data[filterPerBillionToKeyMap[filter]],
              textAlign: "left",
              textBaseline: "top",
              fill: "#595959",
            },
          });

          return group;
        },
        position: "right",
        offset: 4,
      },
      tooltip: {
        // @ts-ignore
        title: (text, data) => `#${data.rank} ${text}`,
        customItems: (originalItems: any) => {
          const items = [
            {
              color: originalItems[0].color,
              name: t("pages.statistics.social.engagementPerBillion"),
              value: originalItems[0].value,
            },
            {
              name: t("pages.statistics.social.marketCap"),
              value: `$${new BigNumber(originalItems[0].data.marketCap)
                .dividedBy(1_000_000_000)
                .toFixed(2)}B`,
            },
            {
              name: t("pages.statistics.social.totalEngagement"),
              value: originalItems[0].data[filterTotalToKeyMap[filter]],
            },
          ];

          return items;
        },
      },
    };

    if (!socialChart) {
      socialChart = new Bar(
        document.getElementById("social-chart") as HTMLElement,
        // @ts-ignore
        config,
      );
      socialChart.render();
    } else {
      socialChart.update(config);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, statistics, filter]);

  React.useEffect(() => {
    return () => {
      socialChart?.destroy();
      socialChart = null;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{t("pages.statistics.social.title")}</title>
      </Helmet>
      <Title level={3}>
        {t("pages.statistics.social.title")}
        <Tooltip placement="right" title={t("tooltips.socialStatistics")}>
          <QuestionCircle />
        </Tooltip>
      </Title>
      <Card size="small" className="detail-layout">
        <Row>
          <Col xs={24}>
            <Radio.Group
              value={filter}
              onChange={({ target: { value } }) => {
                setFilter(value);
              }}
            >
              <Radio.Button value={Filter.REDDIT}>
                <RedditOutlined /> Reddit
              </Radio.Button>
              <Radio.Button value={Filter.TWITTER}>
                <TwitterOutlined /> Twitter
              </Radio.Button>
              <Radio.Button value={Filter.GITHUB}>
                <GithubOutlined /> Github
              </Radio.Button>
            </Radio.Group>
            <br />
            <br />
            <Text>{t(`pages.statistics.social.${filterTotalToKeyMap[filter]}`)}</Text>
          </Col>
        </Row>
        <Row>
          <Col xs={24}>
            <Skeleton loading={isLoading || !statistics.length} active>
              <div id="social-chart" />
            </Skeleton>
          </Col>
        </Row>
      </Card>
    </>
  );
};

export default StatisticsSocialPage;
