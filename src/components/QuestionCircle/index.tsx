import * as React from "react";

import { QuestionCircleFilled, QuestionCircleTwoTone } from "@ant-design/icons";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { Colors } from "components/utils";

const QuestionCircle = React.forwardRef((props: any, ref) => {
  const { theme } = React.useContext(PreferencesContext);

  return theme === Theme.DARK ? (
    <QuestionCircleFilled style={{ color: Colors.PENDING }} ref={ref} {...props} />
  ) : (
    <QuestionCircleTwoTone ref={ref} {...props} />
  );
});

export default QuestionCircle;
