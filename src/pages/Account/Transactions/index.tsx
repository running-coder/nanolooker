import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Row,
  Tag,
  Typography
} from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import TimeAgo from "timeago-react";
import BigNumber from "bignumber.js";
import { rawToRai } from "components/utils";
import { Colors, TwoToneColors } from "components/utils";
import { KnownAccountsContext } from "api/contexts/KnownAccounts";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { History } from "api/contexts/AccountHistory";

const { Text } = Typography;

export const TransactionsLayout: React.FC = ({ children }) => (
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
  showPaginate?: boolean;
  isPaginated?: boolean;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
  setCurrentPage?: Function;
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
}: TransactionsTableProps) => {
  const { theme } = React.useContext(PreferencesContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const isLargeAndHigher = useMediaQuery("(min-width: 992px)");

  return (
    <Card size="small" className="transaction-card">
      {isLoading ? (
        <div className="ant-spin-nested-loading">
          <div>
            <div className="ant-spin ant-spin-spinning">
              <span className="ant-spin-dot ant-spin-dot-spin">
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
                <i className="ant-spin-dot-item"></i>
              </span>
            </div>
          </div>
        </div>
      ) : null}
      {isLargeAndHigher ? (
        <Row
          gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}
          className="row-header color-muted"
        >
          <Col xs={0} lg={2}>
            Type
          </Col>
          <Col xs={0} lg={14}>
            Account / Block
          </Col>
          <Col xs={0} lg={5}>
            Amount
          </Col>
          <Col xs={0} lg={3} style={{ textAlign: "right" }}>
            Date
          </Col>
        </Row>
      ) : null}
      {data?.length ? (
        <>
          {data.map(
            (
              {
                subtype,
                type,
                account,
                amount,
                representative,
                hash,
                local_timestamp: localTimestamp
              }: History,
              index: number
            ) => {
              const transactionType = subtype || type;
              const themeColor = `${transactionType.toUpperCase()}${
                theme === Theme.DARK ? "_DARK" : ""
              }`;
              const knownAccount =
                account &&
                knownAccounts.find(
                  ({ account: knownAccount }) => account === knownAccount
                );

              const modifiedTimestamp = Number(localTimestamp) * 1000;
              const modifiedDate = new Date(modifiedTimestamp);

              return (
                <Row
                  key={index}
                  justify="space-between"
                  align="middle"
                  gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}
                >
                  <Col xs={24} md={4} lg={2}>
                    <Tag
                      // @ts-ignore
                      color={TwoToneColors[themeColor]}
                      style={{ textTransform: "capitalize" }}
                    >
                      {transactionType}
                    </Tag>
                  </Col>
                  <Col xs={24} md={20} lg={14}>
                    {knownAccount ? (
                      <div className="color-important">
                        {knownAccount.alias}
                      </div>
                    ) : null}
                    <Link
                      to={`/account/${account || representative}`}
                      className="break-word color-normal "
                    >
                      {account || representative}
                    </Link>
                    <br />
                    <Link
                      to={`/block/${hash}`}
                      className="color-muted truncate"
                    >
                      {hash}
                    </Link>
                  </Col>
                  <Col xs={12} lg={5}>
                    <Text
                      // @ts-ignore
                      style={{ color: Colors[themeColor] }}
                      className="break-word"
                    >
                      {!amount ? "N/A" : ""}
                      {["receive", "open"].includes(transactionType) ? "+" : ""}
                      {subtype === "send" ? "-" : ""}
                      {amount
                        ? `${new BigNumber(rawToRai(amount)).toFormat()} NANO`
                        : ""}
                    </Text>
                  </Col>
                  <Col xs={12} lg={3} style={{ textAlign: "right" }}>
                    {Number(localTimestamp) ? (
                      <>
                        {modifiedDate.getFullYear()}/
                        {String(modifiedDate.getMonth() + 1).padStart(2, "0")}/
                        {String(modifiedDate.getDate()).padStart(2, "0")}
                        <br />
                        <TimeAgo
                          style={{ fontSize: "12px" }}
                          className="color-muted"
                          datetime={modifiedTimestamp}
                          live={false}
                        />
                      </>
                    ) : (
                      "Unknown"
                    )}
                  </Col>
                </Row>
              );
            }
          )}
          {showPaginate ? (
            <Row className="row-pagination">
              {isPaginated ? (
                <Col xs={24} style={{ textAlign: "right" }}>
                  <Pagination
                    size="small"
                    {...{
                      total: totalPages,
                      pageSize,
                      current: currentPage,
                      disabled: false,
                      onChange: (page: number) => {
                        setCurrentPage?.(page);
                      },
                      showSizeChanger: false
                    }}
                  />
                </Col>
              ) : null}
              {!isPaginated && setCurrentHead ? (
                <Col xs={24} style={{ textAlign: "center" }}>
                  <Button
                    // @ts-ignore
                    onClick={setCurrentHead}
                    type={theme === Theme.DARK ? "primary" : "default"}
                  >
                    Load more transactions
                  </Button>
                </Col>
              ) : null}
            </Row>
          ) : null}
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "12px" }}
        />
      )}
    </Card>
  );
};

export default TransactionsTable;
