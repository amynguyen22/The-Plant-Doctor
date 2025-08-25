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
    setSubmitted({
      plantName,
      plantType,
      environment,
      notes,
      symptoms,
      soil,
      fertilized,
    });
  };

  const onReset = () => {
    setPlantName("");
    setPlantType("");
    setEnvironment("");
    setNotes("");
    setSymptoms([]);
    setSoil({});
    setFertilized(false);
    setSubmitted(null);
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
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Results will show here</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {!submitted ? (
                  <p className="text-gray-500">Run a diagnosis to see your captured inputs.</p>
                ) : (
                  <>
                    <div><span className="font-medium">Plant:</span> {submitted.plantName || "—"} ({submitted.plantType || "—"})</div>
                    <div><span className="font-medium">Environment:</span> {submitted.environment || "—"}</div>
                    <div><span className="font-medium">Fertilized recently:</span> {submitted.fertilized ? "Yes" : "No"}</div>
                    <div><span className="font-medium">Symptoms:</span> {submitted.symptoms.length ? submitted.symptoms.join(", ") : "—"}</div>
                    <div>
                      <span className="font-medium">Soil condition:</span>{" "}
                      {Object.keys(submitted.soil).filter((k) => submitted.soil[k]).join(", ") || "—"}
                    </div>
                    <div><span className="font-medium">Notes:</span> {submitted.notes || "—"}</div>
                  </>
                )}
              </CardContent>
            </Card>
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
