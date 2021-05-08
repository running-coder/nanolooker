import * as React from "react";
import { useTranslation } from "react-i18next";
import { AutoComplete, Col, Row, Typography } from "antd";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { PreferencesContext } from "api/contexts/Preferences";
import DeleteButton from "components/DeleteButton";
import dataSource from "./supported-cryptocurrency.json";

const { Option } = AutoComplete;
const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const CryptocurrencyPreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const {
    cryptocurrency,
    addCryptocurrency,
    removeCryptocurrency,
    reorderCryptocurrency,
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
      disabled={cryptocurrency.includes(symbol) || symbol === "ban"}
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
      result.source?.index || 0,
      result.destination?.index || 0,
    );
    reorderCryptocurrency(items);
  };

  return (
    <Row>
      <Col xs={24}>
        <Text
          className={isDetailed ? "preference-detailed-title" : ""}
          style={{
            display: "block",
            marginBottom: "6px",
          }}
        >
          {t("preferences.watch")}
        </Text>
      </Col>
      {isDetailed ? (
        <Col xs={24} style={{ marginBottom: "6px" }}>
          <Text>{t("preferences.watchDetailed")}</Text>
        </Col>
      ) : null}

      <Col xs={24} md={isDetailed ? 12 : 24}>
        <AutoComplete
          value={search}
          style={{ width: "100%" }}
          filterOption={(value = "", option) => {
            const { value: name, symbol } = option as any;

            return (
              name.toLowerCase().includes(value.toLowerCase()) ||
              symbol.toLowerCase().includes(value.toLowerCase())
            );
          }}
          onSearch={onSearch}
          onSelect={onSelect}
          placeholder={t("preferences.watchSearch")}
        >
          {options}
        </AutoComplete>

        {cryptocurrency.length ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`hello${isDetailed ? "-detailed" : ""}`}>
              {(provided, snapshot) => (
                <ul
                  style={{
                    margin: 0,
                    padding: "6px",
                    marginTop: "6px",
                    backgroundColor: snapshot.isDraggingOver
                      ? "#1890ff24"
                      : "#f6f6f6",
                    listStyle: "none",
                  }}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {cryptocurrency.map((symbol, index) => {
                    const { name = "" } =
                      dataSource.find(
                        ({ symbol: sourceSymbol }) => sourceSymbol === symbol,
                      ) || {};
                    return (
                      <Draggable draggableId={name} index={index} key={name}>
                        {provided => {
                          // https://github.com/atlassian/react-beautiful-dnd/issues/1662#issuecomment-708538811
                          if (
                            typeof provided.draggableProps.onTransitionEnd ===
                            "function"
                          ) {
                            window?.requestAnimationFrame(() =>
                              // @ts-ignore
                              provided?.draggableProps?.onTransitionEnd?.({
                                propertyName: "transform",
                              }),
                            );
                          }

                          return (
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
                                  border: "1px solid #d9d9d9",
                                  ...(index !== cryptocurrency.length - 1
                                    ? { marginBottom: "6px" }
                                    : { marginBottom: "-1px" }),
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
                          );
                        }}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        ) : null}
      </Col>
    </Row>
  );
};

export default CryptocurrencyPreferences;
