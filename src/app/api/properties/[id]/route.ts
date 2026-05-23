import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // In nextjs 15+ route params are Promises. We'll await them to be safe.
    const { id } = await params;
    
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = user.publicMetadata?.role;
    const primaryEmail = user.primaryEmailAddress?.emailAddress;

    // Users can only view if they are admin or the assigned user
    if (role !== "admin" && property.assignedUserEmail !== primaryEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(property);
  } catch (error: any) {
    console.error("API GET [id] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
