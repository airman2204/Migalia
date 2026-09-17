import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { DocumentFolder, DocumentType, MigaliaDocument } from '@/types';

export const dynamic = 'force-dynamic';

function determineFolder(name: string): DocumentFolder {
  const lower = name.toLowerCase();
  if (
    lower.includes('finanz') ||
    lower.includes('presupuesto') ||
    lower.includes('inversion') ||
    lower.includes('capex') ||
    lower.includes('costo')
  ) {
    return 'Finanzas & Inversión';
  }
  if (
    lower.includes('receta') ||
    lower.includes('taller') ||
    lower.includes('operacion') ||
    lower.includes('cocina') ||
    lower.includes('produccion') ||
    lower.includes('inventario')
  ) {
    return 'Operaciones & Taller';
  }
  if (
    lower.includes('legal') ||
    lower.includes('constituc') ||
    lower.includes('acta') ||
    lower.includes('contrato') ||
    lower.includes('permiso') ||
    lower.includes('e-2') ||
    lower.includes('visa')
  ) {
    return 'Legal & Constitución';
  }
  if (
    lower.includes('brand') ||
    lower.includes('identidad') ||
    lower.includes('logo') ||
    lower.includes('estilo') ||
    lower.includes('marketing') ||
    lower.includes('mercadotecnia') ||
    lower.includes('empaque')
  ) {
    return 'Branding & Mercadotecnia';
  }
  return 'General';
}

function determineDocType(mimeType: string): DocumentType {
  if (
    mimeType === 'application/vnd.google-apps.spreadsheet' ||
    mimeType.includes('excel') ||
    mimeType.includes('spreadsheet')
  ) {
    return 'google_sheet';
  }
  if (
    mimeType === 'application/vnd.google-apps.document' ||
    mimeType.includes('word') ||
    mimeType.includes('document')
  ) {
    return 'google_doc';
  }
  return 'google_embed';
}

export async function GET() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '1al1p0uWP2Lwc7Z1pvgKGyJwoHWlNiViO';

    if (!email || !privateKey) {
      return NextResponse.json(
        { error: 'Credenciales de Google Service Account no configuradas en el servidor.' },
        { status: 500 }
      );
    }

    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.readonly', 'https://www.googleapis.com/auth/drive'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q: "'" + folderId + "' in parents and trashed = false",
      fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime, owners)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 100,
    });

    const driveFiles = response.data.files || [];

    const documents: MigaliaDocument[] = driveFiles.map((file) => {
      const docType = determineDocType(file.mimeType || '');
      const folder = determineFolder(file.name || '');
      const owner = file.owners?.[0];

      return {
        id: 'drive-' + file.id,
        title: file.name || 'Documento sin título',
        type: docType,
        folder,
        content: file.webViewLink || ('https://docs.google.com/document/d/' + file.id + '/edit'),
        googleUrl: file.webViewLink || ('https://docs.google.com/document/d/' + file.id + '/edit'),
        authorName: owner?.displayName || 'Socio Migalia',
        createdAt: file.createdTime ? file.createdTime.split('T')[0] : new Date().toISOString().split('T')[0],
        updatedAt: file.modifiedTime ? file.modifiedTime.split('T')[0] : new Date().toISOString().split('T')[0],
        isPinned: false,
      };
    });

    return NextResponse.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error: any) {
    console.error('Error al sincronizar con Google Drive:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al comunicarse con Google Drive API' },
      { status: 500 }
    );
  }
}
