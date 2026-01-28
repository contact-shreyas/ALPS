/**
 * Enhanced notification system with multiple channels
 */

import { prisma } from './prisma';
import { sendMail } from './mailer-debug';
import { format } from 'date-fns';

export interface NotificationPayload {
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data?: Record<string, any>;
  recipients?: string[];
}

export interface NotificationChannel {
  name: string;
  enabled: boolean;
  send: (payload: NotificationPayload) => Promise<boolean>;
}

class NotificationManager {
  private channels: Map<string, NotificationChannel> = new Map();

  constructor() {
    // Register default channels
    this.registerChannel({
      name: 'email',
      enabled: true,
      send: this.sendEmailNotification.bind(this),
    });

    this.registerChannel({
      name: 'webhook',
      enabled: false,
      send: this.sendWebhookNotification.bind(this),
    });

    this.registerChannel({
      name: 'slack',
      enabled: false,
      send: this.sendSlackNotification.bind(this),
    });
  }

  registerChannel(channel: NotificationChannel): void {
    this.channels.set(channel.name, channel);
  }

  async send(payload: NotificationPayload): Promise<{
    success: boolean;
    results: Record<string, boolean>;
  }> {
    const results: Record<string, boolean> = {};
    let overallSuccess = false;

    this.channels.forEach(async (channel, name) => {
      if (!channel.enabled) return;

      try {
        const result = await channel.send(payload);
        results[name] = result;
        if (result) overallSuccess = true;
      } catch (error) {
        console.error(`Notification channel ${name} failed:`, error);
        results[name] = false;
      }
    });

    // Log the notification attempt
    await this.logNotification(payload, results);

    return { success: overallSuccess, results };
  }

  private async sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
    const recipients = payload.recipients || [process.env.ALERT_EMAIL || 'admin@example.com'];
    
    const emailSubject = `🚨 Light Pollution Alert: ${payload.title}`;
    const emailBody = this.formatEmailBody(payload);

    try {
      for (const recipient of recipients) {
        await sendMail({
          to: recipient,
          subject: emailSubject,
          html: emailBody,
        });
      }
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  private async sendWebhookNotification(payload: NotificationPayload): Promise<boolean> {
    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) return false;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          message: payload.message,
          severity: payload.severity,
          timestamp: new Date().toISOString(),
          data: payload.data,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Webhook notification failed:', error);
      return false;
    }
  }

  private async sendSlackNotification(payload: NotificationPayload): Promise<boolean> {
    const slackWebhook = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhook) return false;

    const color = this.getSeverityColor(payload.severity);
    const slackPayload = {
      attachments: [
        {
          color,
          title: payload.title,
          text: payload.message,
          timestamp: Math.floor(Date.now() / 1000),
          fields: payload.data ? Object.entries(payload.data).map(([key, value]) => ({
            title: key,
            value: String(value),
            short: true,
          })) : [],
        },
      ],
    };

    try {
      const response = await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackPayload),
      });
      return response.ok;
    } catch (error) {
      console.error('Slack notification failed:', error);
      return false;
    }
  }

  private formatEmailBody(payload: NotificationPayload): string {
    const severityEmoji = this.getSeverityEmoji(payload.severity);
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    return `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">
              ${severityEmoji} Light Pollution Alert
            </h1>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h2 style="margin-top: 0; color: #2c3e50;">${payload.title}</h2>
              <p style="font-size: 16px; margin: 10px 0;">${payload.message}</p>
              
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                <p><strong>Severity:</strong> <span style="color: ${this.getSeverityColor(payload.severity)}; text-transform: uppercase;">${payload.severity}</span></p>
                <p><strong>Timestamp:</strong> ${timestamp}</p>
              </div>
            </div>

            ${payload.data ? `
              <div style="background: #fff; border: 1px solid #dee2e6; border-radius: 5px; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #495057;">Additional Data:</h3>
                <ul style="list-style: none; padding: 0;">
                  ${Object.entries(payload.data).map(([key, value]) => 
                    `<li style="padding: 5px 0; border-bottom: 1px solid #f1f3f4;"><strong>${key}:</strong> ${value}</li>`
                  ).join('')}
                </ul>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px;">
              <p>This is an automated alert from the INFINITY LOOP system.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getSeverityEmoji(severity: string): string {
    const emojis = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨',
    };
    return emojis[severity as keyof typeof emojis] || '⚠️';
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      low: '#ffc107',
      medium: '#fd7e14',
      high: '#dc3545',
      critical: '#721c24',
    };
    return colors[severity as keyof typeof colors] || '#6c757d';
  }

  private async logNotification(
    payload: NotificationPayload,
    results: Record<string, boolean>
  ): Promise<void> {
    try {
      await prisma.agentLog.create({
        data: {
          component: 'notification',
          status: Object.values(results).some(Boolean) ? 'success' : 'error',
          error: Object.values(results).some(Boolean) ? null : 'All notification channels failed',
        },
      });
    } catch (error) {
      console.error('Failed to log notification:', error);
    }
  }

  enableChannel(name: string): void {
    const channel = this.channels.get(name);
    if (channel) {
      channel.enabled = true;
    }
  }

  disableChannel(name: string): void {
    const channel = this.channels.get(name);
    if (channel) {
      channel.enabled = false;
    }
  }

  getChannelStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.channels.forEach((channel, name) => {
      status[name] = channel.enabled;
    });
    return status;
  }
}

export const notificationManager = new NotificationManager();