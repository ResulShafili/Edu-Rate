import { openApiDocument } from "../../lib/api/openapi";

export const dynamic = "force-static";

export async function GET() {
  return Response.json(openApiDocument, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
