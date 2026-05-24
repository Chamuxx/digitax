import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { DeclaredProperty } from "@/lib/models/DeclaredProperty";

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
    
    // Search for declared properties where nic partially matches the query, case-insensitive
    // Only return pending properties so the admin can assess them
    const properties = await DeclaredProperty.find({
      userNIC: { $regex: nic, $options: "i" },
      status: "pending"
    }).limit(10).sort({ createdAt: -1 });

    return NextResponse.json(properties);
  } catch (error: any) {
    console.error("Search Declared Properties Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
