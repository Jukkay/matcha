import { execute } from "../utilities/SQLConnect";
import { Request, Response } from 'express';
import { decodeUserFromAccesstoken } from "./token";

export const saveNotificationToDatabase = async(data: {
    receiver_id: number
    notification_type: string
    notification_text: string
    sender_id: number
}) => {
    const sql = `
                INSERT INTO
                    notifications (
                        receiver_id,
                        notification_text,
                        notification_type,
                        sender_id)
                VALUES (?, ?, ?, ?)
                `
    const response = await execute(sql, [data.receiver_id, data.notification_text, data.notification_type, data.sender_id]);
    if (response.length > 0) {
        return true;
    }
    return false;

}

export const getNotifications = async(req: Request, res: Response) => {
   const user_id = req.params.id;
    console.log("Getting notifications for user_id: ", user_id);
	try {
		if (!user_id)
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
                        profiles.user_id = notifications.sender_id
                    WHERE
                        notifications.receiver_id = ?
                    ORDER BY
                        notification_time
                    `
		const notifications = await execute(sql, [user_id]);
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
