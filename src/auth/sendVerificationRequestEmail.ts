import { type EmailConfig } from '@auth/core/providers/email'
import { Resend } from 'resend'
import {
  getDefaultSignInEmailHtml,
  getDefaultSignInEmailText,
} from './defaultLoginEmail'

export const sendVerificationRequestEmail = async (
  params: Parameters<EmailConfig['sendVerificationRequest']>[0],
) => {
  let {
    identifier: email,
    url,
    theme,
    provider: { from, apiKey },
  } = params
  try {
    const resend = new Resend(apiKey)
    const host = new URL(url).host

    await resend.emails.send({
      from: from,
      to: email,
      subject: `Login to ${host}`,
      html: getDefaultSignInEmailHtml({ theme, url }),
      text: getDefaultSignInEmailText({ url }),
    })
  } catch (error) {
    console.log({ error })
  }
}
