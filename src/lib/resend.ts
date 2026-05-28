// Resend mailing helper
// import { Resend } from 'resend';

export const FROM = process.env.RESEND_FROM_EMAIL || 'kontakt@polskie-pogrzeby.pl';
export const FROM_NAME = 'Polskie Pogrzeby';

// export const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailTemplate =
  | 'family-confirmation'
  | 'family-offers-ready'
  | 'family-review-request'
  | 'company-new-lead'
  | 'company-payment-success'
  | 'company-payment-failed'
  | 'claim-verification'
  | 'admin-flagged-review';

export async function sendEmail({
  to,
  template,
  data,
}: {
  to: string;
  template: EmailTemplate;
  data: Record<string, any>;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[mock-email] ${template} -> ${to}`, data);
    return { id: 'mock-' + Date.now() };
  }
  // const { subject, html, text } = renderTemplate(template, data);
  // return resend.emails.send({
  //   from: `${FROM_NAME} <${FROM}>`,
  //   to,
  //   subject,
  //   html,
  //   text,
  //   tags: [{ name: 'template', value: template }],
  // });
}
