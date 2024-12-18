import moment from "moment";
import emailService from "./email.service";
import { Token, TokenType, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import { prismaClient } from "../db";
import { ApiError } from "../config/error";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../config";


const saveToken = async (userId: string, tokenType: TokenType, token: string) => {
  // check whether do we need multiple tokens for the same user
  
  const tokenExists = await prismaClient.token.findFirst({
    where: {
      userId,
      type: tokenType
    }
  });
  if(tokenExists) {
    return await prismaClient.token.update({
      where: {
        userId,
        type: tokenType
      }, data: {
        token
      }
    })
  }
  return await prismaClient.token.create({
    data: {
      userId: userId,
      token,
      type: tokenType
    }
  })
}
const generateToken = (
  userId: string,
  expires: any,
  type: string,
  config = process.env.JWT_SECRET
) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, config!);
};

const generateAuthTokens = async (user: any) => {
  const accessTokenExpires = moment().add(1, 'day');
  const accesstoken = generateToken(user.id, accessTokenExpires, TokenType.ACCESS, JWT_ACCESS_SECRET);

  // edge case to solve while creating new refresh token, make sure to delete the existing token from db
  const refreshTokenExpires = moment().add(7, 'day');
  const refreshToken = generateToken(user.id, refreshTokenExpires, TokenType.REFRESH, JWT_REFRESH_SECRET);

  await saveToken(user.id, TokenType.REFRESH, refreshToken);

  return {
    accesstoken, refreshToken
  }
};

const verifyToken = async (
  token: string,
  type: TokenType,
  secret = process.env.JWT_SECRET!
) => {
  try {
    const payload = jwt.verify(token, secret);
    const userId = payload.sub as string;

    const tokenDoc = await prismaClient.token.findFirst({
      where: {
        token,
        type,
        userId,
      },
    });

    if (!tokenDoc) {
      throw new ApiError(404, "Token not found");
    }
    return tokenDoc;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    }
    throw new ApiError(401, "Invalid token");
  }
};

const generateEmailVerificationToken = async (user: User) => {
  const expires = moment().add(1, "minute");
  const token = generateToken(user.id, expires, TokenType.VERIFY_EMAIL);
  await prismaClient.$transaction(async (tx) => {
    // delete the previous tokens
    await tx.token.deleteMany({
      where: {
        userId: user.id,
        type: TokenType.VERIFY_EMAIL,
      },
    });

    // and generate new token for the user ( email verify token)
    await tx.token.create({
      data: {
        userId: user.id,
        token,
        type: TokenType.VERIFY_EMAIL,
      },
    });
  });

  emailService.sendVerificationEmail(user.email, token);
};

export default { generateEmailVerificationToken, generateToken, verifyToken, generateAuthTokens, saveToken };