import API from "./api";

export const simulateScenario = async (file, availabilityChange, demandChange) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post(
    `/simulate?availability_change_pct=${availabilityChange}&demand_change_pct=${demandChange}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data;
};
