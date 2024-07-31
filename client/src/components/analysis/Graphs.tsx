import { useEffect, useState } from "react";

export const angle = {
  Warehouse: -40,
  City: 0,
  Empty: 50,
  Game: 110,
  Maze: 0,
  Random: 0,
  Room: -110,
};

export const infoDescriptionText = {
  domainProgress: {
    description:
      "This plot tracks the progress made by the state-of-the-art (i.e., all algorithms together) in each domain of the benchmark. " +
      "The figure shows the success rate (i.e., percentage) of closed, solved, and unknown instances in each domain. " +
      "The objective here is to identify the domains that are hard to solve with existing MAPF algorithms, so that more attention can be paid to these. ",
    c_axis:
      "The benchmark contains many different maps, each map is associate with a domain (see Type column). " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis shows the success rate (i.e., percentage) of closed, solved, and unknown instances in each map. " +
      "The success rate is calculated according to the total number of instances in each domain.",
    comment:
      "To indicate the progress, all instances in each map are categorised into three types: " +
      "(i) closed instance: the instance has the same best lower bound and best solution cost " +
      "(indicating that the solution cannot be further improved); (ii) solved instance: the instance has a feasible solution reported, but the current best lower bound " +
      "is less than the best solution cost (i.e., improvement may be possible); and (iii) unknown instance: the instance has no solution reported.",
  },
  "domainCompare-#Instances Closed": {
    description:
      "This plot compares the number of instances closed by MAPF algorithms for each domain of the benchmark. " +
      "For a particular algorithm, the instance is closed if the algorithm reports the same lower bound and solution cost. " +
      "Algorithms that do not report lower bound data are omitted from this plot. " +
      "The number of instances closed indicates the performance of algorithms for finding and proving optimal solution (i.e., higher the better). ",
    c_axis:
      "The benchmark contains many different maps, each map is associate with a domain (see Type column). " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances closed for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain.",
  },
  "domainCompare-#Instances Solved": {
    description:
      "This plot compares the number of instances solved by MAPF algorithms for each domain of the benchmark. " +
      "The number of instances solved indicates the performance of algorithms while ignoring solution quality (i.e., higher the better). " +
      "The figure compare between different algorithms and identify challenging domains.",
    c_axis:
      "The benchmark contains many different maps, each map is associate with a domain (see Type column). " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances solved for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain.",
  },
  "domainCompare-#Best Lower-bounds": {
    description:
      "This plot compares the number of instances that have achieved the best lower bound (reported by any algorithm) " +
      "among MAPF algorithms for each domain of the benchmark. " +
      "The number of instances achieving the best lower bound reflects the availability of optimal and bounded-suboptimal algorithms for proving optimality (i.e., higher the better). " +
      "The purpose of this plot is to compare these algorithms and identify challenging domains. " +
      "Algorithms that do not report lower bound data are omitted from this plot.",
    c_axis:
      "The benchmark contains many different maps, each map is associate with a domain (see Type column). " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances that have achieved the best lower bound for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain. ",
    // "For instances where no lower bound is reported, no algorithm can achieve the best lower bound in such cases."
  },
  "domainCompare-#Best Solutions": {
    description:
      "This plot compares the number of instances that have achieved the best solution (reported by any algorithm) " +
      "among MAPF algorithms for each domain of the benchmark. " +
      "The number of instances achieving the best solution reflects the solution quality reported by different algorithms (i.e., higher the better). " +
      "The figure compare between different algorithms and identify challenging scenarios. " +
      "Algorithms that do not report solution data are omitted from this plot.",
    c_axis:
      "The benchmark contains many different maps, each map is associate with domain (see Type column). " +
      "The category-axis displays the names of the domains available in the benchmark.",
    v_axis:
      "The value-axis displays the number of instances that have achieved the best solution for each domain. " +
      "The percentage ratio is shown, calculated based on the total number of instances in each domain. ",
    // "For instances where no solution is reported, no algorithm can achieve the best solution in such cases."
  },

  mapProgress: {
    description:
      "This plot tracks the progress made by the state-of-the-art (i.e., all algorithms together) for each map of the benchmark " +
      "The figure shows the success rate (i.e., percentage) of closed, solved, and unknown instances for different maps. " +
      "The objective here is to allow the researchers to focus MAPF research on the map that are challenging.",
    x_axis:
      "The x-axis displays the names of the maps available in the benchmark.",
    y_axis:
      "The y-axis shows the success rate (percentage) of closed, solved, and unknown instances for different maps. " +
      "The success rate is calculated according to the total number of instances in each map.",
    comment:
      "To indicate the progress, all instances in each map are categorised into three types: " +
      "(i) closed instance: the instance has the same best lower bound and best solution cost " +
      "(indicating that the solution cannot be further improved); (ii) solved instance: the instance has a feasible solution reported, but the current best lower bound " +
      "is less than the best solution cost (i.e., improvement may be possible); and (iii) unknown instance: the instance has no solution reported.",
  },

  "mapCompare-#Instances Closed": {
    description:
      "This plot compares the number of instances closed by MAPF algorithms " +
      "for different maps in the benchmark. " +
      "For a particular algorithm, the instance is closed if the algorithm reports the same lower bound and solution cost. " +
      "Algorithms that do not report lower bound data are omitted from this plot. " +
      "The number of instances closed indicates the performance of algorithms for finding and proving optimal solution (i.e., higher the better). ",
    x_axis:
      "The x-axis displays the names of the maps available in the benchmark.",
    y_axis:
      "The y-axis displays the number of instances closed for different maps. " +
      "The percentage ratio is shown, calculated based on the number of instances available for each map.",
  },
  "mapCompare-#Instances Solved": {
    description:
      "This plot compares the number of instances solved by MAPF algorithms " +
      "for different maps in the benchmark. " +
      "The number of instances solved indicates the performance of algorithms while ignoring solution quality (i.e., higher the better). " +
      "The figure compare between different algorithms and identify challenging maps.",
    x_axis:
      "The x-axis displays the names of the maps available in the benchmark.",
    y_axis:
      "The y-axis displays the number of instances solved for different maps. " +
      "The percentage ratio is shown, calculated based on the number of instances available for each map.",
  },
  "mapCompare-#Best Lower-bounds": {
    description:
      "This plot compares the number of instances that have achieved the best lower bound (reported by any algorithm) among MAPF algorithms " +
      "for different maps in the benchmark. " +
      "The number of instances achieving the best lower bound reflects the availability of optimal and bounded-suboptimal algorithms for proving optimality (i.e., higher the better). " +
      "The purpose of this plot is to compare these algorithms and identify challenging maps. " +
      "Algorithms that do not report lower bound data are omitted from this plot.",
    x_axis:
      "The x-axis displays the names of the maps available in the benchmark.",
    y_axis:
      "The y-axis displays the number of instances that have achieved the best lower bound for different maps. " +
      "The percentage ratio is shown, calculated based on the number of instances available for each map. ",
    // "For instances where no lower bound is reported, no algorithm can achieve the best lower bound in such cases."
  },
  "mapCompare-#Best Solutions": {
    description:
      "This plot compares the number of instances that have achieved the best solution (reported by any algorithm) among MAPF algorithms " +
      "for different maps in the benchmark. " +
      "The number of instances achieving the best solution reflects the solution quality reported by different algorithms (i.e., higher the better). " +
      "The figure compare between different algorithms and identify challenging maps. " +
      "Algorithms that do not report solution data are omitted from this plot.",
    x_axis:
      "The x-axis displays the names of the maps available in the benchmark.",
    y_axis:
      "The y-axis displays the number of instances that have achieved the best solution for different maps. " +
      "The percentage ratio is shown, calculated based on the number of instances available for each map. ",
    // "For instances where no solution is reported, no algorithm can achieve the best solution in such cases."
  },
};

