import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decryptSession } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("care_online_token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "Non connecté" },
        { status: 401 }
      );
    }

    const session = decryptSession(token);

    if (!session) {
      const response = NextResponse.json(
        { authenticated: false, error: "Session invalide ou expirée" },
        { status: 401 }
      );
      // Clear invalid cookie
      response.cookies.set("care_online_token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
      });
      return response;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: "teacher",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification de la session." },
      { status: 500 }
    );
  }
}
