"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import type { Service } from "@/lib/types";
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, generateServiceSlug } from "@/lib/serviceCategory";

const CATEGORY_OPTIONS = Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

function categoryDisplay(cat?: string) {
  const key = (cat || "astrology").toLowerCase() as keyof typeof SERVICE_CATEGORY_LABELS;
  const icon = SERVICE_CATEGORY_ICONS[key] ?? "🔮";
  const label = SERVICE_CATEGORY_LABELS[key] ?? cat ?? "—";
  return `${icon} ${label}`;
}

type KeyPoint = { label: string; desc: string };
type Benefit = { label: string; desc: string };
type Faq = { question: string; answer: string };

export default function ServicesManagement() {
  const router = useRouter();
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [rankValues, setRankValues] = useState<Record<string, string>>({});
  const [rankSaving, setRankSaving] = useState<Record<string, boolean>>({});
  const [rankSuccess, setRankSuccess] = useState<Record<string, boolean>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "astrology",
    shortDescription: "",
    description: "",
    price: 0,
    duration: "",
    ctaText: "Book Now",
    ctaLink: "",
    seoTitle: "",
    seoDescription: "",
    image: "",
    bannerImage: "",
  });
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [newKpLabel, setNewKpLabel] = useState("");
  const [newKpDesc, setNewKpDesc] = useState("");
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [newBenLabel, setNewBenLabel] = useState("");
  const [newBenDesc, setNewBenDesc] = useState("");
  const [faq, setFaq] = useState<Faq[]>([]);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  const resetForm = () => {
    setFormData({ title: "", slug: "", category: "astrology", shortDescription: "", description: "", price: 0, duration: "", ctaText: "Book Now", ctaLink: "", seoTitle: "", seoDescription: "", image: "", bannerImage: "" });
    setSlugManuallyEdited(false);
    setKeyPoints([]); setNewKpLabel(""); setNewKpDesc("");
    setBenefits([]); setNewBenLabel(""); setNewBenDesc("");
    setFaq([]); setNewFaqQ(""); setNewFaqA("");
    setError(null); setSaveSuccess(false);
  };

  const openAddModal = () => { setEditingId(null); resetForm(); setIsModalOpen(true); };

  const openEditModal = (service: Service) => {
    setEditingId(service._id || service.id || null);
    setSlugManuallyEdited(true); // treat existing slug as intentional
    setFormData({
      title: service.title,
      slug: service.slug || "",
      category: (service.category) || "astrology",
      shortDescription: service.shortDescription || "",
      description: service.description,
      price: service.price,
      duration: service.duration || "",
      ctaText: service.ctaText || "Book Now",
      ctaLink: service.ctaLink || "",
      seoTitle: service.seoTitle || "",
      seoDescription: service.seoDescription || "",
      image: service.image || "",
      bannerImage: service.bannerImage || "",
    });
    setKeyPoints((service.keyPoints || []).map((k) => ({ label: k.label, desc: k.desc })));
    setBenefits((service.benefits || []).map((b) => ({ label: b.label, desc: b.desc })));
    setFaq((service.faq || []).map((f) => ({ question: f.question, answer: f.answer })));
    setNewKpLabel(""); setNewKpDesc(""); setNewBenLabel(""); setNewBenDesc(""); setNewFaqQ(""); setNewFaqA("");
    setError(null); setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const extractErrorMessage = async (response: Response) => {
    try { const body = await response.json(); return body.error || `HTTP ${response.status}`; }
    catch { return `HTTP ${response.status}`; }
  };

  const getBase64SizeBytes = (value: string) => {
    const base64Body = value.split(",")[1] || "";
    const padding = (base64Body.match(/=*$/)?.[0].length ?? 0);
    return Math.floor((base64Body.length * 3) / 4) - padding;
  };

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Something went wrong.";
  };

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/services", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please log in again.");
        throw new Error(await extractErrorMessage(res));
      }
      const data = (await res.json()) as Service[];
      setServicesList(data);
      const initialRanks: Record<string, string> = {};
      data.forEach((s) => { const id = s._id || s.id || ""; if (id) initialRanks[id] = String(s.rank ?? 0); });
      setRankValues(initialRanks);
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      setLoading(true);
      try {
        const res = await fetch(`/api/services/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) { if (res.status === 401) throw new Error("Session expired. Please log in again."); throw new Error(await extractErrorMessage(res)); }
        setLoadError(null);
        await fetchServices();
      } catch (err: unknown) {
        setLoadError(getErrorMessage(err));
        setLoading(false);
      }
    }
  };

  const handleSaveRank = async (id: string) => {
    const newRank = Number(rankValues[id]);
    if (!Number.isFinite(newRank)) return;
    setRankSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rank: newRank }),
      });
      if (!res.ok) throw new Error(await extractErrorMessage(res));
      setRankSuccess((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setRankSuccess((prev) => ({ ...prev, [id]: false })), 1800);
      setServicesList((prev) => prev.map((s) => (s._id === id || s.id === id ? { ...s, rank: newRank } : s)));
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setRankSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleImageChange = (field: "image" | "bannerImage") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { setError("Image too large. Please upload an image under 1MB."); return; }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => setFormData((prev) => ({ ...prev, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleSubmit = async () => {
    setSaving(true); setError(null); setSaveSuccess(false);
    try {
      for (const imgField of ["image", "bannerImage"] as const) {
        const img = formData[imgField];
        if (img?.startsWith("data:image") && getBase64SizeBytes(img) > 1024 * 1024) {
          throw new Error(`${imgField === "image" ? "Thumbnail" : "Banner"} image too large. Max 1MB.`);
        }
      }
      const payload: Record<string, unknown> = { ...formData, keyPoints, benefits, faq };

      // Don't re-send unchanged http URLs as image field for PUT
      if (editingId) {
        if (formData.image?.startsWith("http")) { const { image: _, ...rest } = payload as { image: string }; Object.assign(payload, rest); delete payload.image; }
        if (formData.bannerImage?.startsWith("http")) { delete payload.bannerImage; }
      }

      const res = await fetch(editingId ? `/api/services/${editingId}` : "/api/services", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please log in again.");
        throw new Error(await extractErrorMessage(res));
      }

      setSaveSuccess(true);
      await fetchServices();
      setTimeout(() => { resetForm(); setIsModalOpen(false); setSaving(false); }, 1000);
    } catch (err: unknown) {
      const message = getErrorMessage(err);
      setError(message);
      if (message === "Session expired. Please log in again.") setTimeout(() => router.push("/admin/login"), 600);
      setSaving(false);
    }
  };

  const filteredServices = servicesList.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return s.title.toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q) || (s.shortDescription || s.description || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-[#0F172A]">Services Management</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage service pages, categories, content, and SEO — just like products.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setMigrating(true);
              setMigrateResult(null);
              try {
                const res = await fetch("/api/services/migrate-slugs", { method: "POST", credentials: "include" });
                const data = await res.json();
                if (res.ok) {
                  setMigrateResult(`✅ Fixed ${data.updated} service${data.updated !== 1 ? "s" : ""}${data.updated === 0 ? " — all slugs already set!" : " with missing slugs."}`);
                  fetchServices();
                } else {
                  setMigrateResult("❌ " + (data.error || "Migration failed"));
                }
              } catch {
                setMigrateResult("❌ Network error");
              } finally {
                setMigrating(false);
              }
            }}
            disabled={migrating}
            className="px-4 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#F97316] text-[#64748B] hover:text-[#F97316] text-sm font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {migrating ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            )}
            Fix Old URLs
          </button>
          <button onClick={openAddModal} className="px-4 py-2.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center">
            <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add New Service
          </button>
        </div>
      </div>

      {migrateResult && (
        <div className={`text-sm px-4 py-3 rounded-lg border ${migrateResult.startsWith("✅") ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"}`}>
          {migrateResult}
          <button onClick={() => setMigrateResult(null)} className="ml-3 underline text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
        </div>
        <input
          type="text"
          placeholder="Search services by name, category…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] bg-white transition"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#F97316] transition-colors" aria-label="Clear search">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="py-10 flex justify-center"><Spinner className="w-8 h-8 text-[#F97316]" /></div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Service</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Category</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Duration</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Price</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h6" /></svg>
                      Rank
                    </div>
                  </th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Slug</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredServices.length > 0 ? filteredServices.map((service) => {
                  const id = service._id || service.id || "";
                  return (
                    <tr key={id} className="hover:bg-[#F8FAFC]">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img src={service.image || "https://picsum.photos/seed/service/100/100"} alt="" className="w-10 h-10 rounded-md object-cover mr-3 border border-[#E2E8F0]" />
                          <div className="font-bold text-[#0F172A] truncate max-w-[200px]">{service.title}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#64748B] text-xs">{categoryDisplay(service.category)}</td>
                      <td className="px-6 py-4 text-[#64748B]">{service.duration || "—"}</td>
                      <td className="px-6 py-4 font-bold text-[#F97316]">₹{service.price}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number" min={0}
                            value={rankValues[id] ?? "0"}
                            onChange={(e) => setRankValues((prev) => ({ ...prev, [id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveRank(id); }}
                            className="w-16 px-2 py-1 border border-[#E2E8F0] rounded-lg text-sm text-center font-bold text-[#0F172A] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                          />
                          <button
                            onClick={() => handleSaveRank(id)}
                            disabled={rankSaving[id]}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${rankSuccess[id] ? "bg-green-500 text-white" : "bg-[#F97316] hover:bg-[#EA6C0A] text-white"} disabled:opacity-50`}
                          >
                            {rankSaving[id] ? <Spinner className="w-3 h-3 text-white" /> : rankSuccess[id] ? "✓" : "Set"}
                          </button>
                        </div>
                        <p className="text-[10px] text-[#94A3B8] mt-0.5">Higher = first</p>
                      </td>
                      <td className="px-6 py-4 text-[#64748B] font-mono text-xs max-w-[160px] truncate">{service.slug || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditModal(service)} className="text-blue-600 hover:text-blue-800 font-bold mr-4">Edit</button>
                        <button onClick={() => handleDelete(id)} className="text-red-500 hover:text-red-700 font-bold">Delete</button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-[#64748B] font-medium">
                      {searchQuery ? `No services matching "${searchQuery}".` : "No services found. Add one to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {loadError && <div className="mx-6 my-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">{loadError}</div>}
      </div>

      {searchQuery && !loading && (
        <p className="text-xs text-[#64748B]">Showing <span className="font-bold text-[#0F172A]">{filteredServices.length}</span> of <span className="font-bold text-[#0F172A]">{servicesList.length}</span> services</p>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      <Modal isOpen={isModalOpen} onClose={() => !saving && setIsModalOpen(false)} title={editingId ? "Edit Service" : "Add New Service"}>
        <div className="space-y-5">
          {saveSuccess && <p className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded-lg border border-green-200">Saved successfully!</p>}

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Service Name *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title: newTitle,
                    // Auto-fill slug only if user hasn't manually edited it
                    slug: slugManuallyEdited ? prev.slug : generateServiceSlug(newTitle),
                  }));
                }}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">
                URL Slug
                {!slugManuallyEdited && formData.title && (
                  <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">auto</span>
                )}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. kundli-reading"
                  value={formData.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true);
                    setFormData({ ...formData, slug: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none font-mono text-sm"
                />
                {slugManuallyEdited && formData.title && (
                  <button
                    type="button"
                    title="Reset to auto-generated slug"
                    onClick={() => {
                      setSlugManuallyEdited(false);
                      setFormData((prev) => ({ ...prev, slug: generateServiceSlug(prev.title) }));
                    }}
                    className="shrink-0 px-3 py-2 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] text-[#F97316] text-xs font-bold hover:bg-[#FFE8D6] transition-colors"
                  >
                    ↺ Reset
                  </button>
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-1">
                URL: <span className="font-mono">/services/{formData.slug || "…"}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Category</label>
              <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none bg-white">
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Price (₹) *</label>
              <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Duration</label>
              <input type="text" placeholder="e.g. 45 mins" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Thumbnail Image</label>
              <input type="file" accept="image/*" onChange={handleImageChange("image")} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg outline-none text-sm bg-gray-50" />
              {formData.image?.startsWith("http") && <p className="text-xs text-green-600 mt-1">Current image preserved. Upload to replace.</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Banner Image (Detail Page)</label>
              <input type="file" accept="image/*" onChange={handleImageChange("bannerImage")} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg outline-none text-sm bg-gray-50" />
              {formData.bannerImage?.startsWith("http") && <p className="text-xs text-green-600 mt-1">Current banner preserved. Upload to replace.</p>}
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Short Description (card teaser)</label>
            <input type="text" placeholder="One-line summary shown on service cards" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Full Description *</label>
            <textarea required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none min-h-[120px]" placeholder="Detailed description shown on the service detail page…" />
          </div>

          {/* Key Points */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFAFA]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">Key Points / Highlights</h3>
            <p className="text-xs text-[#64748B] mb-3">Shown as bullet points on the detail page. Leave empty to hide.</p>
            {keyPoints.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {keyPoints.map((kp, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{kp.label}</p>
                      {kp.desc && <p className="text-xs text-[#64748B] truncate">{kp.desc}</p>}
                    </div>
                    <button type="button" onClick={() => setKeyPoints((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 font-bold text-xs shrink-0 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <input type="text" placeholder="Point title e.g. Detailed Kundli Analysis" value={newKpLabel} onChange={(e) => setNewKpLabel(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
              <input type="text" placeholder="Optional short note" value={newKpDesc} onChange={(e) => setNewKpDesc(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
              <button type="button" onClick={() => { const label = newKpLabel.trim(); if (!label) return; setKeyPoints((prev) => [...prev, { label, desc: newKpDesc.trim() }]); setNewKpLabel(""); setNewKpDesc(""); }} disabled={!newKpLabel.trim()} className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">+ Add Key Point</button>
            </div>
          </div>

          {/* Benefits */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFAFA]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">Benefits</h3>
            <p className="text-xs text-[#64748B] mb-3">Shown in the benefits grid on the detail page.</p>
            {benefits.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{b.label}</p>
                      {b.desc && <p className="text-xs text-[#64748B] truncate">{b.desc}</p>}
                    </div>
                    <button type="button" onClick={() => setBenefits((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 font-bold text-xs shrink-0 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <input type="text" placeholder="Benefit title e.g. Overcome Career Obstacles" value={newBenLabel} onChange={(e) => setNewBenLabel(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
              <input type="text" placeholder="Optional description" value={newBenDesc} onChange={(e) => setNewBenDesc(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
              <button type="button" onClick={() => { const label = newBenLabel.trim(); if (!label) return; setBenefits((prev) => [...prev, { label, desc: newBenDesc.trim() }]); setNewBenLabel(""); setNewBenDesc(""); }} disabled={!newBenLabel.trim()} className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">+ Add Benefit</button>
            </div>
          </div>

          {/* FAQ */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFAFA]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">FAQ Section</h3>
            <p className="text-xs text-[#64748B] mb-3">Optional Q&A shown at the bottom of the service page.</p>
            {faq.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {faq.map((f, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{f.question}</p>
                      <p className="text-xs text-[#64748B] truncate">{f.answer}</p>
                    </div>
                    <button type="button" onClick={() => setFaq((prev) => prev.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 font-bold text-xs shrink-0 transition-colors">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <input type="text" placeholder="Question e.g. How long is the consultation?" value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
              <textarea placeholder="Answer" value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none min-h-[64px]" />
              <button type="button" onClick={() => { const question = newFaqQ.trim(); const answer = newFaqA.trim(); if (!question || !answer) return; setFaq((prev) => [...prev, { question, answer }]); setNewFaqQ(""); setNewFaqA(""); }} disabled={!newFaqQ.trim() || !newFaqA.trim()} className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50">+ Add FAQ</button>
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">CTA Button Text</label>
              <input type="text" placeholder="e.g. Book Now" value={formData.ctaText} onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">CTA Redirect URL (optional)</label>
              <input type="text" placeholder="/book-slot or https://..." value={formData.ctaLink} onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })} className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
            </div>
          </div>

          {/* SEO */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFAFA]">
            <h3 className="text-sm font-bold text-[#0F172A] mb-3">SEO Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">SEO Title (leave blank to use service title)</label>
                <input type="text" placeholder="Custom page title for search engines" value={formData.seoTitle} onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Meta Description</label>
                <textarea placeholder="Short description for Google (150–160 chars)" value={formData.seoDescription} onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })} className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none min-h-[64px]" />
              </div>
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={saving} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0F172A] rounded-lg font-bold transition-colors disabled:opacity-50">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-lg font-bold transition-colors disabled:opacity-50 min-w-[120px] flex justify-center">
              {saving ? <Spinner className="w-5 h-5 text-white" /> : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
