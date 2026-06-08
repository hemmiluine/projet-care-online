import { NextResponse } from "next/server";
import { getUsers, hashPassword, encryptSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs." },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Strict validation: Block domains other than @care-online.fr
    if (!emailLower.endsWith("@care-online.fr")) {
      return NextResponse.json(
        { error: "Seules les connexions avec une adresse @care-online.fr sont autorisées." },
        { status: 403 }
      );
    }

    const users = await getUsers();
    const user = users.find((u: any) => u.email === emailLower);

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json(
        { error: "Adresse e-mail ou mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Set expiration to 7 days
    const expires = Date.now() + 1000 * 60 * 60 * 24 * 7;
    const sessionToken = encryptSession({
      id: user.id,
      email: user.email,
      name: user.name,
      expires,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "teacher"
      }
    });

    // Set the HTTP-Only cookie
    response.cookies.set("care_online_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la connexion." },
      { status: 500 }
    );
  }
}
