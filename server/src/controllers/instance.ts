import { RequestHandler } from "express";
import { Infer, Instance, Scenario } from "models";
import { Types } from "mongoose";

export const findAll: RequestHandler = (req, res) => {
  Instance.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const findNonEmptyByScenId: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  Instance.aggregate([
    {
      $match: {
        scen_id: id,
      },
    },
    {
      $project: {
        id: "$_id",
        agents: 1,
        lower_cost: 1,
        lower_algos: { $size: "$lower_algos" },
        lower_date: 1,
        solution_cost: 1,
        solution_algos: { $size: "$solution_algos" },
        solution_date: 1,
        solution_path_id: 1,
      },
    },
    { $sort: { agents: 1 } },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const findAlgosRecord: RequestHandler = (req, res) => {
  const { id } = req.params;
  Instance.find(
    { _id: id, empty: false },
    { lower_algos: 1, solution_algos: 1 }
  )
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

function rankingSorter(firstKey, secondKey, thirdKey) {
  return (a, b) => {
    if (a[firstKey] > b[firstKey]) {
      return 1;
    } else if (a[firstKey] < b[firstKey]) {
      return -1;
    } else {
      if (a[secondKey] > b[secondKey]) {
        return 1;
      } else if (a[secondKey] < b[secondKey]) {
        return -1;
      } else {
        if (a[thirdKey] > b[thirdKey]) {
          return 1;
        } else if (a[thirdKey] < b[thirdKey]) {
          return -1;
        } else {
          return 0;
        }
      }
    }
  };
}

export const downloadMapByID: RequestHandler = (req, res) => {
  const { id } = req.params;
  Instance.find(
    { map_id: id, empty: false },
    {
      map_id: 1,
      scen_id: 1,
      agents: 1,
      lower_cost: 1,
      lower_date: 1,
      solution_cost: 1,
      solution_date: 1,
    }
  )
    .populate<{ scen_id: Infer<typeof Scenario> }>("scen_id", {
      scen_type: 1,
      type_id: 1,
      _id: 0,
    })
    .then((data) => {
      const transformedDataArray = data.map((row) => ({
        scen_type: row.scen_id.scen_type,
        type_id: row.scen_id.type_id,
        agents: row.agents,
        lower_cost: row.lower_cost,
        lower_date: row.lower_date,
        solution_cost: row.solution_cost,
        solution_date: row.solution_date,
      }));
      transformedDataArray.sort(
        rankingSorter("scen_type", "type_id", "agents")
      );
      res.send(transformedDataArray);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const test: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  Instance.aggregate([
    {
      $match: {
        map_id: id,
        $or: [
          {
            solution_algo_id: new Types.ObjectId("636cf9b1a1b36ac2118eb15f"),
          },
          {
            lower_algo_id: new Types.ObjectId("636cf9b1a1b36ac2118eb15f"),
          },
        ],
      },
    },
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "instance_id",
        as: "Submission_records",
      },
    },
    {
      $project: {
        _id: "$_id",
        map_id: "$map_id",
        scen_id: "$scen_id",
        agents: "$agents",
        Submission_records: "$Submission_records",
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const downloadNonEmptyByScenId: RequestHandler = (req, res) => {
  const { id } = req.params;
  Instance.find(
    { scen_id: id, empty: false },
    {
      agents: 1,
      lower_cost: 1,
      lower_date: 1,
      solution_cost: 1,
      solution_date: 1,
      _id: 0,
    }
  )
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const findPathById: RequestHandler = (req, res) => {
  const { id } = req.params;
  Instance.find({ _id: id, empty: false }, { solution_path: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const downloadRowById: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  Instance.aggregate([
    {
      $match: { _id: id },
    },
    {
      $lookup: {
        from: "solution_paths",
        localField: "solution_path_id",
        foreignField: "_id",
        as: "path_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$path_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $project: {
        agents: 1,
        lower_cost: 1,
        lower_date: 1,
        solution_cost: 1,
        solution_date: 1,
        path: "$solution_path",
        _id: 0,
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving instances.",
      });
    });
};

export const get_map_level_summary: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  const query1 = Instance.aggregate([
    { $match: { map_id: id } },
    {
      $group: {
        _id: { agents: "$agents" },
        count: { $count: {} },
      },
    },
  ])
    .sort({ "_id.agents": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });

  const query2 = Instance.aggregate([
    { $match: { map_id: id, closed: true } },
    {
      $group: {
        _id: { agents: "$agents" },
        count: { $count: {} },
      },
    },
  ]).catch((err) => {
    res.status(500).send({
      message: err.message || "Some error occurred.",
    });
  });
  const query3 = Instance.aggregate([
    { $match: { map_id: id, $expr: { $ne: ["$solution_cost", null] } } },
    {
      $group: {
        _id: { agents: "$agents" },
        count: { $count: {} },
      },
    },
  ]).catch((err) => {
    res.status(500).send({
      message: err.message || "Some error occurred.",
    });
  });

  Promise.all([query1, query2, query3])
    .then((result) => {
      const [r0, r1, r2] = result;
      if (r0 && r1 && r2) {
        const final_results = [];
        r0.forEach((element) => {
          const entry = {
            name: element._id.agents,
            total: element.count,
            Unknown: element.count,
            Closed: 0,
            Solved: 0,
          };
          final_results.push(entry);
        });
        r1.forEach((element) => {
          final_results[parseInt(element._id.agents) - 1]["Closed"] =
            element.count;
        });
        r2.forEach((element) => {
          final_results[parseInt(element._id.agents) - 1]["Solved"] =
            element.count -
            final_results[parseInt(element._id.agents) - 1]["Closed"];
          final_results[parseInt(element._id.agents) - 1]["Unknown"] =
            final_results[parseInt(element._id.agents) - 1]["total"] -
            element.count;
        });
        res.send(final_results);
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};
