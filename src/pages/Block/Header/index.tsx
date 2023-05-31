import * as React from "react";
import { useParams } from "react-router-dom";

import { BlockOutlined } from "@ant-design/icons";

import Copy from "components/Copy";

import type { PageParams } from "types/page";

const BlockHeader: React.FC = () => {
  const { block = "" } = useParams<PageParams>();

  return (
    <>
      <div
        style={{
          display: "flex",
          fontSize: "16px",
          wordWrap: "break-word",
          position: "relative",
        }}
        className="color-normal"
      >
        <div style={{ alignSelf: "baseline" }}>
          <BlockOutlined
            style={{
              fontSize: "18px",
              marginRight: "6px",
            }}
          />
        </div>
        <span className="break-word" style={{ marginRight: "6px" }}>
          <span>{block.substr(block.length * -1, block.length - 64)}</span>
          <span style={{ color: "#1890ff" }}>{block.substr(-64, 7)}</span>
          <span>{block.substr(-57, 50)}</span>
          <span style={{ color: "#1890ff" }}>{block.substr(-7)}</span>
        </span>
        <div
          style={{
            display: "flex",
          }}
        >
          <Copy text={block} />
        </div>
      </div>
    </>
  );
};

export default BlockHeader;
