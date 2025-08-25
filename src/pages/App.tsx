import { useRef, useState } from "react";
import type { ChangeEventHandler } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

// Simple catalogs
const SYMPTOMS = [
  { id: "yellowing", label: "Yellowing leaves" },
  { id: "browning_tips", label: "Brown/crispy tips" },
  { id: "wilting", label: "Wilting/drooping" },
  { id: "leaf_drop", label: "Leaves dropping" },
  { id: "spots", label: "Leaf spots/blotches" },
  { id: "holes", label: "Holes/chewed edges" },
  { id: "webbing", label: "Fine webbing" },
  { id: "sticky", label: "Sticky residue" },
];

const SOIL = [
  { id: "soil_soggy", label: "Soil feels soggy" },
  { id: "soil_dry", label: "Soil feels very dry" },
  { id: "soil_compact", label: "Soil tightly packed" },
  { id: "soil_loose", label: "Soil loose/airy" },
];

interface DiagnosisResult {
  issue: string;
  confidence: number; // 0..1
  reasons: string[];
  actions: string[];
  urgency?: "low" | "medium" | "high";
}

// Simple rule engine
function analyze(
  symptoms: string[],
  soil: Record<string, boolean>,
  fertilized: boolean,
  notes: string
): DiagnosisResult[] {
  const s = new Set(symptoms);
  const out: DiagnosisResult[] = [];
  const soggy = !!soil["soil_soggy"];
  const veryDry = !!soil["soil_dry"];

  // Overwatering / Root rot
  if ((s.has("yellowing") || s.has("leaf_drop") || s.has("wilting")) && (soggy || s.has("mushy_stem"))) {
    out.push({
      issue: s.has("mushy_stem") ? "Root rot from overwatering" : "Overwatering",
      confidence: s.has("mushy_stem") ? 0.9 : 0.7,
      urgency: s.has("mushy_stem") ? "high" : "medium",
      reasons: [
        s.has("yellowing") ? "Yellowing present" : "",
        s.has("leaf_drop") ? "Leaves dropping" : "",
        soggy ? "Soil reported soggy" : "",
        s.has("mushy_stem") ? "Mushy stem suggests rot" : "",
      ].filter(Boolean),
      actions: [
        "Check roots and trim mushy parts",
        "Repot into well-draining mix; ensure drainage holes",
        "Let top inch or two dry before next watering",
      ],
    });
  }

  // Underwatering
  if ((s.has("wilting") || s.has("browning_tips") || s.has("leaf_drop")) && veryDry) {
    out.push({
      issue: "Underwatering",
      confidence: 0.75,
      urgency: "medium",
      reasons: ["Soil very dry", s.has("wilting") ? "Wilting" : "", s.has("browning_tips") ? "Crispy tips" : ""].filter(Boolean),
      actions: [
        "Water thoroughly until drainage; empty saucer",
        "Adopt a schedule; check moisture with finger or meter",
      ],
    });
  }

  // Pests
  if (s.has("webbing")) {
    out.push({ issue: "Spider mites", confidence: 0.85, urgency: "medium", reasons: ["Fine webbing present"], actions: ["Isolate; shower foliage", "Insecticidal soap/neem weekly x3"] });
  }
  if (s.has("white_cotton")) {
    out.push({ issue: "Mealybugs", confidence: 0.85, urgency: "medium", reasons: ["White cottony tufts"], actions: ["Dab with alcohol", "Follow with soap/neem"] });
  }
  if (s.has("sticky") && s.has("tiny_flies")) {
    out.push({ issue: "Fungus gnats / honeydew check", confidence: 0.6, urgency: "low", reasons: ["Sticky residue + tiny flies"], actions: ["Dry topsoil between waterings", "Yellow sticky traps", "Optional BTi drench"] });
  }

  // Nutrients
  if (s.has("yellowing") && !soggy && !veryDry) {
    let conf = 0.45;
    if (fertilized) conf -= 0.05;
    out.push({ issue: "Possible nutrient deficiency", confidence: Math.max(0, conf), urgency: "low", reasons: ["Yellowing without clear watering issue"], actions: ["Balanced fertilizer at 1/2 strength in growing season"] });
  }

  // Notes keyword nudge
  const txt = notes.toLowerCase();
  const bump = (k: string, amt: number) => (txt.includes(k) ? amt : 0);
  const adjusted = out.map((r) => ({
    ...r,
    confidence: Math.max(0, Math.min(1, r.confidence + bump("for days", 0.05) + bump("weeks", 0.05))),
  }));

  if (adjusted.length === 0) {
    adjusted.push({ issue: "No clear issue detected", confidence: 0.2, urgency: "low", reasons: ["Try selecting more specific symptoms"], actions: ["Check watering routine", "Verify light", "Inspect for pests"] });
  }

  return adjusted.sort((a, b) => b.confidence - a.confidence);
}

