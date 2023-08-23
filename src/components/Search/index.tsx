import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import {
  BlockOutlined,
  CameraOutlined,
  HistoryOutlined,
  SearchOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Alert, AutoComplete, Button, Dropdown, Input, Menu, Modal } from "antd";

import { BookmarksContext } from "api/contexts/Bookmarks";
import { KnownAccount, KnownAccountsContext } from "api/contexts/KnownAccounts";
import { PreferencesContext, Theme } from "api/contexts/Preferences";
import DeleteButton from "components/DeleteButton";
import {
  getAccountAddressFromText,
  getAccountBlockHashFromText,
  getPrefixedAccount,
  isValidAccountAddress,
  isValidBlockHash,
} from "components/utils";

import useSearch from "./hooks/use-search";
import useSearchHistory from "./hooks/use-search-history";

const Search = ({ isHome = false }) => {
  const { t } = useTranslation();
  const { theme } = React.useContext(PreferencesContext);
  const { knownAccounts } = React.useContext(KnownAccountsContext);
  const { bookmarks } = React.useContext(BookmarksContext);
  const hasAccountBookmarks = !!Object.keys(bookmarks?.account || {}).length;
  const [isExpanded, setIsExpanded] = React.useState(isHome);
  const [isError, setIsError] = React.useState(false);
  const [filteredResults, setFilteredResults] = React.useState([] as any);
  const { searchValue, setSearchValue } = useSearch();
  const [accountBookmarks, setAccountBookmarks] = React.useState<
    { alias: string; account: string }[]
  >([]);
  const { searchHistory, addSearchHistory, removeSearchHistory } = useSearchHistory();
  const searchRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [invalidQrCode, setInvalidQrCode] = React.useState("");

  let history = useHistory();

  const validateSearch = React.useCallback(
    async (value: any) => {
      if (!value) {
        setIsError(false);
        setFilteredResults([]);
      } else {
        const isValidAccount = isValidAccountAddress(value);
        const isValidBlock = isValidBlockHash(value);

        setIsError(!isValidAccount && !isValidBlock && value.length > 30);

        if (isValidBlock) {
          addSearchHistory(value.toUpperCase());
          history.push(`/block/${value.toUpperCase()}`);
        } else if (isValidAccount) {
          let account = getPrefixedAccount(value);

          setSearchValue(account);
          addSearchHistory(account);
          history.push(`/account/${account}`);
        } else {
          const filteredKnownAccounts = knownAccounts
            .filter(({ alias }) => alias.toLowerCase().includes(value.toLowerCase()))
            .map(item => renderItem(item));

          const filteredAccountBookmarks = accountBookmarks
            .filter(({ alias }) => alias.toLowerCase().includes(value.toLowerCase()))
            .map(item => renderItem(item as KnownAccount));

          setFilteredResults(filteredAccountBookmarks.concat(filteredKnownAccounts));
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addSearchHistory, knownAccounts, accountBookmarks],
  );

  React.useEffect(() => {
    if (hasAccountBookmarks) {
      setAccountBookmarks(
        Object.entries(bookmarks?.account).map(([account, alias]) => ({
          account,
          alias,
        })),
      );
    } else {
      setAccountBookmarks([]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccountBookmarks]);

  React.useEffect(() => {
    validateSearch(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  React.useEffect(() => {
    if (!isOpen) return;

    function onScanSuccess(qrMessage: any) {
      if (isValidAccountAddress(qrMessage)) {
        setIsOpen(false);
        setSearchValue(getPrefixedAccount(qrMessage));
        document.getElementById("html5-qrcode-scan-stop-btn")?.click();
      } else {
        setInvalidQrCode(qrMessage);
      }
    }

    const html5QrcodeScanner = new window.Html5QrcodeScanner(
      `qrcode-reader-search${isHome ? "-home" : ""}`,
      {
        fps: 10,
        qrbox: 250,
      },
    );
    html5QrcodeScanner.render(onScanSuccess);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    <>
      <AutoComplete
        style={{
          float: isExpanded ? "right" : "none",
          maxWidth: "calc(100vw - 24px)",
          width: isExpanded ? "650px" : "100%",
          // transitionDelay: `${isExpanded ? 0 : 0.2}s`,
        }}
        popupClassName={`search-autocomplete-dropdown ${theme === Theme.DARK ? "theme-dark" : ""}`}
        dropdownStyle={{
          maxWidth: "calc(100vw - 40px)",
        }}
        options={filteredResults}
        // @ts-ignore
        onSelect={validateSearch}
        onChange={value => {
          setSearchValue(value);
        }}
        // @ts-ignore
        onPaste={e => {
          e.preventDefault();

          // @ts-ignore
          const paste = (e.clipboardData || window.clipboardData).getData("text");

          const account = getAccountAddressFromText(paste);
          const hash = getAccountBlockHashFromText(paste);
          if (account || hash) {
            setSearchValue(account || hash);
          } else {
            setSearchValue(paste);
          }
        }}
        value={searchValue}
      >
        <Input
          ref={searchRef}
          allowClear
          suffix={
            <>
              <CameraOutlined
                onClick={() => setIsOpen(true)}
                className="search-history-icon"
                style={{ padding: "6px", marginRight: "3px" }}
              />
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
                        <Menu.Item onClick={() => setSearchValue(history)} key={history}>
                          <div
                            className="color-normal"
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                            }}
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
                <HistoryOutlined
                  className="search-history-icon"
                  style={{ padding: "6px", marginRight: "6px" }}
                />
              </Dropdown>
              <SearchOutlined />
            </>
          }
          className={`ant-input-search ${isError ? "has-error" : ""}`}
          placeholder={t<string>("search.searchBy")}
          onFocus={({ target: { value } }) => {
            validateSearch(value);
            setIsExpanded(true);
          }}
          onBlur={() => setIsExpanded(isHome || false)}
          size={isHome ? "large" : "middle"}
          spellCheck={false}
        />
      </AutoComplete>
      <Modal
        title={t("search.scanWallet")}
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={[
          <Button key="back" onClick={() => setIsOpen(false)}>
            {t("common.cancel")}
          </Button>,
        ]}
      >
        {invalidQrCode ? (
          <Alert
            message={t("pages.nanoquakejs.invalidAccount")}
            description={invalidQrCode}
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
          />
        ) : null}
        <div id={`qrcode-reader-search${isHome ? "-home" : ""}`} className="qrcode-reader"></div>
      </Modal>
    </>
  );
};

export default Search;
