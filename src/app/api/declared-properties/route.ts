import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { DeclaredProperty } from "@/lib/models/DeclaredProperty";
import { User } from "@/lib/models/User";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch user's profile to get their NIC
    const dbUser = await User.findOne({ clerkId: clerkUser.id });
    if (!dbUser || !dbUser.nic) {
      return NextResponse.json([]); // No NIC, no declared properties
    }

    const properties = await DeclaredProperty.find({ userNIC: dbUser.nic }).sort({ createdAt: -1 });
    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("GET Declared Properties Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, address, phone } = await req.json();

    if (!fullName || !address || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const dbUser = await User.findOne({ clerkId: clerkUser.id });
    if (!dbUser || !dbUser.nic) {
      return NextResponse.json({ error: "User profile incomplete. Please set up your NIC first." }, { status: 400 });
    }

    const newProperty = new DeclaredProperty({
      clerkId: clerkUser.id,
      userNIC: dbUser.nic,
      fullName,
      address,
      phone,
    });

    await newProperty.save();

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error: any) {
    console.error("POST Declared Properties Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
