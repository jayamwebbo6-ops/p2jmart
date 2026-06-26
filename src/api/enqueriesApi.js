import api from "./api";

// Get all enquiries
export const getEnqueriesAPI = async () => {
  const response = await api.get("/enquiries");
  return response.data;
};

// Create enquiry (public)
export const createEnqueriesAPI = async (data) => {
  const response = await api.post("/enquiries", data);
  return response.data;
};

// Update read status
export const updateEnqueriesAPI = async (id, data) => {
  const response = await api.patch(`/enquiries/${id}/read`, data);
  return response.data;
};

// Delete enquiry
export const deleteEnqueriesAPI = async (id) => {
  const response = await api.delete(`/enquiries/${id}`);
  return response.data;
};

// Delete multiple enquiries
export const deleteMultipleEnqueriesAPI = async (ids) => {
  const response = await api.post("/enquiries/delete-multiple", {
    ids,
  });
  return response.data;
};

// Get enquiry statistics
export const getEnqueryStatsAPI = async () => {
  const response = await api.get("/enquiries/stats/overview");
  return response.data;
};

// Get enquiry by ID
export const getEnqueryByIdAPI = async (id) => {
  const response = await api.get(`/enquiries/${id}`);
  return response.data;
};