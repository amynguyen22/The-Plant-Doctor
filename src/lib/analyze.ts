import type { DiagnosisResult } from "./types";

export function analyze(
  symptoms: string[],
  toggles: Record<string, boolean>,
  moistureLevel: number,
  lightLevel: number,
  notes: string
): DiagnosisResult[] {
  const s = new Set(symptoms);
  const reasons: DiagnosisResult[] = [];

  const soggy = toggles["soil_soggy"] || moistureLevel >= 70;
  const veryDry = toggles["soil_dry"] || moistureLevel <= 25;

  // Overwatering / Root Rot
  if ((s.has("yellowing") || s.has("leaf_drop") || s.has("wilting")) && (soggy || s.has("mushy_stem"))) {
    reasons.push({
      issue: s.has("mushy_stem") ? "Root rot from overwatering" : "Overwatering",
      confidence: s.has("mushy_stem") ? 0.9 : 0.7,
      urgency: s.has("mushy_stem") ? "high" : "medium",
      reasons: [
        s.has("yellowing") ? "Yellowing leaves present" : "",
        s.has("leaf_drop") ? "Leaf drop reported" : "",
        soggy ? "Soil reported soggy/high moisture" : "",
        s.has("mushy_stem") ? "Mushy stem suggests rot" : "",
      ].filter(Boolean),
      actions: [
        "Check roots: trim mushy black roots.",
        "Repot in fresh, well-draining mix with drainage holes.",
        "Allow top 1–2 inches to dry before watering again.",
        "Increase airflow; avoid letting pot sit in water.",
      ],
    });
  }

  // Underwatering
  if ((s.has("wilting") || s.has("browning_tips") || s.has("leaf_drop")) && veryDry) {
    reasons.push({
      issue: "Underwatering",
      confidence: 0.75,
      urgency: "medium",
      reasons: ["Soil very dry", s.has("wilting") ? "Wilting" : "", s.has("browning_tips") ? "Brown/crispy tips" : ""].filter(Boolean),
      actions: [
        "Water thoroughly until drainage; empty saucer.",
        "Adopt a schedule; use finger or meter to check moisture.",
        "Consider a slightly larger pot or water-retentive mix if drying too fast.",
      ],
    });
  }

  // Low humidity
  if (s.has("browning_tips") && !soggy && !veryDry) {
    reasons.push({
      issue: "Low humidity / dry air",
      confidence: 0.55,
      urgency: "low",
      reasons: ["Brown crispy tips without wet/dry extremes"],
      actions: ["Group plants or use a humidifier (40–60%).", "Avoid vents/drafts; consider pebble tray."],
    });
  }

  // Sunburn
  if (s.has("sunburn") || (toggles["overhead_sun"] && (s.has("spots") || s.has("browning_tips")))) {
    reasons.push({
      issue: "Sunburn / light stress",
      confidence: 0.6,
      urgency: "low",
      reasons: [toggles["overhead_sun"] ? "Direct harsh sun reported" : "", s.has("sunburn") ? "Bleached/brown patches" : ""].filter(Boolean),
      actions: ["Move to bright, indirect light (especially midday).", "Acclimate slowly when increasing light."],
    });
  }

  // Nutrient Imbalance (rough heuristic)
  if (s.has("yellowing") && !soggy && !veryDry && !toggles["overhead_sun"]) {
    reasons.push({
      issue: "Possible nutrient deficiency (nitrogen or micronutrients)",
      confidence: 0.45,
      urgency: "low",
      reasons: ["Yellowing without obvious watering/light issues"],
      actions: [
        "Use a balanced fertilizer at 1/2 strength monthly in growing season.",
        "Ensure pH-appropriate soil and avoid over-fertilizing.",
      ],
    });
  }

  // Fertilizer-related signals
  if (toggles["fertilized"]) {
    for (const r of reasons) {
      if (r.issue.toLowerCase().includes("nutrient deficiency")) {
        r.confidence = Math.max(0, r.confidence - 0.15);
      }
    }
    if (s.has("browning_tips") || s.has("leaf_drop") || s.has("spots")) {
      reasons.push({
        issue: "Over-fertilization / salt buildup",
        confidence: 0.6,
        urgency: "low",
        reasons: [
          "Fertilized recently",
          s.has("browning_tips") ? "Brown/crispy tips" : "",
          s.has("leaf_drop") ? "Leaf drop" : "",
          s.has("spots") ? "Leaf spotting" : "",
        ].filter(Boolean),
        actions: [
          "Flush soil thoroughly with water to leach salts; ensure drainage.",
          "Pause fertilizing for 4–6 weeks; resume at 1/4–1/2 strength.",
          "Remove crusted salts on soil surface if present.",
        ],
      });
    }
  }

  // --- Pests ---
  if (s.has("webbing")) {
    reasons.push({
      issue: "Spider mites",
      confidence: 0.85,
      urgency: "medium",
      reasons: ["Fine webbing present"],
      actions: [
        "Isolate plant. Rinse foliage/shower to knock mites off.",
        "Wipe leaves with insecticidal soap or neem; repeat weekly x3.",
        "Increase humidity; mites prefer dry air.",
      ],
    });
  }
  if (s.has("white_cotton")) {
    reasons.push({
      issue: "Mealybugs",
      confidence: 0.85,
      urgency: "medium",
      reasons: ["White cottony tufts"],
      actions: [
        "Isolate plant. Dab mealybugs with isopropyl alcohol on cotton swab.",
        "Follow with insecticidal soap/neem weekly x3–4.",
      ],
    });
  }
  if (s.has("sticky") && (s.has("black_mold") || s.has("stunted"))) {
    reasons.push({
      issue: "Aphids",
      confidence: 0.7,
      urgency: "medium",
      reasons: ["Sticky honeydew and/or sooty mold"],
      actions: [
        "Rinse/new growth. Apply insecticidal soap; repeat weekly.",
        "Prune heavily infested tips. Encourage beneficial insects outdoors.",
      ],
    });
  }
  if ((s.has("sticky") && !s.has("webbing") && !s.has("white_cotton")) || s.has("bumps")) {
    reasons.push({
      issue: "Scale insects (possible)",
      confidence: 0.5,
      urgency: "medium",
      reasons: ["Sticky residue without webbing/cotton; check for hard bumps"],
      actions: ["Scrape/wipe scales with alcohol swab; repeat.", "Systemic or horticultural oil per label; isolate plant."],
    });
  }
  if (s.has("holes")) {
    reasons.push({
      issue: "Chewing pests (caterpillars, beetles, slugs)",
    confidence: 0.55,
    urgency: "low",
    reasons: ["Holes/chewed edges"],
    actions: ["Night inspection; hand-pick pests.", "Use physical barriers; consider BT for caterpillars as labeled."],
    });
  }
  if (s.has("tiny_flies") && (soggy || !veryDry)) {
    reasons.push({
      issue: "Fungus gnats (larvae in wet soil)",
      confidence: 0.8,
      urgency: "low",
      reasons: ["Tiny flies plus moist soil"],
      actions: [
        "Let top 1–2 inches dry between waterings.",
        "Top-dress with sand or use yellow sticky traps.",
        "BTi (mosquito bits) soil drench per label can help.",
      ],
    });
  }

  // Light stress (too little light)
  if (s.has("leggy") || (s.has("stunted") && lightLevel < 30)) {
    reasons.push({
      issue: "Insufficient light",
      confidence: 0.5,
      urgency: "low",
      reasons: ["Stunted/leggy growth at low light"],
      actions: ["Move closer to bright window or add grow light (12–14h).", "Rotate plant weekly for even growth."],
    });
  }

  if (reasons.length === 0) {
    reasons.push({
      issue: "No clear issue detected",
      confidence: 0.2,
      urgency: "low",
      reasons: ["Try adding more specific symptoms from the checklist."],
      actions: [
        "Check watering routine and drainage.",
        "Verify light level for plant species.",
        "Inspect closely (top/bottom leaves, stems, nodes) for pests.",
      ],
    });
  }

  const txt = notes.toLowerCase();
  const bump = (k: string, amt: number) => (txt.includes(k) ? amt : 0);
  return reasons
    .map((r) => ({
      ...r,
      confidence: Math.max(0, Math.min(1, r.confidence + bump("for days", 0.05) + bump("weeks", 0.05) - bump("maybe", -0.05))),
    }))
    .sort((a, b) => b.confidence - a.confidence);
}