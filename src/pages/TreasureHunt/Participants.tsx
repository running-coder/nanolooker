import * as React from "react";
import { useMediaQuery } from "react-responsive";
import { Link, useHistory, useParams } from "react-router-dom";

import {
  CheckCircleTwoTone,
  CloseCircleOutlined,
  SearchOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Pagination,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { isValidAccountAddress, TwoToneColors } from "components/utils";

import useParticipants from "./hooks/use-participants";
import Rules from "./Rules";

import type { PageParams } from "types/page";

interface ProgressProps {
  isCompleted?: boolean;
  hash?: string;
}

const { Text, Title } = Typography;

const Progress: React.FC<ProgressProps> = ({ isCompleted, hash }) => {
  const { theme } = React.useContext(PreferencesContext);

  return isCompleted || (hash && hash !== "0") ? (
    <Space size={6}>
      <CheckCircleTwoTone
        twoToneColor={theme === Theme.DARK ? TwoToneColors.RECEIVE_DARK : "#52c41a"}
      />
      {hash && hash !== "0" ? (
        <Link to={`/block/${hash}`}>
          <Button shape="circle" size="small" icon={<SearchOutlined />} />
        </Link>
      ) : null}
    </Space>
  ) : (
    <CloseCircleOutlined />
  );
};

const Participants: React.FC = () => {
  const { account } = useParams<PageParams>();
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const {
    participants,
    meta: { total, perPage },
    isLoading: isParticipantsLoading,
  } = useParticipants({
    account,
    page: currentPage,
  });
  const history = useHistory();
  const isLargeAndLower = !useMediaQuery({ query: "(min-width: 992px)" });

  const onChange = (e: React.ChangeEventHandler<HTMLInputElement>) => {
    // @ts-ignore
    const { value } = e.currentTarget;

    if (value && isValidAccountAddress(value)) {
      history.push(`/treasure-hunt/${value}`);
    } else if (!value && history.location.pathname !== "/treasure-hunt") {
      history.push("/treasure-hunt");
    }
  };

  return (
    <>
      <Rules />

      <Title level={3} id="treasure-hunt-title">
        {total} Participant{participants.length === 1 ? "" : "s"}
      </Title>

      <Input
        defaultValue={account}
        // @ts-ignore
        onChange={onChange}
        placeholder="Search for participant address"
        style={{ maxWidth: isLargeAndLower ? "100%" : "60%", marginBottom: 12 }}
        allowClear
      ></Input>

      <Card size="small" className="detail-layout">
        {!isLargeAndLower ? (
          <Row gutter={6}>
            <Col md={8}>Participant{participants.length === 1 ? "" : "s"}</Col>
            <Col md={3} style={{ textAlign: "center" }}>
              <TwitterOutlined /> Twitter
            </Col>
            <Col md={3} style={{ textAlign: "center" }}>
              NanoCafe.cc
            </Col>
            <Col md={3} style={{ textAlign: "center" }}>
              Representative
            </Col>
            <Col md={3} style={{ textAlign: "center" }}>
              NanoBrowserQuest
            </Col>
            <Col md={4} style={{ textAlign: "center" }}>
              Payout
            </Col>
          </Row>
        ) : null}
        {isParticipantsLoading
          ? Array.from(Array(5).keys()).map(index => (
              <Row gutter={6} key={index}>
                <Col md={8}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col md={3}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col md={3}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col md={3}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col md={3}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
                <Col md={4}>
                  <Skeleton loading={true} paragraph={false} active />
                </Col>
              </Row>
            ))
          : null}

        {!isParticipantsLoading && !participants.length ? (
          <Row>
            <Col xs={24} style={{ textAlign: "center" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  account
                    ? "Participant not found, if you posted your account on the twitter thread, wait a few seconds."
                    : "No participants found"
                }
                style={{ padding: "12px" }}
              />
            </Col>
          </Row>
        ) : null}

        {!isParticipantsLoading && participants.length ? (
          <>
            {participants.map(
              ({ account, twitter, nanoCafe, representative, nanoBrowserQuest, payout }) => (
                <Row gutter={6} key={account}>
                  <Col xs={24} lg={8}>
                    <Link
                      to={`/account/${account}`}
                      style={{ fontSize: "14px" }}
                      className="break-word"
                    >
                      {account}
                    </Link>
                  </Col>
                  <Col xs={12} md={6} lg={3} style={{ textAlign: "center" }}>
                    <Space size={[6, 12]}>
                      {isLargeAndLower ? (
                        <>
                          <TwitterOutlined /> Twitter
                        </>
                      ) : null}
                      <Progress isCompleted={twitter !== "0"} />
                    </Space>
                  </Col>
                  <Col xs={12} md={6} lg={3} style={{ textAlign: "center" }}>
                    <Space size={6}>
                      {isLargeAndLower ? <Text>NanoCafe.cc</Text> : null}
                      <Progress hash={nanoCafe} />
                    </Space>
                  </Col>
                  <Col xs={12} md={6} lg={3} style={{ textAlign: "center" }}>
                    <Space size={6}>
                      {isLargeAndLower ? <Text>Representative</Text> : null}
                      <Progress hash={representative} />
                    </Space>
                  </Col>
                  <Col xs={12} md={6} lg={3} style={{ textAlign: "center" }}>
                    <Space size={6}>
                      {isLargeAndLower ? <Text>NanoBrowserQuest</Text> : null}
                      <Progress hash={nanoBrowserQuest} />
                    </Space>
                  </Col>
                  <Col xs={24} md={6} lg={4} style={{ textAlign: "center" }}>
                    {payout && payout !== "0" ? (
                      <Link to={`block/${payout}`} className="truncate">
                        {payout}
                      </Link>
                    ) : (
                      "Waiting for completion"
                    )}
                  </Col>
                </Row>
              ),
            )}

            {!account && perPage ? (
              <Row className="row-pagination">
                <Col xs={24} style={{ textAlign: "right" }}>
                  <Pagination
                    size="small"
                    {...{
                      total,
                      pageSize: perPage,
                      current: currentPage,
                      disabled: false,
                      onChange: (page: number) => {
                        const element = document.getElementById("treasure-hunt-title");
                        element?.scrollIntoView();

                        setCurrentPage?.(page);
                      },
                      showSizeChanger: false,
                    }}
                  />
                </Col>
              </Row>
            ) : null}
          </>
        ) : null}
      </Card>
    </>
  );
};

export default Participants;
