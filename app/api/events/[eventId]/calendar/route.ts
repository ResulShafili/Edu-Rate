import { apiError } from "../../../../lib/api/http";
import { requestRemoteApi } from "../../../../lib/auth/remote-credential";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ eventId: string }> };

type CampusEvent = {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  organizer?: string;
};

/** RFC 5545: ters kəsr, nöqtəli vergül, vergül və sətir sonu qorunmalıdır. */
const ESCAPES: Record<string, string> = {
  "\\": "\\\\",
  ";": "\\;",
  ",": "\\,",
  "\n": "\\n",
};

function escapeText(value: string) {
  return value.replace(/[\\;,\n]/g, (character) => ESCAPES[character] ?? character);
}

function stamp(value: string | undefined, fallback: Date) {
  const date = value ? new Date(value) : fallback;
  const safe = Number.isNaN(date.getTime()) ? fallback : date;
  return `${safe.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
}

/** RFC 5545: sətirlər 75 oktetdən uzun olmamalıdır. */
function fold(line: string) {
  if (line.length <= 74) return line;
  const parts: string[] = [line.slice(0, 74)];
  let rest = line.slice(74);
  while (rest.length) {
    parts.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  return parts.join("\r\n");
}

export async function GET(_request: Request, context: Context) {
  try {
    const { eventId } = await context.params;
    const events = await requestRemoteApi<CampusEvent[]>("/api/events");
    const event = events.find((item) => item.id === eventId);
    if (!event) {
      return new Response("Tədbir tapılmadı.", { status: 404, headers: { "Cache-Control": "no-store" } });
    }

    const now = new Date();
    const startDate = new Date(event.startAt);
    const fallbackEnd = new Date((Number.isNaN(startDate.getTime()) ? now : startDate).getTime() + 2 * 60 * 60 * 1000);

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EduRate//Kampus tedbirleri//AZ",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${event.id}@edurate`,
      `DTSTAMP:${stamp(undefined, now)}`,
      `DTSTART:${stamp(event.startAt, now)}`,
      `DTEND:${stamp(event.endAt, fallbackEnd)}`,
      `SUMMARY:${escapeText(event.title)}`,
      ...(event.description ? [`DESCRIPTION:${escapeText(event.description)}`] : []),
      ...(event.location ? [`LOCATION:${escapeText(event.location)}`] : []),
      "BEGIN:VALARM",
      "TRIGGER:-PT60M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(`${event.title} bir saatdan sonra başlayır`)}`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ];

    return new Response(`${lines.map(fold).join("\r\n")}\r\n`, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="edurate-${encodeURIComponent(event.id)}.ics"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
