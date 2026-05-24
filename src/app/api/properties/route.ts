import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { User } from "@/lib/models/User";
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
      if (assignedUserEmail) query.assignedUserEmail = assignedUserEmail;
      if (assignedUserNIC) query.assignedUserNIC = assignedUserNIC;
    } else {
      const dbUser = await User.findOne({ clerkId: user.id });
      if (!dbUser || !dbUser.nic) {
        // If the user hasn't set up an NIC yet, they can't have any properties
        return NextResponse.json([]);
      }
      query.assignedUserNIC = dbUser.nic;
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
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create properties
    if (user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const newProperty = new Property(body);
    await newProperty.save();

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
