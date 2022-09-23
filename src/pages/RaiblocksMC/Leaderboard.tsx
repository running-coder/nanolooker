import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Pagination, Skeleton, Typography } from "antd";
import { TrophyTwoTone } from "@ant-design/icons";
import chunk from "lodash/chunk";

import type { PlayerScore } from "./hooks/use-raiblocksmc";

const { Text, Title } = Typography;

interface Props {
  playerScore: PlayerScore[];
}

const Trophy: React.FC<{ rank: number }> = ({ rank }) => {
  let color: null | string = null;
  if (rank === 1) {
    color = "#ffd700";
  } else if (rank === 2) {
    color = "#c0c0c0";
  } else if (rank === 3) {
    color = "#cd7f32";
  }

  return color ? (
    <TrophyTwoTone
      twoToneColor={color}
      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
    />
  ) : null;
};

const fontSizeToRankMap: { [key: number]: string } = {
  1: "18px",
  2: "18px",
  3: "18px",
};

const Leaderboard: React.FC<Props> = ({ playerScore }) => {
  const { t } = useTranslation();
  const pageSize = 15;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [paginatedTopScores, setPaginatedTopScores] = React.useState(
    [] as PlayerScore[][],
  );

  React.useEffect(() => {
    setPaginatedTopScores(chunk(playerScore, pageSize));
  }, [playerScore]);

  return (
    <>
      <Title level={3}>{t("pages.raiblocksmc.leaderboard")}</Title>
      <Card size="small" bordered={false} className="detail-layout">
        <Row gutter={12}>
          <Col xs={4}>{t("pages.raiblocksmc.rank")}</Col>
          <Col xs={14}>{t("pages.raiblocksmc.player")}</Col>
          <Col xs={6}>{t("pages.raiblocksmc.kills")}</Col>
        </Row>
        {!playerScore?.length ? (
          Array.from(Array(5).keys()).map(index => (
            <Row gutter={12} key={index}>
              <Col xs={4}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={14}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={6}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
            </Row>
          ))
        ) : (
          <>
            {paginatedTopScores[currentPage - 1]?.map(
              ({ rank, player, kills }) => (
                <Row gutter={12} key={rank}>
                  <Col xs={4}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      #{rank} <Trophy rank={rank} />
                    </Text>
                  </Col>
                  <Col xs={14}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      {player}
                    </Text>
                  </Col>
                  <Col xs={6}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      {kills}
                    </Text>
                  </Col>
                </Row>
              ),
            )}
            <Row className="row-pagination">
              <Col xs={24} style={{ textAlign: "right" }}>
                <Pagination
                  size="small"
                  {...{
                    total: playerScore.length,
                    pageSize,
                    current: currentPage,
                    disabled: false,
                    onChange: (page: number) => {
                      setCurrentPage?.(page);
                    },
                    showSizeChanger: false,
                  }}
                />
              </Col>
            </Row>
          </>
        )}
      </Card>
    </>
  );
};

export default Leaderboard;
