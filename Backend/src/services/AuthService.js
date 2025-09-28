import { AuthModel } from "../models/AuthModel.js";
import bcrypt from "bcrypt"


export const AuthService = {

 loginByPassword: async (password) => {
    const users = await AuthModel.findByPassword();
    for (let user of users) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        return user; // return the matched user
      }
    }

    throw new Error("checkPassword");
  },


}