import * as React from "react";
import { useTranslation } from "react-i18next";

import { Card, Typography } from "antd";
import moment from "moment";

import type { MediumPost } from "./hooks/use-medium";

const { Meta } = Card;
const { Text } = Typography;

interface Props {
  post: MediumPost;
}

const Medium: React.FC<Props> = ({ post }) => {
  const { t } = useTranslation();

  const { title, pubDate, author, link, thumbnail = "", descriptionShort } = post;
  const hasThumbnail =
    /.+?\.(jpe?g|png|gif)$/.test(thumbnail) || thumbnail.startsWith("https://cdn-images");

  return (
    <Card
      hoverable
      bodyStyle={{ cursor: "default" }}
      cover={
        <>
          {hasThumbnail ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              <img src={thumbnail} alt={title} width="100%" />
            </a>
          ) : null}
          {!hasThumbnail ? <img alt="Nano news" src="/nano-background.png" width="100%" /> : null}
        </>
      }
    >
      <Meta
        title={title}
        description={
          <>
            <Text style={{ display: "block", marginBottom: 6 }}>{descriptionShort}</Text>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Text style={{ display: "block", fontSize: 12 }}>
                {moment(pubDate).format("YYYY-MM-DD")} {t("common.by")} {author}
              </Text>
              <a href={link} target="_blank" rel="noopener noreferrer">
                {t("common.continueReading")}
              </a>
            </div>
          </>
        }
      />
    </Card>
  );
};

export default Medium;
