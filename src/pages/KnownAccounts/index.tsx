import * as React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button, Input, Table, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import BigNumber from "bignumber.js";
import useKnownAccountsBalance from "api/hooks/use-known-accounts-balance";

const { Title } = Typography;

const KnownAccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const { knownAccountsBalance, isLoading } = useKnownAccountsBalance();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <Helmet>
        <title>Banano {t("menu.knownAccounts")}</title>
      </Helmet>
      <Title level={3}>
        {t("pages.knownAccounts.totalAccounts", {
          totalAccounts: knownAccountsBalance.length,
        })}
      </Title>
      <Table
        size="small"
        pagination={false}
        loading={isLoading}
        rowKey={record => record.account}
        columns={[
          {
            title: t("common.balance"),
            dataIndex: "total",
            // @ts-ignore
            defaultSortOrder: "descend",
            // @ts-ignore
            sorter: {
              compare: (a, b) => a.total - b.total,
            },
            render: (text: string) => (
              <span className="break-word">
                {new BigNumber(text).toFormat()} BAN
              </span>
            ),
          },
          {
            title: t("common.alias"),
            dataIndex: "alias",
            filterDropdown: ({
              setSelectedKeys,
              selectedKeys,
              confirm,
              clearFilters,
            }) => (
              <div style={{ padding: 8 }}>
                <Input
                  // @ts-ignore
                  ref={inputRef}
                  placeholder={t("common.searchAlias")}
                  // @ts-ignore
                  value={selectedKeys[0]}
                  onChange={({ target: { value } }) => {
                    setSelectedKeys([value]);
                  }}
                  // @ts-ignore
                  onPressEnter={confirm}
                  style={{ width: 188, marginBottom: 8, display: "block" }}
                />
                <Button
                  type="primary"
                  // @ts-ignore
                  onClick={confirm}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90, marginRight: 8 }}
                >
                  {t("common.search")}
                </Button>
                <Button
                  onClick={() => {
                    clearFilters?.();
                    setSelectedKeys([""]);
                  }}
                  size="small"
                  style={{ width: 90 }}
                >
                  {t("common.reset")}
                </Button>
              </div>
            ),
            filterIcon: filtered => (
              <SearchOutlined
                style={{ color: filtered ? "#1890ff" : undefined }}
              />
            ),
            onFilter: (value, record) =>
              record["alias"]
                .toString()
                .toLowerCase()
                .includes(String(value).toLowerCase()),
            onFilterDropdownVisibleChange: visible => {
              if (visible) {
                setTimeout(() => inputRef?.current?.select());
              }
            },
            // @ts-ignore
            sorter: {
              compare: ({ alias: a }, { alias: b }) => {
                const aLowerCase = a.toLowerCase();
                const bLowerCase = b.toLowerCase();

                if (aLowerCase < bLowerCase) {
                  return -1;
                }
                if (aLowerCase > bLowerCase) {
                  return 1;
                }
                return 0;
              },
            },
            render: (text: string) => (
              <span className="color-important break-word">{text}</span>
            ),
          },
          {
            title: t("common.account"),
            dataIndex: "account",
            render: (text: string) => (
              <>
                <Link
                  to={`/account/${text}`}
                  className="color-normal break-word"
                >
                  {text}
                </Link>
              </>
            ),
          },
        ]}
        dataSource={knownAccountsBalance}
      />
    </>
  );
};

export default KnownAccountsPage;
