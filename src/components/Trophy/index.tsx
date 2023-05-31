import * as React from "react";

import { TrophyTwoTone } from "@ant-design/icons";

const Trophy: React.FC<{ rank: number }> = ({ rank }) => {
  let color: null | string = null;
  if (rank === 1) {
    color = "#ffd700";
  } else if (rank === 2) {
    color = "#c0c0c0";
  } else if (rank === 3) {
    color = "#cd7f32";
  }

  return color ? (
    <TrophyTwoTone twoToneColor={color} style={{ fontSize: fontSizeToRankMap[rank] ?? "auto" }} />
  ) : null;
};

export const fontSizeToRankMap: { [key: number]: string } = {
  1: "18px",
  2: "18px",
  3: "18px",
};

export default Trophy;
