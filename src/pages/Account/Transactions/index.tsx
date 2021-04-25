import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Col,
  Empty,
  Pagination,
  Row,
  Tag,
  Typography,
} from "antd";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import TimeAgo from "timeago-react";
import BigNumber from "bignumber.js";
import { rawToRai } from "components/utils";
import { Colors, TwoToneColors } from "components/utils";
import { Natricon } from "components/Preferences/Natricons/Natricon";
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
  scrollTo?: string;
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
  scrollTo,
  data,
  isLoading,
  showPaginate,
  isPaginated,
  pageSize,
  currentPage,
  totalPages,
  setCurrentPage,
  setCurrentHead,
}: TransactionsTableProps) => {
  const { t } = useTranslation();
  const { theme, natricons } = React.useContext(PreferencesContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);

  const isLargeAndHigher = useMediaQuery("(min-width: 992px)");
  const smallNatriconSize = !useMediaQuery("(min-width: 768px)");

  return (
    <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
      <Col xs={24}>
        <Card size="small" className="transaction-card" id={scrollTo}>
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
                {t("transaction.type")}
              </Col>
              {natricons ? <Col xs={0} lg={2}></Col> : null}
              <Col xs={0} lg={natricons ? 12 : 14}>
                {t("transaction.accountAndBlock")}
              </Col>
              <Col xs={0} lg={5}>
                {t("transaction.amount")}
              </Col>
              <Col xs={0} lg={3} style={{ textAlign: "right" }}>
                {t("common.date")}
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
                    account: historyAccount,
                    amount,
                    representative,
                    hash,
                    local_timestamp: localTimestamp,
                  }: History,
                  index: number,
                ) => {
                  const transactionType = subtype || type;
                  const themeColor = `${transactionType.toUpperCase()}${
                    theme === Theme.DARK ? "_DARK" : ""
                  }`;
                  // When transaction is a representative change, the account is the representative
                  const account =
                    subtype === "change" ? representative : historyAccount;
                  const knownAccount =
                    account &&
                    knownAccounts.find(
                      ({ account: knownAccount }) => account === knownAccount,
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
                      <Col xs={natricons ? 12 : 24} md={4} lg={2}>
                        <Tag
                          // @ts-ignore
                          color={TwoToneColors[themeColor]}
                          style={{ textTransform: "capitalize" }}
                          className={`tag-${subtype || type}`}
                        >
                          {t(`transaction.${transactionType}`)}
                        </Tag>
                      </Col>
                      {natricons ? (
                        <Col xs={12} md={2} style={{ textAlign: "right" }}>
                          <Natricon
                            account={account}
                            style={{
                              margin: "-12px -6px -18px -18px ",
                              width: `${smallNatriconSize ? 60 : 80}px`,
                              height: `${smallNatriconSize ? 60 : 80}px`,
                            }}
                          />
                        </Col>
                      ) : null}
                      <Col
                        xs={24}
                        md={natricons ? 18 : 20}
                        lg={natricons ? 12 : 14}
                      >
                        {knownAccount ? (
                          <div className="color-important">
                            {knownAccount.alias}
                          </div>
                        ) : null}
                        <Link
                          to={`/account/${account}`}
                          className="break-word color-normal"
                        >
                          {account}
                        </Link>
                        <br />
                        <Link
                          to={`/block/${hash}`}
                          className="color-muted truncate"
                        >
                          {hash}
                        </Link>
                      </Col>
                      <Col xs={16} md={12} lg={5}>
                        <Text
                          // @ts-ignore
                          style={{ color: Colors[themeColor] }}
                          className="break-word"
                        >
                          {!amount ? t("common.notAvailable") : ""}
                          {["receive", "open"].includes(transactionType)
                            ? "+"
                            : ""}
                          {subtype === "send" ? "-" : ""}
                          {amount
                            ? `${new BigNumber(
                                rawToRai(amount),
                              ).toFormat()} NANO`
                            : ""}
                        </Text>
                      </Col>
                      <Col xs={8} md={12} lg={3} style={{ textAlign: "right" }}>
                        {Number(localTimestamp) ? (
                          <>
                            {modifiedDate.getFullYear()}/
                            {String(modifiedDate.getMonth() + 1).padStart(
                              2,
                              "0",
                            )}
                            /{String(modifiedDate.getDate()).padStart(2, "0")}
                            <br />
                            <TimeAgo
                              style={{ fontSize: "12px" }}
                              className="color-muted"
                              datetime={modifiedTimestamp}
                              live={false}
                            />
                          </>
                        ) : (
                          t("common.unknown")
                        )}
                      </Col>
                    </Row>
                  );
                },
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
                            if (scrollTo) {
                              const element = document.getElementById(scrollTo);
                              element?.scrollIntoView();
                            }

                            setCurrentPage?.(page);
                          },
                          showSizeChanger: false,
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
                        {t("pages.account.loadMoreTransactions")}
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
      </Col>
    </Row>
  );
};

export default TransactionsTable;
