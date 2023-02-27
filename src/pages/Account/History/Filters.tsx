import * as React from "react";
import { useTranslation, Trans } from "react-i18next";
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
import moment from "moment";
import { useForm, Controller } from "react-hook-form";

import { TwoToneColors } from "components/utils";
import { Theme, PreferencesContext } from "api/contexts/Preferences";
import { AccountHistoryFilterContext } from "api/contexts/AccountHistoryFilter";
import QuestionCircle from "components/QuestionCircle";

import Export from "./Export";

import type { Subtype } from "types/transaction";
import type { RangePickerProps } from "antd/es/date-picker";
import type { Moment } from "moment";

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

type IncludeExclude = "include" | "exclude";

export interface HistoryFilters {
  subType: Subtype[];
  senderType: IncludeExclude;
  sender?: string;
  dateRange: [any, any] | null;
  receiverType: IncludeExclude;
  receiver?: string;
  minAmount?: number;
  maxAmount?: number;
  fromHeight?: number;
  toHeight?: number;
  includeNoTimestamp?: boolean;
  excludeUnknownAccounts?: boolean;
  reverse?: boolean;
  sum?: boolean;
}

const Filters: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, setFilters } = React.useContext(
    AccountHistoryFilterContext,
  );

  const [options] = React.useState(
    [
      { value: "send" },
      { value: "receive" },
      { value: "change" },
      { value: "open" },
      { value: "epoch" },
    ].map(option => ({
      // @TODO update on language change
      label: <Trans i18nKey={`transaction.${option.value}`} />,
      value: option.value as Subtype,
    })),
  );

  const defaultFilters = {
    subType: Object.values(options)
      .filter(option => !["open", "epoch"].includes(option.value))
      .map(({ value }) => value),
    senderType: "include",
    sender: "",
    dateRange: null,
    receiverType: "include",
    receiver: "",
    minAmount: undefined,
    maxAmount: undefined,
    fromHeight: undefined,
    toHeight: undefined,
    includeNoTimestamp: true,
    excludeUnknownAccounts: false,
    reverse: false,
    sum: false,
  } as HistoryFilters;

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    defaultValues: defaultFilters,
    mode: "onChange",
  });

  const onSubmit = (rawFilters: HistoryFilters) => {
    const { dateRange, ...rest } = rawFilters;

    const filters = {
      dateRange:
        dateRange?.map((date: Moment | null) => date?.format("x")) || null,
      ...rest,
    };

    setFilters(filters);
  };

  const disabledDate: RangePickerProps["disabledDate"] = current =>
    current && current > moment().endOf("day");

  return (
    <Card size="small">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row
          gutter={[{ xs: 6, sm: 12, md: 12, lg: 12 }, 12]}
          style={isLoading ? { opacity: 0.6, pointerEvents: "none" } : {}}
        >
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
            <div style={{ marginTop: 6 }}>
              <Text>
                {t("pages.block.sender")}
                <Tooltip placement="right" title={t("tooltips.senderFilter")}>
                  <QuestionCircle />
                </Tooltip>
              </Text>
            </div>
            <Input.Group compact style={{ display: "flex" }}>
              <Select
                defaultValue="include"
                onChange={(senderType: IncludeExclude) => {
                  setValue("senderType", senderType);
                }}
              >
                <Option value="include">{t("common.include")}</Option>
                <Option value="exclude">{t("common.exclude")}</Option>
              </Select>
              <Controller
                render={({ field }) => (
                  <Input
                    {...field}
                    style={{ flexGrow: 1 }}
                    placeholder="nano_"
                  />
                )}
                control={control}
                name="sender"
              />
            </Input.Group>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <div>
              <Text>{t("pages.account.dateRange")}</Text>
            </div>
            <Controller
              render={({ field }) => (
                // @ts-ignore
                <RangePicker
                  {...field}
                  style={{ width: "100%" }}
                  defaultPickerValue={[
                    moment().add(-1, "month"),
                    moment().add(-1, "month"),
                  ]}
                  placeholder={[
                    t("pages.account.startDate"),
                    t("pages.account.endDate"),
                  ]}
                  allowEmpty={[true, true]}
                  disabledDate={disabledDate}
                />
              )}
              control={control}
              name="dateRange"
            />
            <div style={{ marginTop: 6 }}>
              <Text>
                {t("pages.block.receiver")}
                <Tooltip placement="right" title={t("tooltips.receiverFilter")}>
                  <QuestionCircle />
                </Tooltip>
              </Text>
            </div>
            <Input.Group compact style={{ display: "flex" }}>
              <Select
                defaultValue="include"
                onChange={(receiverType: IncludeExclude) => {
                  setValue("receiverType", receiverType);
                }}
              >
                <Option value="include">{t("common.include")}</Option>
                <Option value="exclude">{t("common.exclude")}</Option>
              </Select>
              <Controller
                render={({ field }) => (
                  <Input
                    {...field}
                    style={{ flexGrow: 1 }}
                    placeholder="nano_"
                  />
                )}
                control={control}
                name="receiver"
              />
            </Input.Group>
          </Col>
          <Col xs={24} sm={12} md={8} lg={5}>
            <Text>{t("transaction.amount")}</Text>

            <Input.Group compact style={{ width: "100%" }}>
              <Controller
                render={({ field }) => (
                  <Input
                    {...field}
                    style={{ width: "44%" }}
                    placeholder={t("pages.account.minimum")}
                    type="number"
                    min="0"
                  />
                )}
                control={control}
                name="minAmount"
              />
              <Input
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
              <Controller
                render={({ field }) => (
                  <Input
                    {...field}
                    style={{
                      width: "45%",
                    }}
                    placeholder={t("pages.account.minimum")}
                    type="number"
                    min="0"
                  />
                )}
                control={control}
                name="maxAmount"
              />
            </Input.Group>
            <div style={{ marginTop: 6 }}>
              <Text>{t("pages.block.height")}</Text>
            </div>
            <Input.Group compact style={{ width: "100%" }}>
              <Controller
                render={({ field }) => (
                  <Input
                    {...field}
                    style={{ width: "44%" }}
                    placeholder={t("pages.account.from")}
                    type="number"
                    step={1}
                    min="0"
                  />
                )}
                control={control}
                name="fromHeight"
              />
              <Input
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
              <Controller
                render={({ field }) => (
                  <Input
                    {...field}
                    style={{
                      width: "45%",
                    }}
                    placeholder={t("pages.account.to")}
                    type="number"
                    step={1}
                    min="0"
                  />
                )}
                control={control}
                name="toHeight"
              />
            </Input.Group>
          </Col>
          <Col xs={24} sm={12} md={12} lg={6}>
            <div>
              <Text>{t("pages.account.advancedOptions")}</Text>
            </div>
            <Controller
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  {t("pages.account.includeNoTimestamp")}
                </Checkbox>
              )}
              control={control}
              name="includeNoTimestamp"
            />
            <Tooltip
              placement="right"
              title={t("tooltips.unknownTransactionDate")}
            >
              <QuestionCircle style={{ marginLeft: 0 }} />
            </Tooltip>
            <br />
            <Controller
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  {t("pages.account.excludeUnknownAccounts")}
                </Checkbox>
              )}
              control={control}
              name="excludeUnknownAccounts"
            />
            <br />
            <Controller
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  {t("pages.account.reverse")}
                </Checkbox>
              )}
              control={control}
              name="reverse"
            />
            <br />
            <Controller
              render={({ field }) => (
                <Checkbox {...field} checked={field.value}>
                  {t("pages.account.sumAmounts")}
                </Checkbox>
              )}
              control={control}
              name="sum"
            />
          </Col>
          <Col xs={24} sm={24} md={12} lg={3}>
            <div style={{ textAlign: "right" }}>
              <Button
                type={isDirty ? "primary" : "default"}
                loading={isLoading}
                disabled={!isValid}
                onClick={handleSubmit(onSubmit)}
              >
                {t("pages.account.applyFilters")}
              </Button>
              <div style={{ marginTop: 12 }}>
                <Export />
              </div>
            </div>
          </Col>
        </Row>
      </form>
    </Card>
  );
};

export default Filters;
