"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/ui/Modal";
import Spinner from "@/components/ui/Spinner";
import type { Product } from "@/lib/types";
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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    image: "",
    zodiac: "",
    certification: "",
    category: "gemstones",
  });
  const [extraImages, setExtraImages] = useState<string[]>([]);
  const [optionsInput, setOptionsInput] = useState("");

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      price: 0,
      image: "",
      zodiac: "",
      certification: "",
      category: "gemstones",
    });
    setExtraImages([]);
    setOptionsInput("");
    setError(null);
    setSaveSuccess(false);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(product._id || product.id || null);
    setFormData({
      title: product.title,
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
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(await extractErrorMessage(res));
      }
      const data = (await res.json()) as Product[];
      setProductsList(data);
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
          if (res.status === 401) {
            throw new Error("Session expired. Please log in again.");
          }
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
        if (res.status === 401) {
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(await extractErrorMessage(res));
      }

      setSaveSuccess(true);
      await fetchProducts();
      setTimeout(() => {
        setFormData({
          title: "",
          description: "",
          price: 0,
          image: "",
          zodiac: "",
          certification: "",
          category: "gemstones",
        });
        setExtraImages([]);
        setOptionsInput("");
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
                  <th className="px-6 py-4 font-bold text-[#64748B]">Category</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Zodiac</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Certification</th>
                  <th className="px-6 py-4 font-bold text-[#64748B]">Price</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {productsList.length > 0 ? (
                  productsList.map((product) => (
                    <tr key={product._id || product.id} className="hover:bg-[#F8FAFC]">
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
                      <td className="px-6 py-4 text-[#64748B] font-mono text-xs">{categoryLabel(product.category)}</td>
                      <td className="px-6 py-4 text-[#64748B]">{product.zodiac || "-"}</td>
                      <td className="px-6 py-4 text-[#64748B] truncate max-w-[150px]">{product.certification || "-"}</td>
                      <td className="px-6 py-4 font-bold text-[#F97316]">₹{product.price}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-800 font-bold mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product._id || product.id || "")}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[#64748B] font-medium">
                      No products found. Add one to get started.
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:ring-[#F97316] focus:border-[#F97316] outline-none"
            />
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
          <div className="pt-4 flex justify-end gap-3">
            {error && (
              <div className="flex-1 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm mr-auto">
                {error}
              </div>
            )}
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
        </div>
      </Modal>
    </div>
  );
}
