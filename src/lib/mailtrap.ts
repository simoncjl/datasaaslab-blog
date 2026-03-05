interface MailtrapRecipient {
  email: string;
  name?: string;
}

interface MailtrapSendEmailOptions {
  apiToken: string;
  fromEmail: string;
  fromName?: string;
  to: MailtrapRecipient[];
  subject: string;
  text: string;
  html?: string;
  category?: string;
}

export async function sendMailtrapEmail(options: MailtrapSendEmailOptions): Promise<boolean> {
  const response = await fetch('https://send.api.mailtrap.io/api/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Token': options.apiToken,
    },
    body: JSON.stringify({
      from: {
        email: options.fromEmail,
        name: options.fromName ?? 'DataSaaSLab',
      },
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      category: options.category ?? 'subscription',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mailtrap send failed (${response.status}): ${body}`);
  }

  return true;
}
