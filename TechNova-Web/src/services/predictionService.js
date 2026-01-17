import API from "./api";

export const predictCSV = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await API.post("/predict", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
