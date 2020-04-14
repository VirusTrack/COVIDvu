import React, { useEffect, useState } from "react";

import { useMobileDetect } from "../../hooks/ui";

import PlotlyGraph from "./PlotlyGraph";

import moment from "moment";

export const MovingAverageGraph = ({
  graphName,
  data,
  x_title,
  y_title,
  selected,
  config,
  ref = null
}) => {
  const [plotsAsValues, setPlotsAsValues] = useState([]);

  const detectMobile = useMobileDetect();

  useEffect(() => {
    const plots = {};

    const selectedData = Object.keys(data).filter(
      entry => selected.indexOf(entry) !== -1
    );

    const plotsOrder = [];

    for (const region of selectedData) {
      const dataLength = Object.values(data[region]).length;

      plotsOrder.push({
        region: region,
        total: Object.values(data[region])[dataLength - 1]
      });

      const normalizedRegion = region.startsWith("!")
        ? region.substring(1)
        : region;
      plots[normalizedRegion] = {
        x: [],
        y: [],
        type: "scatter",
        mode: "lines+markers",
        name: normalizedRegion,
        showlegend: true,
        marker: {
          size: 5
        }
      };

      const regionData = data[region];

      const diff = Object.values(regionData).reduce(
        (acc, value, index, array) => {
          acc.push(acc.length === 0 ? value : value - array[index - 1]);
          return acc;
        },
        []
      );

      let index = 0;
      for (const key of Object.keys(regionData).sort()) {
        plots[normalizedRegion].x.push(key);
        plots[normalizedRegion].y.push(diff[index]);

        ++index;
      }

      plots[normalizedRegion].type = "bar";
    }

    let earliestDay = undefined;
    let latestDay = undefined;

    for (const plot of Object.values(plots)) {
      const plotBeginDate = moment(plot.x[0]);
      const plotEndDate = moment(plot.x[plot.x.length - 1]);

      if (!earliestDay) {
        earliestDay = plotBeginDate;
        latestDay = plotEndDate;
      } else {
        if (earliestDay.isBefore(plotBeginDate)) {
          earliestDay = plotBeginDate;
        }
        if (latestDay.isAfter(plotEndDate)) {
          latestDay = plotEndDate;
        }
      }

      if (earliestDay && latestDay) {
        // console.dir(earliestDay.format("YYYY-MM-DD"));
        // console.dir(latestDay.format("YYYY-MM-DD"));

        const diffInDays = latestDay.diff(earliestDay, "days") + 1;

        const x_axis_days = [];
        const y_totals = [];

        const total_plots = Object.values(plots).length;
        let currentDayKey = moment(earliestDay).format("YYYY-MM-DD");

        for (let i = 0; i < diffInDays; i++) {
          currentDayKey = moment(earliestDay)
            .add(i, "days")
            .format("YYYY-MM-DD");

          x_axis_days.push(currentDayKey);

          let y_total = 0;

          for (let plot of Object.values(plots)) {
            let y_vals = Object.values(plot.y);
            y_total += !isNaN(y_vals[i]) ? y_vals[i] : 0
          }

          y_total = y_total / total_plots;
          y_totals.push(y_total);
        }

        // console.dir(x_axis_days);
        // console.dir(y_totals);

        const movingAverage = y_totals.reduce((acc, value, index, array) => {
          const howMany = index < 7 ? index : 7;

          let sum = 0;
          for (let i = index - howMany; i < index; i++) {
            sum += array[i];
          }

          acc.push(sum / howMany);
          return acc;
        }, []);

        plots["rolling_average"] = {
          order: 0,
          x: x_axis_days,
          y: movingAverage,
          type: "scatter",
          mode: "lines",
          name: "7-Day Average",
          line: {
            color: "black",
            width: 3
          }
        };
      }
    }

    const sortedPlotsOrder = plotsOrder.sort((a, b) => b.total - a.total);

    for (const plot of Object.values(plots)) {
      for (let i = 0; i < sortedPlotsOrder.length; i++) {
        if (plot.name === sortedPlotsOrder[i].region) {
          plot.order = i;
        }
      }
    }

    setPlotsAsValues(Object.values(plots).sort((a, b) => a.order - b.order));
  }, [selected, data, graphName]);

  const mergeConfig = {
    ...config,
    displayModeBar: false,
    responsive: true
  };

  let layout = {
    autosize: true,
    width: undefined,
    height: undefined,
    margin: {
      l: 70,
      t: 5,
      r: 10
    }
  };

  if (detectMobile.isMobile()) {
    layout = {
      ...layout,
      xaxis: {
        fixedrange: true
      }
    };
  }

  if (y_title) {
    layout = {
      ...layout,
      yaxis: { ...layout.yaxis, title: y_title }
    };
  }

  if (x_title) {
    layout.xaxis.title = x_title;
  }

  layout.legend = {
    xanchor: "center",
    yanchor: "top",
    y: -0.2,
    x: 0.5,
    orientation: "h",
    itemclick: "toggleothers"
  };

  return (
    <PlotlyGraph
      data={plotsAsValues}
      layout={layout}
      config={mergeConfig}
      ref={ref}
    />
  );
};

export default MovingAverageGraph;
