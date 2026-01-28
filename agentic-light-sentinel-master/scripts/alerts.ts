import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import nodemailer from "nodemailer";

const THRESHOLD = Number(process.env.ALERT_HOTSPOTS ?? 50);

async function send(to: string, message: string) {
  const t = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await t.sendMail({ from: process.env.SMTP_USER, to, subject: "Light Sentinel Alert", text: message });
}

async function main() {
  const today = new Date();
  const date = new Date(today.toISOString().slice(0, 10) + "T00:00:00Z");

  const bad = await prisma.districtDailyMetric.findMany({
    where: { date, hotspots: { gt: THRESHOLD } },
    select: { code: true, hotspots: true },
  });

  if (!bad.length) { console.log("No alerts today."); return; }

  const districts = await prisma.district.findMany({
    where: { code: { in: bad.map(b => b.code) } },
    select: { code: true, name: true, stateCode: true },
  });
  const byCode = new Map(districts.map(d => [d.code, d]));
  const lines = bad.map(b => {
    const d = byCode.get(b.code);
    return `${d?.name} (${d?.stateCode}) — hotspots=${b.hotspots}`;
  });

  await send(process.env.ALERT_TO!, `Districts exceeded threshold ${THRESHOLD}\n\n` + lines.join("\n"));
  console.log(`📧 Sent alert for ${bad.length} districts`);
}
main().catch((e) => { console.error(e); process.exit(1); });
