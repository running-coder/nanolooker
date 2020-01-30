import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, Col, Row, Table, Tag, Typography } from "antd";
import { format } from "timeago.js";
import useAccountHistory from "api/hooks/use-account-history";
import { AccountInfoContext } from "api/contexts/AccountInfo";
import { rawToRai } from "components/utils";
import { Color } from "components/Price";

enum TypeColors {
  CHANGE = "purple",
  PENDING = "blue",
  SEND = "red",
  RECEIVE = "green"
}

export const AccountHistoryLayout: React.FunctionComponent = ({ children }) => (
  <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
    <Col span={24}>
      <Card size="small" bodyStyle={{ padding: 0 }}>
        {children}
      </Card>
    </Col>
  </Row>
);

const TRANSACTIONS_PER_PAGE = 25;
const { Text } = Typography;
const AccountHistory = () => {
  const { account, accountInfo } = React.useContext(AccountInfoContext);
  const isPaginated = Number(accountInfo?.block_count) <= 100;
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [currentHead, setCurrentHead] = React.useState<string | undefined>();
  const {
    accountHistory: { history, previous },
    isLoading: isAccountHistoryLoading
  } = useAccountHistory(account, {
    count: String(TRANSACTIONS_PER_PAGE),
    raw: true,
    offset: isPaginated ? (currentPage - 1) * TRANSACTIONS_PER_PAGE : undefined,
    head: !isPaginated ? currentHead : undefined
  });

  return (
    <AccountHistoryLayout>
      <Table
        loading={isAccountHistoryLoading}
        pagination={
          isPaginated
            ? {
                total: Number(accountInfo?.block_count) || 0,
                pageSize: TRANSACTIONS_PER_PAGE,
                current: currentPage,
                disabled: false,
                onChange: (page: number) => {
                  setCurrentPage(page);
                }
              }
            : false
        }
        footer={
          !isPaginated && previous
            ? () => (
                <Button
                  onClick={() => {
                    // @TODO Scroll to top of transaction table
                    setCurrentHead(previous);
                  }}
                >
                  Load more transactions
                </Button>
              )
            : undefined
        }
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
            render: (text: string, { representative, hash }) => (
              <>
                <Link
                  to={`/account/${text || representative}`}
                  className="link-normal"
                >
                  {text || representative}
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
            render: (text: string, { subtype }) => {
              let color = undefined;
              if (!text) {
                color = subtype === "change" ? "#722ed1" : undefined;
              } else {
                color = subtype === "receive" ? Color.POSITIVE : Color.POSITIVE;
              }

              return (
                <Text style={{ color }}>
                  {!text ? "N/A" : ""}
                  {subtype === "receive" ? "+" : ""}
                  {subtype === "send" ? "-" : ""}
                  {text ? `${rawToRai(text)} NANO` : ""}
                </Text>
              );
            }
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
        dataSource={
          history?.length
            ? history.map(newHistory => {
                if (!newHistory.subtype) {
                  // @ts-ignore
                  newHistory.subtype = newHistory.type;
                }
                return newHistory;
              })
            : undefined
        }
      />
    </AccountHistoryLayout>
  );
};

export default AccountHistory;
