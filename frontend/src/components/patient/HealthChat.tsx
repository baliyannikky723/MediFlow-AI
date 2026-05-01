"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, RotateCcw } from "lucide-react";

/* ─── Types ── */
interface Message { role: "ai" | "user"; text: string; }
interface Doctor { name: string; spec: string; availability: string; fee: string; location: string; rating: string; }

/* ─── Fallback questions ── */
const QUESTIONS = [
  "Hi! I'm MediFlow AI 👋 What health concerns or symptoms are you experiencing today?",
  "How long have you been feeling this way?",
  "On a scale of 1 to 10, how would you rate the severity? (1 = very mild, 10 = unbearable)",
  "Have you taken any medicines or home remedies for this so far? If yes, what?",
  "Do you have any known allergies or pre-existing medical conditions?",
  "Is there anything else about your health or lifestyle you'd like me to know?",
];

/* ─── Keyword matching ── */
function matchSpec(text: string): string {
  const t = text.toLowerCase();
  if (/chest|heart|palpitation|breathless/.test(t)) return "Cardiologist";
  if (/head|migraine|dizzy|vertigo|nervous|memory/.test(t)) return "Neurologist";
  if (/skin|rash|acne|itch/.test(t)) return "Dermatologist";
  if (/stomach|abdomen|digestion|nausea|vomit|bowel/.test(t)) return "Gastroenterologist";
  if (/bone|joint|back|knee|muscle|fracture/.test(t)) return "Orthopedic Specialist";
  if (/mental|anxiety|stress|depression|sleep|mood/.test(t)) return "Psychiatrist";
  if (/child|infant|baby|pediatric/.test(t)) return "Pediatrician";
  if (/eye|vision|sight/.test(t)) return "Ophthalmologist";
  if (/ear|nose|throat|sinus|tonsil/.test(t)) return "ENT Specialist";
  return "General Physician";
}

