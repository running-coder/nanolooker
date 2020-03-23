import React from "react";
import { Skeleton, Statistic } from "antd";

interface LoadingStatisticProps {
  isLoading: boolean;
  title: string;
  value: any;
  prefix?: string;
  valueStyle?: any;
}

const LoadingStatistic = ({
  isLoading,
  title,
  ...rest
}: LoadingStatisticProps) => (
  <>
    {isLoading ? <div className="ant-statistic-title">{title}</div> : null}
    <Skeleton
      loading={isLoading}
      active
      paragraph={false}
      className="isloading-skeleton-width"
    >
      <Statistic title={title} {...rest}></Statistic>
    </Skeleton>
  </>
);

export default LoadingStatistic;
