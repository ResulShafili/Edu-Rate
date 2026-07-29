import { Router } from "express";
import { clubs, events, mentors } from "../data/catalog.js";

export const catalogRouter = Router();

catalogRouter.get("/events", (_request, response) => response.json({ data: events }));
catalogRouter.get("/clubs", (_request, response) => response.json({ data: clubs }));
catalogRouter.get("/mentors", (_request, response) => response.json({ data: mentors }));
