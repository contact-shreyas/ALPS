import { prisma } from '@/lib/prisma';
import { sendMail } from '@/lib/mailer';
import { generateDashboardReport } from '@/lib/reports';

export async function checkAndSendScheduledReports() {
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, '0');
  const currentMinute = now.getMinutes().toString().padStart(2, '0');
  const currentTime = `${currentHour}:${currentMinute}`;
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

  // Find all enabled schedules for current time
  const schedules = await prisma.reportSchedule.findMany({
    where: {
      enabled: true,
      type: 'dashboard',
      time: currentTime,
      lastSentAt: {
        // Only get schedules that haven't been sent in the last hour
        lt: new Date(now.getTime() - 60 * 60 * 1000)
      }
    }
  });

  for (const schedule of schedules) {
    // Check if we should send today
    const shouldSendToday = schedule.frequency === 'daily' ||
      (schedule.frequency === 'weekly' && currentDay === 'Monday') ||
      (schedule.frequency === 'custom' && schedule.days?.includes(currentDay));

    if (!shouldSendToday) continue;

    try {
      // TODO: Replace with actual metrics query
      const mockData = {
        timestamp: new Date().toISOString(),
        metrics: {
          totalDistricts: 100,
          affectedDistricts: 35,
          avgRadiance: 42.5,
          highSeverityCount: 12
        },
        topDistricts: [
          { name: "District 1", stateCode: "ST1", meanRadiance: 75.2 },
          { name: "District 2", stateCode: "ST2", meanRadiance: 68.9 },
          { name: "District 3", stateCode: "ST3", meanRadiance: 62.4 },
          { name: "District 4", stateCode: "ST4", meanRadiance: 58.1 },
          { name: "District 5", stateCode: "ST5", meanRadiance: 55.7 }
        ],
        nationalTrend: [
          { date: "2025-09-08", value: 450 },
          { date: "2025-09-09", value: 425 },
          { date: "2025-09-10", value: 460 },
          { date: "2025-09-11", value: 440 },
          { date: "2025-09-12", value: 455 }
        ]
      };

      const report = generateDashboardReport(mockData);

      await sendMail({
        to: schedule.email || process.env.MUNICIPALITY_EMAIL!,
        subject: 'Scheduled Light Pollution Dashboard Report',
        html: report.html
      });

      // Update lastSentAt
      await prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: { lastSentAt: now }
      });

      console.log(`Scheduled report sent for schedule ${schedule.id}`);
    } catch (error) {
      console.error(`Failed to send scheduled report ${schedule.id}:`, error);
    }
  }
}