import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Leaf, Stethoscope } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold flex items-center gap-2">
            <Leaf className="w-7 h-7 text-emerald-700" />
            Plant Doctor
          </h1>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="new">New Diagnosis</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* New Diagnosis */}
          <TabsContent value="new">
            <div className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload & Describe</CardTitle>
                <CardDescription>Share details about your plant.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-xl p-6 text-center text-muted-foreground">
                  Photo upload area (coming soon)
                </div>
                <input className="border rounded p-2 w-full" placeholder="Plant Name" />
                <input className="border rounded p-2 w-full" placeholder="Plant Type" />
                <div className="border rounded p-2 w-full">Symptoms (buttons coming soon)</div>
                <div className="border rounded p-2 w-full">Soil condition (coming soon)</div>
                <div className="border rounded p-2 w-full">Fertilized recently? (toggle coming soon)</div>
                <textarea className="border rounded p-2 w-full" placeholder="Notes (coming soon)" />
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button><Stethoscope className="w-4 h-4 mr-2" /> Diagnose</Button>
                <Button variant="ghost">Reset</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
                <CardDescription>Top matches will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Run a diagnosis to see results.</p>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history">
            <div className="space-y-6 mt-4">
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No cases yet — run a diagnosis to save your first case.
              </CardContent>
            </Card>
            </div>
          </TabsContent>

          {/* About */}
          <TabsContent value="about">
            <div className="space-y-6 mt-4">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
