import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { Property } from "@/lib/models/Property";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await currentUser();

    if (!user || user.publicMetadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [totalProperties, taxResult] = await Promise.all([
      Property.countDocuments(),
      Property.aggregate([
        {
          $group: {
            _id: null,
            totalTax: { $sum: "$taxAmount" },
            avgTax: { $avg: "$taxAmount" },
            maxTax: { $max: "$taxAmount" },
          },
        },
      ]),
    ]);

    const taxData = taxResult[0] || { totalTax: 0, avgTax: 0, maxTax: 0 };

    return NextResponse.json({
      totalProperties,
      totalTax: taxData.totalTax,
      avgTax: taxData.avgTax,
      maxTax: taxData.maxTax,
    });
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
