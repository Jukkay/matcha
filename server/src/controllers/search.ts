import { Request, Response } from 'express';
import { execute } from '../utilities/SQLConnect';
import bcryptjs from 'bcryptjs';
import { signAccessToken, signRefreshToken } from '../utilities/promisifyJWT';
import { sendEmailVerification } from '../utilities/sendEmailVerification';
import { convertBirthdayToAge } from '../utilities/helpers';
import { validateRegistrationInput } from '../utilities/validators';
import { decodeUserFromAccesstoken, deleteRefreshToken, updateRefreshTokenList } from './token';

export const searchProfiles = async (req: Request, res: Response) => {
    console.log(req.body.search)
}