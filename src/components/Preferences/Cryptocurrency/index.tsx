import React from "react";
import { AutoComplete, Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PreferencesContext } from "api/contexts/Preferences";
import DeleteButton from "components/DeleteButton";
import dataSource from "./supported-cryptocurrency.json";

const { Option } = AutoComplete;
const { Text } = Typography;

const CryptocurrencyPreferences: React.FC = () => {
  const {
    cryptocurrency,
    addCryptocurrency,
    removeCryptocurrency,
    reorderCryptocurrency
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
      disabled={cryptocurrency.includes(symbol) || symbol === "nano"}
    >
      <img
        src={`/cryptocurrencies/logo/${symbol}.png`}
        alt={name}
        width="16px"
        height="16px"
        style={{ marginRight: "6px" }}
      />
      {name}
    </Option>
  ));

  const reorder = (list: string[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: any) => {
    const items = reorder(
      cryptocurrency,
      result.source.index,
      result.destination.index
    );
    reorderCryptocurrency(items);
  };

  return (
    <div>
      <Text style={{ marginBottom: "6px", display: "block" }}>
        Watch other cryptocurrencies
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
        placeholder="Search"
      >
        {options}
      </AutoComplete>

      {cryptocurrency.length ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="hello">
            {(provided, snapshot) => (
              <ul
                style={{
                  margin: 0,
                  padding: "6px",
                  marginTop: "6px",
                  backgroundColor: snapshot.isDraggingOver
                    ? "#1890ff24"
                    : "#f6f6f6",
                  listStyle: "none"
                }}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {cryptocurrency.map((symbol, index) => {
                  const { name = "" } =
                    dataSource.find(
                      ({ symbol: sourceSymbol }) => sourceSymbol === symbol
                    ) || {};
                  return (
                    <Draggable draggableId={name} index={index} key={name}>
                      {provided => (
                        <li
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              padding: "6px",
                              marginTop: "-1px",
                              backgroundColor: "#fff",
                              ...(index !== cryptocurrency.length - 1
                                ? { marginBottom: "6px" }
                                : { marginBottom: "-1px" })
                            }}
                          >
                            <span>
                              <img
                                src={`/cryptocurrencies/logo/${symbol}.png`}
                                alt={name}
                                width="16px"
                                height="16px"
                                style={{ marginRight: "6px" }}
                              />
                              {name}
                            </span>
                            <DeleteButton
                              onClick={(e: Event) => {
                                e.stopPropagation();
                                removeCryptocurrency(symbol);
                              }}
                            />
                          </div>
                        </li>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      ) : null}
    </div>
  );
};

export default CryptocurrencyPreferences;
