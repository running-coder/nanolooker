import * as React from "react";
import { Trans, useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Col, Row, Slider, Switch, Tooltip, Typography } from "antd";

import { PreferencesContext } from "api/contexts/Preferences";
import QuestionCircle from "components/QuestionCircle";

import { units } from "./utils";

const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const FilterTransactionsRangePreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const {
    filterTransactions,
    setFilterTransactions,
    filterTransactionsRange,
    setFilterTransactionsRange,
  } = React.useContext(PreferencesContext);
  const isMediumAndLower = !useMediaQuery({ query: "(min-width: 768px)" });

  const marks = React.useCallback(() => {
    return units.reduce((acc, { unit, raw }, index) => {
      if (raw === 1e30) {
        acc[index] = {
          label: (
            <>
              <strong>{unit}</strong>
              <Tooltip placement="top" title={<Trans i18nKey="tooltips.mnano" />}>
                <QuestionCircle />
              </Tooltip>
            </>
          ),
        };
      } else if (raw === Infinity) {
        acc[index] = {
          label: <Trans i18nKey="pages.preferences.noLimit" />,
        };
      } else {
        if (!isMediumAndLower || raw === 1) {
          acc[index] = unit;
        }
      }

      return acc;
    }, {} as { [key: number]: any });
  }, [isMediumAndLower]);

  return (
    <Row>
      <Col xs={24}>
        <Text className={isDetailed ? "preference-detailed-title" : ""}>
          {t("pages.preferences.filterTransactionsRange")}
        </Text>
      </Col>

      <Col xs={18}>
        <Text>{t("pages.preferences.filterTransactionsRangeDetailed")}</Text>
      </Col>

      <Col xs={6} style={{ textAlign: "right" }}>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          onChange={(checked: boolean) => {
            setFilterTransactions(checked);
          }}
          checked={filterTransactions}
        />
      </Col>
      <Col xs={22} push={1}>
        <Slider
          style={{ marginTop: "18px" }}
          disabled={!filterTransactions}
          dots
          reverse
          marks={marks()}
          min={0}
          max={units.length - 1}
          step={1}
          range
          tipFormatter={value => {
            const { display } = units[value || 0];

            return display || t("pages.preferences.noLimit");
          }}
          defaultValue={[
            units.findIndex(({ raw }) => filterTransactionsRange[0] === raw),
            units.findIndex(({ raw }) => filterTransactionsRange[1] === raw),
          ]}
          onAfterChange={value => {
            setFilterTransactionsRange([units[value[0]].raw, units[value[1]].raw]);
          }}
        />
      </Col>
    </Row>
  );
};

export default FilterTransactionsRangePreferences;
