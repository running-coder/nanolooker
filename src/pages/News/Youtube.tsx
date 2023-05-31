import * as React from "react";
import { useTranslation } from "react-i18next";

import { Card, Typography } from "antd";
import moment from "moment";

import type { YoutubePost } from "./hooks/use-youtube";

const { Meta } = Card;
const { Text } = Typography;

interface Props {
  post: YoutubePost;
}

const Youtube: React.FC<Props> = ({ post }) => {
  const { t } = useTranslation();
  const [isClicked, setIsClicked] = React.useState(false);

  const { videoId, title, channelTitle, pubDate, thumbnail = "", description } = post;

  return (
    <Card
      hoverable
      bodyStyle={{ cursor: "default" }}
      cover={
        !isClicked ? (
          <div style={{ background: "#000", textAlign: "center" }}>
            <img
              style={{ cursor: "pointer" }}
              src={thumbnail}
              alt={title}
              width="75%"
              onClick={() => setIsClicked(true)}
            />
          </div>
        ) : (
          <div className="video-wrapper">
            <iframe
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )
      }
    >
      <Meta
        title={title}
        description={
          <>
            <Text style={{ color: "#000000d9", display: "block", marginBottom: 6 }}>
              {description}
            </Text>
            <Text style={{ display: "block", fontSize: 12 }}>
              {moment(pubDate).format("YYYY-MM-DD")} {t("common.by")} {channelTitle}
            </Text>
          </>
        }
      />
    </Card>
  );
};

export default Youtube;
