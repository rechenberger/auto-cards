import type { EmailConfig } from '@auth/core/providers/email'
import {
  getDefaultSignInEmailHtml,
  getDefaultSignInEmailText,
} from './defaultLoginEmail'

import nodemailer from 'nodemailer'

export const sendVerificationRequestEmail = async (
  params: Parameters<EmailConfig['sendVerificationRequest']>[0],
) => {
  const {
    identifier: email,
    url,
    theme,
    provider: { from },
  } = params
  try {
    const transporter = nodemailer.createTransport(process.env.SMTP_URL)
    const host = new URL(url).host

    const mailOptions = {
      from: from,
      to: email,
      subject: `Login to ${host}`,
      html: getDefaultSignInEmailHtml({ theme, url }),
      text: getDefaultSignInEmailText({ url }),
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.log({ error })
  }
}
