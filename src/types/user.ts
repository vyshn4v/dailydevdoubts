import { Types } from "mongoose";

export interface User {
    name: string | undefined;
    email: string | undefined;
    phone: number | undefined;
    password: string;
    isBanned: boolean;
    isVerified: boolean;
    reputation: number;
    profile_image: string;
    badges: Array<Object> | undefined;
    following_user: Array<Types.ObjectId>;
    isSignupWithGoogle: boolean;
    _id: Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
    bookmark: Array<Types.ObjectId>
};
export type UsernWithOutPassword = Omit<User, "password">

