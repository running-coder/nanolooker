import React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { AutoComplete, Dropdown, Input, Menu } from "antd";
import {
  WalletOutlined,
  BlockOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import {
  isValidAccountAddress,
  isValidBlockHash,
  getAccountAddressFromText,
  getAccountBlockHashFromText,
} from "components/utils";
import DeleteButton from "components/DeleteButton";

import useSearch from "./hooks/use-search";
import useSearchHistory from "./hooks/use-search-history";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { KnownAccount, KnownAccountsContext } from "api/contexts/KnownAccounts";

const { Search: SearchAnt } = Input;

const Search = () => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [filteredResults, setFilteredResults] = React.useState([] as any);
  const { searchValue, setSearchValue } = useSearch();
  const {
    searchHistory,
    addSearchHistory,
    removeSearchHistory,
  } = useSearchHistory();

  let history = useHistory();

  const validateSearch = React.useCallback(
    async (value: any) => {
      if (!value) {
        setIsError(false);
        setFilteredResults([]);
      } else {
        const isValidAccount = isValidAccountAddress(value);
        const isValidBlock = isValidBlockHash(value);

        setIsError(!isValidAccount && !isValidBlock);

        if (isValidAccount) {
          addSearchHistory(value);
          history.push(`/account/${value}`);
        } else if (isValidBlock) {
          addSearchHistory(value);
          history.push(`/block/${value}`);
        } else {
          const filteredKnownAccounts = knownAccounts
            .filter(({ alias }) =>
              alias.toLowerCase().includes(value.toLowerCase()),
            )
            .map(item => renderItem(item));

          setFilteredResults(filteredKnownAccounts);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addSearchHistory, knownAccounts],
  );

  React.useEffect(() => {
    validateSearch(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const renderItem = ({ alias, account }: KnownAccount) => ({
    value: account,
    label: (
      <>
        <strong style={{ display: "block" }}>{alias}</strong>
        {account}
      </>
    ),
  });

  return (
    <AutoComplete
      style={{
        float: isExpanded ? "right" : "none",
        maxWidth: "calc(100vw - 40px)",
        width: isExpanded ? "650px" : "100%",
        // transitionDelay: `${isExpanded ? 0 : 0.2}s`,
      }}
      dropdownClassName={`search-autocomplete-dropdown ${
        theme === Theme.DARK ? "theme-dark" : ""
      }`}
      dropdownStyle={{
        maxWidth: "calc(100vw - 40px)",
      }}
      options={filteredResults}
      // @ts-ignore
      onSelect={validateSearch}
      onChange={value => {
        setSearchValue(value);
      }}
      value={searchValue}
    >
      <SearchAnt
        allowClear
        suffix={
          <Dropdown
            key="search-history-dropdown"
            overlayStyle={{ zIndex: 1050 }}
            overlayClassName={theme === Theme.DARK ? "theme-dark" : ""}
            overlay={
              <Menu>
                {!searchHistory.length ? (
                  <Menu.Item disabled>{t("search.noHistory")}</Menu.Item>
                ) : (
                  searchHistory.map(history => (
                    <Menu.Item
                      onClick={() => setSearchValue(history)}
                      key={history}
                    >
                      <div
                        className="color-normal"
                        style={{ display: "flex", alignItems: "flex-start" }}
                      >
                        <div>
                          {isValidAccountAddress(history) ? (
                            <WalletOutlined />
                          ) : (
                            <BlockOutlined />
                          )}
                        </div>
                        <div
                          className="break-word"
                          style={{ margin: "0 6px", whiteSpace: "normal" }}
                        >
                          {history}
                        </div>
                        <DeleteButton
                          onClick={(e: Event) => {
                            e.stopPropagation();
                            removeSearchHistory(history);
                          }}
                        />
                      </div>
                    </Menu.Item>
                  ))
                )}
              </Menu>
            }
            placement="bottomRight"
          >
            <HistoryOutlined style={{ padding: "6px", marginRight: "6px" }} />
          </Dropdown>
        }
        className={isError ? "has-error" : ""}
        placeholder={t("search.searchBy")}
        onFocus={() => setIsExpanded(true)}
        onBlur={() => setIsExpanded(false)}
        onPaste={e => {
          e.preventDefault();

          // @ts-ignore
          const paste = (e.clipboardData || window.clipboardData).getData(
            "text",
          );
          const account = getAccountAddressFromText(paste);
          if (account) {
            setSearchValue(account);
          } else {
            const hash = getAccountBlockHashFromText(paste);
            if (hash) {
              setSearchValue(hash);
            }
          }
        }}
        onSearch={value => {
          value !== searchValue ? setSearchValue(value) : validateSearch(value);
        }}
      />
    </AutoComplete>
  );
};

export default Search;
