import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const form = await request.formData();
    const file = form.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type || 'application/octet-stream',
      contentDisposition: 'inline',
    });

    return NextResponse.json(blob);
  } catch (error: unknown) {
    console.error("Vercel Blob Upload Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Erreur lors de l'upload. Détail : ${errorMessage}` },
      { status: 500 }
    );
  }
}
