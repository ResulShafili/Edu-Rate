import { apiSuccess } from "../../lib/api/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return apiSuccess({
    status: "ok",
    service: "EduRate API",
    timestamp: new Date().toISOString(),
  });
}
