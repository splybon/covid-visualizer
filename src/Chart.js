import React, { useState, useRef } from "react";
import useRawData from "./hooks/useRawData";
import { HorizontalBar } from "react-chartjs-2";
import {
  initialDayStr,
  finalDayStr,
  dateFormat,
  columnOptions,
} from "./constants";
import moment from "moment";

const dataSetDefault = {};

const sortByCount = (a, b) => {
  if (Number(a.count) > Number(b.count)) return -1;
  if (Number(b.count) > Number(a.count)) return 1;

  return 0;
};

const dataForDate = (data, columnIndex) =>
  data.map((arr) => ({ count: arr[columnIndex], state: arr[0] }));

const genData = (rawData, date, column) => {
  const columnIndex = rawData[initialDayStr][0].indexOf(column);
  const sortedData = dataForDate(rawData[date].slice(1), columnIndex)
    .sort(sortByCount)
    .slice(0, 10);
  return {
    labels: sortedData.map(({ state }) => state),
    datasets: [
      {
        ...dataSetDefault,
        label: column,
        data: sortedData.map(({ count }) => count),
      },
    ],
  };
};

const Chart = () => {
  const { rawData } = useRawData();
  const currentDate = useRef(initialDayStr);
  const timeoutRef = useRef(null);
  const [data, setData] = useState(null);
  const [column, setColumn] = useState("Deaths");

  const runCycle = () => {
    if (!rawData) return;
    setData(genData(rawData, currentDate.current, column));
    const newDate = moment(currentDate.current).add(1, "days");
    currentDate.current = newDate.format(dateFormat);
  };

  const timeout = () => {
    runCycle();
    if (moment(currentDate.current) < moment(finalDayStr)) {
      timeoutRef.current = setTimeout(timeout, 500);
    }
  };

  return (
    <div>
      <h2>Charts by state</h2>
      <select
        value={column}
        onChange={(event) => setColumn(event.target.value)}
      >
        {columnOptions.map(({ label, value }) => (
          <option value={value}>{label}</option>
        ))}
      </select>{" "}
      <button
        onClick={() => {
          clearTimeout(timeoutRef.current);
          currentDate.current = initialDayStr;
          timeout();
        }}
      >
        Run
      </button>
      <h5>Date: {currentDate.current}</h5>
      {data && <HorizontalBar data={data} />}
    </div>
  );
};

export default Chart;
