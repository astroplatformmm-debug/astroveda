"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import type { Product } from "@/lib/types";
import { generateProductSlug } from "@/lib/productCategory";

const CATEGORY_LABELS: Record<string, string> = {
  healing: "Healing Crystals",
  gemstones: "Gemstones",
  rudraksha: "Rudraksha",
  pooja: "Pooja Items",
};

function categoryLabel(cat?: string) {
  const key = (cat || "gemstones").toLowerCase();
  return CATEGORY_LABELS[key] ? `${cat || "gemstones"} · ${CATEGORY_LABELS[key]}` : cat || "—";
}

export default function ProductsManagement() {
  const router = useRouter();
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── NEW: search + rank state ───────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [rankValues, setRankValues] = useState<Record<string, string>>({});
  const [rankSaving, setRankSaving] = useState<Record<string, boolean>>({});
  const [rankSuccess, setRankSuccess] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    image: "",
    zodiac: "",
    certification: "",
    category: "gemstones",
  });
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [optionsInput, setOptionsInput] = useState("");
  const [ringMaterialEnabled, setRingMaterialEnabled] = useState(false);
  const [ringMaterials, setRingMaterials] = useState<{ label: string; extraPrice: number }[]>([]);
  const [newRingLabel, setNewRingLabel] = useState("");
  const [newRingPrice, setNewRingPrice] = useState<number>(0);
  const [benefits, setBenefits] = useState<{ label: string; desc: string }[]>([]);
  const [newBenefitLabel, setNewBenefitLabel] = useState("");
  const [newBenefitDesc, setNewBenefitDesc] = useState("");

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ title: "", slug: "", description: "", price: 0, image: "", zodiac: "", certification: "", category: "gemstones" });
    setExtraImages([]);
    setOptionsInput("");
    setRingMaterialEnabled(false);
    setRingMaterials([]);
    setNewRingLabel("");
    setNewRingPrice(0);
    setBenefits([]);
    setNewBenefitLabel("");
    setNewBenefitDesc("");
    setError(null);
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product._id || product.id || null);
    setFormData({
      title: product.title,
      slug: product.slug || "",
      description: product.description,
      price: product.price,
      image: product.image || "",
      zodiac: product.zodiac || "",
      certification: product.certification || "",
      category: product.category || "gemstones",
    });
    setExtraImages([...(product.images || [])]);
    setOptionsInput(
      (product.options || [])
        .map((o: { label: string; price: number }) => `${o.label}:${o.price}`)
        .join(", ")
    );
    setRingMaterialEnabled(product.ringMaterialEnabled ?? false);
    setRingMaterials(
      (product.ringMaterials || []).map((m: { label: string; extraPrice: number }) => ({
        label: m.label,
        extraPrice: m.extraPrice,
      }))
    );
    setNewRingLabel("");
    setNewRingPrice(0);
    setBenefits((product.benefits || []).map((b: { label: string; desc: string }) => ({ label: b.label, desc: b.desc })));
    setNewBenefitLabel("");
    setNewBenefitDesc("");
    setError(null);
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const extractErrorMessage = async (response: Response) => {
    try {
      const body = await response.json();
      return body.error || `HTTP ${response.status}`;
    } catch {
      return `HTTP ${response.status}`;
    }
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

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please log in again.");
        throw new Error(await extractErrorMessage(res));
      }
      const data = (await res.json()) as Product[];
      setProductsList(data);
      // Initialise rank inputs from fetched data
      const initialRanks: Record<string, string> = {};
      data.forEach((p) => {
        const id = p._id || p.id || "";
        if (id) initialRanks[id] = String(p.rank ?? 0);
      });
      setRankValues(initialRanks);
      setLoadError(null);
    } catch (err: unknown) {
      console.error("Fetch failed:", err);
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE", credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Session expired. Please log in again.");
          throw new Error(await extractErrorMessage(res));
        }
        setLoadError(null);
        await fetchProducts();
      } catch (err: unknown) {
        console.error("Delete failed:", err);
        setLoadError(getErrorMessage(err));
        setLoading(false);
      }
    }
  };

  // ── NEW: save rank inline ─────────────────────────────────────────────────
  const handleSaveRank = async (id: string) => {
    const newRank = Number(rankValues[id]);
    if (!Number.isFinite(newRank)) return;
    setRankSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rank: newRank }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please log in again.");
        throw new Error(await extractErrorMessage(res));
      }
      setRankSuccess((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setRankSuccess((prev) => ({ ...prev, [id]: false })), 1800);
      // Update local list rank without full refetch
      setProductsList((prev) =>
        prev.map((p) => (p._id === id || p.id === id ? { ...p, rank: newRank } : p))
      );
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setRankSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError("Image too large. Please upload an image under 1MB.");
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxExtra = 4;
    const slots = maxExtra - extraImages.length;
    if (slots <= 0) {
      setError("You can upload up to 4 additional images.");
      e.target.value = "";
      return;
    }
    const toProcess = files.slice(0, slots);
    setError(null);
    toProcess.forEach((file) => {
      if (file.size > 1024 * 1024) {
        setError("Each additional image must be under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setExtraImages((prev) => {
          if (prev.length >= maxExtra) return prev;
          return [...prev, reader.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeExtraImage = (index: number) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const options = optionsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => {
          const colonIndex = s.lastIndexOf(":");
          if (colonIndex === -1) return { label: s, price: 0 };
          const label = s.slice(0, colonIndex).trim();
          const price = Number(s.slice(colonIndex + 1).trim());
          return { label, price: Number.isFinite(price) ? price : 0 };
        })
        .filter((o) => o.label.length > 0);

      const primaryImage = formData.image;
      const payload: Record<string, unknown> = {
        ...formData,
        category: typeof formData.category === "string" ? formData.category.toLowerCase().trim() : "gemstones",
        images: extraImages.slice(0, 4),
        options,
        ringMaterialEnabled,
        ringMaterials,
        benefits,
      };

      if (
        typeof primaryImage === "string" &&
        primaryImage.startsWith("data:image") &&
        getBase64SizeBytes(primaryImage) > 1024 * 1024
      ) {
        throw new Error("Image too large. Please upload an image under 1MB.");
      }
      for (const img of extraImages) {
        if (img.startsWith("data:image") && getBase64SizeBytes(img) > 1024 * 1024) {
          throw new Error("An additional image is too large. Each must be under 1MB.");
        }
      }

      const requestPayload =
        editingId && typeof primaryImage === "string" && primaryImage && !primaryImage.startsWith("data:image")
          ? (({ image: _image, ...rest }) => rest)(payload)
          : payload;

      const res = await fetch(editingId ? `/api/products/${editingId}` : "/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestPayload),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Session expired. Please log in again.");
        throw new Error(await extractErrorMessage(res));
      }

      setSaveSuccess(true);
      await fetchProducts();
      setTimeout(() => {
        setFormData({ title: "", slug: "", description: "", price: 0, image: "", zodiac: "", certification: "", category: "gemstones" });
        setExtraImages([]);
        setOptionsInput("");
        setRingMaterialEnabled(false);
        setRingMaterials([]);
        setNewRingLabel("");
        setNewRingPrice(0);
        setBenefits([]);
        setNewBenefitLabel("");
        setNewBenefitDesc("");
        setIsModalOpen(false);
        setSaving(false);
      }, 1000);
    } catch (err: unknown) {
      console.error("Save failed:", err);
      const message = getErrorMessage(err);
      setError(message);
      if (message === "Session expired. Please log in again.") {
        setTimeout(() => router.push("/admin/login"), 600);
      }
      setSaving(false);
    }
  };

  // ── NEW: filtered products list ───────────────────────────────────────────
  const filteredProducts = productsList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.title.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.zodiac || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold font-playfair text-[#0F172A]">Products Management</h1>
          <p className="text-[#64748B] text-sm mt-1">Manage all shop products, categories, and inventory.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Product
        </button>
      </div>

      {/* ── NEW: Admin Search Bar ─────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-[#94A3B8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search products by name, category…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] bg-white transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-3 flex items-center text-[#94A3B8] hover:text-[#F97316] transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="py-10 flex justify-center">
            <Spinner className="w-8 h-8 text-[#F97316]" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Product</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Slug / URL</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Category</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Zodiac</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Certification</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Price</th>
                  {/* ── NEW: Rank column header ── */}
                  <th className="px-6 py-4 font-bold text-[#64748B]">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h12M3 17h6" />
                      </svg>
                      Rank
                    </div>
                  </th>
                  <th className="px-6 py-4 font-bold text-[#64748B] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const id = product._id || product.id || "";
                    return (
                      <tr key={id} className="hover:bg-[#F8FAFC]">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={product.image || "https://picsum.photos/seed/placeholder/100/100"}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover mr-3 border border-[#E2E8F0]"
                            />
                            <div className="font-bold text-[#0F172A] truncate max-w-[200px]">{product.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {product.slug
                            ? <span className="font-mono text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded">/shop/{product.slug}</span>
                            : <span className="text-xs text-gray-400">no slug</span>}
                        </td>
                        <td className="px-6 py-4 text-[#64748B] font-mono text-xs">{categoryLabel(product.category)}</td>
                        <td className="px-6 py-4 text-[#64748B]">{product.zodiac || "-"}</td>
                        <td className="px-6 py-4 text-[#64748B] truncate max-w-[150px]">{product.certification || "-"}</td>
                        <td className="px-6 py-4 font-bold text-[#F97316]">₹{product.price}</td>

                        {/* ── NEW: Rank cell ── */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={0}
                              value={rankValues[id] ?? "0"}
                              onChange={(e) =>
                                setRankValues((prev) => ({ ...prev, [id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveRank(id);
                              }}
                              className="w-16 px-2 py-1 border border-[#E2E8F0] rounded-lg text-sm text-center font-bold text-[#0F172A] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                              title="Higher rank = shown first in shop"
                            />
                            <button
                              onClick={() => handleSaveRank(id)}
                              disabled={rankSaving[id]}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                rankSuccess[id]
                                  ? "bg-green-500 text-white"
                                  : "bg-[#F97316] hover:bg-[#EA6C0A] text-white"
                              } disabled:opacity-50`}
                              title="Save rank"
                            >
                              {rankSaving[id] ? (
                                <Spinner className="w-3 h-3 text-white" />
                              ) : rankSuccess[id] ? (
                                "✓"
                              ) : (
                                "Set"
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-[#94A3B8] mt-0.5">Higher = first</p>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:text-blue-800 font-bold mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-[#64748B] font-medium">
                      {searchQuery ? `No products matching "${searchQuery}".` : "No products found. Add one to get started."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {loadError && (
          <div className="mx-6 my-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
            {loadError}
          </div>
        )}
      </div>

      {/* ── Search results count ─────────────────────────────────────────── */}
      {searchQuery && !loading && (
        <p className="text-xs text-[#64748B]">
          Showing <span className="font-bold text-[#0F172A]">{filteredProducts.length}</span> of{" "}
          <span className="font-bold text-[#0F172A]">{productsList.length}</span> products
        </p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingId ? "Edit Product" : "Add New Product"}
      >
        <div className="space-y-4">
          {saveSuccess && (
            <p className="text-green-600 text-sm font-bold bg-green-50 p-3 rounded-lg border border-green-200">
              Saved successfully!
            </p>
          )}
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                setFormData({ ...formData, title, slug: generateProductSlug(title) });
              }}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">
              Slug <span className="text-xs font-normal text-gray-400">(auto-generated, editable)</span>
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-") })}
              placeholder="e.g. blue-sapphire-ring"
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none font-mono text-sm"
            />
            {formData.slug && (
              <p className="text-xs text-gray-400 mt-1">URL: /shop/<span className="text-orange-500 font-semibold">{formData.slug}</span></p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value.toLowerCase().trim() })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none bg-white"
            >
              <option value="gemstones">Gemstones</option>
              <option value="healing">Healing Crystals</option>
              <option value="rudraksha">Rudraksha</option>
              <option value="pooja">Pooja Items</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Zodiac Alignment (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Leo, Virgo"
                value={formData.zodiac}
                onChange={(e) => setFormData({ ...formData, zodiac: e.target.value })}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#0F172A] mb-1">Price (₹)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Certification Details (Optional)</label>
            <input
              type="text"
              placeholder="e.g. IGI Certified"
              value={formData.certification}
              onChange={(e) => setFormData({ ...formData, certification: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none min-h-[80px]"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Upload Image (primary)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg outline-none text-sm bg-gray-50"
            />
            {formData.image && formData.image.startsWith("http") && (
              <p className="text-xs text-green-600 mt-1">Current image preserved. Upload a new one to replace.</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Additional Images (up to 4)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleMultipleImageUpload}
              disabled={extraImages.length >= 4}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg outline-none text-sm bg-gray-50 disabled:opacity-50"
            />
            <div className="flex gap-2 flex-wrap mt-2">
              {extraImages.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border border-[#E2E8F0]" />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#0F172A] mb-1">Product Options with Prices</label>
            <input
              type="text"
              placeholder="e.g. 5 carat:5000, 7 carat:7000, 10 carat:9500"
              value={optionsInput}
              onChange={(e) => setOptionsInput(e.target.value)}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">Format: <strong>Label:Price</strong> — separate multiple options with commas. e.g. 5 carat:5000, 7 carat:7000</p>
          </div>

          {/* ── Benefits Section ─────────────────────────────────────────── */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFAFA]">
            <div className="mb-3">
              <h3 className="text-sm font-bold text-[#0F172A]">Product Benefits</h3>
              <p className="text-xs text-[#64748B] mt-0.5">Add bullet points shown on the product page under &quot;Why this works&quot;. Leave empty to hide that section.</p>
            </div>
            {benefits.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {benefits.map((b, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0F172A] truncate">{b.label}</p>
                      <p className="text-xs text-[#64748B] truncate">{b.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBenefits((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-600 font-bold text-xs shrink-0 transition-colors mt-0.5"
                      aria-label="Remove benefit"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Benefit Title</label>
                <input
                  type="text"
                  placeholder="e.g. Attract Wealth & Prosperity"
                  value={newBenefitLabel}
                  onChange={(e) => setNewBenefitLabel(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#64748B] mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Draws financial growth and abundance daily"
                  value={newBenefitDesc}
                  onChange={(e) => setNewBenefitDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const label = newBenefitLabel.trim();
                  const desc = newBenefitDesc.trim();
                  if (!label) return;
                  setBenefits((prev) => [...prev, { label, desc }]);
                  setNewBenefitLabel("");
                  setNewBenefitDesc("");
                }}
                disabled={!newBenefitLabel.trim()}
                className="px-3 py-1.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                + Add Benefit
              </button>
            </div>
          </div>

          {/* ── Ring Material Section ────────────────────────────────────── */}
          <div className="border border-[#E2E8F0] rounded-xl p-4 bg-[#FAFAFA]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A]">Ring Material Options</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Allow customers to choose a ring setting with an added price</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs font-semibold text-[#64748B]">Enable</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={ringMaterialEnabled}
                    onChange={(e) => setRingMaterialEnabled(e.target.checked)}
                  />
                  <div className={`w-10 h-5 rounded-full transition-colors ${ringMaterialEnabled ? "bg-[#F97316]" : "bg-gray-300"}`} />
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ringMaterialEnabled ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </label>
            </div>

            {ringMaterialEnabled && (
              <div className="space-y-3">
                {ringMaterials.length > 0 && (
                  <div className="space-y-1.5">
                    {ringMaterials.map((mat, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-sm">
                        <span className="font-medium text-[#0F172A]">{mat.label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#F97316] font-bold">
                            {mat.extraPrice > 0 ? `+₹${mat.extraPrice.toLocaleString("en-IN")}` : "No extra charge"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRingMaterials((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:text-red-600 font-bold text-xs transition-colors"
                            aria-label="Remove ring material"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Material Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Only Gemstone, Silver Ring, Gold Ring"
                      value={newRingLabel}
                      onChange={(e) => setNewRingLabel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
                    />
                  </div>
                  <div className="w-32 shrink-0">
                    <label className="block text-xs font-semibold text-[#64748B] mb-1">Extra Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newRingPrice}
                      onChange={(e) => setNewRingPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const label = newRingLabel.trim();
                      if (!label) return;
                      if (ringMaterials.some((m) => m.label.toLowerCase() === label.toLowerCase())) return;
                      setRingMaterials((prev) => [...prev, { label, extraPrice: newRingPrice || 0 }]);
                      setNewRingLabel("");
                      setNewRingPrice(0);
                    }}
                    className="shrink-0 px-3 py-1.5 bg-[#F97316] hover:bg-[#EA6C0A] text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
                    disabled={!newRingLabel.trim()}
                  >
                    + Add
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Set extra price to <strong>0</strong> for &quot;Only Gemstone&quot; (no ring charge).
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex-1 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mr-auto">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0F172A] rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-lg font-bold transition-colors disabled:opacity-50 min-w-[120px] flex justify-center"
            >
              {saving ? <Spinner className="w-5 h-5 text-white" /> : "Save Changes"}
            </button>
          </div>
        </div>   {/* closes space-y-4 */}
      </Modal>
    </div>
  );
}