export default function PlantDoctorApp() {
  
  // --- Basic state ---
  const [plantName, setPlantName] = useState("");
  const [plantType, setPlantType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [notes, setNotes] = useState("");

  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [soil, setSoil] = useState<Record<string, boolean>>({});
  const [fertilized, setFertilized] = useState(false);

  // Image Submission
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Results
  const [results, setResults] = useState<DiagnosisResult[] | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null); 

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Submitted snapshot (for Results display)
  const [submitted, setSubmitted] = useState<null | {
    plantName: string;
    plantType: string;
    environment: string;
    notes: string;
    symptoms: string[];
    soil: Record<string, boolean>;
    fertilized: boolean;
  }>(null);

  // --- Handlers ---
  const toggleSymptom = (id: string) =>
    setSymptoms((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleSoil = (id: string) =>
    setSoil((prev) => ({ ...prev, [id]: !prev[id] }));

  const onDiagnose = () => {
    const res = analyze(symptoms, soil, fertilized, notes);
    setResults(res);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const onReset = () => {
    setPlantName("");
    setPlantType("");
    setEnvironment("");
    setNotes("");
    setSymptoms([]);
    setSoil({});
    setFertilized(false);
    setResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">Plant Doctor</h1>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="new">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="new">New Diagnosis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* New Diagnosis */}
          <TabsContent value="new">
            {/* Intake */}
            <Card>
              <CardHeader>
                <CardTitle>Upload & Describe</CardTitle>
                <CardDescription>Share details about your plant.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Upload placeholder */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="border-2 border-dashed rounded-2xl p-6 text-center bg-white hover:bg-emerald-50 transition"
                >
                  {imageUrl ? (
                    <div className="space-y-3">
                      <img
                        src={imageUrl}
                        alt="Plant preview"
                        className="mx-auto max-h-80 rounded-xl object-contain"
                      />
                      <div className="flex justify-center gap-2">
                        <Button variant="secondary" onClick={handleChooseFile}>Replace photo</Button>
                        <Button variant="ghost" onClick={() => setImageUrl(null)}>Remove</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-gray-600">
                      <div>Drop an image here</div>
                      <div>or</div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <Button onClick={handleChooseFile}>Choose image</Button>
                    </div>
                  )}
                </div>

                {/* Basic text inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="plantName">Plant Name</Label>
                    <Input id="plantName" placeholder="e.g., Monstera #2" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="plantType">Plant Type</Label>
                    <Input id="plantType" placeholder="e.g., Monstera deliciosa" value={plantType} onChange={(e) => setPlantType(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Input
                    id="environment"
                    placeholder="e.g., East window, 5 ft away; ~45% humidity"
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                  />
                </div>

                {/* Symptoms buttons */}
                <div>
                  <Label>Symptoms</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SYMPTOMS.map((s) => {
                      const active = symptoms.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleSymptom(s.id)}
                          className={`px-3 py-1 rounded-full border text-sm transition ${
                            active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-emerald-50"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Soil condition buttons */}
                <div>
                  <Label>Soil Condition</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SOIL.map((t) => {
                      const active = !!soil[t.id];
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleSoil(t.id)}
                          className={`px-3 py-1 rounded-full border text-sm transition ${
                            active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-emerald-50"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fertilized toggle */}
                <div>
                  <Label>Did you recently fertilize?</Label>
                  <div className="mt-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={fertilized}
                      onClick={() => setFertilized((v) => !v)}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
                        fertilized ? "bg-emerald-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          fertilized ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-sm text-gray-600">{fertilized ? "Yes" : "No"}</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Describe what you’re observing…"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button onClick={onDiagnose}>Diagnose</Button>
                <Button variant="ghost" onClick={onReset}>Reset</Button>
              </CardFooter>
            </Card>

            {/* Results */}
            <div ref={resultsRef} />
            {results && (
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Results will show here</CardDescription>
              </CardHeader>
                <CardContent className="space-y-4">
                  {results.map((r, i) => (
                    <div key={i} className="border rounded-2xl p-4 bg-white">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-lg">{r.issue}</div>
                        <span className="text-xs rounded-full px-2 py-0.5 bg-gray-100">{Math.round(r.confidence * 100)}%</span>
                      </div>
                      {r.reasons.length > 0 && (
                        <ul className="list-disc pl-6 mt-2 text-sm text-gray-700">
                          {r.reasons.map((reason, idx) => (
                            <li key={idx}>{reason}</li>
                          ))}
                        </ul>
                      )}
                      <div className="mt-3">
                        <div className="text-sm font-medium">What to do now</div>
                        <ul className="list-disc pl-6 text-sm mt-1">
                          {r.actions.map((a, idx) => (
                            <li key={idx}>{a}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </CardContent>
            </Card>
            )}
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                History is coming.
              </CardContent>
            </Card>
          </TabsContent>

          {/* About */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About Plant Doctor</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Plant Doctor helps you diagnose common houseplant problems. 
                  Everything runs in your browser—photos never leave your device.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
