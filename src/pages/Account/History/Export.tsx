import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button, Checkbox, Col, Input, Modal, Row, Select, Tree, Typography } from "antd";
import pick from "lodash/pick";

import { AccountHistoryFilterContext } from "api/contexts/AccountHistoryFilter";
import { rawToRai } from "components/utils";

const { Text } = Typography;
const { Option } = Select;

type ExportKeys = {
  account: boolean;
  subtype: boolean;
  amount: boolean;
  local_timestamp: boolean;
  height: boolean;
  hash: boolean;
  representative: boolean;
  confirmed: boolean;
};

const Export: React.FC = () => {
  const { t } = useTranslation();
  const { history: historyFilter } = React.useContext(AccountHistoryFilterContext);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState(`export`);
  const [delimiter, setDelimiter] = React.useState(",");
  const [values, setValues] = React.useState<ExportKeys>({
    account: true,
    subtype: true,
    amount: true,
    local_timestamp: true,
    height: true,
    hash: true,
    representative: false,
    confirmed: false,
  });

  const exportToCsv = () => {
    setIsLoading(true);

    const formattedDelimiter = delimiter === "s" ? " " : delimiter;

    const header = Object.entries(values)
      .map(([key, value]) => (value ? key : undefined))
      .filter(Boolean) as string[];

    const rows = historyFilter
      .map(history =>
        Object.entries(pick(history, header))
          .map(([key, value]) => {
            if (key === "amount" && value) {
              return rawToRai(value);
            }
            return value;
          })
          .join(formattedDelimiter),
      )
      .join("\r\n");

    const csv = `${header.join(formattedDelimiter)}\r\n${rows}`;
    const fileNameWithCsv = `${fileName}.csv`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", fileNameWithCsv);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setIsLoading(false);
    setIsOpen(false);
  };

  const treeData = Object.entries(values).map(([key, value]) => ({
    key,
    title: (
      <>
        <Checkbox
          checked={value}
          onChange={({ target: { checked } }) =>
            setValues(prevValues => ({ ...prevValues, ...{ [key]: checked } }))
          }
        >
          <Text>{key}</Text>
        </Checkbox>
      </>
    ),
  }));

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{t("pages.account.exportToCsv")}</Button>
      <Modal
        title={t("pages.account.exportTransactions", {
          count: historyFilter.length,
        })}
        open={isOpen}
        onOk={() => exportToCsv()}
        okText={t("pages.account.export")}
        okButtonProps={{
          disabled: !Object.values(values).some(v => v),
        }}
        confirmLoading={isLoading}
        onCancel={() => setIsOpen(false)}
        cancelButtonProps={{
          disabled: isLoading,
        }}
        cancelText={t("common.cancel")}
      >
        <Row>
          <Col xs={24}>
            <div className="tree-container">
              <Tree
                treeData={treeData}
                selectable={false}
                draggable
                onDrop={({ dragNodesKeys, dropPosition }) => {
                  setValues(prevValues => {
                    const currentIndex = Object.keys(prevValues).findIndex(
                      key => key === dragNodesKeys[0],
                    );
                    const order = Object.keys(prevValues);
                    order.splice(
                      dropPosition === -1 ? 0 : dropPosition,
                      0,
                      dragNodesKeys[0] as string,
                    );
                    order.splice(currentIndex + (currentIndex > dropPosition ? 1 : 0), 1);

                    return order.reduce((acc, key) => {
                      // @ts-ignore
                      acc[key] = prevValues[key];
                      return acc;
                    }, {} as ExportKeys);
                  });
                }}
              />
            </div>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <div style={{ marginTop: 6 }}>
              <Text>{t("pages.account.delimiter")}</Text>
            </div>
            <Select
              defaultValue={delimiter}
              onChange={delimiter => {
                setDelimiter(delimiter);
              }}
              style={{ width: "100%" }}
            >
              <Option value=",">{t("pages.account.delimiterComma")} (,)</Option>
              <Option value=";">{t("pages.account.delimiterSemicolon")} (;)</Option>
              <Option value="\t">{t("pages.account.delimiterTab")} (\t)</Option>
              <Option value="s">{t("pages.account.delimiterSpace")} ( )</Option>
              <Option value="|">{t("pages.account.delimiterPipe")} (|)</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ marginTop: 6 }}>
              <Text>{t("pages.account.fileName")}</Text>
            </div>

            <Input
              defaultValue={fileName}
              onChange={({ target: { value } }) => setFileName(value)}
              addonAfter=".csv"
            />
          </Col>
        </Row>
      </Modal>
    </>
  );
};

export default Export;
