import mongoose from "mongoose";


export const connection = () =>{
    mongoose.connect(process.env.MONGO_URL,{
        dbName:"AUCTION_PLATFORM"
    }).then(()=>{
        console.log("Connected to database");
        
    }).catch((err)=>{
        console.log(`database error : ${err}`);
        
    })
}