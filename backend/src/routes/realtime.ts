import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/authenticate.js";
import { issueRealtimeTicket } from "../realtime.js";

export const realtimeRouter=Router();
realtimeRouter.post("/ticket",rateLimit({windowMs:60_000,limit:10,standardHeaders:true,legacyHeaders:false}),authenticate,(request,response)=>{
  response.status(201).json({data:issueRealtimeTicket(request.auth!.userId)});
});
