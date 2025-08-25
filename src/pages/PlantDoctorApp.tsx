import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Upload, Trash2, Download, Camera, Image as ImageIcon, Leaf, Stethoscope, Wrench } from "lucide-react";

import YesNoSwitch from "@/components/ui/YesNoSwitch";
import { analyze } from "@/lib/analyze";
import { fileToPreviewDataURL, fileToThumbDataURL } from "@/lib/images";
import { persistHistorySafely, estimateBytes } from "@/lib/storage";
import { STORAGE_KEY_V2, LEGACY_KEY_V1, HISTORY_SOFT_LIMIT, THUMB_MAX_DIM, THUMB_QUALITY } from "@/lib/constants";
import type { CaseRecord, DiagnosisResult } from "@/lib/types";

const SYMPTOMS = [
  { id: "yellowing", label: "Yellowing leaves" },
  { id: "browning_tips", label: "Brown/crispy tips" },
  { id: "wilting", label: "Wilting/drooping" },
  { id: "leaf_drop", label: "Leaves dropping" },
  { id: "mushy_stem", label: "Mushy stem or base" },
  { id: "spots", label: "Leaf spots or blotches" },
  { id: "holes", label: "Holes/chewed edges" },
  { id: "webbing", label: "Fine webbing on leaves" },
  { id: "white_cotton", label: "White cottony tufts" },
  { id: "sticky", label: "Sticky residue (honeydew)" },
  { id: "tiny_flies", label: "Tiny flies around soil" },
  { id: "black_mold", label: "Sooty/black mold" },
  { id: "stunted", label: "Stunted or distorted growth" },
  { id: "sunburn", label: "Bleached/brown sunburn patches" },
];

