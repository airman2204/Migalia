import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Debes proporcionar correo y contraseña de Zoho Mail.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validar que el dominio sea @migaliabakery.com o @zohomail.com
    const allowedDomain = '@migaliabakery.com';
    if (!cleanEmail.endsWith(allowedDomain) && !cleanEmail.endsWith('@zohomail.com') && !cleanEmail.endsWith('@zoho.com')) {
      return NextResponse.json(
        { error: `Acceso restringido. Solo cuentas del dominio oficial ${allowedDomain} o Zoho están autorizadas.` },
        { status: 403 }
      );
    }

    // 2. Verificar autenticidad real contra los servidores seguros de Zoho Mail vía SMTP (puerto 465 SSL)
    const transporter = nodemailer.createTransport({
      host: 'smtppro.zoho.com', // Servidor profesional para dominios personalizados
      port: 465,
      secure: true, // SSL
      auth: {
        user: cleanEmail,
        pass: password,
      },
      tls: {
        rejectUnauthorized: true,
      },
      connectionTimeout: 10000, // 10 segundos
    });

    try {
      await transporter.verify();
    } catch (primaryError: any) {
      // Intento de fallback con el servidor estándar de Zoho
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: 'smtp.zoho.com',
          port: 465,
          secure: true,
          auth: {
            user: cleanEmail,
            pass: password,
          },
          connectionTimeout: 8000,
        });
        await fallbackTransporter.verify();
      } catch (fallbackError: any) {
        console.error('Error de autenticación Zoho:', primaryError?.message || fallbackError?.message);
        return NextResponse.json(
          {
            error:
              'Credenciales de Zoho inválidas o autenticación en 2 pasos activada. Verifica tu correo y contraseña (o Contraseña de Aplicación de Zoho).',
          },
          { status: 401 }
        );
      }
    }

    // Si las credenciales fueron verificadas con éxito por los servidores de Zoho
    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    return NextResponse.json({
      success: true,
      user: {
        id: 'zoho-' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_'),
        name: formattedName,
        shortName: formattedName,
        email: cleanEmail,
        role: 'Socio Cofundador Verificado',
        avatar: formattedName.charAt(0).toUpperCase(),
      },
    });
  } catch (error: any) {
    console.error('Error general en endpoint de autenticación:', error);
    return NextResponse.json(
      { error: 'Error de conexión con los servidores de Zoho. Intenta de nuevo.' },
      { status: 500 }
    );
  }
}
