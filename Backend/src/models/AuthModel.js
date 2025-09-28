import connection from "../config.js";

export const AuthModel={

    findByPassword : async ()=>{
        const [rows] = await connection.query("SELECT * FROM users");
         return rows;
    },
}