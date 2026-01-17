import API from "./api";

export const getGeoJsonMap = async () => {
  const res = await API.get("/map/geojson");
  return res.data;
};
