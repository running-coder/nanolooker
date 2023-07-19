import * as React from "react";
import { useTranslation } from "react-i18next";

import { Card, Col, Pagination, Row, Skeleton, Typography } from "antd";
import chunk from "lodash/chunk";

import Trophy from "components/Trophy";

import useNanoBrowserQuestLeaderboard from "./hooks/use-nanobrowserquest-leaderboard";
import { getLevel } from "./utils";

const { Text, Title } = Typography;

const Leaderboard: React.FC = () => {
  const { t } = useTranslation();
  const { leaderboard, isLoading } = useNanoBrowserQuestLeaderboard();
  const pageSize = 20;
  const [currentPage, setCurrentPage] = React.useState(1);
  const [paginatedTopScores, setPaginatedTopScores] = React.useState([] as any[][]);

  React.useEffect(() => {
    setPaginatedTopScores(chunk(leaderboard, pageSize));
  }, [leaderboard]);

  return (
    <>
      <Title level={3}>{t("pages.nanobrowserquest.leaderboard")}</Title>
      <Card size="small" className="detail-layout">
        <Row gutter={12}>
          <Col xs={3}>{t("pages.nanobrowserquest.rank")}</Col>
          <Col xs={8}>{t("pages.nanobrowserquest.player")}</Col>
          <Col xs={3}>{t("pages.nanobrowserquest.level")}</Col>
          <Col xs={5}>{t("pages.nanobrowserquest.exp")}</Col>
          <Col xs={5}>
            {t("pages.nanobrowserquest.gold")}{" "}
            <img alt="Gold" src={`/nanobrowserquest/gold.png`} style={{ marginLeft: "3px" }} />
          </Col>
        </Row>
        {isLoading ? (
          Array.from(Array(5).keys()).map(index => (
            <Row gutter={12} key={index}>
              <Col xs={3}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={8}>
                <Skeleton loading={true} paragraph={false} active />
              </Col>
              <Col xs={3}>
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
            {paginatedTopScores[currentPage - 1]?.map(({ rank, player, exp, gold }) => (
              <Row gutter={12} key={rank}>
                <Col xs={3}>
                  <Text>
                    #{rank} <Trophy rank={rank} />
                  </Text>
                </Col>
                <Col xs={8}>
                  <Text>{player}</Text>
                </Col>
                <Col xs={3}>
                  <Text>{getLevel(exp)}</Text>
                </Col>
                <Col xs={5}>
                  <Text>{new Intl.NumberFormat("en-EN", {}).format(exp)}</Text>
                </Col>
                <Col xs={5}>
                  <Text>{new Intl.NumberFormat("en-EN", {}).format(gold)}</Text>
                </Col>
              </Row>
            ))}
            <Row className="row-pagination">
              <Col xs={24} style={{ textAlign: "right" }}>
                <Pagination
                  size="small"
                  {...{
                    total: leaderboard.length,
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
