import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { title, type } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const email =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      'migalia-drive@antigravity-sync-491006.iam.gserviceaccount.com';

    const rawKey =
      process.env.GOOGLE_PRIVATE_KEY ||
      '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9b4wRfPL6Z/Li\nUoxVXm2aJTU5svgjt/hLThY5rZQm1gueZ5DBmLdEomNzbpsOZpiMwkjc58xUPlhv\n/FnCRhUeh7z/l1Be98LJfCWCO5J1eFpR8eWK6+tbzg3S3HGIXCIjpIfkR6CwMa/0\nnyK6D+T4Y7tIJ9xBJzAlCqI6/wFjJEbClQJo0KWqKuCG6SOWOpQGAAj4Q6b4EmzM\naPkvuW9E/tpCeS+l8ZSGxqjQ0CeFl4AcNLEUtxn2D/xCBW0TwIXjhSYtLtWTA9f+\nfmH/R92IubWhBSpNNcH+lwq4WYW+z8GMcIDJ2x4KX6KTsUyyh2Y2yoIYDCeVceem\nZR1MwpOhAgMBAAECggEAO7dzxLmKURS+tMjH80tqqpqLHk7EOWJPs9GAYRtOZjW4\ngO1t7RGKyGiWiDd4SsBd25WNaZHq0C29LEQ1OXBlTPQGSN422FErRt/LZTQJVd2k\nP0vNjA8V6SFaKzwR0CYXHvxJWFWaGqD3MlqOFHBZQlISIktqe+FyJGMnRAjKM6ma\na40OMn0dr3PLjwyD40YhJHaMyDQtCFRXFp3s82ZljueUBFYgyRjuwiOARXJyg7Vh\nZm2leJHhDTq/4RMTnHr2fSUR4/JW6JqwDN28/BTPkeFcVSCpNddT8KDA01JdJa/F\nju5AKIn/+5f8h3s99VK/1w0bFLckmAhr26mSK4GVBwKBgQD6E5Vi/rpW4vacFlzT\nrBWtdEP9fYXUDigpSvSKcYlVH4x1GFHrhz9EqCbVL7mbaqARspJ3BBHNOfMaSGcs\nzlnT765GCPaaXcv4AfWDnJHSo1TwOKhuq1NqiiXvkdeFQEVRyGUt32aQecKjZB/Z\nUpkwXoErblpyTG+BUJq+/587KwKBgQDB7D/ed6ugyJYHc315aOoBYhMqaul50DeH\n/+ioJfFjynFZXOgfzdvLQYw8q/cK6rv9CjnAAdI96DwevQsbbkeJj7js1H8sfmm8\napKluNPfev7scmfRrTcxxFhnhhrmVEmArXNt2E5eXwE0WfsFGMIKCAf8E+qnuHtv\nHQbCiMsWYwKBgQCacOG/Y4V9B2o5922YpBw3JSigMpcl4SBYcBwaLAgec/9wiXZ+\nOOaP5jElU/YSz4TPqTLfIbpEvlcukix19XJwewNr6TkzGF5RahRQFa/RIGHigXsz\n7cb0cyD+lVk+x/SHj3U9IUzcSPY1pi4tLt/AiXzIb7yX/jCW8kq/TmruRQKBgA9R\nk0YGnAcqcTeLdvj1Qa70SWFLasAVo51ZqM5HmQbyAfw2K5v/jgJDXkmYp/4zxr/Z\nY/B39FyxkLY45ry2/G2wbcI/kwA3yDB7FrSCojIALE0PSIY2sap7wSQEYvGY7Ol+\nSiT+NkqcJKM3DG49o25ZbhAKnrm7B/0iBNuvJKPTAoGAUqUgDIbmcdqw0Bg4s55r\n5o2He1hTBjLBknW212M0XLukTYMbmeX31ThrKC0NQsEDmnsFunWIZNEJD+d/2qhF\npsxeRNgG9DkfPBt4YMJSYJbdoPCLeJmbh4Yp+L1hAM1L+TK0YSO9ltxZ6FebP3QH\nr01KnGWFeIe1XyXqbbMOPLU=\n-----END PRIVATE KEY-----\n';

    const folderId =
      process.env.GOOGLE_DRIVE_FOLDER_ID || '1al1p0uWP2Lwc7Z1pvgKGyJwoHWlNiViO';

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
