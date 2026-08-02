import { Router } from "express";
import { clubs, mentors } from "../data/catalog.js";

export const catalogRouter = Router();

catalogRouter.get("/clubs", (_request, response) => response.json({ data: clubs }));
catalogRouter.get("/mentors", (_request, response) => response.json({ data: mentors }));
