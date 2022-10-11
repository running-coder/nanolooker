import * as React from "react";
import { useTranslation } from "react-i18next";
import { Card, Row, Col, Pagination, Skeleton, Typography } from "antd";
import chunk from "lodash/chunk";
import Trophy, { fontSizeToRankMap } from "components/Trophy";

import type { TreasureHunt } from "../hooks/use-raiblocksmc-leaderboards";

const { Text } = Typography;

interface Props {
  treasureHuntLeaderboard: TreasureHunt[];
}

const TreasureHuntLeaderboard: React.FC<Props> = ({
  treasureHuntLeaderboard,
}) => {
  const { t } = useTranslation();
  const pageSize = 15;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [paginatedTopScores, setPaginatedTopScores] = React.useState(
    [] as TreasureHunt[][],
  );

  React.useEffect(() => {
    setPaginatedTopScores(chunk(treasureHuntLeaderboard, pageSize));
  }, [treasureHuntLeaderboard]);

  return (
    <>
      <Card size="small" bordered={false} className="detail-layout">
        <Row gutter={12}>
          <Col xs={4}>{t("pages.raiblocksmc.rank")}</Col>
          <Col xs={10}>{t("pages.raiblocksmc.player")}</Col>
          <Col xs={5}>{t("pages.raiblocksmc.treasures")}</Col>
          <Col xs={5}>{t("pages.raiblocksmc.earned")}</Col>
        </Row>
        {!treasureHuntLeaderboard?.length ? (
          Array.from(Array(5).keys()).map(index => (
            <Row gutter={12} key={index}>
              <Col xs={4}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={10}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={5}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={5}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
            </Row>
          ))
        ) : (
          <>
            {paginatedTopScores[currentPage - 1]?.map(
              ({ rank, player, numberOfTreasures, totalNanoReceived }) => (
                <Row gutter={12} key={rank}>
                  <Col xs={4}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      #{rank} <Trophy rank={rank} />
                    </Text>
                  </Col>
                  <Col xs={10}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      {player}
                    </Text>
                  </Col>
                  <Col xs={5}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      {numberOfTreasures}
                    </Text>
                  </Col>
                  <Col xs={5}>
                    <Text
                      style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }}
                    >
                      Ӿ {totalNanoReceived}
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
                    total: treasureHuntLeaderboard.length,
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

export default TreasureHuntLeaderboard;
