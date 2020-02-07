import React from "react";
import { Link } from "react-router-dom";
import { Button, Card, Col, Row, Table, Tag, Typography } from "antd";
import TimeAgo from "timeago-react";
import BigNumber from "bignumber.js";
import { rawToRai } from "components/utils";
import { Color } from "components/Price";

export enum TypeColors {
  CHANGE = "purple",
  PENDING = "blue",
  SEND = "red",
  RECEIVE = "green"
}

const { Text } = Typography;

export const TransactionsLayout: React.FunctionComponent = ({ children }) => (
  <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
    <Col span={24}>
      <Card size="small" bodyStyle={{ padding: 0 }}>
        {children}
      </Card>
    </Col>
  </Row>
);

interface TransactionsTableProps {
  data: any;
  isLoading: boolean;
  showPaginate: boolean;
  isPaginated: boolean;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: Function;
  setCurrentHead?: Function | null;
}

const TransactionsTable = ({
  data,
  isLoading,
  showPaginate,
  isPaginated,
  pageSize,
  currentPage,
  totalPages,
  setCurrentPage,
  setCurrentHead
}: TransactionsTableProps) => (
  <TransactionsLayout>
    <Table
      loading={isLoading}
      pagination={
        showPaginate && isPaginated
          ? {
              total: totalPages,
              pageSize,
              current: currentPage,
              disabled: false,
              onChange: (page: number) => {
                setCurrentPage(page);
              }
            }
          : false
      }
      footer={
        showPaginate && !isPaginated && setCurrentHead
          ? () => (
              // @ts-ignore
              <Button onClick={setCurrentHead}>Load more transactions</Button>
            )
          : undefined
      }
      // @ts-ignore
      rowKey={record => record.hash}
      // @ts-ignore
      columns={[
        {
          title: "Type",
          dataIndex: "subtype",
          render: (text: string, { type }) => (
            <Tag
              // @ts-ignore
              color={TypeColors[(text || type).toUpperCase()]}
              style={{ textTransform: "capitalize" }}
            >
              {text || type}
            </Tag>
          )
        },
        {
          title: "Account / Block",
          dataIndex: "account",
          className: "truncate",
          render: (text: string, { representative, hash }) => (
            <>
              <Link
                to={`/account/${text || representative}`}
                className="color-normal"
              >
                {text || representative}
              </Link>
              <br />
              <Link to={`/block/${hash}`} className="color-muted">
                {hash}
              </Link>
            </>
          )
        },
        {
          title: "Amount",
          dataIndex: "amount",
          render: (text: string, { subtype: recordSubtype, type }) => {
            let color = undefined;
            const subtype = recordSubtype || type;
            if (!text) {
              color = subtype === "change" ? "#722ed1" : undefined;
            } else {
              color = subtype === "send" ? Color.NEGATIVE : Color.POSITIVE;
            }

            return (
              <Text style={{ color }}>
                {!text ? "N/A" : ""}
                {["receive", "open"].includes(subtype) ? "+" : ""}
                {subtype === "send" ? "-" : ""}
                {text ? `${new BigNumber(rawToRai(text)).toFormat()} NANO` : ""}
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
                <TimeAgo datetime={modifiedTimestamp} live={false} />
              </>
            ) : (
              "Unknown"
            );
          }
        }
      ]}
      dataSource={data || undefined}
    />
  </TransactionsLayout>
);

export default TransactionsTable;