/* ─── Doctor DB ── */
const DOCTOR_DB: Record<string, Doctor[]> = {
  "Cardiologist":        [{ name:"Dr. Arvind Kapoor",      spec:"Cardiologist",        availability:"Available Today",         fee:"₹800", location:"Apollo Heart Centre, Bandra",          rating:"⭐ 4.8" },{ name:"Dr. Meena Nair",         spec:"Cardiologist",        availability:"Next Available: Tomorrow",     fee:"₹500", location:"Fortis Cardiac, Koregaon Park",        rating:"⭐ 4.6" },{ name:"Dr. Ramesh Iyer",        spec:"Cardiologist",        availability:"Available in 2 days",         fee:"₹300", location:"City Hospital, Connaught Place",       rating:"⭐ 4.5" }],
  "Neurologist":         [{ name:"Dr. Priya Sharma",       spec:"Neurologist",         availability:"Available Today",         fee:"₹500", location:"Max Neuro Centre, Saket",             rating:"⭐ 4.7" },{ name:"Dr. Suresh Patil",       spec:"Neurologist",         availability:"Next Available: Tomorrow",     fee:"₹800", location:"Apollo Neuro, Jubilee Hills",          rating:"⭐ 4.9" },{ name:"Dr. Kavita Rao",         spec:"Neurologist",         availability:"Available in 2 days",         fee:"₹300", location:"Medanta Brain, Gurugram",             rating:"⭐ 4.5" }],
  "Dermatologist":       [{ name:"Dr. Ananya Mehta",       spec:"Dermatologist",       availability:"Available Today",         fee:"₹300", location:"SkinCare Clinic, Indiranagar",        rating:"⭐ 4.6" },{ name:"Dr. Vikram Shah",        spec:"Dermatologist",       availability:"Next Available: Tomorrow",     fee:"₹500", location:"DermaCare, Linking Road",             rating:"⭐ 4.7" },{ name:"Dr. Pooja Gupta",        spec:"Dermatologist",       availability:"Available in 2 days",         fee:"₹800", location:"Apollo Skin, Anna Nagar",             rating:"⭐ 4.8" }],
  "Gastroenterologist":  [{ name:"Dr. Karan Bose",         spec:"Gastroenterologist",  availability:"Available Today",         fee:"₹500", location:"GI Clinic, Salt Lake City",          rating:"⭐ 4.7" },{ name:"Dr. Sunita Verma",       spec:"Gastroenterologist",  availability:"Next Available: Tomorrow",     fee:"₹800", location:"Fortis GI, Mulund",                   rating:"⭐ 4.6" },{ name:"Dr. Raju Krishnan",      spec:"Gastroenterologist",  availability:"Available in 2 days",         fee:"₹300", location:"City GI Hospital, T. Nagar",          rating:"⭐ 4.5" }],
  "Orthopedic Specialist":[{ name:"Dr. Anil Mathur",       spec:"Orthopedic Specialist",availability:"Available Today",        fee:"₹500", location:"Bone & Joint Clinic, Punjabi Bagh",  rating:"⭐ 4.8" },{ name:"Dr. Deepa Joshi",        spec:"Orthopedic Specialist",availability:"Next Available: Tomorrow",    fee:"₹300", location:"OrthoMax, FC Road",                   rating:"⭐ 4.6" },{ name:"Dr. Rajesh Tiwari",      spec:"Orthopedic Specialist",availability:"Available in 2 days",        fee:"₹800", location:"Apollo Ortho, Jubilee Hills",         rating:"⭐ 4.7" }],
  "Psychiatrist":        [{ name:"Dr. Nidhi Arora",        spec:"Psychiatrist",        availability:"Available Today",         fee:"₹800", location:"MindCare Centre, Banjara Hills",      rating:"⭐ 4.9" },{ name:"Dr. Sameer Kulkarni",    spec:"Psychiatrist",        availability:"Next Available: Tomorrow",     fee:"₹500", location:"Wellness Clinic, Koramangala",        rating:"⭐ 4.7" },{ name:"Dr. Asha Singh",         spec:"Psychiatrist",        availability:"Available in 2 days",         fee:"₹300", location:"NeuroMind, Connaught Place",          rating:"⭐ 4.6" }],
  "Pediatrician":        [{ name:"Dr. Ritu Bansal",        spec:"Pediatrician",        availability:"Available Today",         fee:"₹300", location:"ChildCare Clinic, Andheri West",      rating:"⭐ 4.8" },{ name:"Dr. Mohan Reddy",        spec:"Pediatrician",        availability:"Next Available: Tomorrow",     fee:"₹500", location:"Apollo Childrens, Greams Road",       rating:"⭐ 4.7" },{ name:"Dr. Lalitha Kumar",      spec:"Pediatrician",        availability:"Available in 2 days",         fee:"₹800", location:"Rainbow Childrens, Banjara Hills",    rating:"⭐ 4.9" }],
  "Ophthalmologist":     [{ name:"Dr. Vivek Agarwal",      spec:"Ophthalmologist",     availability:"Available Today",         fee:"₹500", location:"Eye Care Centre, MG Road",           rating:"⭐ 4.7" },{ name:"Dr. Smitha Nair",        spec:"Ophthalmologist",     availability:"Next Available: Tomorrow",     fee:"₹800", location:"LV Prasad Eye Institute, Hyderabad", rating:"⭐ 4.9" },{ name:"Dr. Harish Menon",       spec:"Ophthalmologist",     availability:"Available in 2 days",         fee:"₹300", location:"Vision Plus, Anna Salai",            rating:"⭐ 4.6" }],
  "ENT Specialist":      [{ name:"Dr. Preeti Saxena",      spec:"ENT Specialist",      availability:"Available Today",         fee:"₹300", location:"ENT Clinic, Lajpat Nagar",           rating:"⭐ 4.6" },{ name:"Dr. Ashok Thadani",      spec:"ENT Specialist",      availability:"Next Available: Tomorrow",     fee:"₹500", location:"Fortis ENT, Mulund",                 rating:"⭐ 4.7" },{ name:"Dr. Sangeetha Pillai",   spec:"ENT Specialist",      availability:"Available in 2 days",         fee:"₹800", location:"Apollo ENT, Velachery",              rating:"⭐ 4.8" }],
  "General Physician":   [{ name:"Dr. Rajiv Malhotra",     spec:"General Physician",   availability:"Available Today",         fee:"₹300", location:"Family Care Clinic, Sector 15",      rating:"⭐ 4.6" },{ name:"Dr. Usha Krishnamurthy", spec:"General Physician",   availability:"Next Available: Tomorrow",     fee:"₹500", location:"HealthFirst, Koramangala",           rating:"⭐ 4.7" },{ name:"Dr. Pawan Khanna",       spec:"General Physician",   availability:"Available in 2 days",         fee:"₹800", location:"Apollo Clinic, Bandra",              rating:"⭐ 4.8" }],
};

