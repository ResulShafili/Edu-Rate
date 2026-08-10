import { Router } from "express";
import { ACADEMIC_CATALOG } from "../data/academic-catalog.js";
import { listProfessionalProfiles } from "../db/professionals.js";

export const catalogRouter = Router();

catalogRouter.get("/mentors", async (_request, response) => {
  const profiles = await listProfessionalProfiles("mentor");
  response.json({ data: profiles.map((profile) => ({ ...profile, id: profile.slug, profileId: profile.id, available: profile.visible })) });
});
catalogRouter.get("/teachers", async (_request, response) => {
  const profiles = await listProfessionalProfiles("teacher");
  response.json({ data: profiles.map((profile) => ({ ...profile, id: profile.slug, profileId: profile.id, available: profile.visible })) });
});
catalogRouter.get("/academic-catalog", (_request, response) =>
  response.json({ data: ACADEMIC_CATALOG }),
);
