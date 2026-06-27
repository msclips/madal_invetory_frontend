import api from "../api";

export const loginUser = async (form: any) => {
    return await api.post("/auth/login", form);
};

export const logoutUser = async () => {
    return await api.post("/auth/logout");
};
