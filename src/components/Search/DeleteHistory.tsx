import React from "react";
import { Icon } from "antd";

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
        twoToneColor="#eb2f96"
      />
    </div>
  );
};

export default DeleteHistory;
