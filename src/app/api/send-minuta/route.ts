import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

/**
 * Endpoint para despachar la minuta formal de acuerdos a los socios de Migalia por correo electrónico.
 */
export async function POST(request: NextRequest) {
  try {
    const { title, date, agreements, attendees, rawNotes, senderName, recipients } =
      await request.json();

    if (!title || !agreements) {
      return NextResponse.json(
        { error: 'Título y acuerdos son requeridos para emitir la minuta.' },
        { status: 400 }
      );
    }

    const defaultRecipients = ['mario@migaliabakery.com', 'susy@migaliabakery.com'];
    const targetEmails: string[] =
      Array.isArray(recipients) && recipients.length > 0 ? recipients : defaultRecipients;

    // Configurar transporte de correo (Zoho SMTP o cuenta de envío)
    const smtpUser = process.env.ZOHO_EMAIL || process.env.SMTP_USER || 'contacto@migaliabakery.com';
    const smtpPass = process.env.ZOHO_PASSWORD || process.env.SMTP_PASS;

    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #F8F6F0; margin: 0; padding: 30px 10px; color: #221F1D; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #E6DFD5; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #221F1D; padding: 28px; text-align: center; color: #ffffff; }
          .logo-title { font-family: Georgia, serif; font-size: 26px; letter-spacing: 2px; color: #C59B27; margin: 0; }
          .subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #A39E93; margin-top: 6px; }
          .content { padding: 32px 28px; }
          .badge { display: inline-block; background: #FEF3C7; color: #B45309; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 12px; }
          .meeting-title { font-family: Georgia, serif; font-size: 20px; color: #221F1D; margin: 0 0 16px 0; font-weight: bold; line-height: 1.3; }
          .meta-box { background: #F8F6F0; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #6E665D; margin-bottom: 24px; border: 1px solid #EAE5DC; }
          .section-title { font-family: Georgia, serif; font-size: 14px; font-weight: bold; color: #221F1D; border-bottom: 1px solid #EAE5DC; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .agreements { font-size: 13px; line-height: 1.6; color: #34302C; white-space: pre-line; background: #FDFBF7; padding: 16px; border-radius: 12px; border-left: 4px solid #C59B27; }
          .footer { background: #F2EFE9; padding: 20px; text-align: center; font-size: 11px; color: #8C827A; border-top: 1px solid #E6DFD5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-title">MIGALIA</h1>
            <p class="subtitle">Boutique Bakery · Minuta Oficial de Sesión</p>
          </div>
          <div class="content">
            <span class="badge">Acuerdos Asentados</span>
            <h2 class="meeting-title">${title}</h2>
            <div class="meta-box">
              <p style="margin: 0 0 4px 0;"><strong>📅 Fecha de la Sesión:</strong> ${date || new Date().toISOString().split('T')[0]}</p>
              <p style="margin: 0 0 4px 0;"><strong>👥 Asistentes:</strong> ${attendees || 'Mario González & Susy'}</p>
              <p style="margin: 0;"><strong>✍️ Asentado por:</strong> ${senderName || 'Miga AI & Asistente de Sesión'}</p>
            </div>

            <div class="section-title">Acuerdos y Compromisos Tomados</div>
            <div class="agreements">${agreements}</div>

            ${rawNotes ? `
            <div class="section-title">Transcripción / Notas de Respaldo</div>
            <div style="font-size: 12px; color: #8C827A; font-style: italic; line-height: 1.5; background: #FAFAFA; padding: 12px; border-radius: 8px;">
              ${rawNotes}
            </div>` : ''}
          </div>
          <div class="footer">
            Documento emitido y registrado automáticamente en el expediente central de <strong>MIGALIA</strong>.<br>
            Plataforma Administrativa · Puebla, México.
          </div>
        </div>
      </body>
    </html>
    `;

    // Si hay credenciales de correo configuradas, enviar por SMTP
    let emailSent = false;
    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtppro.zoho.com',
          port: 465,
          secure: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: `"Migalia Asistente" <${smtpUser}>`,
          to: targetEmails.join(', '),
          subject: `📋 Minuta de Sesión: ${title} - Migalia`,
          html: emailHtml,
        });

        emailSent = true;
      } catch (smtpErr) {
        console.warn('Error al despachar por SMTP directo, registrando minuta localmente:', smtpErr);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      recipients: targetEmails,
      message: emailSent
        ? 'Minuta enviada con éxito a las cuentas de los socios.'
        : 'Minuta registrada formalmente con plantilla de correo lista.',
      renderedHtml: emailHtml,
    });
  } catch (error: any) {
    console.error('Error en /api/send-minuta:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el envío de la minuta.' },
      { status: 500 }
    );
  }
}
