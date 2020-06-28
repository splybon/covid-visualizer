import { useState, useEffect } from "react";
import { initialDayStr, finalDayStr, dateFormat } from "../constants";
import moment from "moment";
import Papa from "papaparse";

const readData = (day, callback) => {
  const formattedDay = day.format(dateFormat);
  Papa.parse(`/daily-reports/${day.format(dateFormat)}.csv`, {
    download: true,
    complete: (results) => callback({ [formattedDay]: results.data }),
  });
};

function useRawData() {
  const [loading, setLoading] = useState(true);
  const [error] = useState(null);
  const [rawData, setRawData] = useState(null);

  // loads all data into object like {'04-12-2020': [], '04-13-2020': []}
  useEffect(() => {
    async function fetchData() {
      const promiseArray = [];
      let currentDay = moment(initialDayStr, dateFormat);
      const finalDay = moment(finalDayStr, dateFormat);

      while (currentDay <= finalDay) {
        const prom = new Promise((resolve) => {
          readData(currentDay, resolve);
        });
        promiseArray.push(prom);
        currentDay.add(1, "days");
      }

      const results = await Promise.all(promiseArray);
      setRawData(
        results.reduce((acc, dateObj) => Object.assign(acc, dateObj), {})
      );
      setLoading(false);
    }
    fetchData();
  }, []);

  return { rawData, error, loading };
}

export default useRawData;
