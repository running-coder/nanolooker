export type ConfirmationType = "active_quorum";

export type Type = "state" & Subtype;
export type Subtype = "change" | "pending" | "send" | "receive" | "open" | "epoch";

export interface Transaction {
  account: string;
  amount: string;
  block: Block;
  confirmation_type: ConfirmationType;
  hash: string;
  timestamp: number;
  alias?: string;
}

export interface Block {
  account: string;
  balance: string;
  link: string;
  link_as_account: string;
  previous: string;
  representative: string;
  signature: string;
  subtype: Subtype;
  type: Type;
  work: string;
}
