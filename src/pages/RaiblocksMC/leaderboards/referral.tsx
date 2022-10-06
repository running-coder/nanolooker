import * as React from "react";
import {useTranslation} from "react-i18next";
import {Card, Row, Col, Pagination, Skeleton, Typography} from "antd";
import chunk from "lodash/chunk";

import type {Referral} from "../hooks/use-raiblocksmc-leaderboards";
import {fontSizeToRankMap} from "../../GamesUtils/Trophy";
import Trophy from "../../GamesUtils/Trophy";

const {Text} = Typography;

interface Props {
    referralLeaderboard: Referral[];
}


const ReferralLeaderboard: React.FC<Props> = ({referralLeaderboard}) => {
    const {t} = useTranslation();
    const pageSize = 15;
    const [currentPage, setCurrentPage] = React.useState(1);
    const [paginatedTopScores, setPaginatedTopScores] = React.useState([] as Referral[][],
    );

    React.useEffect(() => {
        setPaginatedTopScores(chunk(referralLeaderboard, pageSize));
    }, [referralLeaderboard]);

    return (
        <>
            <Card size="small" bordered={false} className="detail-layout">
                <Row gutter={12}>
                    <Col xs={4}>{t("pages.raiblocksmc.rank")}</Col>
                    <Col xs={10}>{t("pages.raiblocksmc.player")}</Col>
                    <Col xs={5}>{t("pages.raiblocksmc.playersReferred")}</Col>
                    <Col xs={5}>{t("pages.raiblocksmc.earned")}</Col>
                </Row>
                {!referralLeaderboard?.length ? (
                    Array.from(Array(5).keys()).map(index => (
                        <Row gutter={12} key={index}>
                            <Col xs={4}>
                                <Skeleton loading={true} paragraph={false} active/>
                            </Col>
                            <Col xs={10}>
                                <Skeleton loading={true} paragraph={false} active/>
                            </Col>
                            <Col xs={5}>
                                <Skeleton loading={true} paragraph={false} active/>
                            </Col>
                            <Col xs={5}>
                                <Skeleton loading={true} paragraph={false} active/>
                            </Col>
                        </Row>
                    ))
                ) : (
                    <>
                        {paginatedTopScores[currentPage - 1]?.map(
                            ({rank, player, playersReferred, totalNanoReceived}) => (
                                <Row gutter={12} key={rank}>
                                    <Col xs={4}>
                                        <Text
                                            style={{fontSize: fontSizeToRankMap[rank] ?? "auto"}}
                                        >
                                            #{rank} <Trophy rank={rank}/>
                                        </Text>
                                    </Col>
                                    <Col xs={10}>
                                        <Text
                                            style={{fontSize: fontSizeToRankMap[rank] ?? "auto"}}
                                        >
                                            {player}
                                        </Text>
                                    </Col>
                                    <Col xs={5}>
                                        <Text
                                            style={{fontSize: fontSizeToRankMap[rank] ?? "auto"}}
                                        >
                                            {playersReferred}
                                        </Text>
                                    </Col>
                                    <Col xs={5}>
                                        <Text
                                            style={{fontSize: fontSizeToRankMap[rank] ?? "auto"}}
                                        >
                                            Ӿ {totalNanoReceived}
                                        </Text>
                                    </Col>
                                </Row>
                            ),
                        )}
                        <Row className="row-pagination">
                            <Col xs={24} style={{textAlign: "right"}}>
                                <Pagination
                                    size="small"
                                    {...{
                                        total: referralLeaderboard.length,
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

export default ReferralLeaderboard;
