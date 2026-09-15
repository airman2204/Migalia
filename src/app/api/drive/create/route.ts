import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { title, type } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'El título es requerido' }, { status: 400 });
    }

    const webhookUrl =
      process.env.GOOGLE_DRIVE_WEBHOOK_URL ||
      'https://script.google.com/macros/s/AKfycbzQ_7EpRc6-3DeDlfXm-pu_obiH7ooDhegcupMaqtfAbTt-NVyuDFdVpF-2jvReJh6WNw/exec';

    // Llamar al Google Apps Script Webhook que corre directamente con la cuenta del usuario
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title.trim(),
        type: type === 'google_sheet' ? 'google_sheet' : 'google_doc',
      }),
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || 'Error reportado por Google Apps Script');
    }

    return NextResponse.json({
      success: true,
      fileId: data.id,
      name: data.name,
      url: data.url,
    });
  } catch (error: any) {
    console.error('Error al crear archivo en Google Drive:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Error al comunicarse con el Webhook de Google Drive',
      },
      { status: 500 }
    );
  }
}
