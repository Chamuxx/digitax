import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function GET(req: Request) {
  try {
    const adminUser = await currentUser();

    if (!adminUser || adminUser.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const nic = searchParams.get("nic");

    if (!nic) {
      return NextResponse.json([]);
    }

    await connectToDatabase();
    
    // Search for users where nic partially matches the query, case-insensitive
    const users = await User.find({
      nic: { $regex: nic, $options: "i" }
    }).limit(5).select("nic email firstName lastName clerkId");

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Search Users Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
