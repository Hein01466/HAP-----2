import { Injectable, Logger } from '@nestjs/common'
import nodemailer from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private readonly transporter: nodemailer.Transporter | null

  constructor() {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587', 10)
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS
    const secure = (process.env.SMTP_SECURE || 'false') === 'true'

    if (!host || !user || !pass) {
      this.logger.warn('SMTP not configured. Emails will be skipped.')
      this.transporter = null
      return
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })
  }

  async sendMail(to: string, subject: string, text: string) {
    if (!this.transporter) {
      this.logger.log(`Email skipped to ${to}: ${subject}`)
      return
    }
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com'
    await this.transporter.sendMail({ from, to, subject, text })
  }
}
