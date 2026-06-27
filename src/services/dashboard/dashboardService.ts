import api from "../api";

export const getDashboardData = async () => {
    return await api.get("/dashboard");
};
