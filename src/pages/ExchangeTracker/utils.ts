export const tagColors = [
  "magenta",
  "red",
  "volcano",
  "orange",
  "gold",
  "lime",
  "green",
  "cyan",
  "blue",
  "geekblue",
  "purple",
  "pink",
];

export const lineColors = [
  "magenta",
  "red",
  "#fa541c",
  "orange",
  "gold",
  "lime",
  "#52c41a",
  "cyan",
  "blue",
  "#2f54eb",
  "#722ed1",
  "pink",
];

export const formatDate = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const year = date.getFullYear();

  return [year, month, day].join("-");
};
