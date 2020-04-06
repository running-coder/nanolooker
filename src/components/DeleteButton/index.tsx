import React from "react";
import { CloseCircleTwoTone, CloseCircleOutlined } from "@ant-design/icons";
import { TwoToneColors } from "components/utils";
import { Theme, PreferencesContext } from "api/contexts/Preferences";

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
        <CloseCircleTwoTone
          twoToneColor={
            theme === Theme.DARK ? TwoToneColors.SEND_DARK : TwoToneColors.SEND
          }
        />
      ) : (
        <CloseCircleOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />
      )}
    </div>
  );
};

export default DeleteButton;
