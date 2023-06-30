import { User, UsernWithOutPassword } from "../types/user";

export default function generateUserOutputWithouPasswordtsts(user: User, token: string, refreshToken: string) {
    let data = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "isBanned": user.isBanned,
        "isVerified": user.isVerified,
        "reputation": user.reputation,
        "profile_image": user.profile_image,
        "following_user": user.following_user,
        "isSignupWithGoogle": user.isSignupWithGoogle,
        "_id": user._id,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt,
        "token": token,
        "refreshToken":refreshToken
    }
    return <UsernWithOutPassword>{
        ...data
    }
}