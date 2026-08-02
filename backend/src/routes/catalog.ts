import { Router } from "express";
import { ACADEMIC_CATALOG } from "../data/academic-catalog.js";
import { mentors } from "../data/catalog.js";

export const catalogRouter = Router();

catalogRouter.get("/mentors", (_request, response) => response.json({ data: mentors }));
catalogRouter.get("/academic-catalog", (_request, response) =>
  response.json({ data: ACADEMIC_CATALOG }),
);
