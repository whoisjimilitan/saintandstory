// Test if the B2BPipeline component can be imported and its dependencies
import { B2B_INDUSTRIES } from "@/lib/b2b-industries";
import { DELIVERY_TYPES } from "@/lib/delivery-types";
import { DELIVERY_FREQUENCIES, AVERAGE_DELIVERIES, COURIER_PROVIDERS, DELIVERY_CHALLENGES } from "@/lib/business-intelligence";
import { calculateLeadScore, getScoreLabel, getScoreStyle } from "@/lib/lead-scoring";

console.log("Testing B2BPipeline dependencies...");

try {
  console.log("1. B2B_INDUSTRIES:", typeof B2B_INDUSTRIES, Object.keys(B2B_INDUSTRIES).length, "categories");
  
  // Test the initialization that happens in DiscoverPanel
  const industry = Object.values(B2B_INDUSTRIES)[0][0];
  console.log("2. First industry:", industry);
  
  console.log("3. DELIVERY_TYPES:", DELIVERY_TYPES.length, "types");
  console.log("4. DELIVERY_FREQUENCIES:", DELIVERY_FREQUENCIES.length, "frequencies");
  console.log("5. AVERAGE_DELIVERIES:", AVERAGE_DELIVERIES.length, "ranges");
  console.log("6. COURIER_PROVIDERS:", COURIER_PROVIDERS.length, "providers");
  console.log("7. DELIVERY_CHALLENGES:", DELIVERY_CHALLENGES.length, "challenges");
  
  // Test calculateLeadScore
  const score = calculateLeadScore({
    industry: undefined,
    deliveryFrequency: undefined,
    averageDeliveries: undefined,
    courierProvider: undefined,
    deliveryChallenge: undefined,
  });
  console.log("8. Score with undefined values:", score);
  
  const label = getScoreLabel(score.total);
  console.log("9. Score label:", label);
  
  const style = getScoreStyle(score.total);
  console.log("10. Score style:", style);
  
  console.log("\n✅ All dependencies loaded successfully");
} catch (e: any) {
  console.error("❌ Error:", e.message);
  console.error("Stack:", e.stack);
}
