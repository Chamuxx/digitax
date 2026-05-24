import { NextResponse } from "next/server";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/lib/models/User";

export async function POST(req: Request) {
  try {
    const adminUser = await currentUser();

    if (!adminUser || adminUser.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, firstName, lastName, nic } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const clerk = await clerkClient();

    // Check if user already exists
    const existingUsers = await clerk.users.getUserList({
      emailAddress: [email],
    });

    if (existingUsers.totalCount > 0) {
      const existing = existingUsers.data[0];
      // Ensure they have user role set
      if (!existing.publicMetadata?.role) {
        await clerk.users.updateUserMetadata(existing.id, {
          publicMetadata: { role: "user" },
        });
      }

      await connectToDatabase();
      const dbUser = await User.findOne({ clerkId: existing.id });
      if (dbUser) {
        if (nic && !dbUser.nic) {
          dbUser.nic = nic;
          await dbUser.save();
        }
      } else {
        await User.create({
          clerkId: existing.id,
          email: existing.emailAddresses[0].emailAddress,
          firstName: existing.firstName,
          lastName: existing.lastName,
          nic,
          role: "user"
        });
      }

      return NextResponse.json({
        message: "User already exists",
        userId: existing.id,
        isNew: false,
      });
    }

    // Generate a temporary password
    const tempPassword =
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      "!7";
      
    // Generate a unique username based on the email
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase() + Math.random().toString(36).slice(2, 6);

    // Create the user
    const newUser = await clerk.users.createUser({
      emailAddress: [email],
      username,
      password: tempPassword,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      publicMetadata: { role: "user" },
      skipPasswordChecks: false,
    });

    await connectToDatabase();
    await User.create({
      clerkId: newUser.id,
      email: email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      nic,
      role: "user"
    });

    return NextResponse.json({
      message: "User created successfully",
      userId: newUser.id,
      tempPassword,
      isNew: true,
    });
  } catch (error: any) {
    console.error("Create user API error:", error);
    // Clerk errors have a specific structure
    const message =
      error?.errors?.[0]?.message || error?.message || "Failed to create user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
