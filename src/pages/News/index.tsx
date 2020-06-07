import React from "react";
import { Card, Col, Row, Skeleton, Typography } from "antd";

const { Title } = Typography;

const NewsPage = () => {
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [posts, setPosts] = React.useState<any[]>(Array.from(Array(3).keys()));

  React.useEffect(() => {
    const getPosts = async () => {
      try {
        const res = await fetch(
          "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/nanocurrency",
        );
        const { items } = await res.json();

        const posts = items.map(({ description, content, ...rest }: any) => {
          const [, descriptionShort, descriptionLong] =
            description.match(/(<p>.+?<\/p>)[\s\S]+?(<p>.+?<\/p>)/) || [];
          return {
            ...rest,
            descriptionShort: descriptionShort.replace(/<[\s\S]+?\/?>/g, ""),
            descriptionLong: descriptionLong.replace(/<[\s\S]+?\/?>/g, ""),
          };
        });

        setPosts(posts);
        setIsLoading(false);
      } catch (e) {}
    };

    getPosts();
  }, []);

  return (
    <>
      {posts.map(
        (
          {
            title,
            pubDate,
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
                    {pubDate}
                  </span>
                  <div
                    dangerouslySetInnerHTML={{ __html: descriptionShort }}
                  ></div>
                  <div
                    dangerouslySetInnerHTML={{ __html: descriptionLong }}
                  ></div>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    Continue reading
                  </a>
                </Skeleton>
              </Card>
            </Col>
          </Row>
        ),
      )}
    </>
  );
};

export default NewsPage;
