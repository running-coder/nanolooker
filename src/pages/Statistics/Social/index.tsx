import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Radio, Card, Col, Row, Skeleton, Typography } from "antd";
import {
  TwitterOutlined,
  RedditOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Bar } from "@antv/g2plot";
import orderBy from "lodash/orderBy";
import useStatisticsSocial, {
  CryptoCurrency,
} from "./hooks/use-statistics-social";

const { Title } = Typography;

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

const filterToKeyMap: { [key in Filter]: PerBillion } = {
  [Filter.TWITTER]: "twitterFollowersPerBillion",
  [Filter.REDDIT]: "redditSubscribersPerBillion",
  [Filter.GITHUB]: "githubStarsPerBillion",
};

const StatisticsSocialPage: React.FC = () => {
  const { t } = useTranslation();
  const { statistics, isLoading } = useStatisticsSocial();
  const [filter, setFilter] = React.useState(Filter.REDDIT);

  React.useEffect(() => {
    if (isLoading || !statistics.length) return;

    const data = orderBy(
      statistics.filter(statistic => !!statistic[filterToKeyMap[filter]]),
      [filterToKeyMap[filter]],
      ["desc"],
    );

    const config = {
      data,
      xField: filterToKeyMap[filter],
      yField: "name",
      seriesField: "name",
      height: 3000,
      legend: {
        visible: false,
      },
      label: {
        formatter: (data: CryptoCurrency) => {
          return data[filterToKeyMap[filter]];
        },
        position: "right",
        offset: 4,
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
      <Title level={3}>{t("pages.statistics.social.title")}</Title>
      <Card size="small" bordered={false} className="detail-layout">
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
          </Col>
        </Row>

        <Row>
          <Col xs={24}>
            {/* <img src="https://assets.coingecko.com/coins/images/975/large/cardano.png?1547034860" /> */}
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
