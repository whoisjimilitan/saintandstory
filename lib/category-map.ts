/**
 * Canonical mapping of problem types to business categories
 * Used across Discover, Enrich, and Inference endpoints
 */

export const CATEGORY_MAP: Record<string, string> = {
  court_deadline_delivery: "Solicitor",
  legal_document_delivery: "Legal",
  hospital_supply_delivery: "Hospital",
  pharmacy_prescription_delivery: "Pharmacy",
  veterinary_supply_delivery: "Veterinary",
  dental_supply_delivery: "Dental",
  construction_material_delivery: "Construction",
  estate_agent_document_delivery: "Estate Agent",
  architecture_drawing_delivery: "Architect",
  film_production_equipment: "Film Production",
  accounting_file_delivery: "Accountant",
  retail_stock_delivery: "Retail",
  beauty_supply_delivery: "Beauty",
  office_supply_delivery: "Office",
  art_gallery_artwork_delivery: "Art Gallery",
  catering_supply_delivery: "Catering",
  manufacturing_part_delivery: "Manufacturing",
  restaurant_supply_delivery: "Restaurant"
};

/**
 * Get all unique category values sorted alphabetically
 */
export function getAllCategories(): string[] {
  return Array.from(new Set(Object.values(CATEGORY_MAP))).sort();
}

/**
 * Map a problem type to its category
 */
export function getProblemCategory(problemType: string): string {
  return CATEGORY_MAP[problemType] || "Business";
}
