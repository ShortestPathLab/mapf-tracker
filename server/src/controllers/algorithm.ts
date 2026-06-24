///@ts-nocheck This file is bonkers

import { Algorithm, Submission } from "models";
import { Types } from "mongoose";

export const findAll = async (ctx: any) => {
  return Algorithm.find({}, { _id: 1, algo_name: 1 })
    .then((data) => {
      return data;
    })
    ;
};

export const findAllDetails = async (ctx: any) => {
  return Algorithm.find({})
    .then((data) => {
      return data;
    })
    ;
};

export const findBestClosed = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findBestSolution = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findBestSolved = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findBestLower = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findSolvedDomainQuery = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findClosedDomainQuery = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findBestLowerDomainQuery = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findBestSolutionDomainQuery = async (ctx: any) => {
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findBestLowerGroup = async (ctx: any) => {
  const id = new Types.ObjectId(ctx.params.id);
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
    ;
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
    ;

  return Promise.all([query1, query2, query3])
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
      return final_results;
    })
    ;
};

export const findBestSolutionGroup = async (ctx: any) => {
  const id = new Types.ObjectId(ctx.params.id);
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
    ;
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
    ;

  return Promise.all([query1, query2, query3])
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
      return final_results;
    })
    ;
};

export const findBestClosedGroup = async (ctx: any) => {
  const id = new Types.ObjectId(ctx.params.id);
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
    ;
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
    ;

  return Promise.all([query1, query2, query3])
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
      return final_results;
    })
    ;
};

export const findBestSolvedGroup = async (ctx: any) => {
  const id = new Types.ObjectId(ctx.params.id);
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
    ;
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
    ;

  return Promise.all([query1, query2, query3])
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
      return final_results;
    })
    ;
};

export const LeadingSolvedInfo = async (ctx: any) => {
  return Algorithm.aggregate([
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
      return data;
    })
    ;
};

export const LeadingLowerInfo = async (ctx: any) => {
  return Algorithm.aggregate([
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
      return data;
    })
    ;
};

export const findOne = async (ctx: any) => {
  const { id } = ctx.params;

  return Algorithm.findById(id)
    .then((data) => {
      if (!data)
        return ctx.status(404, { message: `Not found Map with id ${id}` });
      else return data;
    })
    ;
};

export const findScenBestClosed = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findScenBestSolved = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findScenBestLower = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findScenBestSolution = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findAgentBestClosed = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findAgentBestSolved = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findAgentBestLower = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findAgentBestSolution = async (ctx: any) => {
  const map_id = new Types.ObjectId(ctx.params.id);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findAgentSolutionCost = async (ctx: any) => {
  const [mapId, scenId] = (ctx.params.pair ?? "").split("&");
  const map_id = new Types.ObjectId(mapId);
  const scen_id = new Types.ObjectId(scenId);
  return Submission.aggregate([
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
      return data;
    })
    ;
};

export const findAgentLower = async (ctx: any) => {
  const [mapId, scenId] = (ctx.params.pair ?? "").split("&");
  const map_id = new Types.ObjectId(mapId);
  const scen_id = new Types.ObjectId(scenId);
  return Submission.aggregate([
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
      return data;
    })
    ;
};
