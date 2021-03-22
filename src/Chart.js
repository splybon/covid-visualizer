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
  const [speed, setSpeed] = useState(100);
  const [startDate, setStartDate] = useState(
    new Date(initialDayStr.replace(/-/g, "/"))
  );

  const clear = () => {
    currentDate.current = moment(startDate).format(dateFormat);
    clearTimeout(timeoutRef.current);
  };

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
      Dataset found{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/CSSEGISandData/COVID-19/tree/master/csse_covid_19_data/csse_covid_19_daily_reports_us"
      >
        here
      </a>
      {loading && <h2> Loading Data...</h2>}
      {!loading && (
        <React.Fragment>
          <h2>COVID Visualization by state</h2>
          <label>
            Data Type &nbsp;
            <select
              value={column}
              onChange={(event) => {
                clear();
                setColumn(event.target.value);
              }}
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
            <input
              type="text"
              value={speed}
              onChange={(event) => {
                clear();
                setSpeed(event.target.value);
              }}
            />
          </label>
          <br />
          <br />
          <label>
            Start Date &nbsp;
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                clear();
                currentDate.current = moment(date).format(dateFormat);
                setStartDate(date);
              }}
            />
          </label>
          <br />
          <br />
          <button
            onClick={() => {
              clear();
              currentDate.current = moment(startDate).format(dateFormat);
              timeout();
            }}
          >
            Run
          </button>
          &nbsp;
          <button onClick={clear}>Stop</button>
          <h5>Date: {currentDate.current}</h5>
          <div class="chartContainer" style={{ flex: 1 }}>
            {data && (
              <HorizontalBar
                data={data}
                options={{
                  // responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    datalabels: {
                      display: false,
                    },
                  },
                }}
              />
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default Chart;
