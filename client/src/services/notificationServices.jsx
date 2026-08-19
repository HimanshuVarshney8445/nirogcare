import { api } from "../api/apiClient";

export const getMyNotificationsApi = async () => {
    const response = await api.get("/api/notifications");
    return response.data;
};

export const markNotificationAsReadApi = async (notificationId) => {
    const response = await api.patch(
        `/api/notifications/${notificationId}/read`
    );
    return response.data;
};