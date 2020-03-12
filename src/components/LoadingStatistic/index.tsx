import React from "react";
import { Skeleton } from "antd";

interface LoadingStatisticProps {
  isLoading: boolean;
  title: string;
  children: any;
}

const LoadingStatistic = ({
  isLoading,
  title,
  children
}: LoadingStatisticProps) => (
  <>
    {isLoading ? <div className="ant-statistic-title">{title}</div> : null}
    <Skeleton
      loading={isLoading}
      active
      paragraph={false}
      className="isloading-skeleton-width"
    >
      {React.cloneElement(children, { title })}
    </Skeleton>
  </>
);

export default LoadingStatistic;
