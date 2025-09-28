import mysql from 'mysql2'
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'POS'
})

connection.connect((err)=>{
    if(err)
    {
        console.log('connection Failed',err.stack)
    }       
    console.log('connection successfully')
    })

    export default connection