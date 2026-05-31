import app from "./app"
import config from "./config"
import pool from "./DB/db"
import initDB from "./DB/initdb"

const main =async()=>{
    //databse ar shathe connect kore
    // pool.connect()
    // console.log("Database connect successflly🥰")

    //table creat kore
    initDB()

    // server run kore
    app.listen(config.PORT,()=>{
        console.log(`server is running on port ${config.PORT}✅`)
    })
}

main();
