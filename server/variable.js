const weightMap = {
  "45": {
    "2": 23,
    "3": 36,
    "4": 200
  },
  "46": {
    "1": 50,
    "2": 60
  },
  "89": {
    "1": 1004
  },
  "120": {
    "1": 26,
    "2": 1120
  }
};

function getUniqueWeight(job_id, process_id) {
  if (weightMap[job_id] && weightMap[job_id][process_id]) {
    return weightMap[job_id][process_id];
  }
  return null;
}

function getWeightMap() {
  return weightMap;
}

module.exports = { getUniqueWeight, getWeightMap };