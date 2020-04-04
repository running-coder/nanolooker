import React from "react";
import { Select, Typography } from "antd";
import { PreferencesContext } from "api/contexts/Preferences";

const { Option } = Select;
const { Text } = Typography;

const LanguagePreferences: React.FC = () => {
  const { language, setLanguage } = React.useContext(PreferencesContext);

  return (
    <>
      <Text style={{ marginRight: "12px" }}>Select language</Text>
      <Select
        disabled
        defaultValue={language}
        onChange={value => {
          setLanguage(value);
        }}
      >
        <Option value="en">English</Option>
        <Option value="fr">Français</Option>
      </Select>
    </>
  );
};

export default LanguagePreferences;