const TOGGLES: { id: string; label: string }[] = [
  { id: "soil_soggy", label: "Soil feels soggy" },
  { id: "soil_dry", label: "Soil feels very dry" },
  { id: "soil_compact", label: "Soil is tightly packed" },
  { id: "soil_loose", label: "Soil is loose and airy" },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function downloadJSON(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PlantDoctorApp() {
  const [plantName, setPlantName] = useState("");
  const [plantType, setPlantType] = useState("");
  const [environment, setEnvironment] = useState("");
  const [notes, setNotes] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({});
  const [moistureLevel, setMoistureLevel] = useState(50);
  const [lightLevel, setLightLevel] = useState(50);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [thumbUrl, setThumbUrl] = useState<string | undefined>();
  const [history, setHistory] = useState<CaseRecord[]>([]);
  const [results, setResults] = useState<DiagnosisResult[]>([]);
  const [storageNotice, setStorageNotice] = useState("");
  const [view, setView] = useState<'intake' | 'loading' | 'results'>('intake');
  const [loadProgress, setLoadProgress] = useState(0);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    try {
      const v2 = localStorage.getItem(STORAGE_KEY_V2);
      if (v2) {
        setHistory(JSON.parse(v2));
        return;
      }
      const v1 = localStorage.getItem(LEGACY_KEY_V1);
      if (v1) {
        try {
          const parsed = JSON.parse(v1) as CaseRecord[];
          const migrated = parsed
            .map((rec) => ({ ...rec, imageUrl: undefined, thumbUrl: (rec as any).thumbUrl }))
            .slice(0, HISTORY_SOFT_LIMIT);
          setHistory(migrated);
          persistHistorySafely(migrated, setStorageNotice);
          localStorage.removeItem(LEGACY_KEY_V1);
        } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    persistHistorySafely(history, setStorageNotice);
  }, [history]);

  const handleImage = async (file: File) => {
    const [preview, thumb] = await Promise.all([
      fileToPreviewDataURL(file, 1280, 0.85),
      fileToThumbDataURL(file, THUMB_MAX_DIM, THUMB_QUALITY),
    ]);
    setImageUrl(preview);
    setThumbUrl(thumb);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleImage(file);
  };

  const onAnalyze = () => {
    const res = analyze(symptoms, toggles, moistureLevel, lightLevel, notes);
    setResults(res);

    setLoadProgress(0);
    setView('loading');

    let current = 0;
    const id = setInterval(() => {
      current += 7 + Math.round(Math.random() * 6);
      if (current >= 100) {
        current = 100;
        clearInterval(id);
        setLoadProgress(current);
        setView('results');
      } else {
        setLoadProgress(current);
      }
    }, 120);

    const record: CaseRecord = {
      id: uid(),
      createdAt: Date.now(),
      plantName,
      plantType,
      environment,
      notes,
      imageUrl,
      thumbUrl,
      symptoms,
      toggles,
      moistureLevel,
      lightLevel,
      results: res,
    };

    setHistory((h) => {
      const next = [record, ...h].slice(0, HISTORY_SOFT_LIMIT);
      return next.map((r) => ({ ...r, imageUrl: undefined }));
    });
  };

  const resetForm = () => {
    setPlantName("");
    setPlantType("");
    setEnvironment("");
    setNotes("");
    setSymptoms([]);
    setToggles({});
    setMoistureLevel(50);
    setLightLevel(50);
    setImageUrl(undefined);
    setThumbUrl(undefined);
    setResults([]);
  };

  const compactHistory = () => {
    setHistory((h) => h.slice(0, Math.ceil(HISTORY_SOFT_LIMIT / 2)).map((r) => ({ ...r, thumbUrl: undefined })));
    setStorageNotice("History compacted: thumbnails removed and list pruned.");
  };

  const headerTitle = useMemo(
    () => (
      <div className="flex items-center gap-3">
        <Stethoscope className="w-6 h-6" />
        <span>The Plant Doctor</span>
      </div>
    ),
    []
  );

  const storageBytes = estimateBytes(JSON.stringify(history));
  const storageKB = Math.round(storageBytes / 1024);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-3">
            <Leaf className="w-8 h-8" /> {headerTitle}
          </h1>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => downloadJSON("plant-doctor-history.json", history)}>
              <Download className="w-4 h-4 mr-2" /> Export History
            </Button>
            <Button variant="secondary" onClick={compactHistory}>
              <Wrench className="w-4 h-4 mr-2" /> Compact History
            </Button>
            <Button variant="destructive" onClick={() => setHistory([])}>
              <Trash2 className="w-4 h-4 mr-2" /> Clear History
            </Button>
          </div>
        </div>

        {storageNotice && (
          <div className="mb-4 p-3 border rounded-xl bg-amber-50 text-amber-900 text-sm">
            {storageNotice}
          </div>
        )}

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="new">New Diagnosis</TabsTrigger>
            <TabsTrigger value="history">Case History</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <div className="space-y-6 mt-4">
              {view === 'intake' && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Upload & Describe</CardTitle>
                    <CardDescription>Share a photo of what you're plant. I'll diagnose likely causes and prescribe fixes.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Image uploader */}
                    <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} className="border-2 border-dashed rounded-2xl p-4 text-center bg-white hover:bg-emerald-50 transition">
                      {imageUrl ? (
                        <div className="relative">
                          <img src={imageUrl} alt="Plant" className="mx-auto max-h-72 rounded-xl object-contain" />
                          <div className="flex justify-center gap-2 mt-3">
                            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                              <ImageIcon className="w-4 h-4 mr-2" /> Replace photo
                            </Button>
                            <Button variant="ghost" onClick={() => { setImageUrl(undefined); setThumbUrl(undefined); }}>
                              <X className="w-4 h-4 mr-2" /> Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="py-10">
                          <Upload className="w-10 h-10 mx-auto mb-3" />
                          <p className="text-muted-foreground mb-2">Drag & drop a plant photo here</p>
                          <Button onClick={() => fileRef.current?.click()}>
                            <Camera className="w-4 h-4 mr-2" /> Choose image
                          </Button>
                        </div>
                      )}
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="plantName">Plant Name</Label>
                        <Input id="plantName" placeholder="e.g., Monstera #2" value={plantName} onChange={(e) => setPlantName(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="plantType">Plant Type/Species</Label>
                        <Input id="plantType" placeholder="e.g., Monstera deliciosa" value={plantType} onChange={(e) => setPlantType(e.target.value)} />
                      </div>
                    </div>

                    {/* Symptoms checklist */}
                    <div>
                      <Label>What Are the Plant's Symptoms</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {SYMPTOMS.map((s) => {
                          const active = symptoms.includes(s.id);
                          return (
                            <button
                              type="button"
                              key={s.id}
                              onClick={() => setSymptoms((prev) => (active ? prev.filter((x) => x !== s.id) : [...prev, s.id]))}
                              className={`px-3 py-1 rounded-full border text-sm transition ${active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-emerald-50"}`}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="environment">Describe the Plant's Environment</Label>
                      <Input id="environment" placeholder="e.g., Bright east window, 5 ft away; 45% humidity" value={environment} onChange={(e) => setEnvironment(e.target.value)} />
                    </div>

                    <div>
                      <Label>What Is the Soil Condition?</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {TOGGLES.map((t) => {
                          const active = !!toggles[t.id];
                          return (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() => setToggles((o) => ({ ...o, [t.id]: !o[t.id] }))}
                              className={`px-3 py-1 rounded-full border text-sm transition ${active ? "bg-emerald-600 text-white border-emerald-600" : "hover:bg-emerald-50"}`}
                            >
                              {t.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="fertilized">Did You Recently Fertilize?</Label>
                      <div className="mt-2 flex items-center gap-3">
                        <YesNoSwitch
                          id="fertilized"
                          ariaLabel="Fertilized recently"
                          checked={!!toggles.fertilized}
                          onChange={(v) => setToggles((o) => ({ ...o, fertilized: v }))}
                        />
                        <span className="text-sm text-muted-foreground">{toggles.fertilized ? "Yes" : "No"}</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Anything Else You Want to Share?</Label>
                      <Textarea id="notes" className="min-h-24" placeholder="Spots on older leaves, sticky residue on new growth, watered last week…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-3 justify-between">
                    <Button onClick={onAnalyze} className="rounded-2xl px-6">
                      <Stethoscope className="w-4 h-4 mr-2" /> Diagnose
                    </Button>
                    <Button variant="ghost" onClick={resetForm}>Reset</Button>
                  </CardFooter>
                </Card>
              )}

              {view === 'loading' && (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Analyzing…</CardTitle>
                    <CardDescription>I'm using my plant expertise to determine your diagnosis.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="py-8">
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${loadProgress}%`, transition: "width 120ms linear" }} />
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground text-center">{loadProgress}%</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {view === 'results' && (
                <Card className="shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Results</CardTitle>
                      <CardDescription>Top matches appear first. Always confirm before treating.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => { setView('intake'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        ← Back to Diagnosis
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {results.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No results. Try adjusting your inputs.</div>
                    ) : (
                      <div className="space-y-4">
                        {results.map((r, i) => (
                          <div key={i} className="border rounded-2xl p-4 bg-white">
                            <div className="flex items-center justify-between gap-2">
                              <div className="font-medium text-lg">{r.issue}</div>
                              <Badge variant={r.urgency === "high" ? "destructive" : r.urgency === "medium" ? "default" : "secondary"} className="uppercase">
                                {r.urgency ?? "low"}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Confidence: {(r.confidence * 100).toFixed(0)}%</div>
                            {r.reasons.length > 0 && (
                              <ul className="list-disc pl-6 mt-2 text-sm">
                                {r.reasons.map((rr, idx) => (
                                  <li key={idx}>{rr}</li>
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
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    {results.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          downloadJSON(`plant-doctor-${plantName || "case"}.json`, {
                            plantName,
                            plantType,
                            environment,
                            notes,
                            symptoms,
                            toggles,
                            moistureLevel,
                            lightLevel,
                            results,
                          })
                        }
                      >
                        <Download className="w-4 h-4 mr-2" /> Export Results
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {history.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No cases yet — run a diagnosis to save your first case.
                  </CardContent>
                </Card>
              )}
              {history.map((rec) => (
                <Card key={rec.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="truncate flex items-center gap-2">
                      <Leaf className="w-4 h-4" /> {rec.plantName || "Untitled Plant"}
                    </CardTitle>
                    <CardDescription className="truncate">{rec.plantType || "Unspecified species"}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {rec.thumbUrl && <img src={rec.thumbUrl} alt="Plant thumb" className="w-full h-40 object-cover rounded-xl" />}
                    <div className="flex flex-wrap gap-1">
                      {rec.symptoms.slice(0, 6).map((sid) => (
                        <Badge key={sid} variant="secondary" className="rounded-full">
                          {SYMPTOMS.find((s) => s.id === sid)?.label || sid}
                        </Badge>
                      ))}
                      {rec.symptoms.length > 6 && <Badge className="rounded-full">+{rec.symptoms.length - 6}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(rec.createdAt).toLocaleString()}</div>
                    <div className="text-sm line-clamp-3">{rec.notes}</div>
                    <div className="mt-1 text-sm">
                      <span className="font-medium">Top diagnosis:</span> {rec.results[0]?.issue}{" "}
                      <span className="text-muted-foreground">({Math.round((rec.results[0]?.confidence || 0) * 100)}%)</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-xs text-muted-foreground">
              Stored history size ≈ {storageKB} KB
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>About Plant Doctor</CardTitle>
                <CardDescription>A lightweight, client-side triage tool for common houseplant problems.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-6">
                <p>
                  <strong>How it works:</strong> You provide a photo, select symptoms, and describe conditions. A simple rule engine suggests
                  potential causes (e.g., overwatering, underwatering, pests) and shows actionable next steps.
                </p>
                <p>
                  <strong>Privacy:</strong> Your photos and case history stay in your browser. The history only stores a small thumbnail to avoid storage limits.
                </p>
                <p>
                  <strong>Disclaimer:</strong> The plant doctor is not a real doctor.
                </p>
                <p>
                  <strong>Tips:</strong> Clear close-ups of leaf surfaces (top and underside), stems, and soil help. Note watering timing,
                  light exposure, drafts, and recent changes.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Start a diagnosis</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}