import API from "./api";

export const startTraining = async () => {
  const res = await API.get("/train");
  return res.data;
};
