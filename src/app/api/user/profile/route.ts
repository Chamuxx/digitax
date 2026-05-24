import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const dbUser = await User.findOne({ clerkId: clerkUser.id });

    if (!dbUser) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, user: dbUser });
  } catch (error: any) {
    console.error("GET Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nic } = await req.json();
    if (!nic) {
      return NextResponse.json({ error: "NIC is required" }, { status: 400 });
    }

    await connectToDatabase();
    let dbUser = await User.findOne({ clerkId: clerkUser.id });

    if (dbUser) {
      dbUser.nic = nic;
      await dbUser.save();
    } else {
      dbUser = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        nic,
        role: clerkUser.publicMetadata?.role || "user",
      });
    }

    return NextResponse.json({ message: "Profile updated successfully", user: dbUser });
  } catch (error: any) {
    console.error("POST Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
