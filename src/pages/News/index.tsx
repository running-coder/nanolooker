import * as React from "react";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";

import { DownOutlined } from "@ant-design/icons";
import { Button, Card, Col, Dropdown, Menu, Row, Skeleton, Space, Typography } from "antd";
import orderBy from "lodash/orderBy";

import useMedium, { MEDIUM_FEEDS, MediumPost } from "./hooks/use-medium";
import useYoutube, { YoutubePost } from "./hooks/use-youtube";
import Medium from "./Medium";
import Youtube from "./Youtube";

import type { PageParams } from "types/page";

const { Text } = Typography;

const ALL = "all";

export enum PostSource {
  MEDIUM = "MEDIUM",
  YOUTUBE = "YOUTUBE",
}

const NewsPage: React.FC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { feed = "" } = useParams<PageParams>();
  const [posts, setPosts] = React.useState([] as (MediumPost | YoutubePost)[]);
  const [authors, setAuthors] = React.useState([""]);
  const { isLoading: isMediumLoading, posts: mediumPosts, authors: mediumAuthors } = useMedium();
  const {
    isLoading: isYoutubeLoading,
    posts: youtubePosts,
    authors: youtubeAuthors,
  } = useYoutube();
  const [feedFilter, setFeedFilter] = React.useState<MEDIUM_FEEDS | string>(ALL);
  const [authorFilter, setAuthorFilter] = React.useState<string>(ALL);
  const [sourceFilter, setSourceFilter] = React.useState<string>(ALL);

  React.useEffect(() => {
    const orderedPosts: (MediumPost | YoutubePost)[] = orderBy(
      [...mediumPosts, ...youtubePosts],
      ["pubDate"],
      ["desc"],
    );

    setPosts(orderedPosts);
  }, [mediumPosts, youtubePosts]);

  React.useEffect(() => {
    const orderedAuthors: string[] = [...mediumAuthors, ...youtubeAuthors].sort();

    setAuthors(orderedAuthors);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediumAuthors.length, youtubeAuthors.length]);

  React.useEffect(() => {
    if (feed && posts.find(({ feed: postFeed }) => postFeed === feed)) {
      handleFeedFilter({ key: feed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const handleFeedFilter = ({ key }: any) => {
    history.replace(`/news${key !== ALL ? `/${key}` : ""}`);
    setFeedFilter(key);
  };

  const handleAuthorFilter = ({ key }: any) => {
    setAuthorFilter(key);
  };

  const handleSourceFilter = ({ key }: any) => {
    setSourceFilter(key);
  };

  const filteredPosts = posts
    .filter(({ feed }) => (feedFilter !== ALL ? feedFilter === feed : true))
    .filter(({ author }) => (authorFilter !== ALL ? authorFilter === author : true))
    .filter(({ source }) => (sourceFilter !== ALL ? sourceFilter === source : true));

  return (
    <>
      <Helmet>
        <title>Nano {t("menu.news")}</title>
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
            {feedFilter !== ALL ? feedFilter : t("pages.news.allFeeds")} <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          overlay={
            <Menu onClick={handleAuthorFilter}>
              <Menu.Item key={ALL}>{t("pages.news.allAuthors")}</Menu.Item>
              {authors.map(author => (
                <Menu.Item key={author}>{author}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {authorFilter !== ALL ? authorFilter : t("pages.news.allAuthors")} <DownOutlined />
          </Button>
        </Dropdown>

        <Dropdown
          overlay={
            <Menu onClick={handleSourceFilter}>
              <Menu.Item key={ALL}>{t("pages.news.allSources")}</Menu.Item>
              {Object.keys(PostSource).map(source => (
                <Menu.Item key={source}>{source}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <Button>
            {sourceFilter !== ALL ? sourceFilter : t("pages.news.allSources")} <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      <Row gutter={[12, 0]}>
        {!filteredPosts.length && (isMediumLoading || isYoutubeLoading)
          ? Array.from({ length: 6 }).map((_value, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card
                  size="small"
                  bodyStyle={{
                    minHeight: "240px",
                  }}
                >
                  <Skeleton active loading={true}></Skeleton>
                </Card>
              </Col>
            ))
          : null}

        {filteredPosts.map((post: MediumPost | YoutubePost, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            {post.source === PostSource.MEDIUM ? <Medium post={post} /> : null}
            {post.source === PostSource.YOUTUBE ? <Youtube post={post} /> : null}
          </Col>
        ))}
      </Row>

      {!filteredPosts?.length && !isMediumLoading && !isYoutubeLoading ? (
        <Text style={{ display: "block" }}>{t("common.noResults")}</Text>
      ) : null}
    </>
  );
};

export default NewsPage;
