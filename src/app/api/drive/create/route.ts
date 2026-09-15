import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { title, type } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const rawKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1al1p0uWP2Lwc7Z1pvgKGyJwoHWlNiViO';

    if (!email || !rawKey) {
      return NextResponse.json(
        { error: 'Credenciales de Google Drive no configuradas' },
        { status: 500 }
      );
    }

    // Normalizar salto de línea en la clave privada
    const privateKey = rawKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
      ],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Determinar mimeType según sea hoja de cálculo o documento de Google
    const mimeType =
      type === 'google_sheet'
        ? 'application/vnd.google-apps.spreadsheet'
        : 'application/vnd.google-apps.document';

    // 1. Crear el archivo directamente dentro de la carpeta con su título
    const createRes = await drive.files.create({
      requestBody: {
        name: title.trim(),
        mimeType,
        parents: [folderId],
      },
      fields: 'id, name, webViewLink, webContentLink',
      supportsAllDrives: true,
    });

    const file = createRes.data;

    if (!file.id) {
      throw new Error('No se pudo obtener el ID del archivo creado en Drive');
    }

    // 2. Dar permisos de lectura/edición con el link para que los socios lo abran de inmediato
    try {
      await drive.permissions.create({
        fileId: file.id,
        requestBody: {
          role: 'writer',
          type: 'anyone',
        },
        supportsAllDrives: true,
      });
    } catch (permErr) {
      console.warn('Advertencia al configurar permisos públicos del archivo:', permErr);
    }

    // Generar URL directa de edición
    const fileUrl =
      type === 'google_sheet'
        ? `https://docs.google.com/spreadsheets/d/${file.id}/edit`
        : `https://docs.google.com/document/d/${file.id}/edit`;

    return NextResponse.json({
      success: true,
      fileId: file.id,
      name: file.name,
      url: fileUrl,
    });
  } catch (error: any) {
    console.error('Error al crear archivo en Google Drive:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Error al comunicarse con Google Drive API',
        details: error?.response?.data || null,
      },
      { status: 500 }
    );
  }
}
