import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { User } from "@/lib/models/User";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const role = user.publicMetadata?.role;

    if (role !== "admin") {
      const dbUser = await User.findOne({ clerkId: user.id });
      if (!dbUser || property.assignedUserNIC !== dbUser.nic) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(property);
  } catch (error: any) {
    console.error("API GET [id] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const user = await currentUser();

    if (!user || user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await Property.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("API PUT [id] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const user = await currentUser();

    if (!user || user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden — Admin only" }, { status: 403 });
    }

    const { id } = await params;
    const deleted = await Property.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Property deleted successfully" });
  } catch (error: any) {
    console.error("API DELETE [id] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
