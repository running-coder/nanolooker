import React from "react";
import { AutoComplete, List, Typography } from "antd";
import { PreferencesContext } from "api/contexts/Preferences";
import DeleteHistory from "components/Search/DeleteHistory";
import dataSource from "./supported-cryptocurrency.json";

const { Option } = AutoComplete;
const { Text } = Typography;

const CryptocurrencyPreferences: React.FC = () => {
  const {
    cryptocurrency,
    addCryptocurrency,
    removeCryptocurrency
  } = React.useContext(PreferencesContext);
  const [search, setSearch] = React.useState<string>("");

  const onSearch = (value: string) => {
    setSearch(value);
  };

  const onSelect = (value: string) => {
    const { symbol = "" } = dataSource.find(({ name }) => name === value) || {};

    addCryptocurrency(symbol);
    setSearch("");
  };

  const options = dataSource.map(({ name, symbol }) => (
    <Option
      key={name}
      value={name}
      symbol={symbol}
      disabled={cryptocurrency.includes(symbol) || symbol === 'nano'}
    >
      <img
        src={`/cryptocurrencies/logo/${symbol}.png`}
        alt={name}
        width="16px"
        height="16px"
        style={{ marginRight: "3px" }}
      />
      {name}
    </Option>
  ));

  return (
    <div>
      <Text style={{ marginBottom: "6px", display: "block" }}>
        Cryptocurrency price watchers
      </Text>

      <AutoComplete
        value={search}
        style={{ width: "250px" }}
        filterOption={(value = "", option) => {
          const { value: name, symbol } = option as any;

          return (
            name.toLowerCase().includes(value.toLowerCase()) ||
            symbol.toLowerCase().includes(value.toLowerCase())
          );
        }}
        onSearch={onSearch}
        onSelect={onSelect}
        placeholder="Search crypto currencies"
      >
        {options}
      </AutoComplete>

      {cryptocurrency.length ? (
        <ul style={{ margin: 0, padding: 0 }}>
          <List size="small">
            {cryptocurrency.map(symbol => {
              const { name = "" } =
                dataSource.find(
                  ({ symbol: sourceSymbol }) => sourceSymbol === symbol
                ) || {};
              return (
                <List.Item key={name}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%"
                    }}
                  >
                    <span>
                      <img
                        src={`/cryptocurrencies/logo/${symbol}.png`}
                        alt={name}
                        width="16px"
                        height="16px"
                        style={{ marginRight: "3px" }}
                      />
                      {name}
                    </span>
                    <DeleteHistory
                      onClick={(e: Event) => {
                        e.stopPropagation();
                        removeCryptocurrency(symbol);
                      }}
                    />
                  </div>
                </List.Item>
              );
            })}
          </List>
        </ul>
      ) : null}
    </div>
  );
};

export default CryptocurrencyPreferences;
