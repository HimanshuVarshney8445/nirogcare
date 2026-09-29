import React, { useEffect, useState, useCallback } from "react";
import { Bell, Check, RotateCw } from "lucide-react";
import {
    getMyNotificationsApi,
    markNotificationAsReadApi,
} from "../services/notificationServices";

const Notification = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        try {
            const response = await getMyNotificationsApi();

            if (response && response.success) {
                setNotifications(response.notifications || []);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();

        const handleRefresh = () => fetchNotifications();
        window.addEventListener("refreshNotifications", handleRefresh);

        const interval = setInterval(() => {
            fetchNotifications();
        }, 30000);

        return () => {
            window.removeEventListener("refreshNotifications", handleRefresh);
            clearInterval(interval);
        };
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await markNotificationAsReadApi(id);

            setNotifications((prev) =>
                prev.map((notification) =>
                    notification._id === id
                        ? { ...notification, isRead: true }
                        : notification
                )
            );
            window.dispatchEvent(new Event("refreshNotifications"));
        } catch (error) {
            console.error("Error marking notification:", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-gray-400">
                <RotateCw className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
                Loading notifications...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="text-emerald-400 w-6 h-6" />
                    <h2 className="text-2xl font-semibold text-white">
                        Notifications
                    </h2>
                </div>
                <button
                    onClick={() => fetchNotifications(true)}
                    disabled={refreshing}
                    className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition border border-gray-700 flex items-center gap-2 text-xs font-medium cursor-pointer"
                    title="Refresh notifications"
                >
                    <RotateCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
                    Refresh
                </button>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-gray-800/40 p-8 rounded-xl border border-gray-700/50 text-center">
                    <Bell className="w-10 h-10 text-gray-500 mx-auto mb-3" />

                    <p className="text-gray-400 font-medium">
                        No notifications yet.
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                        Updates from your clinic and appointments will appear here.
                    </p>
                </div>
            ) : (
                notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${notification.isRead
                                ? "bg-gray-800/30 border-gray-700/50"
                                : "bg-emerald-950/30 border-emerald-500/40 shadow-sm shadow-emerald-900/20"
                            }`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    {!notification.isRead && (
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    )}
                                    <h3 className="text-white font-semibold text-base">
                                        {notification.title}
                                    </h3>
                                </div>

                                <p className="text-gray-300 text-sm">
                                    {notification.body}
                                </p>

                                <p className="text-gray-500 text-xs mt-2">
                                    {new Date(
                                        notification.createdAt
                                    ).toLocaleString()}
                                </p>
                            </div>

                            {!notification.isRead && (
                                <button
                                    onClick={() =>
                                        markAsRead(notification._id)
                                    }
                                    className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/30 transition cursor-pointer"
                                    title="Mark as read"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Notification;