function Graph() {
  const [, setMapQuery] = useState("#Instances Closed");
  const [mapQueryResult, setMapQueryResult] = useState([]);
  const [mapBarChartAlgorithms, setMapBarChartAlgorithms] = useState([]);
  const [, setMapBarChartDisplayAlgorithms] = useState([]);
  const [, setMapBarChartDisplayData] = useState([]);
  const [mapBarChartOriData, setMapBarChartOriData] = useState([]);
  const [mapFilterState, setMapFilterState] = useState({});
  const [, setMapLoading] = useState(true);

  const [, setDomainQuery] = useState("#Instances Closed");
  const [domainQueryResult, setDomainQueryResult] = useState([]);
  const [domainBarChartAlgorithms, setDomainBarChartAlgorithms] = useState([]);
  const [, setDomainBarChartDisplayAlgorithms] = useState([]);
  const [, setDomainBarChartDisplayData] = useState([]);
  const [domainBarChartOriData, setDomainBarChartOriData] = useState([]);
  const [domainFilterState, setDomainFilterState] = useState({});
  const [, setDomainLoading] = useState(true);

  useEffect(() => {
    if (algorithm_name.length <= 0) {
      return;
    }
    setDomainLoading(true);
    setMapLoading(true);
    setDomainQuery("#Instances Closed");
    setMapQuery("#Instances Closed");
  }, [algorithm_name]);

  useEffect(() => {
    if (isClosedDataSuccess) {
      setMapQueryResult(closedData);
      setMapLoading(false);
    }
  }, [closedData, isClosedDataSuccess]);

  useEffect(() => {
    if (isDomainDataSuccess) {
      setDomainQueryResult(domainData);
      setDomainLoading(false);
    }
  }, [domainData, isDomainDataSuccess]);

  useEffect(() => {
    if (mapQueryResult.length <= 0) {
      return;
    }
    const mapChartData = [];
    [...new Set(data.map((item) => item.map_name))].forEach((element) =>
      mapChartData.push({ name: element })
    );
    const algorithm = new Set();
    mapQueryResult.forEach((result) => {
      const mapIndex = mapChartData.findIndex(
        (x) => x.name === result.map_name
      );
      result.solved_instances.forEach((algo) => {
        algorithm.add(algo.algo_name);
        mapChartData[mapIndex][algo.algo_name] = algo.count / algo.total;
        mapChartData[mapIndex].total = algo.total;
      });
    });

    const uniqueKey = Array.from(algorithm).sort();
    const checkBoxState = uniqueKey.reduce((acc, algo) => {
      acc[algo] = true;
      return acc;
    }, {});

    setMapFilterState(checkBoxState);
    setMapBarChartAlgorithms(uniqueKey);
    setMapBarChartDisplayAlgorithms(uniqueKey);
    setMapBarChartDisplayData(mapChartData);
    setMapBarChartOriData(mapChartData);
  }, [mapQueryResult]);

  useEffect(() => {
    if (domainQueryResult.length <= 0) {
      return;
    }
    const domainChartData = [];
    [...new Set(data.map((item) => item.map_type))].forEach((element) =>
      domainChartData.push({ name: element })
    );
    const algorithm = new Set();
    domainQueryResult.forEach((result) => {
      const domainIndex = domainChartData.findIndex(
        (x) => x.name === result.map_type
      );
      result.results.forEach((algo) => {
        algorithm.add(algo.algo_name);
        domainChartData[domainIndex][algo.algo_name] = algo.count;
        domainChartData[domainIndex].total = algo.total_ins;
      });
    });

    const uniqueKey = Array.from(algorithm).sort();
    const checkBoxState = uniqueKey.reduce((acc, algo) => {
      acc[algo] = true;
      domainChartData.forEach((element) => {
        if (element[algo] === undefined) {
          element[algo] = 0;
        }
      });
      return acc;
    }, {});

    uniqueKey.sort((a, b) => {
      const valueA = domainChartData.reduce(
        (sum, element) => sum + element[a],
        0
      );
      const valueB = domainChartData.reduce(
        (sum, element) => sum + element[b],
        0
      );
      return valueB - valueA;
    });

    domainChartData.forEach((element) => {
      element.name =
        element.name.charAt(0).toUpperCase() + element.name.slice(1);
    });

    setDomainFilterState(checkBoxState);
    setDomainBarChartAlgorithms(uniqueKey);
    setDomainBarChartDisplayAlgorithms(uniqueKey);
    setDomainBarChartDisplayData(domainChartData);
    setDomainBarChartOriData(domainChartData);
  }, [domainQueryResult]);

  useEffect(() => {
    const displayData = mapBarChartOriData.map((element) => {
      const mapData = {
        name: element.name,
        total: element.total,
      };
      mapBarChartAlgorithms.forEach((algo) => {
        if (mapFilterState[algo]) {
          mapData[algo] = element[algo];
        }
      });
      return mapData;
    });

    const displayKey = mapBarChartAlgorithms.filter(
      (algo) => mapFilterState[algo]
    );

    setMapBarChartDisplayAlgorithms(displayKey);
    setMapBarChartDisplayData(displayData);
  }, [mapFilterState]);

  useEffect(() => {
    const displayData = domainBarChartOriData.map((element) => {
      const domainData = {
        name: element.name,
        total: element.total,
      };
      domainBarChartAlgorithms.forEach((algo) => {
        if (domainFilterState[algo]) {
          domainData[algo] = element[algo];
        }
      });
      return domainData;
    });

    const displayKey = domainBarChartAlgorithms.filter(
      (algo) => domainFilterState[algo]
    );

    setDomainBarChartDisplayAlgorithms(displayKey);
    setDomainBarChartDisplayData(displayData);
  }, [domainFilterState]);
}
