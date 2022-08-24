import { execute } from "../utilities/SQLConnect";
import { Request, Response } from 'express';
import { decodeUserFromAccesstoken } from "./token";

export const saveNotificationToDatabase = async(data: {
    user_id: number
    notification_type: string
    notification_text: string
    sender: number
}) => {
    const sql = `
                INSERT INTO
                    notifications (
                        user_id,
                        notification_text,
                        notification_type,
                        sender)
                VALUES (?, ?, ?, ?)
                `
    const response = await execute(sql, [data.user_id, data.notification_text, data.notification_type, data.sender]);
    if (response.length > 0) {
        return true;
    }
    return false;

}

export const getNotifications = async(req: Request, res: Response) => {
    const requestedID = req.params.id;
    console.log("Getting notifications")
	try {
		if (!requestedID)
			return res.status(400).json({
				message: 'No user_id given',
			});
		const sql = `
                    SELECT
                        notifications.*,
                        profiles.name
                    FROM
                        notifications
                    INNER JOIN
                        profiles
                        ON
                        profiles.user_id = notifications.sender
                    WHERE
                        notifications.user_id = ?
                    ORDER BY
                        notification_time
                    `
		const notifications = await execute(sql, [requestedID]);
        console.log(notifications);
		if (notifications.length > 0)
			return res.status(200).json({
				message: 'Notifications retrieved successfully',
				notifications: notifications,
			});
		return res.status(204).json({
			message: 'No notifications found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
