import { Request, Response, NextFunction } from "express";
import { getSecret } from "docker-secret";
import { IEmailToken } from "../interfaces/token";
import { execute } from "../utilities/SQLConnect";
import {
  signAccessToken,
  signRefreshToken,
  verifyJWT,
} from "../utilities/promisifyJWT";
const tokenList = require("../index").tokenList;

export const verifyEmailToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const server_token = getSecret("server_token");
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
      });
    }
    const decoded = await verifyJWT(token, server_token);
    const { email } = decoded as IEmailToken;
    const sql = `UPDATE users SET validated = "1" WHERE email = ?;`;
    const response = await execute(sql, [email]);
    return res.status(201).json({
      message: "Email verified",
    });
  } catch (err) {
    return res.status(401).json({
      message: "Cannot verify email token",
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    const { user_id } = req.body;
    const refresh_token = getSecret("refresh_token");
    if (!token) {
      return res.json({
        status: 401,
        message: "No token given",
      });
    }
    // Check if token is valid
    const decoded = await verifyJWT(token, refresh_token);
    if (!decoded) {
      return res.status(403).json({
        message: "Invalid token",
      });
    }
    //Check if refreshToken is on valid token list
    const findToken = `SELECT * FROM tokens WHERE token = ?;`
    const foundToken = await execute(findToken, [token])
    if (!foundToken) {
      return res.status(403).json({
        message: "Token has been invalidated",
      });
    }
    // Create and return new access token
    const accessToken = await signAccessToken(user_id);
    if (!accessToken) {
      return res.status(500).json({
        message: "Server error",
      });
    }
    return res.status(200).json({
      user_id: user_id,
      accessToken: accessToken,
    });
  } catch (err) {
    console.error(err);
    return res.status(403).json({
      message: "Unauthorized",
    });
  }
};

export const updateRefreshTokenList = async (
 refreshToken: string,
 user_id: number
) => {
  try {

    //Check number of existing user tokens
    const findTokens = `SELECT user_id FROM tokens WHERE user_id = ?;`
		const userTokens = await execute(findTokens, [user_id])
    // Update first if more than 5
    if (userTokens.length > 4) {
      const updateToken = `UPDATE tokens SET token = ? WHERE user_id = ? ORDER BY token_id ASC LIMIT 1;`
      await execute(updateToken, [refreshToken, user_id])
      return
    }
    const sql = `INSERT INTO tokens (token, user_id) VALUES (?, ?);`
		await execute(sql, [refreshToken, user_id])

  } catch (err) {
    console.error(err);
  }
};


export const deleteRefreshToken = async (
  refreshToken: string,
 ) => {
   try {
     const sql = `DELETE FROM tokens WHERE token = ?;`
     await execute(sql, [refreshToken])

   } catch (err) {
     console.error(err);
   }
 };