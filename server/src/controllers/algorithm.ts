///@ts-nocheck This file is bonkers

import { Algorithm, Submission } from "models";
import { Types } from "mongoose";

export const findAll: RequestHandler = (req, res) => {
  Algorithm.find({}, { _id: 1, algo_name: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAllDetails: RequestHandler = (req, res) => {
  Algorithm.find({})
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findBestClosed: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { $expr: { $eq: ["$lower_cost", "$solution_cost"] } } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_name: "$map_name" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        map_name: "$_id.map_name",
        solved_instances: "$record",
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findBestSolution: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { best_solution: true } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_name: "$map_name" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        map_name: "$_id.map_name",
        solved_instances: "$record",
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestSolved: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { $expr: { $ne: ["$solution_cost", null] } } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_name: "$map_name" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        map_name: "$_id.map_name",
        solved_instances: "$record",
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestLower: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { best_lower: true } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_name: "$map_name" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        map_name: "$_id.map_name",
        solved_instances: "$record",
      },
    },
  ])
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findSolvedDomainQuery: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { $expr: { $ne: ["$solution_cost", null] } } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        sum_value: { $sum: "$count" },
        total_instances: { $sum: "$instances" },
      },
    },
    {
      $group: {
        _id: { map_type: "$_id.map_type" },
        record: {
          $addToSet: {
            algo_name: "$_id.algo_name",
            sum_value: "$sum_value",
            total_ins: "$total_instances",
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        map_type: "$_id.map_type",
        results: "$record",
      },
    },
  ])
    .sort({ map_type: 1 })
    .then((data) => {
      data.forEach((element) => {
        let total = 0;
        element["results"].forEach((algo: any) => {
          if (algo["algo_name"] === "CBSH2-RTC") {
            total = algo["total_ins"];
          }
        });
        element["results"].forEach((algo: any) => {
          algo["count"] = algo["sum_value"] / total;
        });
      });
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findClosedDomainQuery: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { $expr: { $eq: ["$lower_cost", "$solution_cost"] } } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        sum_value: { $sum: "$count" },
        total_instances: { $sum: "$instances" },
      },
    },
    {
      $group: {
        _id: { map_type: "$_id.map_type" },
        record: {
          $addToSet: {
            algo_name: "$_id.algo_name",
            sum_value: "$sum_value",
            total_ins: "$total_instances",
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        map_type: "$_id.map_type",
        results: "$record",
      },
    },
  ])
    .sort({ map_type: 1 })
    .then((data) => {
      data.forEach((element) => {
        let total = 0;
        element["results"].forEach((algo: any) => {
          if (algo["algo_name"] === "CBSH2-RTC") {
            total = algo["total_ins"];
          }
        });
        element["results"].forEach((algo) => {
          algo["count"] = algo["sum_value"] / total;
        });
      });
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestLowerDomainQuery: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { best_lower: true } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        sum_value: { $sum: "$count" },
        total_instances: { $sum: "$instances" },
      },
    },
    {
      $group: {
        _id: { map_type: "$_id.map_type" },
        record: {
          $addToSet: {
            algo_name: "$_id.algo_name",
            sum_value: "$sum_value",
            total_ins: "$total_instances",
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        map_type: "$_id.map_type",
        results: "$record",
      },
    },
  ])
    .sort({ map_type: 1 })
    .then((data) => {
      data.forEach((element) => {
        let total = 0;
        element["results"].forEach((algo) => {
          if (algo["algo_name"] === "CBSH2-RTC") {
            total = algo["total_ins"];
          }
        });
        element["results"].forEach((algo) => {
          algo["count"] = algo["sum_value"] / total;
        });
      });
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestSolutionDomainQuery: RequestHandler = (req, res) => {
  Submission.aggregate([
    { $match: { best_solution: true } },
    {
      $group: {
        _id: { algo_id: "$algo_id", map_id: "$map_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        sum_value: { $sum: "$count" },
        total_instances: { $sum: "$instances" },
      },
    },
    {
      $group: {
        _id: { map_type: "$_id.map_type" },
        record: {
          $addToSet: {
            algo_name: "$_id.algo_name",
            sum_value: "$sum_value",
            total_ins: "$total_instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        map_type: "$_id.map_type",
        results: "$record",
      },
    },
  ])
    .sort({ map_type: 1 })
    .then((data) => {
      data.forEach((element) => {
        let total = 0;
        element["results"].forEach((algo) => {
          if (algo["algo_name"] === "CBSH2-RTC") {
            total = algo["total_ins"];
          }
        });
        element["results"].forEach((algo) => {
          algo["count"] = algo["sum_value"] / total;
        });
      });
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestLowerGroup: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  const query3 = Algorithm.find({ _id: id });
  const query1 = Submission.aggregate([
    { $match: { best_lower: true } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },

    {
      $group: {
        _id: { map_type: "$map_type" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
  const query2 = Submission.aggregate([
    { $match: { best_lower: true, algo_id: id } },
    {
      $group: {
        _id: { map_id: "$map_id", algo_id: "$algo_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        algo_name: "$_id.algo_name",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });

  Promise.all([query1, query2, query3])
    .then((result) => {
      const final_results = [];
      result[0] &&
        result[0].forEach((element) => {
          const entry = {};
          entry["name"] = element.map_type;
          entry["State of The Art"] = element.count / element.instances;
          entry[result[2][0].algo_name] = 0;
          result[1] &&
            result[1].forEach((algo) => {
              if (algo.map_type === element.map_type) {
                entry[algo.algo_name] = algo.count / algo.instances;
              }
            });
          final_results.push(entry);
        });
      res.send(final_results);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestSolutionGroup = async (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  const query3 = Algorithm.find({ _id: id });
  const query1 = Submission.aggregate([
    { $match: { best_solution: true } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },

    {
      $group: {
        _id: { map_type: "$map_type" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
  const query2 = Submission.aggregate([
    { $match: { best_solution: true, algo_id: id } },
    {
      $group: {
        _id: { map_id: "$map_id", algo_id: "$algo_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        algo_name: "$_id.algo_name",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });

  Promise.all([query1, query2, query3])
    .then((result) => {
      const final_results = [];
      result[0] &&
        result[0].forEach((element) => {
          const entry = {};
          entry["name"] = element.map_type;
          entry["State of The Art"] = element.count / element.instances;
          entry[result[2][0].algo_name] = 0;
          result[1] &&
            result[1].forEach((algo) => {
              if (algo.map_type === element.map_type) {
                entry[algo.algo_name] = algo.count / algo.instances;
              }
            });
          final_results.push(entry);
        });
      res.send(final_results);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestClosedGroup: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  const query3 = Algorithm.find({ _id: id });
  const query1 = Submission.aggregate([
    { $match: { $expr: { $eq: ["$lower_cost", "$solution_cost"] } } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },

    {
      $group: {
        _id: { map_type: "$map_type" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
  const query2 = Submission.aggregate([
    {
      $match: {
        $expr: { $eq: ["$lower_cost", "$solution_cost"] },
        algo_id: id,
      },
    },
    {
      $group: {
        _id: { map_id: "$map_id", algo_id: "$algo_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        algo_name: "$_id.algo_name",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });

  Promise.all([query1, query2, query3])
    .then((result) => {
      const final_results = [];
      if (result[0])
        result[0].forEach((element) => {
          const entry = {};
          entry["name"] = element.map_type;
          entry["State of The Art"] = element.count / element.instances;
          entry[result[2][0].algo_name] = 0;
          if (result[1])
            result[1].forEach((algo) => {
              if (algo.map_type === element.map_type) {
                entry[algo.algo_name] = algo.count / algo.instances;
              }
            });
          final_results.push(entry);
        });
      res.send(final_results);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const findBestSolvedGroup: RequestHandler = (req, res) => {
  const id = new Types.ObjectId(req.params.id);
  const query3 = Algorithm.find({ _id: id });
  const query1 = Submission.aggregate([
    { $match: { $expr: { $ne: ["$solution_cost", null] } } },
    {
      $group: {
        _id: { map_id: "$map_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },

    {
      $group: {
        _id: { map_type: "$map_type" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
  const query2 = Submission.aggregate([
    { $match: { $expr: { $ne: ["$solution_cost", null] }, algo_id: id } },
    {
      $group: {
        _id: { map_id: "$map_id", algo_id: "$algo_id" },
        uniqueInstance: { $addToSet: "$instance_id" },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $lookup: {
        from: "maps",
        localField: "_id.map_id",
        foreignField: "_id",
        as: "map_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$map_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { map_type: "$map_type", algo_name: "$algo_name" },
        instances: { $sum: "$instances" },
        uniqueInstance: { $addToSet: { $size: "$uniqueInstance" } },
      },
    },
    {
      $project: {
        map_type: "$_id.map_type",
        instances: "$instances",
        algo_name: "$_id.algo_name",
        count: { $sum: "$uniqueInstance" },
      },
    },
  ])
    .sort({ "_id.map_type": 1 })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });

  Promise.all([query1, query2, query3])
    .then((result) => {
      const final_results = [];
      result[0] &&
        result[0].forEach((element) => {
          const entry = {};
          entry["name"] = element.map_type;
          entry["State of The Art"] = element.count / element.instances;
          entry[result[2][0].algo_name] = 0;
          result[1] &&
            result[1].forEach((algo) => {
              if (algo.map_type === element.map_type) {
                entry[algo.algo_name] = algo.count / algo.instances;
              }
            });
          final_results.push(entry);
        });
      res.send(final_results);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred.",
      });
    });
};

export const LeadingSolvedInfo: RequestHandler = (req, res) => {
  Algorithm.aggregate([
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "algo_id",
        as: "Submission_records",
      },
    },
    {
      $project: {
        algo_name: "$algo_name",
        Submission_records: {
          $filter: {
            input: "$Submission_records",
            cond: { $eq: ["$$submission.leading_solution", true] },
            as: "submission",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$algo_name",
        count: { $size: "$Submission_records" },
      },
    },
  ])
    .sort({ name: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const LeadingLowerInfo: RequestHandler = (req, res) => {
  Algorithm.aggregate([
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "algo_id",
        as: "Submission_records",
      },
    },
    {
      $project: {
        algo_name: "$algo_name",
        Submission_records: {
          $filter: {
            input: "$Submission_records",
            cond: { $eq: ["$$submission.leading_lower", true] },
            as: "submission",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$algo_name",
        count: { $size: "$Submission_records" },
      },
    },
  ])
    .sort({ name: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findOne: RequestHandler = (req, res) => {
  const { id } = req.params;

  Algorithm.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: `Not found Map with id ${id}` });
      else res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: `Error retrieving Map with id=${id}` });
    });
};

export const findScenBestClosed: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$lower_cost", "$solution_cost"] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", scen_id: "$scen_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "scenarios",
        localField: "_id.scen_id",
        foreignField: "_id",
        as: "scen_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$scen_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { scen_type: "$scen_type", type_id: "$type_id" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        scen_type: "$_id.scen_type",
        type_id: "$_id.type_id",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ scen_type: 1, type_id: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findScenBestSolved: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $ne: ["$solution_cost", null] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", scen_id: "$scen_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "scenarios",
        localField: "_id.scen_id",
        foreignField: "_id",
        as: "scen_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$scen_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { scen_type: "$scen_type", type_id: "$type_id" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        scen_type: "$_id.scen_type",
        type_id: "$_id.type_id",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ scen_type: 1, type_id: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findScenBestLower: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$best_lower", true] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", scen_id: "$scen_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "scenarios",
        localField: "_id.scen_id",
        foreignField: "_id",
        as: "scen_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$scen_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { scen_type: "$scen_type", type_id: "$type_id" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        scen_type: "$_id.scen_type",
        type_id: "$_id.type_id",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ scen_type: 1, type_id: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findScenBestSolution: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$best_solution", true] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", scen_id: "$scen_id" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $lookup: {
        from: "scenarios",
        localField: "_id.scen_id",
        foreignField: "_id",
        as: "scen_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$scen_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { scen_type: "$scen_type", type_id: "$type_id" },
        record: {
          $addToSet: {
            algo_name: "$algo_name",
            count: "$count",
            total: "$instances",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        scen_type: "$_id.scen_type",
        type_id: "$_id.type_id",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ scen_type: 1, type_id: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAgentBestClosed: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$lower_cost", "$solution_cost"] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", agents: "$agents" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { agents: "$_id.agents" },
        record: { $addToSet: { algo_name: "$algo_name", count: "$count" } },
      },
    },
    {
      $project: {
        _id: 0,
        agents: "$_id.agents",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAgentBestSolved: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $ne: ["$solution_cost", null] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", agents: "$agents" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { agents: "$_id.agents" },
        record: { $addToSet: { algo_name: "$algo_name", count: "$count" } },
      },
    },
    {
      $project: {
        _id: 0,
        agents: "$_id.agents",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAgentBestLower: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$best_lower", true] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", agents: "$agents" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { agents: "$_id.agents" },
        record: { $addToSet: { algo_name: "$algo_name", count: "$count" } },
      },
    },
    {
      $project: {
        _id: 0,
        agents: "$_id.agents",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAgentBestSolution: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.id);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $eq: ["$best_solution", true] } },
          { $expr: { $eq: ["$map_id", map_id] } },
        ],
      },
    },
    {
      $group: {
        _id: { algo_id: "$algo_id", agents: "$agents" },
        count: { $count: {} },
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "_id.algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },
    {
      $group: {
        _id: { agents: "$_id.agents" },
        record: { $addToSet: { algo_name: "$algo_name", count: "$count" } },
      },
    },
    {
      $project: {
        _id: 0,
        agents: "$_id.agents",
        solved_instances: "$record",
      },
    },
  ])
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAgentSolutionCost: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.mapId);
  const scen_id = new Types.ObjectId(req.params.scenId);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $ne: ["$solution_cost", null] } },
          { $expr: { $eq: ["$map_id", map_id] } },
          { $expr: { $eq: ["$scen_id", scen_id] } },
        ],
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },

    {
      $group: {
        _id: { agents: "$agents" },
        record: {
          $addToSet: { algo_name: "$algo_name", cost: "$solution_cost" },
        },
      },
    },
    {
      $project: {
        _id: 0,
        agents: "$_id.agents",
        record: 1,
      },
    },
  ])
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};

export const findAgentLower: RequestHandler = (req, res) => {
  const map_id = new Types.ObjectId(req.params.mapId);
  const scen_id = new Types.ObjectId(req.params.scenId);
  Submission.aggregate([
    {
      $match: {
        $and: [
          { $expr: { $ne: ["$lower_cost", null] } },
          { $expr: { $eq: ["$map_id", map_id] } },
          { $expr: { $eq: ["$scen_id", scen_id] } },
        ],
      },
    },
    {
      $lookup: {
        from: "algorithms",
        localField: "algo_id",
        foreignField: "_id",
        as: "algo_info",
      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{ $arrayElemAt: ["$algo_info", 0] }, "$$ROOT"],
        },
      },
    },

    {
      $group: {
        _id: { agents: "$agents" },
        record: { $addToSet: { algo_name: "$algo_name", cost: "$lower_cost" } },
      },
    },
    {
      $project: {
        _id: 0,
        agents: "$_id.agents",
        record: 1,
      },
    },
  ])
    .sort({ agents: 1 })
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials.",
      });
    });
};
