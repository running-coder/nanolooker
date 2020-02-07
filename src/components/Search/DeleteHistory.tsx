import React from "react";
import { Icon } from "antd";
import { TwoToneColors } from "components/utils";

const DeleteHistory = (props: any) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ marginLeft: "auto" }}
    >
      <Icon
        type="minus-circle"
        className="delete-history-button"
        theme={isHovered ? "twoTone" : "outlined"}
        twoToneColor={TwoToneColors.SEND}
      />
    </div>
  );
};

export default DeleteHistory;
