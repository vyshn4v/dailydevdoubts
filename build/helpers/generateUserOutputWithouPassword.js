"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateUserOutputWithouPasswordtsts(user, token, refreshToken, Bookmark) {
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
        "plan": user.plan,
        "_id": user._id,
        "badges": user.badges,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt,
        "token": token,
        "refreshToken": refreshToken,
        "bookmark": Bookmark
    };
    return Object.assign({}, data);
}
exports.default = generateUserOutputWithouPasswordtsts;
