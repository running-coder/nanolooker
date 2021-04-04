import type { SORT_BY } from "pages/LargeTransactions";

export interface PageParams {
  account?: string;
  block?: string;
  feed?: string;
  sortBy?: SORT_BY;
  section?: string;
}
