import * as React from "react";

interface Props {
  account: string;
  style: { [key: string]: string };
}

export const Natricon: React.FC<Props> = ({ account, style }) =>
  account ? (
    <img
      alt="Monkey"
      src={`https://monkey.banano.cc/api/v1/monkey/${account}?svc=bananolooker`}
      style={style}
    />
  ) : null;