function getWellnessTips(symptom: string): string[] {
  const t = symptom.toLowerCase();
  if (/chest|heart/.test(t))     return ["Rest and avoid strenuous activity","Practice slow deep breathing","Reduce sodium intake","Monitor your pulse regularly"];
  if (/head|migraine|dizzy/.test(t)) return ["Rest in a quiet dark room","Stay well-hydrated","Apply a cold compress","Avoid bright screens"];
  if (/skin|rash|itch/.test(t))  return ["Avoid scratching","Apply mild moisturizer","Keep area clean and dry","Avoid harsh soaps"];
  if (/stomach|nausea/.test(t))  return ["Eat light bland food","Stay hydrated with clear fluids","Avoid spicy/fried food","Rest"];
  if (/bone|joint|back/.test(t)) return ["Apply ice for 20 minutes","Rest the area","Try gentle stretching after 24h","Elevate if possible"];
  if (/anxiety|stress|sleep/.test(t)) return ["Practice 4-7-8 breathing","Maintain consistent sleep schedule","Take short outdoor walks","Limit caffeine before bed"];
  return ["Drink 8+ glasses of water","Get 7–8 hours of sleep","Eat balanced meals","Take breaks from sitting"];
}

function randomTime(): string {
  const h = [10,11,12,14,15,16,17,18][Math.floor(Math.random()*8)];
  const m = Math.random()>0.5?"00":"30";
  return `${h>12?h-12:h}:${m} ${h<12?"AM":"PM"}`;
}

/* ─── Styles ── */
const S = {
  wrap:    { display:"flex", flexDirection:"column" as const, height:"calc(100vh - 128px)", background:"#f0f8ff" },
  area:    { flex:1, overflowY:"auto" as const, padding:"24px 16px 8px" },
  inner:   { maxWidth:680, margin:"0 auto", display:"flex", flexDirection:"column" as const, gap:14 },
  ai:      { maxWidth:"78%", padding:"12px 16px", borderRadius:"18px 18px 18px 4px", background:"#fff", color:"#1B4965", fontSize:"0.88rem", lineHeight:1.65, boxShadow:"0 1px 4px rgba(27,73,101,.1)", whiteSpace:"pre-wrap" as const },
  user:    { maxWidth:"78%", padding:"12px 16px", borderRadius:"18px 18px 4px 18px", background:"#1B4965", color:"#fff", fontSize:"0.88rem", lineHeight:1.65 },
  avatar:  { width:30, height:30, borderRadius:"50%", background:"#1B4965", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, alignSelf:"flex-end" as const, marginRight:8 },
  bar:     { borderTop:"1px solid #d1e9f6", background:"#fff", padding:"14px 16px" },
  row:     { maxWidth:680, margin:"0 auto", display:"flex", gap:10, alignItems:"flex-end" },
  input:   { flex:1, background:"#f0f8ff", border:"1.5px solid #d1e9f6", borderRadius:24, padding:"11px 18px", fontSize:"0.88rem", color:"#1B4965", outline:"none", fontFamily:"inherit" },
  send:    { width:44, height:44, borderRadius:"50%", background:"#1B4965", border:"none", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 },
  card:    { background:"#fff", border:"1px solid #d1e9f6", borderRadius:16, padding:"16px 18px", boxShadow:"0 2px 8px rgba(27,73,101,.08)" },
  bookBtn: { background:"#1B4965", color:"#fff", border:"none", borderRadius:24, padding:"8px 18px", fontSize:"0.8rem", fontWeight:700, cursor:"pointer" },
  skipLink:{ background:"none", border:"none", color:"#6b9ab8", fontSize:"0.78rem", cursor:"pointer", marginTop:6, textDecoration:"underline", display:"block" },
  resetBtn:{ background:"#f0f8ff", border:"1.5px solid #d1e9f6", borderRadius:24, padding:"9px 20px", fontSize:"0.82rem", fontWeight:700, color:"#1B4965", cursor:"pointer", display:"flex", alignItems:"center", gap:6 },
  avail:   (a:string) => ({ fontSize:"0.72rem", fontWeight:700, padding:"3px 10px", borderRadius:99, background:a==="Available Today"?"#dcfce7":"#fef3c7", color:a==="Available Today"?"#16a34a":"#b45309" }),
};

/* ─── localStorage helpers ── */
function getUser() { try { const s=localStorage.getItem("mediflow_user"); return s?JSON.parse(s):null; } catch { return null; } }
function saveHistory(symptoms:string, severity:string, recommendation:string) {
  try {
    const key="mediflow_health_history";
    const prev=JSON.parse(localStorage.getItem(key)||"[]");
    prev.unshift({ date:new Date().toISOString(), symptoms, severity, riskLevel:recommendation, aiSummary:recommendation });
    localStorage.setItem(key, JSON.stringify(prev));
  } catch {}
}
function saveAppointment(doc:Doctor) {
  try {
    const key="mediflow_appointments";
    const prev=JSON.parse(localStorage.getItem(key)||"[]");
    prev.unshift({ doctorName:doc.name, specialization:doc.spec, clinicName:doc.location, fee:doc.fee, dateTime:new Date().toDateString()+" "+randomTime(), status:"confirmed" });
    localStorage.setItem(key, JSON.stringify(prev));
  } catch {}
}

