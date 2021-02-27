import React from "react";
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
  NANO_CURRENCY = "nanocurrency",
  NANO_CENTER = "the-nano-center",
  NANO_EDUCATION = "nano-education",
  SENATUS = "@senatusspqr",
  JOOHANSSON = "@nanojson",
}

const AUTHORS: string[] = [];

enum DEFAULT_FILTERS {
  ALL_FEEDS = "All feeds",
  ALL_AUTHORS = "All authors",
}

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

const NewsPage = () => {
  const history = useHistory();
  const { feed = "" } = useParams<PageParams>();
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [posts, setPosts] = React.useState<any[]>(Array.from(Array(3).keys()));
  const [feedFilter, setFeedFilter] = React.useState<MEDIUM_FEEDS | string>(
    DEFAULT_FILTERS.ALL_FEEDS,
  );
  const [authorFilter, setAuthorFilter] = React.useState<string>(
    DEFAULT_FILTERS.ALL_AUTHORS,
  );

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
    history.replace(
      `/news${key !== DEFAULT_FILTERS.ALL_FEEDS ? `/${key}` : ""}`,
    );
    setFeedFilter(key);
  };

  const handleAuthorFilter = ({ key }: any) => {
    setAuthorFilter(key);
  };

  const filteredPosts = posts
    .filter(({ feed }) =>
      feedFilter !== DEFAULT_FILTERS.ALL_FEEDS ? feedFilter === feed : true,
    )
    .filter(({ author }) =>
      authorFilter !== DEFAULT_FILTERS.ALL_AUTHORS
        ? authorFilter === author
        : true,
    );

  return (
    <>
      <Space style={{ marginBottom: "12px" }}>
        <Dropdown
          overlay={
            <Menu onClick={handleFeedFilter}>
              <Menu.Item key={DEFAULT_FILTERS.ALL_FEEDS}>
                {DEFAULT_FILTERS.ALL_FEEDS}
              </Menu.Item>
              {Object.values(MEDIUM_FEEDS).map(feed => (
                <Menu.Item key={feed}>{feed}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {feedFilter || DEFAULT_FILTERS.ALL_FEEDS} <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          overlay={
            <Menu onClick={handleAuthorFilter}>
              <Menu.Item key={DEFAULT_FILTERS.ALL_AUTHORS}>
                {DEFAULT_FILTERS.ALL_AUTHORS}
              </Menu.Item>
              {AUTHORS.map(author => (
                <Menu.Item key={author}>{author}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {authorFilter || DEFAULT_FILTERS.ALL_AUTHORS} <DownOutlined />
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
            thumbnail,
            descriptionShort,
            descriptionLong,
          },
          index,
        ) => (
          <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]} key={index}>
            <Col xs={24} md={10} lg={8}>
              <Card
                bodyStyle={{
                  padding: 0,
                  minHeight: isLoading ? "180px" : "auto",
                }}
              >
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <img src={thumbnail} alt={title} width="100%" />
                </a>
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
                    {pubDate} by {author}
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
                    Continue reading
                  </a>
                </Skeleton>
              </Card>
            </Col>
          </Row>
        ),
      )}

      {!filteredPosts?.length ? (
        <Text style={{ display: "block" }}>No results</Text>
      ) : null}
    </>
  );
};

export default NewsPage;
