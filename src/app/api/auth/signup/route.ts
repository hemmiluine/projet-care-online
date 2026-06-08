import { NextResponse } from "next/server";
import { getUsers, saveUsers, hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Veuillez remplir tous les champs." },
        { status: 400 }
      );
    }

    // Strict validation: Must end with @care-online.fr
    const emailLower = email.toLowerCase().trim();
    if (!emailLower.endsWith("@care-online.fr")) {
      return NextResponse.json(
        { error: "Seules les adresses du domaine @care-online.fr sont autorisées." },
        { status: 400 }
      );
    }

    // Double check email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@care-online\.fr$/;
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { error: "Adresse e-mail invalide." },
        { status: 400 }
      );
    }

    const users = await getUsers();
    const userExists = users.some((u: any) => u.email === emailLower);

    if (userExists) {
      return NextResponse.json(
        { error: "Un utilisateur avec cette adresse e-mail existe déjà." },
        { status: 400 }
      );
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: emailLower,
      password: hashPassword(password),
    };

    users.push(newUser);
    await saveUsers(users);

    return NextResponse.json(
      { success: true, message: "Inscription réussie ! Vous pouvez maintenant vous connecter." },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
