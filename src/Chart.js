import React, { useState, useRef } from "react";
import useRawData from "./hooks/useRawData";
import { HorizontalBar } from "react-chartjs-2";
import "chartjs-plugin-datalabels";
import {
  initialDayStr,
  finalDayStr,
  dateFormat,
  columnOptions,
} from "./constants";
import moment from "moment";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const dataSetDefault = {
  backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],
};

const sortByCount = (a, b) => {
  if (Number(a.count) > Number(b.count)) return -1;
  if (Number(b.count) > Number(a.count)) return 1;

  return 0;
};

const dataForDate = (data, columnIndex) =>
  data.map((arr) => ({ count: Math.round(arr[columnIndex]), state: arr[0] }));

const genData = (rawData, date, column) => {
  const columnIndex = rawData[initialDayStr][0].indexOf(column);
  const sortedData = dataForDate(rawData[date].slice(1), columnIndex)
    .sort(sortByCount)
    .slice(0, 10);
  const label = columnOptions.find((opt) => opt.value === column).label;
  return {
    labels: sortedData.map(({ state }) => state),
    datasets: [
      {
        ...dataSetDefault,
        label,
        data: sortedData.map(({ count }) => count),
      },
    ],
  };
};

const Chart = () => {
  const { loading, rawData } = useRawData();
  const currentDate = useRef(initialDayStr);
  const timeoutRef = useRef(null);
  const [data, setData] = useState(null);
  const [column, setColumn] = useState("Deaths");
  const [speed, setSpeed] = useState(500)
  const [startDate, setStartDate] = useState(new Date(initialDayStr));

  const runCycle = () => {
    if (!rawData) return;
    setData(genData(rawData, currentDate.current, column));
    const newDate = moment(currentDate.current, dateFormat).add(1, "days");
    currentDate.current = newDate.format(dateFormat);
  };

  const timeout = () => {
    runCycle();
    if (
      moment(currentDate.current, dateFormat) < moment(finalDayStr, dateFormat)
    ) {
      timeoutRef.current = setTimeout(timeout, speed);
    }
  };

  return (
    <div className="chart">
      {loading && <h2> Loading Data...</h2>}
      {!loading && (
        <React.Fragment>
          <h2>COVID Visualization by state</h2>
          <label>
            Data Type &nbsp;
          <select
            value={column}
            onChange={(event) => setColumn(event.target.value)}
          >
            {columnOptions.map(({ label, value }) => (
              <option key={label} value={value}>
                {label}
              </option>
            ))}
          </select>
          </label>
          <br />
          <br />
          <label>
            Timeout Speed &nbsp;
            <input type="text" value={speed} onChange={event => setSpeed(event.target.value)} />
          </label>
          <br />
          <br />
          <label>
            Start Date &nbsp;
          <DatePicker selected={startDate} onChange={date => {
            currentDate.current = moment(date).format(dateFormat);
            setStartDate(date);
            }} />
          </label>
          <br />
          <br />
          <button
            onClick={() => {
              clearTimeout(timeoutRef.current);
              timeout();
            }}
          >
            Run
          </button>
          &nbsp;
          <button
            onClick={() => {
              clearTimeout(timeoutRef.current);
            }}
          >
            Stop
          </button>
          <h5>Date: {currentDate.current}</h5>
          {data && (
            <HorizontalBar
              data={data}
              options={{
                plugins: {
                  datalabels: {
                    display: true,
                    color: "black",
                  },
                },
              }}
            />
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default Chart;
