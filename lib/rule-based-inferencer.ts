/**
 * Rule-Based Problem Inference
 * Fast, free, no API calls. Handles 80% of real-world confessions.
 */

export function inferProblemFromDescription(description: string): {
  problem_type: string | null;
  confidence: number;
} {
  if (!description || description.trim().length === 0) {
    return { problem_type: null, confidence: 0 };
  }

  const text = description.toLowerCase();

  // Paper, documents, files
  if (text.includes("paper") || text.includes("document") || text.includes("file")) {
    if (text.includes("tax") || text.includes("compliance") || text.includes("accounting")) {
      return { problem_type: "accounting_file_delivery", confidence: 0.8 };
    }
    if (text.includes("court") || text.includes("legal")) {
      return { problem_type: "legal_document_delivery", confidence: 0.85 };
    }
    return { problem_type: "office_supply_delivery", confidence: 0.75 };
  }

  // Supplies, stock, inventory
  if (text.includes("supply") || text.includes("stock") || text.includes("inventory")) {
    if (text.includes("medicine") || text.includes("medication") || text.includes("pharmacy")) {
      return { problem_type: "pharmacy_prescription_delivery", confidence: 0.85 };
    }
    if (text.includes("lab") || text.includes("dental")) {
      return { problem_type: "dental_supply_delivery", confidence: 0.8 };
    }
    if (text.includes("vet") || text.includes("animal")) {
      return { problem_type: "veterinary_supply_delivery", confidence: 0.8 };
    }
    if (text.includes("ingredient") || text.includes("food") || text.includes("restaurant")) {
      return { problem_type: "restaurant_supply_delivery", confidence: 0.8 };
    }
    if (text.includes("retail") || text.includes("store") || text.includes("shop")) {
      return { problem_type: "retail_stock_delivery", confidence: 0.8 };
    }
    return { problem_type: "office_supply_delivery", confidence: 0.7 };
  }

  // Materials, construction, building
  if (text.includes("material") || text.includes("construction") || text.includes("site") || text.includes("build")) {
    return { problem_type: "construction_material_delivery", confidence: 0.85 };
  }

  // Delivery, courier, logistics (generic)
  if (text.includes("delivery") || text.includes("courier") || text.includes("logistics")) {
    if (text.includes("prescription") || text.includes("pharmacy")) {
      return { problem_type: "pharmacy_prescription_delivery", confidence: 0.8 };
    }
    if (text.includes("equipment") || text.includes("film") || text.includes("production")) {
      return { problem_type: "film_production_equipment", confidence: 0.8 };
    }
    if (text.includes("part") || text.includes("manufacture")) {
      return { problem_type: "manufacturing_part_delivery", confidence: 0.8 };
    }
    return { problem_type: "office_supply_delivery", confidence: 0.65 };
  }

  // Deadline, timing, schedule
  if (text.includes("deadline") || text.includes("timing") || text.includes("schedule")) {
    if (text.includes("court") || text.includes("legal")) {
      return { problem_type: "court_deadline_delivery", confidence: 0.85 };
    }
    if (text.includes("completion") || text.includes("property") || text.includes("agent")) {
      return { problem_type: "estate_agent_document_delivery", confidence: 0.85 };
    }
    if (text.includes("event") || text.includes("catering")) {
      return { problem_type: "catering_supply_delivery", confidence: 0.8 };
    }
    if (text.includes("tax")) {
      return { problem_type: "accounting_file_delivery", confidence: 0.8 };
    }
    return { problem_type: "office_supply_delivery", confidence: 0.65 };
  }

  // Art, gallery, exhibition
  if (text.includes("art") || text.includes("gallery") || text.includes("exhibition")) {
    return { problem_type: "art_gallery_artwork_delivery", confidence: 0.85 };
  }

  // Beauty, salon, appointment
  if (text.includes("beauty") || text.includes("salon") || text.includes("client") || text.includes("appointment")) {
    if (text.includes("product") || text.includes("supply")) {
      return { problem_type: "beauty_supply_delivery", confidence: 0.8 };
    }
    if (text.includes("dental") || text.includes("lab")) {
      return { problem_type: "dental_supply_delivery", confidence: 0.8 };
    }
    return { problem_type: "office_supply_delivery", confidence: 0.65 };
  }

  // Blueprint, architecture, plan
  if (text.includes("blueprint") || text.includes("architecture") || text.includes("plan") || text.includes("architect")) {
    return { problem_type: "architecture_drawing_delivery", confidence: 0.85 };
  }

  // Hospital, surgery, patient care
  if (text.includes("hospital") || text.includes("surgery") || text.includes("patient") || text.includes("care")) {
    return { problem_type: "hospital_supply_delivery", confidence: 0.85 };
  }

  // Equipment, film, production
  if (text.includes("equipment") || text.includes("film") || text.includes("production")) {
    return { problem_type: "film_production_equipment", confidence: 0.8 };
  }

  // Manufacturing, parts, production
  if (text.includes("part") || text.includes("manufacture") || text.includes("production") || text.includes("quota")) {
    return { problem_type: "manufacturing_part_delivery", confidence: 0.8 };
  }

  // No confident match
  return { problem_type: null, confidence: 0 };
}
