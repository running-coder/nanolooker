import * as React from "react";

import { CloseCircleFilled, CloseCircleOutlined, CloseCircleTwoTone } from "@ant-design/icons";

import { PreferencesContext, Theme } from "api/contexts/Preferences";
import { Colors, TwoToneColors } from "components/utils";

const DeleteButton = (props: any) => {
  const { theme } = React.useContext(PreferencesContext);
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ marginLeft: "auto", cursor: "pointer" }}
    >
      {isHovered ? (
        theme === Theme.DARK ? (
          <CloseCircleFilled style={{ color: Colors.SEND_DARK }} />
        ) : (
          <CloseCircleTwoTone twoToneColor={TwoToneColors.SEND} />
        )
      ) : theme === Theme.DARK ? (
        <CloseCircleFilled style={{ color: "gray" }} />
      ) : (
        <CloseCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
      )}
    </div>
  );
};

export default DeleteButton;
