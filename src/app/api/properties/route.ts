import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = user.publicMetadata?.role;
    const { searchParams } = new URL(req.url);
    const assignedUserEmail = searchParams.get("email");
    const assignedUserNIC = searchParams.get("nic");

    let query: any = {};

    if (role === "admin") {
      // Admin sees everything, but can filter by email or NIC
      if (assignedUserEmail) query.assignedUserEmail = assignedUserEmail;
      if (assignedUserNIC) query.assignedUserNIC = assignedUserNIC;
    } else {
      // Normal user can only see properties assigned to their email (or NIC if we verify that)
      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      if (!primaryEmail) {
        return NextResponse.json({ error: "User has no email" }, { status: 400 });
      }
      query.assignedUserEmail = primaryEmail;
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });
    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("API GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Usually we check if user is admin here
    // For MVP, we'll allow creation if they hit this endpoint, 
    // but in production, verify role === 'admin'
    const body = await req.json();
    const newProperty = new Property(body);
    await newProperty.save();

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
