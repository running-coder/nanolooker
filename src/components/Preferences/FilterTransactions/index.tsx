import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Col, Row, Switch, Typography } from "antd";
import isEqual from "lodash/isEqual";

import { PreferencesContext } from "api/contexts/Preferences";

import { DEFAULT_UNITS, units } from "./utils";

const { Text } = Typography;

interface Props {
  isDetailed?: boolean;
}

const FilterTransactionsPreferences: React.FC<Props> = ({ isDetailed }) => {
  const { t } = useTranslation();
  const { filterTransactions, filterTransactionsRange, setFilterTransactions } =
    React.useContext(PreferencesContext);

  const range = `${units.find(({ raw }) => raw === filterTransactionsRange[1])?.display} - ${
    units.find(({ raw }) => raw === filterTransactionsRange[0])?.display ||
    t("pages.preferences.noLimit")
  }`;

  return (
    <>
      <Row>
        <Col xs={18}>
          <Text style={{ whiteSpace: "nowrap", paddingRight: "18px" }}>
            {isEqual(filterTransactionsRange, DEFAULT_UNITS) ? (
              t("preferences.filterTransactions")
            ) : (
              <>
                {t("preferences.filterTransactionsRange")}
                <br />
                <strong>{range}</strong>
              </>
            )}
          </Text>

          <br />
          <Link to="/preferences" style={{ whiteSpace: "nowrap" }}>
            {t("preferences.filterTransactionsRangeDetailed")}
          </Link>
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
      </Row>
    </>
  );
};

export default FilterTransactionsPreferences;
