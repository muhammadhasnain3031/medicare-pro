'use client';

/**
 * MEDICARE PRO - ADVANCED EMR SYSTEM
 * Patient Electronic Medical Record Management Module
 * Version: 2.0.4
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

// Global Constants for Medical Standardization
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EMRPage() {
    // ---------------------------------------------------------
    // HOOKS & ROUTING
    // ---------------------------------------------------------
    const params = useParams();
    const router = useRouter();
    const patId = params.id as string;

    // ---------------------------------------------------------
    // STATE MANAGEMENT
    // ---------------------------------------------------------
    const [emr, setEMR] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAILoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'history' | 'visits'>('overview');
    const [showVisit, setShowVisit] = useState(false);

    // Detailed Profile Form State
    const [form, setForm] = useState({
        bloodGroup: '',
        allergies: '',
        chronicConditions: '',
        currentMedications: '',
        familyHistory: '',
        height: '',
        weight: '',
        socialHistory: '',
        surgicalHistory: '',
        immunizationStatus: '',
        emergencyContact: '',
        insuranceProvider: ''
    });

    // Comprehensive Visit Encounter State
    const [visitForm, setVisitForm] = useState({
        diagnosis: '', 
        treatment: '', 
        notes: '',
        followUpDate: '',
        doctorName: '',
        facilityName: 'Medicare Central',
        vitals: { 
            bp: '', 
            pulse: '', 
            temp: '', 
            weight: '',
            respRate: '',
            spo2: '',
            glucose: ''
        },
    });

    // ---------------------------------------------------------
    // DATA FETCHING LOGIC
    // ---------------------------------------------------------
    const fetchPatientEMR = useCallback(async () => {
        if (!patId) return;
        
        try {
            setLoading(true);
            const response = await fetch(`/api/emr/${patId}`);
            
            if (!response.ok) {
                throw new Error("Failed to fetch EMR data from server");
            }

            const data = await response.json();
            
            if (data.emr) {
                setEMR(data.emr);
                // Hydrate the form state with database values
                setForm({
                    bloodGroup: data.emr.bloodGroup || '',
                    allergies: data.emr.allergies?.join(', ') || '',
                    chronicConditions: data.emr.chronicConditions?.join(', ') || '',
                    currentMedications: data.emr.currentMedications?.join(', ') || '',
                    familyHistory: data.emr.familyHistory || '',
                    height: String(data.emr.height || ''),
                    weight: String(data.emr.weight || ''),
                    socialHistory: data.emr.socialHistory || '',
                    surgicalHistory: data.emr.surgicalHistory || '',
                    immunizationStatus: data.emr.immunizationStatus || '',
                    emergencyContact: data.emr.emergencyContact || '',
                    insuranceProvider: data.emr.insuranceProvider || ''
                });
            }
        } catch (err: any) {
            console.error("Critical Fetch Error:", err.message);
        } finally {
            setLoading(false);
        }
    }, [patId]);

    useEffect(() => {
        fetchPatientEMR();
    }, [fetchPatientEMR]);

    // ---------------------------------------------------------
    // ACTION HANDLERS
    // ---------------------------------------------------------
    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            // Process comma-separated strings into arrays
            const allergiesArray = form.allergies.split(',').map(s => s.trim()).filter(Boolean);
            const conditionsArray = form.chronicConditions.split(',').map(s => s.trim()).filter(Boolean);
            const medsArray = form.currentMedications.split(',').map(s => s.trim()).filter(Boolean);

            const updatePayload = {
                ...form,
                allergies: allergiesArray,
                chronicConditions: conditionsArray,
                currentMedications: medsArray,
                height: Number(form.height) || 0,
                weight: Number(form.weight) || 0
            };

            const response = await fetch(`/api/emr/${patId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });

            const result = await response.json();
            if (result.emr) {
                setEMR(result.emr);
                alert("Clinical Profile Successfully Updated");
            }
        } catch (error) {
            console.error("Save Operation Failed:", error);
            alert("Error saving record. Please check console.");
        } finally {
            setSaving(false);
        }
    };

    const handleAIGenerator = async () => {
        setAILoading(true);
        try {
            const response = await fetch(`/api/emr/${patId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ generateAI: true }),
            });
            const data = await response.json();
            if (data.emr) {
                setEMR(data.emr);
            }
        } catch (err) {
            console.error("AI Analysis Failed:", err);
        } finally {
            setAILoading(false);
        }
    };

    const handleVisitSubmission = async () => {
        if (!visitForm.diagnosis || !visitForm.treatment) {
            return alert("Mandatory Fields: Diagnosis and Treatment Plan are required.");
        }
        
        setSaving(true);
        try {
            const response = await fetch(`/api/emr/${patId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ addVisit: visitForm }),
            });
            const data = await response.json();
            
            if (data.emr) {
                setEMR(data.emr);
                setShowVisit(false);
                // Clear the form for next entry
                setVisitForm({
                    diagnosis: '', treatment: '', notes: '', followUpDate: '',
                    doctorName: '', facilityName: 'Medicare Central',
                    vitals: { bp: '', pulse: '', temp: '', weight: '', respRate: '', spo2: '', glucose: '' }
                });
            }
        } catch (err) {
            console.error("Encounter Logging Error:", err);
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // REPORT GENERATION
    // ---------------------------------------------------------
    const generateMedicalPDF = () => {
        if (!emr) return;
        const doc = new jsPDF();
        
        // Brand Header
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(26);
        doc.text('MEDICARE PRO EMR', 15, 25);
        doc.setFontSize(10);
        doc.text(`Report Generated On: ${new Date().toLocaleString()}`, 15, 35);
        
        // Patient Snapshot
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text(`Patient Name: ${emr.patient?.name || 'N/A'}`, 15, 55);
        doc.setFontSize(11);
        doc.text(`Registration ID: ${patId}`, 15, 62);
        doc.text(`Blood Type: ${emr.bloodGroup || 'Not Tested'}`, 15, 69);

        // Core Medical Data Table
        autoTable(doc, {
            startY: 80,
            head: [['Clinical Category', 'Status / Details']],
            body: [
                ['Drug Allergies', emr.allergies?.join(', ') || 'No known allergies'],
                ['Chronic Diseases', emr.chronicConditions?.join(', ') || 'No chronic history'],
                ['Current Medications', emr.currentMedications?.join(', ') || 'None'],
                ['Surgical History', emr.surgicalHistory || 'No major surgeries reported'],
                ['Immunization', emr.immunizationStatus || 'Up to date']
            ],
           headStyles: { fillColor: [30, 58, 138] }
        });

        doc.save(`EMR_REPORT_${emr.patient?.name}.pdf`);
    };

    // ---------------------------------------------------------
    // RENDER HELPERS
    // ---------------------------------------------------------
    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <div className="relative">
                <div className="w-20 h-20 border-8 border-blue-100 rounded-full"></div>
                <div className="w-20 h-20 border-8 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <h2 className="mt-6 text-xl font-black text-blue-900 tracking-tighter">SECURE CLINICAL UPLOAD...</h2>
        </div>
    );

    const inputClasses = "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium";
    const labelClasses = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-2";

    return (
        <div className="min-h-screen bg-[#fcfdfe] pb-24 text-slate-800">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-12">
                
                {/* 1. TOP COMMAND BAR */}
                <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="space-y-2">
                        <Link href="/dashboard" className="group flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                            <span>←</span> Clinical Dashboard
                        </Link>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mt-2">Patient Records</h1>
                        <p className="text-slate-400 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Current Patient: <span className="text-slate-600 uppercase tracking-tighter">{emr?.patient?.name}</span>
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-8 lg:mt-0 w-full lg:w-auto">
                        <button onClick={generateMedicalPDF} className="flex-1 lg:flex-none px-8 py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                            Export Record
                        </button>
                        <button onClick={handleUpdateProfile} disabled={saving} className="flex-1 lg:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all">
                            {saving ? 'Processing...' : 'Commit Updates'}
                        </button>
                    </div>
                </header>

                {/* 2. AI ANALYTICS ENGINE */}
                <section className="mb-12">
                    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-blue-900 rounded-[3.5rem] p-10 text-white shadow-2xl">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border border-white/10 shrink-0">
                                🤖
                            </div>
                            <div className="flex-1 text-center md:text-left space-y-3">
                                <span className="inline-block px-4 py-1 bg-blue-500 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">Neural Intelligence</span>
                                <h3 className="text-2xl font-black">AI Diagnosis & Summary</h3>
                                {emr?.aiSummary ? (
                                    <p className="text-blue-100/80 leading-relaxed font-medium italic">"{emr.aiSummary}"</p>
                                ) : (
                                    <p className="text-blue-200/50 font-medium italic">Execute health analysis to generate clinical insights based on patient history.</p>
                                )}
                            </div>
                            <button onClick={handleAIGenerator} disabled={aiLoading} className="px-8 py-4 bg-white text-blue-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all shrink-0">
                                {aiLoading ? 'Analyzing...' : 'Run Analysis'}
                            </button>
                        </div>
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-20%] left-[10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
                    </div>
                </section>

                {/* 3. NAVIGATION NAVIGATION NAVIGATION */}
                <nav className="flex gap-4 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Patient Profile', icon: '👤' },
                        { id: 'vitals', label: 'Latest Vitals', icon: '📈' },
                        { id: 'visits', label: 'Encounter History', icon: '🏥' },
                        { id: 'history', label: 'Surgical/Social', icon: '🧪' }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-10 py-5 rounded-[1.75rem] font-black text-sm transition-all border-2 ${
                                activeTab === tab.id 
                                ? 'bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-100 -translate-y-1' 
                                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                            }`}>
                            <span>{tab.icon}</span> {tab.label}
                        </button>
                    ))}
                </nav>

                {/* 4. MAIN CONTENT AREA */}
                <main className="bg-white border border-slate-100 rounded-[4rem] p-10 md:p-16 shadow-sm shadow-slate-100">
                    
                    {activeTab === 'overview' && (
                        <div className="grid lg:grid-cols-2 gap-20 animate-in fade-in slide-in-from-bottom-5 duration-500">
                            {/* Column A: Biometrics */}
                            <div className="space-y-10">
                                <h4 className="text-xl font-black text-slate-900 flex items-center gap-4">
                                    <span className="w-1.5 h-10 bg-blue-600 rounded-full"></span> 
                                    Biometric Parameters
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Height (cm)</label>
                                        <input type="number" value={form.height} onChange={(e) => setForm({...form, height: e.target.value})} className={inputClasses} placeholder="170" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Weight (kg)</label>
                                        <input type="number" value={form.weight} onChange={(e) => setForm({...form, weight: e.target.value})} className={inputClasses} placeholder="70" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>Blood Group (Standardized)</label>
                                    <select value={form.bloodGroup} onChange={(e) => setForm({...form, bloodGroup: e.target.value})} className={inputClasses}>
                                        <option value="">Not Specified</option>
                                        {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>Family Medical History Details</label>
                                    <textarea value={form.familyHistory} onChange={(e) => setForm({...form, familyHistory: e.target.value})} className={`${inputClasses} h-40 resize-none`} placeholder="Describe any hereditary conditions..." />
                                </div>
                            </div>

                            {/* Column B: Risk Factors */}
                            <div className="space-y-10">
                                <h4 className="text-xl font-black text-slate-900 flex items-center gap-4">
                                    <span className="w-1.5 h-10 bg-red-500 rounded-full"></span> 
                                    Clinical Risk Assessment
                                </h4>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-2">Drug & Food Allergies</label>
                                    <input value={form.allergies} onChange={(e) => setForm({...form, allergies: e.target.value})} className="w-full px-5 py-4 bg-red-50/20 border border-red-100 rounded-2xl outline-none focus:ring-4 focus:ring-red-100 transition-all text-sm font-medium" placeholder="Penicillin, Lactose, etc." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-2">Chronic Diseases</label>
                                    <input value={form.chronicConditions} onChange={(e) => setForm({...form, chronicConditions: e.target.value})} className="w-full px-5 py-4 bg-orange-50/20 border border-orange-100 rounded-2xl outline-none focus:ring-4 focus:ring-orange-100 transition-all text-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-2">Active Prescriptions</label>
                                    <textarea value={form.currentMedications} onChange={(e) => setForm({...form, currentMedications: e.target.value})} className="w-full px-5 py-4 bg-indigo-50/20 border border-indigo-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-sm font-medium h-40 resize-none" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'vitals' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-12">
                            <h3 className="text-3xl font-black text-slate-900">Real-time Vitals Monitor</h3>
                            {emr?.visits?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                                    {[
                                        { l: 'BP', v: emr.visits[emr.visits.length-1].vitals?.bp, u: 'mmHg', c: 'bg-rose-50 text-rose-600', ic: '❤️' },
                                        { l: 'PULSE', v: emr.visits[emr.visits.length-1].vitals?.pulse, u: 'bpm', c: 'bg-blue-50 text-blue-600', ic: '💓' },
                                        { l: 'TEMP', v: emr.visits[emr.visits.length-1].vitals?.temp, u: '°F', c: 'bg-amber-50 text-amber-600', ic: '🌡️' },
                                        { l: 'OXYGEN', v: emr.visits[emr.visits.length-1].vitals?.spo2, u: '%', c: 'bg-emerald-50 text-emerald-600', ic: '🌬️' },
                                    ].map((v, i) => (
                                        <div key={i} className={`${v.c.split(' ')[0]} p-10 rounded-[3rem] border border-white shadow-xl shadow-slate-100 transition-all hover:scale-105`}>
                                            <div className="flex justify-between items-start mb-6">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{v.l}</span>
                                                <span className="text-2xl">{v.ic}</span>
                                            </div>
                                            <p className={`text-5xl font-black tracking-tighter ${v.c.split(' ')[1]}`}>{v.v || '--'}</p>
                                            <p className="text-xs font-black opacity-40 mt-4 uppercase tracking-widest">{v.u}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">Vital Data Stream Unavailable</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'visits' && (
                        <div className="animate-in fade-in duration-700 space-y-12">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <h3 className="text-3xl font-black text-slate-900 border-b-8 border-blue-100 pb-2">Clinical Encounters</h3>
                                <button onClick={() => setShowVisit(true)} className="w-full md:w-auto px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-black transition-all">
                                    + Start New Encounter
                                </button>
                            </div>
                            
                            <div className="grid gap-10">
                                {[...(emr?.visits || [])].reverse().map((visit: any, index: number) => (
                                    <div key={index} className="p-10 bg-white border border-slate-100 rounded-[3.5rem] hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                            <div>
                                                <div className="flex gap-3 mb-4">
                                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        Case #{(emr?.visits?.length || 0) - index}
                                                    </span>
                                                    <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                        {visit.date}
                                                    </span>
                                                </div>
                                                <h4 className="text-3xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{visit.diagnosis}</h4>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-12 mb-10">
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Therapeutic Plan</h5>
                                                <p className="text-slate-700 font-bold leading-relaxed text-lg">{visit.treatment}</p>
                                            </div>
                                            <div className="space-y-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doctor's Annotations</h5>
                                                <p className="text-slate-500 font-medium italic">"{visit.notes || 'No specific clinical notes recorded for this visit'}"</p>
                                            </div>
                                        </div>
                                        {/* Dynamic Vitals Injection */}
                                        <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                                            {visit.vitals && Object.entries(visit.vitals).map(([k, val]) => (
                                                val && (
                                                    <div key={k} className="px-5 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase block mb-0.5">{k}</span>
                                                        <span className="text-sm font-black text-slate-900">{val as any}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* 5. OVERLAY MODAL: ENCOUNTER BUILDER */}
            {showVisit && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-6 overflow-y-auto">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-4xl my-auto shadow-3xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-12">
                            <div className="space-y-1">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Clinical Encounter Builder</h2>
                                <p className="text-slate-400 font-bold">Input physical exam data and diagnosis</p>
                            </div>
                            <button onClick={() => setShowVisit(false)} className="w-14 h-14 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all text-xl">✕</button>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Medical Logic */}
                            <div className="md:col-span-2 space-y-8">
                                <div className="space-y-2">
                                    <label className={labelClasses}>Differential Diagnosis *</label>
                                    <input value={visitForm.diagnosis} onChange={e => setVisitForm({...visitForm, diagnosis: e.target.value})} className={inputClasses} placeholder="Search conditions..." />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>Treatment & Action Plan *</label>
                                    <textarea value={visitForm.treatment} onChange={e => setVisitForm({...visitForm, treatment: e.target.value})} className={`${inputClasses} h-40 resize-none`} placeholder="Enter medication, dosage, and next steps..." />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>Additional Observations</label>
                                    <textarea value={visitForm.notes} onChange={e => setVisitForm({...visitForm, notes: e.target.value})} className={`${inputClasses} h-24 resize-none`} />
                                </div>
                            </div>

                            {/* Vital Stats Panel */}
                            <div className="bg-slate-50 p-8 rounded-[3rem] space-y-6">
                                <h4 className="text-center font-black text-slate-400 text-[10px] uppercase tracking-widest mb-4">Patient Vitals</h4>
                                <div className="space-y-4">
                                    <input value={visitForm.vitals.bp} onChange={e => setVisitForm({...visitForm, vitals: {...visitForm.vitals, bp: e.target.value}})} className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm" placeholder="BP (120/80)" />
                                    <input value={visitForm.vitals.pulse} onChange={e => setVisitForm({...visitForm, vitals: {...visitForm.vitals, pulse: e.target.value}})} className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm" placeholder="Pulse (bpm)" />
                                    <input value={visitForm.vitals.temp} onChange={e => setVisitForm({...visitForm, vitals: {...visitForm.vitals, temp: e.target.value}})} className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm" placeholder="Temp (°F)" />
                                    <input value={visitForm.vitals.spo2} onChange={e => setVisitForm({...visitForm, vitals: {...visitForm.vitals, spo2: e.target.value}})} className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm" placeholder="SpO2 (%)" />
                                    <input value={visitForm.vitals.respRate} onChange={e => setVisitForm({...visitForm, vitals: {...visitForm.vitals, respRate: e.target.value}})} className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-sm" placeholder="Resp Rate" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-4">
                            <button onClick={() => setShowVisit(false)} className="flex-1 py-5 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancel Log</button>
                            <button onClick={handleVisitSubmission} disabled={saving} className="flex-[2] py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all">
                                {saving ? 'Verifying...' : 'Finalize & Archive Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}