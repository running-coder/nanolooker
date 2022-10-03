import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Input,
  Row,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { useForm, Controller } from "react-hook-form";
// import useMediaQuery from "@material-ui/core/useMediaQuery";
import { TwoToneColors } from "components/utils";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import QuestionCircle from "components/QuestionCircle";

import type { Subtype } from "types/transaction";
import type { CheckboxChangeEvent } from "antd/es/checkbox";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TagRender = (props: any) => {
  const { label, value, closable, onClose } = props;
  const { theme } = React.useContext(PreferencesContext);
  const themeColor = `${value.toUpperCase()}${
    theme === Theme.DARK ? "_DARK" : ""
  }`;

  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      // @ts-ignore
      color={TwoToneColors[themeColor]}
      style={{ textTransform: "capitalize" }}
      className={`tag-${value}`}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
    >
      {label}
    </Tag>
  );
};

const TransactionsFilters = () => {
  const { t } = useTranslation();

  // const isLargeAndHigher = useMediaQuery("(min-width: 992px)");

  const [isIncludeNoTimestamp, setIsIncludeNoTimestamp] = React.useState(true);
  const [options] = React.useState(
    [
      { value: "send" },
      { value: "receive" },
      { value: "change" },
      { value: "open" },
    ].map(option => ({
      // @TODO update on language change
      label: t(`transaction.${option.value}`),
      value: option.value as Subtype,
    })),
  );

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      subType: Object.values(options)
        .filter(option => option.value !== "open")
        .map(({ value }) => value),
    },
    mode: "onChange",
  });

  const onChange = ({ target: { checked } }: CheckboxChangeEvent) => {
    setIsIncludeNoTimestamp(checked);
    console.log(`checked = ${checked}`);
  };

  const onSubmit = (data: any) => {
    console.log("~~~~data", data);
  };

  return (
    <Card size="small">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}>
          <Col xs={24} sm={12} md={8} lg={5}>
            <div>
              <Text>{t("pages.block.blockSubtype")}</Text>
            </div>
            <Controller
              render={({ field }) => (
                <Select
                  {...field}
                  style={{ width: "100%" }}
                  mode="multiple"
                  showArrow
                  tagRender={TagRender}
                  options={options}
                />
              )}
              control={control}
              name="subType"
            />
            <div>
              <Text>
                {t("pages.block.sender")}
                <Tooltip placement="right" title={t("tooltips.senderFilter")}>
                  <QuestionCircle />
                </Tooltip>
              </Text>
            </div>
            <Input.Group compact style={{ display: "flex" }}>
              <Select defaultValue="include">
                <Option value="include">{t("common.include")}</Option>
                <Option value="exclude">{t("common.exclude")}</Option>
              </Select>
              <Input style={{ flexGrow: 1 }} placeholder="nano_" />
            </Input.Group>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <div>
              <Text>{t("pages.account.dateRange")}</Text>
            </div>
            <RangePicker style={{ width: "100%" }} />
            <div>
              <Text>
                {t("pages.block.receiver")}
                <Tooltip placement="right" title={t("tooltips.receiverFilter")}>
                  <QuestionCircle />
                </Tooltip>
              </Text>
            </div>
            <Input.Group compact style={{ display: "flex" }}>
              <Select defaultValue="include">
                <Option value="include">{t("common.include")}</Option>
                <Option value="exclude">{t("common.exclude")}</Option>
              </Select>
              <Input style={{ flexGrow: 1 }} placeholder="nano_" />
            </Input.Group>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <div>
              <Text>
                {t("transaction.amount")}
                <Tooltip placement="right" title={t("tooltips.amountFilter")}>
                  <QuestionCircle />
                </Tooltip>
              </Text>
            </div>
            <Input.Group compact style={{ width: "100%" }}>
              <Input
                style={{ width: "44%" }}
                placeholder="Minimum"
                type="number"
                // onBlur={({ target: {value}}) => {
                //   if (parseFloat(value) < 0.01) {
                //     set
                //   }
                // }}
                // onChange={}
              />
              <Input
                className="site-input-split"
                style={{
                  width: "10%",
                  borderLeft: 0,
                  borderRight: 0,
                  pointerEvents: "none",
                  backgroundColor: "transparent",
                  textAlign: "center",
                }}
                placeholder="-"
                disabled
              />
              <Input
                className="site-input-right"
                style={{
                  width: "45%",
                }}
                placeholder="Maximum"
                type="number"
              />
            </Input.Group>
            <div>
              <Text>{t("pages.block.height")}</Text>
            </div>
            <Input.Group compact style={{ width: "100%" }}>
              <Input
                style={{ width: "44%" }}
                placeholder="Start"
                type="number"
                step={1}
              />
              <Input
                className="site-input-split"
                style={{
                  width: "10%",
                  borderLeft: 0,
                  borderRight: 0,
                  pointerEvents: "none",
                  backgroundColor: "transparent",
                  textAlign: "center",
                }}
                placeholder="-"
                disabled
              />
              <Input
                className="site-input-right"
                style={{
                  width: "45%",
                }}
                placeholder="End"
                type="number"
                step={1}
              />
            </Input.Group>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <div>
              <Text>{t("pages.account.advancedOptions")}</Text>
            </div>
            <Checkbox onChange={onChange} checked={isIncludeNoTimestamp}>
              {t("pages.account.includeNoTimestamp")}
              <Tooltip
                placement="right"
                title={t("tooltips.unknownTransactionDate")}
              >
                <QuestionCircle />
              </Tooltip>
            </Checkbox>
            <br />
            <Checkbox>{t("pages.account.excludeUnknownAccounts")}</Checkbox>
            <br />
            <Checkbox>Only show blocks from exchanges</Checkbox>
          </Col>
          <Col xs={24} sm={24} md={12} lg={3}>
            <div style={{ textAlign: "right" }}>
              <Button
                type="primary"
                // disabled={!isValid}
                onClick={handleSubmit(onSubmit)}
              >
                {t("pages.account.applyFilters")}
              </Button>
              <br />
              <Button>Export to CSV</Button>
            </div>
          </Col>
        </Row>
      </form>
    </Card>
  );
};

export default TransactionsFilters;
