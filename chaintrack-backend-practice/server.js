import express from "express";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get("/health",(req,res)=>{
    res.json({
        success : true,
        message: "🚀 ChainTrack Backend is running!",
        timestamp : new Date().toISOString()
    })
})

app.listen(PORT,()=>{
    console.log(`🚀 Server is running on port ${PORT}`);
})
