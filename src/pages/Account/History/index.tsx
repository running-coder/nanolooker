import React from "react";
import { Link, useParams } from "react-router-dom";
import { Card, Col, Row, Table, Tag, Typography } from "antd";
import { format } from "timeago.js";
import useAccountHistory from "api/hooks/use-account-history";
import useAccountInfo from "api/hooks/use-account-info";
import { rawToRai } from "components/utils";

enum TypeColors {
  PENDING = "#1890ff",
  SEND = "red",
  RECEIVE = "green"
}

const TRANSACTIONS_PER_PAGE = 10;
const { Text } = Typography;
const AccountHistory = () => {
  const { account = "" } = useParams();
  const { accountInfo } = useAccountInfo(account);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const {
    accountHistory: { history }
  } = useAccountHistory(account, {
    count: String(TRANSACTIONS_PER_PAGE),
    raw: true,
    offset: (currentPage - 1) * TRANSACTIONS_PER_PAGE
  });

  return (
    <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
      <Col span={24}>
        <Card size="small" bodyStyle={{ padding: 0 }}>
          {history ? (
            <Table
              pagination={{
                total: Number(accountInfo?.block_count) || 0,
                pageSize: TRANSACTIONS_PER_PAGE,
                current: currentPage,
                disabled: false,
                onChange: (page: number) => {
                  setCurrentPage(page);
                }
              }}
              rowKey={record => record.hash}
              columns={[
                {
                  title: "Type",
                  dataIndex: "subtype",
                  render: (text: string) => (
                    <Tag
                      // @ts-ignore
                      color={TypeColors[text.toUpperCase()]}
                      style={{ textTransform: "capitalize" }}
                    >
                      {text}
                    </Tag>
                  )
                },
                {
                  title: "Account / Block",
                  dataIndex: "account",
                  render: (text: string, { hash }) => (
                    <>
                      <Link to={`/account/${text}`} className="link-normal">
                        {text}
                      </Link>
                      <br />
                      <Link to={`/block/${hash}`} className="link-muted">
                        {hash}
                      </Link>
                    </>
                  )
                },
                {
                  title: "Amount",
                  dataIndex: "amount",
                  render: (text: string, { subtype }) => (
                    <Text
                      style={{
                        // @ts-ignore
                        color: TypeColors[subtype.toUpperCase()]
                      }}
                    >
                      {subtype === "send" ? "-" : ""}
                      {rawToRai(text)} NANO
                    </Text>
                  )
                },
                {
                  title: "Date",
                  align: "right",
                  dataIndex: "local_timestamp",
                  render: (text: string) => {
                    const modifiedTimestamp = Number(text) * 1000;
                    const modifiedDate = new Date(modifiedTimestamp);

                    return Number(text) ? (
                      <>
                        {modifiedDate.getFullYear()}/
                        {String(modifiedDate.getMonth() + 1).padStart(2, "0")}/
                        {String(modifiedDate.getDate()).padStart(2, "0")}
                        <br />
                        {format(modifiedTimestamp)}
                      </>
                    ) : (
                      "Unknown"
                    );
                  }
                }
              ]}
              dataSource={history.map(newHistory => {
                if (!newHistory.subtype) {
                  // @ts-ignore
                  newHistory.subtype = newHistory.type;
                }
                return newHistory;
              })}
            />
          ) : (
            "no history"
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default AccountHistory;
