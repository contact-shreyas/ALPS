import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { sendMail } from "../src/lib/mailer";

async function run() {
  const unsent = await prisma.alert.findMany({ where: { sentAt: null }});
  for (const a of unsent) {
    const res = await sendMail({
      to: process.env.MUNICIPALITY_EMAIL || "dev@local.invalid",
      subject: `Light Pollution Alert: ${a.code}`,
      html: `<p>Severity: <b>${a.severity}</b></p><p>${a.message}</p>`
    });
    if (res) {
      await prisma.alert.update({ where: { id: a.id }, data: { sentAt: new Date() } });
    }
  }
  console.log(`✅ Notified ${unsent.length} alerts (or logged JSON if SMTP not configured).`);
}
run().finally(() => prisma.$disconnect());
