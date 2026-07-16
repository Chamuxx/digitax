import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PropertyData {
  _id: string;
  location: { lat: number; lng: number };
  area: number;
  geometry: { x: number; y: number }[];
  floorGeometries?: { x: number; y: number }[][];
  attributes: {
    flooring: string;
    floors: number;
    hasPool: boolean;
    hasGarage: boolean;
    gardenSize: string;
    usage: string;
    yearBuilt?: number;
    roofingMaterial?: string;
    wallType?: string;
    propertyCondition?: string;
    amenities?: string[];
  };
  taxAmount: number;
  assignedUserEmail: string;
  assignedUserNIC: string;
  createdAt: string;
}

export function generatePropertyAssessmentPDF(property: PropertyData) {
  const doc = new jsPDF({
    format: "a4",
    unit: "mm",
  });

  // Top Header Band
  doc.setFillColor(30, 58, 138); // #1e3a8a dark navy
  doc.rect(0, 0, 210, 32, "F");

  // Portal Branding Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("DigiTax Portal", 14, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text("Official Municipal Revenue & Property Assessment System", 14, 23);

  // Document Title & Date on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PROPERTY TAX ASSESSMENT REPORT", 210 - 14, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, 210 - 14, 23, { align: "right" });

  let currentY = 42;

  // Section 1: Assessment Overview
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("1. Assessment Overview", 14, currentY);
  currentY += 4;

  const assessmentDateStr = new Date(property.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  autoTable(doc, {
    startY: currentY,
    head: [["Property Specification", "Details"]],
    body: [
      ["Assessment Date", assessmentDateStr],
      ["Property Assessment ID", property._id || "N/A"],
      [
        "Location Coordinates",
        `Latitude: ${property.location?.lat?.toFixed(6) || "N/A"} | Longitude: ${property.location?.lng?.toFixed(6) || "N/A"}`,
      ],
      ["Area Region / Province", "North Western Province (Sri Lanka)"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 9.5, cellPadding: 3.5, textColor: [51, 65, 85] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65, fillColor: [248, 250, 252] } },
    margin: { left: 14, right: 14 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 2: Ownership Details
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("2. Ownership Details", 14, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [["Owner Information Field", "Recorded Record"]],
    body: [
      ["Registered Owner NIC", property.assignedUserNIC || "Not Specified"],
      ["Contact Email Address", property.assignedUserEmail || "Not Specified"],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 9.5, cellPadding: 3.5, textColor: [51, 65, 85] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65, fillColor: [248, 250, 252] } },
    margin: { left: 14, right: 14 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 3: Building Attributes
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("3. Building Attributes & Structural Specifications", 14, currentY);
  currentY += 4;

  const formatText = (val: string | undefined) => {
    if (!val) return "Not Recorded";
    if (val === "concrete_slab") return "Concrete Slab";
    if (val === "cement_block") return "Cement Block";
    if (val === "needs_repair") return "Needs Repair";
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  autoTable(doc, {
    startY: currentY,
    head: [["Structural Attribute", "Recorded Value", "Structural Attribute", "Recorded Value"]],
    body: [
      [
        "Usage Type",
        formatText(property.attributes?.usage),
        "Total Floors",
        `${property.attributes?.floors || 1} Floor(s)`,
      ],
      [
        "Roofing Material",
        formatText(property.attributes?.roofingMaterial),
        "Wall Type",
        formatText(property.attributes?.wallType),
      ],
      [
        "Flooring Type",
        formatText(property.attributes?.flooring),
        "Property Condition",
        formatText(property.attributes?.propertyCondition),
      ],
      [
        "Year Built",
        property.attributes?.yearBuilt ? `${property.attributes.yearBuilt}` : "Not Recorded",
        "Total Drawn Footprint",
        `${property.area?.toFixed(2) || "0.00"} sq. ft.`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 9.5, cellPadding: 3.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 45, fillColor: [248, 250, 252] },
      1: { cellWidth: 46 },
      2: { fontStyle: "bold", cellWidth: 45, fillColor: [248, 250, 252] },
      3: { cellWidth: 46 },
    },
    margin: { left: 14, right: 14 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section 4: Amenities
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("4. Applied Amenities & Adjustments", 14, currentY);
  currentY += 4;

  const amenityList: string[] =
    property.attributes?.amenities && property.attributes.amenities.length > 0
      ? property.attributes.amenities
      : [
          ...(property.attributes?.hasPool ? ["swimming_pool"] : []),
          ...(property.attributes?.hasGarage ? ["garage"] : []),
        ];

  const amenityLabels: Record<string, { label: string; impact: string }> = {
    swimming_pool: { label: "Swimming Pool", impact: "+20% Luxury Adjustment" },
    garage: { label: "Garage Facility", impact: "+10% Structural Adjustment" },
    air_conditioning: { label: "Air Conditioning System", impact: "+15% Utility Adjustment" },
    solar_panels: { label: "Solar Panel Installation", impact: "-10% Green Eco Rebate" },
    security_system: { label: "Integrated Security System", impact: "+5% Facility Adjustment" },
    backup_generator: { label: "Backup Generator Unit", impact: "+10% Utility Adjustment" },
    overhead_water_tank: { label: "Overhead Water Tank", impact: "+5% Utility Adjustment" },
  };

  const amenityRows = amenityList.map((id) => {
    const item = amenityLabels[id] || { label: id, impact: "Standard Included" };
    return [item.label, item.impact];
  });

  if (amenityRows.length === 0) {
    amenityRows.push(["No special amenities recorded", "Standard Base Rate Applied"]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [["Amenity Feature", "Assessment Rate Adjustment"]],
    body: amenityRows,
    theme: "grid",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 9.5, cellPadding: 3, textColor: [51, 65, 85] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 90 } },
    margin: { left: 14, right: 14 },
  });
  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Ensure Final Tax Calculation Box doesn't split or get cut off
  if (currentY > 220) {
    doc.addPage();
    currentY = 25;
  }

  // Section 5: Final Tax Calculation Box
  doc.setTextColor(30, 58, 138);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("5. Final Tax Assessment Calculation", 14, currentY);
  currentY += 5;

  const boxHeight = 44;
  doc.setFillColor(239, 246, 255); // #eff6ff light blue background
  doc.setDrawColor(37, 99, 235); // #2563eb blue border
  doc.setLineWidth(0.6);
  doc.roundedRect(14, currentY, 210 - 28, boxHeight, 3, 3, "FD");

  const baseRateStr = "LKR 10.00 / sq. ft.";
  const totalEffectiveArea = property.area * (property.attributes?.floors || 1);
  const effectiveAreaStr = `${totalEffectiveArea.toFixed(2)} sq. ft. (${property.attributes?.floors || 1} Floor${property.attributes?.floors > 1 ? "s" : ""})`;
  const formattedTax = `LKR ${property.taxAmount?.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}`;

  // Line 1: Base Rate & Effective Area
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Base Assessment Rate:", 20, currentY + 11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(baseRateStr, 72, currentY + 11);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Total Effective Area:", 20, currentY + 19);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(effectiveAreaStr, 72, currentY + 19);

  // Divider Line
  doc.setDrawColor(191, 219, 254);
  doc.setLineWidth(0.4);
  doc.line(20, currentY + 25, 210 - 20, currentY + 25);

  // Final Tax Amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text("FINAL ANNUAL ASSESSED TAX:", 20, currentY + 35);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(29, 78, 216); // #1d4ed8 dark blue accent
  doc.text(formattedTax, 210 - 22, currentY + 35, { align: "right" });

  // Add Footers to All Pages
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240); // #e2e8f0 border top
    doc.setLineWidth(0.4);
    doc.line(14, 280, 210 - 14, 280);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "This document is an official electronically generated Property Tax Assessment Report from the DigiTax Portal.",
      14,
      285
    );
    doc.text(
      "Issued by Municipal Revenue & Property Assessment Department. Valid without manual signature.",
      14,
      289
    );
    doc.text(`Page ${i} of ${pageCount}`, 210 - 14, 287, { align: "right" });
  }

  // Save the PDF
  doc.save(`DigiTax_Assessment_Report_${property._id || "Report"}.pdf`);
}
