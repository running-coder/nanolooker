import React from "react";
import { MinusCircleOutlined, MinusCircleTwoTone } from '@ant-design/icons';
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
      {isHovered ? <MinusCircleTwoTone twoToneColor={TwoToneColors.SEND} className="delete-history-button" /> : <MinusCircleOutlined className="delete-history-button" />}
    </div>
  );
};

export default DeleteHistory;
