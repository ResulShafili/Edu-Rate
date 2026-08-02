import { Router } from "express";
import { mentors } from "../data/catalog.js";

export const catalogRouter = Router();

catalogRouter.get("/mentors", (_request, response) => response.json({ data: mentors }));
