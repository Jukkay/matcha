import { execute } from '../utilities/SQLConnect';
import { Request, Response } from 'express';

export const saveMessageToDatabase = async (data: {
	match_id: number;
	sender_id: number;
	message_text: string;
	message_time: string;
}) => {
	const sql = `
				INSERT INTO
					messages 
					(
						match_id,
						user_id,
						message_text,
						message_time
					)
				VALUES
					(?, ?, ?, ?)
				`;
	const response = await execute(sql, [
		data.match_id,
		data.sender_id,
		data.message_text,
		data.message_time,
	]);
	return response;
};

export const getChatMessages = async (req: Request, res: Response) => {
	const requestedID = req.params.id;
	try {
		if (!requestedID)
			return res.status(400).json({
				message: 'No match_id given',
			});
		const sql = `
			SELECT
				messages.*,
				profiles.name
			FROM
				messages
			INNER JOIN
				profiles
				ON
				profiles.user_id = messages.user_id
			WHERE
				match_id = ?
			ORDER BY
				message_time
			`;
		const messages = await execute(sql, [requestedID]);
		if (messages.length > 0)
			return res.status(200).json({
				message: 'Chat log retrieved successfully',
				messages: messages,
			});
		return res.status(204).json({
			message: 'No messages found',
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: 'Something went wrong',
		});
	}
};
