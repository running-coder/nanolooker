import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import {
  Button,
  Card,
  Col,
  Dropdown,
  Menu,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useParams, useHistory } from "react-router-dom";

import type { PageParams } from "types/page";

const { Title, Text } = Typography;

const removeHtmlTags = (html: string): string =>
  html.replace(/<[\s\S]+?\/?>/g, "");

enum MEDIUM_FEEDS {
  BANANO_CURRENCY = "@bananocurrency",
  DEIV = "@deiv",
}

const AUTHORS: string[] = [];

const ALL = "all";

interface MediumPost {
  author: string;
  categories: string[];
  description: string;
  content: string;
  descriptionLong: string;
  descriptionShort: string;
  enclosure: any;
  guid: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  title: string;
  feed?: MEDIUM_FEEDS;
}

const getMediumPosts = async () => {
  const mediumPosts = (await Promise.all(
    Object.values(MEDIUM_FEEDS).map(
      feed =>
        new Promise(async (resolve, reject) => {
          try {
            const res = await fetch(
              `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${feed}`,
            );
            const { items } = await res.json();

            const posts: MediumPost[] = items.map(
              ({ description, content, author, ...rest }: MediumPost) => {
                const [, descriptionShort, descriptionLong] =
                  description.match(/(<p>.+?<\/p>)[\s\S]+?(<p>.+?<\/p>)/) || [];

                if (!AUTHORS.includes(author)) {
                  AUTHORS.push(author);
                }

                return {
                  ...rest,
                  author,
                  descriptionShort: removeHtmlTags(descriptionShort),
                  descriptionLong: removeHtmlTags(descriptionLong),
                  feed,
                };
              },
            );

            resolve(posts);
          } catch (e) {
            reject([]);
          }
        }),
    ),
  )) as MediumPost[][];

  const orderedPosts = orderBy(
    mediumPosts.flatMap(x => x),
    ["pubDate"],
    ["desc"],
  );

  const filteredPosts = uniqBy(orderedPosts, "title");

  // @NOTE Add category filtering if needed in the future
  // filteredPosts.filter(({ categories }) => categories.includes("nano"));

  return filteredPosts;
};

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { feed = "" } = useParams<PageParams>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [posts, setPosts] = React.useState(
    (Array.from(Array(3).keys()) as unknown) as MediumPost[],
  );
  const [feedFilter, setFeedFilter] = React.useState<MEDIUM_FEEDS | string>(
    ALL,
  );
  const [authorFilter, setAuthorFilter] = React.useState<string>(ALL);

  React.useEffect(() => {
    getMediumPosts().then(posts => {
      if (feed && posts.find(({ feed: postFeed }) => postFeed === feed)) {
        handleFeedFilter({ key: feed });
      }

      setPosts(posts);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFeedFilter = ({ key }: any) => {
    history.replace(`/news${key !== ALL ? `/${key}` : ""}`);
    setFeedFilter(key);
  };

  const handleAuthorFilter = ({ key }: any) => {
    setAuthorFilter(key);
  };

  const filteredPosts = posts
    .filter(({ feed }) => (feedFilter !== ALL ? feedFilter === feed : true))
    .filter(({ author }) =>
      authorFilter !== ALL ? authorFilter === author : true,
    );

  return (
    <>
      <Helmet>
        <title>Banano {t("menu.news")}</title>
      </Helmet>
      <Space style={{ marginBottom: "12px" }}>
        <Dropdown
          overlay={
            <Menu onClick={handleFeedFilter}>
              <Menu.Item key={ALL}>{t("pages.news.allFeeds")}</Menu.Item>
              {Object.values(MEDIUM_FEEDS).map(feed => (
                <Menu.Item key={feed}>{feed}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {feedFilter !== ALL ? feedFilter : t("pages.news.allFeeds")}{" "}
            <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          overlay={
            <Menu onClick={handleAuthorFilter}>
              <Menu.Item key={ALL}>{t("pages.news.allAuthors")}</Menu.Item>
              {AUTHORS.map(author => (
                <Menu.Item key={author}>{author}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {authorFilter !== ALL ? authorFilter : t("pages.news.allAuthors")}{" "}
            <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      {filteredPosts.map(
        (
          {
            title,
            pubDate,
            author,
            link,
            thumbnail = "",
            descriptionShort,
            descriptionLong,
          },
          index,
        ) => {
          const hasThumbnail =
            /.+?\.(jpe?g|png|gif)$/.test(thumbnail) ||
            thumbnail.startsWith("https://cdn-images");

          return (
            <Row gutter={[12, 0]} key={index}>
              <Col xs={24} md={10} lg={8}>
                <Card
                  bodyStyle={{
                    padding: 0,
                    minHeight: isLoading || !hasThumbnail ? "180px" : "auto",
                  }}
                >
                  {!isLoading && hasThumbnail ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <img src={thumbnail} alt={title} width="100%" />
                    </a>
                  ) : null}
                  {!isLoading && !hasThumbnail ? (
                    <img
                      alt="Banano news"
                      src="/nano-background.png"
                      width="100%"
                    />
                  ) : null}
                </Card>
              </Col>
              <Col xs={24} md={14} lg={16}>
                <Card size="small">
                  <Skeleton active loading={isLoading}>
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {title}
                    </Title>
                    <span
                      style={{
                        display: "block",
                        fontSize: "12px",
                        marginBottom: "12px",
                      }}
                      className="color-muted"
                    >
                      {pubDate} {t("common.by")} {author}
                    </span>
                    <div
                      dangerouslySetInnerHTML={{ __html: descriptionShort }}
                    ></div>
                    <div
                      dangerouslySetInnerHTML={{ __html: descriptionLong }}
                    ></div>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ marginTop: "12px", display: "inline-block" }}
                    >
                      {t("common.continueReading")}
                    </a>
                  </Skeleton>
                </Card>
              </Col>
            </Row>
          );
        },
      )}

      {!filteredPosts?.length ? (
        <Text style={{ display: "block" }}>{t("common.noResults")}</Text>
      ) : null}
    </>
  );
};

export default NewsPage;
