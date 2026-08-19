import { Router } from "express";
import { z } from "zod";
import { createAnnouncement, createFeedPost, getAnnouncementReactionState, listAnnouncements, listFeed, recordAnnouncementView, setAnnouncementReaction } from "../db/network.js";
import { authenticate, optionalAuthenticate } from "../middleware/authenticate.js";
import { findUserById } from "../db/database.js";
import { ApiError } from "../lib/api-error.js";

export const networkRouter = Router();

const querySchema = z.object({
  category: z.enum(["official", "faculties", "clubs", "scholarship", "events"]).optional(),
});

networkRouter.get("/announcements", optionalAuthenticate, async (request, response) => {
  const { category } = querySchema.parse(request.query);
  response.json({ data: await listAnnouncements(category,request.auth?.userId) });
});

const announcementSubmissionSchema=z.object({
  category:z.enum(["official","faculties","clubs","scholarship","events"]),
  title:z.string().trim().min(3).max(180),summary:z.string().trim().min(10).max(800),
  startsAt:z.string().datetime({offset:true}),expiresAt:z.string().datetime({offset:true}),
}).strict().superRefine((value,context)=>{if(new Date(value.expiresAt).getTime()<=new Date(value.startsAt).getTime())context.addIssue({code:"custom",path:["expiresAt"],message:"Bitmə vaxtı başlama vaxtından sonra olmalıdır."});});
networkRouter.post("/announcements",authenticate,async(request,response)=>{
  const input=announcementSubmissionSchema.parse(request.body);const user=await findUserById(request.auth!.userId);
  if(!user)throw new ApiError(404,"USER_NOT_FOUND","İstifadəçi tapılmadı.");
  const sourceInitials=user.name.split(/\s+/).slice(0,2).map((part)=>part[0]?.toLocaleUpperCase("az")).join("");
  const tones={official:"lime",faculties:"lilac",clubs:"blue",scholarship:"gold",events:"coral"} as const;
  const item=await createAnnouncement({...input,source:user.name,sourceInitials,tone:tones[input.category],priority:false,status:"draft"},user.id);
  response.status(202).json({data:item});
});

const reactionSchema=z.enum(["👍","❤️","😂","😮","😢","👏","🎉","🤔","👎","🙏"]);
networkRouter.post("/announcements/:id/view",authenticate,async(request,response)=>response.json({data:{viewCount:await recordAnnouncementView(z.string().parse(request.params.id),request.auth!.userId)}}));
networkRouter.get("/announcements/:id/reactions",authenticate,async(request,response)=>{const id=z.string().parse(request.params.id);response.json({data:await getAnnouncementReactionState(id,request.auth!.userId)});});
networkRouter.patch("/announcements/:id/reaction",authenticate,async(request,response)=>{const id=z.string().parse(request.params.id);const {emoji}=z.object({emoji:reactionSchema.nullable()}).parse(request.body);await setAnnouncementReaction(id,request.auth!.userId,emoji);response.json({data:await getAnnouncementReactionState(id,request.auth!.userId)});});

networkRouter.get("/feed", async (request, response) => {
  const { category } = querySchema.parse(request.query);
  response.json({ data: await listFeed(category) });
});

networkRouter.post("/feed", authenticate, async (request, response) => {
  const input = z
    .object({
      title: z.string().trim().min(3).max(180),
      summary: z.string().trim().min(10).max(800),
      tags: z.array(z.string().trim().min(1).max(32)).max(5).default([]),
    })
    .strict()
    .parse(request.body);

  const user = await findUserById(request.auth!.userId);
  if (!user) {
    throw new ApiError(404, "USER_NOT_FOUND", "İstifadəçi tapılmadı.");
  }

  response.status(202).json({ data: await createFeedPost(user.id, input, user.name) });
});