/* ─── Component ── */
export default function HealthChat() {
  const [messages,  setMessages]  = useState<Message[]>([]);
  const [qIndex,    setQIndex]    = useState(0);
  const [answers,   setAnswers]   = useState<string[]>([]);
  const [phase,     setPhase]     = useState<"chat"|"results">("chat");
  const [input,     setInput]     = useState("");
  const [typing,    setTyping]    = useState(false);
  const [doctors,   setDoctors]   = useState<Doctor[]>([]);
  const [booking,   setBooking]   = useState<"idle"|"booking"|"confirmed">("idle");
  const [skipped,   setSkipped]   = useState(false);
  const [convHist,  setConvHist]  = useState<{role:string;content:string}[]>([]);
  const [useFallback,setFallback] = useState(false);
  const [assessment,setAssessment]= useState<{symptoms:string;severity:string;recommendation:string}|null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const user = typeof window !== "undefined" ? getUser() : null;
  const userName = user?.name || "there";

  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      const firstQ = `Hi ${userName}! 👋 I'm MediFlow AI. What health concerns or symptoms are you experiencing today?`;
      setMessages([{ role:"ai", text:firstQ }]);
      setConvHist([{ role:"assistant", content:firstQ }]);
    }, 900);
    return () => clearTimeout(t);
  }, [userName]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, typing, phase, booking, skipped]);

  /* ─── Backend call with fallback ── */
  const callBackend = async (userMsg: string, hist: {role:string;content:string}[], newAnswers: string[]): Promise<boolean> => {
    const profile = user ? { age:user.age, gender:user.gender, conditions:user.conditions, medications:user.medications, allergies:user.allergies } : {};
    try {
      const res = await fetch("http://localhost:5000/api/triage/chat", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ userMessage:userMsg, conversationHistory:hist, patientProfile:profile }),
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setTyping(false);
      setMessages(p => [...p, { role:"ai", text:data.aiMessage }]);
      setConvHist(p => [...p, { role:"assistant", content:data.aiMessage }]);
      if (data.isComplete && data.assessment) {
        setAssessment(data.assessment);
        saveHistory(data.assessment.symptoms||newAnswers[0]||"", data.assessment.severity||"", data.assessment.recommendation||"");
        setTimeout(() => { const spec=matchSpec(newAnswers[0]||""); setDoctors(DOCTOR_DB[spec]||DOCTOR_DB["General Physician"]); setPhase("results"); }, 2000);
      }
      return true;
    } catch {
      return false;
    }
  };

  /* ─── Send handler ── */
  const handleSend = async () => {
    const val = input.trim();
    if (!val || typing || phase === "results") return;
    setInput("");
    setMessages(p => [...p, { role:"user", text:val }]);
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    const newHist = [...convHist, { role:"user", content:val }];
    setConvHist(newHist);
    setTyping(true);

    /* Try backend unless already falling back */
    if (!useFallback) {
      const ok = await callBackend(val, newHist, newAnswers);
      if (ok) return;
      setFallback(true); // switch to fallback silently
    }

    /* Fallback: fixed questions */
    const next = qIndex + 1;
    if (next < QUESTIONS.length) {
      setQIndex(next);
      setTimeout(() => { setTyping(false); setMessages(p => [...p, { role:"ai", text:QUESTIONS[next] }]); }, 1000);
    } else {
      setQIndex(QUESTIONS.length);
      setTimeout(() => {
        setTyping(false);
        setMessages(p => [...p, { role:"ai", text:"Thank you for sharing! Give me a moment while I analyze your responses and find the best doctors available for you... 🔍" }]);
        saveHistory(newAnswers[0]||"", "—", "AI-assessed");
        setTimeout(() => { const spec=matchSpec(newAnswers[0]||""); setDoctors(DOCTOR_DB[spec]||DOCTOR_DB["General Physician"]); setPhase("results"); }, 2000);
      }, 1000);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const handleBook = (doc: Doctor) => {
    if (booking !== "idle") return;
    setBooking("booking");
    saveAppointment(doc);
    const time = randomTime();
    setMessages(p => [...p, { role:"ai", text:`Great choice! Booking your appointment with ${doc.name}...` }]);
    setTimeout(() => {
      setBooking("confirmed");
      setMessages(p => [...p, { role:"ai", text:`✅ Appointment confirmed! ${doc.name} — ${time} today. Check your email for confirmation details.` }]);
    }, 1500);
  };

  const handleSkip = () => {
    setSkipped(true);
    const tips = getWellnessTips(answers[0]||"");
    setMessages(p => [...p, { role:"ai", text:`No problem at all! Based on what you've shared, here are a few things that may help in the meantime:\n\n${tips.map((t,i)=>`${i+1}. ${t}`).join("\n")}` }]);
    setTimeout(() => setMessages(p => [...p, { role:"ai", text:"Feel free to come back anytime if your symptoms worsen 🙂" }]), 900);
  };

  const handleReset = () => {
    setMessages([]); setQIndex(0); setAnswers([]); setPhase("chat");
    setInput(""); setTyping(false); setDoctors([]); setBooking("idle"); setSkipped(false);
    setConvHist([]); setFallback(false); setAssessment(null);
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        const firstQ = `Hi ${userName}! 👋 I'm MediFlow AI. What health concerns or symptoms are you experiencing today?`;
        setMessages([{ role:"ai", text:firstQ }]);
        setConvHist([{ role:"assistant", content:firstQ }]);
      }, 900);
    }, 200);
  };

  const disabled = typing || phase === "results";

  return (
    <div style={S.wrap}>
      <div style={S.area}>
        <div style={S.inner}>
          {messages.map((m,i) => (
            <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
              {m.role==="ai" && <div style={S.avatar}><Bot size={14} color="white"/></div>}
              <div style={m.role==="ai"?S.ai:S.user}>{m.text}</div>
            </div>
          ))}

          {typing && (
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={S.avatar}><Bot size={14} color="white"/></div>
              <div style={{ ...S.ai, display:"flex", gap:5, alignItems:"center", padding:"12px 18px" }}>
                {[0,0.18,0.36].map((d,i)=>(
                  <span key={i} style={{ width:7,height:7,borderRadius:"50%",background:"#5FA8D3",display:"inline-block",animation:`typingBounce 1.2s ${d}s infinite ease-in-out` }}/>
                ))}
              </div>
            </div>
          )}

          {phase==="results" && doctors.length>0 && (
            <div style={{ marginLeft:38, display:"flex", flexDirection:"column", gap:12, marginTop:4 }}>
              <p style={{ fontSize:"0.78rem", color:"#6b9ab8", fontWeight:600 }}>Recommended doctors for you:</p>
              {doctors.map((doc,i)=>(
                <div key={i} style={S.card}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <div>
                      <div style={{ fontWeight:700, color:"#1B4965", fontSize:"0.95rem" }}>{doc.name}</div>
                      <div style={{ color:"#5FA8D3", fontSize:"0.78rem", fontWeight:600, marginTop:2 }}>{doc.spec}</div>
                    </div>
                    <span style={S.avail(doc.availability)}>{doc.availability}</span>
                  </div>
                  <div style={{ display:"flex", gap:16, flexWrap:"wrap" as const, fontSize:"0.8rem", color:"#4b7a99", marginBottom:12 }}>
                    <span>{doc.rating}</span><span>📍 {doc.location}</span><span>💰 {doc.fee}</span>
                  </div>
                  {booking==="idle" && (
                    <>
                      <button style={S.bookBtn} onClick={()=>handleBook(doc)}>Book Appointment</button>
                      <button style={S.skipLink} onClick={handleSkip}>Skip / Not Now</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {booking==="confirmed" && (
            <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>
              <button style={S.resetBtn} onClick={handleReset}><RotateCcw size={14}/> Back to Home</button>
            </div>
          )}
          {skipped && (
            <div style={{ display:"flex", justifyContent:"center", marginTop:8 }}>
              <button style={S.resetBtn} onClick={handleReset}><RotateCcw size={14}/> Start Over</button>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>

      <style>{`@keyframes typingBounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}`}</style>

      <div style={S.bar}>
        <div style={S.row}>
          <input style={{ ...S.input, opacity:disabled?.6:1, cursor:disabled?"not-allowed":"text" }}
            placeholder={disabled?(phase==="results"?"Choose a doctor above or skip…":"MediFlow AI is typing…"):"Type your answer…"}
            value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKey} disabled={disabled}/>
          <button style={{ ...S.send, background:(disabled||!input.trim())?"#d1e9f6":"#1B4965" }}
            onClick={handleSend} disabled={disabled||!input.trim()}>
            <Send size={16} color={(disabled||!input.trim())?"#6b9ab8":"white"}/>
          </button>
        </div>
      </div>
    </div>
  );
}
