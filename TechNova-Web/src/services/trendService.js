import API from "./api";

export const getTrends = async (stationId) => {
  const res = await API.get(`/trends?station_id=${stationId}`);
  return res.data;
};
