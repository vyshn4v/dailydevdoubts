import { Types } from "mongoose";

export interface Person {
    name: string | undefined;
    email: string | undefined;
    phone: number | undefined;
    password: string;
    isBanned: boolean;
    isVerified: boolean;
    following_user: Array<Types.ObjectId>;
    isSignupWithGoogle: boolean;
    _id: Types.ObjectId;
    createdAt: NativeDate;
    updatedAt: NativeDate;
};
export type personWithOutPassword = Omit<Person, "password">