import Notification from "../models/Notification.js";

export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            userId: req.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false,
        });

        res.status(200).json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Get notifications error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            {
                _id: id,
                userId: req.user.id,
            },
            {
                isRead: true,
            },
            {
                new: true,
            }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.status(200).json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("Mark notification error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update notification",
        });
    }
};