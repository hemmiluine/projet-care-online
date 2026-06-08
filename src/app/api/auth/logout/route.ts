import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Déconnexion réussie" });
  
  // Clear the cookie by setting maxAge to 0
  response.cookies.set("care_online_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
