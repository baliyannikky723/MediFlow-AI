"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Calendar, History, Activity, Edit2 } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { DemoNavbar } from "../../../../components/layout/DemoNavbar";
import { PatientSidebar, type PatientTab } from "../../../../components/patient/PatientSidebar";

interface UserProfile {
  name: string; age: string; gender: string; bloodGroup: string;
  height: string; weight: string; conditions: string[];
  medications: string; allergies: string;
}

interface Appointment {
  doctorName: string; specialization: string; clinicName: string; fee: string; dateTime: string; status: string;
}

interface HealthRecord {
  date: string; symptoms: string; severity: string; riskLevel: string; aiSummary: string;
}

export default function PatientDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<HealthRecord[]>([]);
  const [activeTab, setActiveTab] = useState<PatientTab>("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("mediflow_user");
      if (!storedUser) { router.replace("/demo/patient/auth"); return; }
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditForm(parsedUser);

      const storedAppts = localStorage.getItem("mediflow_appointments");
      if (storedAppts) setAppointments(JSON.parse(storedAppts));

      const storedHistory = localStorage.getItem("mediflow_health_history");
      if (storedHistory) setHistory(JSON.parse(storedHistory));
    } catch (e) {}
  }, [router]);

  const handleSaveProfile = () => {
    if (!user) return;
    const updated = { ...user, ...editForm };
    localStorage.setItem("mediflow_user", JSON.stringify(updated));
    setUser(updated);
    setIsEditing(false);
  };

  if (!user) return null;

  // Simple demo mock logic for upcoming vs previous (since randomly generated times)
  const upcoming = appointments; 
  const previous: Appointment[] = []; 

  return (
    <>
      <DemoNavbar title="Patient Dashboard" />
      <div className="flex min-h-screen bg-bgLight">
        <PatientSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          patientName={user.name}
          riskLabel="Active"
          riskColor="bg-success/10 text-success border-success/30"
        />

        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-primary">Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─── Section 1: Profile Card ─── */}
            <div className="lg:col-span-1 space-y-6">
              <Card padding="lg" className="animate-fadeUp">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-display text-lg text-primary font-bold flex items-center gap-2">
                    <User size={20} className="text-secondary"/> Profile
                  </h2>
                  <button onClick={() => setIsEditing(!isEditing)} className="text-accent hover:text-primary transition-colors">
                    <Edit2 size={16}/>
                  </button>
                </div>

                {isEditing ? (
                  <div className="space-y-3 text-sm">
                    <input className="w-full border rounded p-2 focus:ring-accent outline-none" value={editForm.name||""} onChange={e=>setEditForm({...editForm, name: e.target.value})} placeholder="Name" />
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border rounded p-2 outline-none" value={editForm.age||""} onChange={e=>setEditForm({...editForm, age: e.target.value})} placeholder="Age" />
                      <input className="border rounded p-2 outline-none" value={editForm.gender||""} onChange={e=>setEditForm({...editForm, gender: e.target.value})} placeholder="Gender" />
                      <input className="border rounded p-2 outline-none" value={editForm.height||""} onChange={e=>setEditForm({...editForm, height: e.target.value})} placeholder="Height (cm)" />
                      <input className="border rounded p-2 outline-none" value={editForm.weight||""} onChange={e=>setEditForm({...editForm, weight: e.target.value})} placeholder="Weight (kg)" />
                    </div>
                    <input className="w-full border rounded p-2 outline-none" value={editForm.bloodGroup||""} onChange={e=>setEditForm({...editForm, bloodGroup: e.target.value})} placeholder="Blood Group" />
                    <input className="w-full border rounded p-2 outline-none" value={editForm.medications||""} onChange={e=>setEditForm({...editForm, medications: e.target.value})} placeholder="Medications" />
                    <input className="w-full border rounded p-2 outline-none" value={editForm.allergies||""} onChange={e=>setEditForm({...editForm, allergies: e.target.value})} placeholder="Allergies" />
                    <button onClick={handleSaveProfile} className="w-full bg-primary text-white py-2 rounded-xl font-bold mt-2 hover:bg-secondary transition-colors">Save Changes</button>
                  </div>
                ) : (
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-2 gap-y-3">
                      <div><span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-0.5">Name</span><span className="font-semibold text-primary">{user.name}</span></div>
                      <div><span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-0.5">Age/Gender</span><span className="font-semibold text-primary">{user.age}, {user.gender}</span></div>
                      <div><span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-0.5">Blood Group</span><span className="font-semibold text-primary">{user.bloodGroup}</span></div>
                      <div><span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-0.5">Vitals</span><span className="font-semibold text-primary">{user.height}cm, {user.weight}kg</span></div>
                    </div>
                    <div className="border-t border-bgSoft pt-3">
                      <span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-1.5">Conditions</span>
                      <div className="flex flex-wrap gap-1.5">
                        {user.conditions && user.conditions.length > 0
                          ? user.conditions.map(c => <Badge key={c} variant="normal" size="sm">{c}</Badge>)
                          : <span className="text-primary/70 font-medium">None</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-0.5">Medications</span>
                      <span className="font-semibold text-primary">{user.medications || "None"}</span>
                    </div>
                    <div>
                      <span className="text-primary/50 text-xs block uppercase tracking-wider font-bold mb-0.5">Allergies</span>
                      <span className="font-semibold text-primary">{user.allergies || "None"}</span>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {/* ─── Section 2: Upcoming Appointments ─── */}
              <Card padding="lg" id="appointments-section" className="animate-fadeUp">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="font-display text-lg text-primary font-bold flex items-center gap-2">
                    <Calendar size={20} className="text-accent"/> Upcoming Appointments
                  </h2>
                  <button onClick={() => router.push("/demo/patient/chat")} className="text-xs bg-accent text-white px-3 py-1.5 rounded-full font-semibold hover:bg-primary transition-colors">
                    Book via AI Assistant
                  </button>
                </div>
                {upcoming.length > 0 ? (
                  <div className="space-y-3">
                    {upcoming.map((apt, i) => (
                      <div key={i} className="flex justify-between items-center bg-bgLight/50 p-4 rounded-xl border border-bgSoft">
                        <div>
                          <p className="font-bold text-primary">{apt.doctorName} <span className="text-xs text-secondary font-semibold ml-2">{apt.specialization}</span></p>
                          <p className="text-xs text-primary/70 mt-1">{apt.dateTime} • {apt.clinicName}</p>
                        </div>
                        <Badge variant="success" size="md">Confirmed</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-bgLight/50 border border-bgSoft rounded-xl p-6 text-center">
                    <p className="text-sm font-semibold text-primary/70">No upcoming appointments</p>
                    <p className="text-xs text-primary/50 mt-1">Chat with our AI Assistant to book one.</p>
                  </div>
                )}
              </Card>

              {/* ─── Section 3: Previous Doctors ─── */}
              <Card padding="lg" className="animate-fadeUp">
                <div className="flex items-center gap-2 mb-5">
                  <Activity size={20} className="text-secondary"/>
                  <h2 className="font-display text-lg text-primary font-bold">Previous Doctors</h2>
                </div>
                {previous.length > 0 ? (
                  <div className="space-y-3">
                    {previous.map((apt, i) => (
                      <div key={i} className="flex justify-between items-center bg-bgLight/50 p-4 rounded-xl border border-bgSoft">
                        <div>
                          <p className="font-bold text-primary">{apt.doctorName}</p>
                          <p className="text-xs text-primary/70 mt-1">{apt.specialization}</p>
                        </div>
                        <button onClick={() => router.push("/demo/patient/chat")} className="text-xs border border-primary text-primary px-4 py-1.5 rounded-full font-bold hover:bg-bgLight transition-colors">
                          Book Again
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-bgLight/50 border border-bgSoft rounded-xl p-6 text-center">
                    <p className="text-sm font-semibold text-primary/70">No previous consultations yet</p>
                  </div>
                )}
              </Card>

              {/* ─── Section 4: Health History ─── */}
              <Card padding="lg" id="health-history-section" className="animate-fadeUp">
                <div className="flex items-center gap-2 mb-5">
                  <History size={20} className="text-warning"/>
                  <h2 className="font-display text-lg text-primary font-bold">Health History</h2>
                </div>
                {history.length > 0 ? (
                  <div className="space-y-4">
                    {history.map((rec, i) => (
                      <div key={i} className="bg-bgLight/50 p-4 rounded-xl border border-bgSoft flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-primary/50 uppercase tracking-wider">{new Date(rec.date).toLocaleDateString()}</span>
                          <Badge variant={rec.riskLevel?.toLowerCase().includes("emergency") ? "emergency" : rec.riskLevel?.toLowerCase().includes("high") ? "high" : "normal"} size="sm">
                            {rec.riskLevel || "Analyzed"}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-primary leading-relaxed">{rec.symptoms}</p>
                        {rec.severity && rec.severity !== "—" && (
                          <p className="text-xs font-bold text-secondary">Severity Score: {rec.severity}/10</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-bgLight/50 border border-bgSoft rounded-xl p-6 text-center">
                    <p className="text-sm font-semibold text-primary/70">Your health history will appear here after your first AI assessment</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
