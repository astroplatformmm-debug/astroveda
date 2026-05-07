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
  return CATEGORY_LABELS[key]
    ? `${cat || "gemstones"} · ${CATEGORY_LABELS[key]}`
    : cat || "—";
}

export default function ProductsManagement() {
  const router = useRouter();

  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  const [ringMaterialEnabled, setRingMaterialEnabled] = useState(false);

  const [ringMaterials, setRingMaterials] = useState<
    { label: string; extraPrice: number }[]
  >([]);

  const [newRingLabel, setNewRingLabel] = useState("");
  const [newRingPrice, setNewRingPrice] = useState<number>(0);

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

    setRingMaterialEnabled(false);
    setRingMaterials([]);

    setNewRingLabel("");
    setNewRingPrice(0);

    setError(null);
    setSaveSuccess(false);

    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingId(String(product._id || product.id || ""));

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
        .map(
          (o: { label: string; price: number }) =>
            `${o.label}:${o.price}`
        )
        .join(", ")
    );

    setRingMaterialEnabled(product.ringMaterialEnabled ?? false);

    setRingMaterials(
      (product.ringMaterials || []).map(
        (m: { label: string; extraPrice: number }) => ({
          label: m.label,
          extraPrice: m.extraPrice,
        })
      )
    );

    setNewRingLabel("");
    setNewRingPrice(0);

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
    const padding = base64Body.match(/=*$/)?.[0].length ?? 0;

    return Math.floor((base64Body.length * 3) / 4) - padding;
  };

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    return "Something went wrong.";
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", {
        credentials: "include",
      });

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
        const res = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

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

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      if (file.size > 1024 * 1024) {
        setError("Image too large. Please upload an image under 1MB.");
        return;
      }

      setError(null);

      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData({
          ...formData,
          image: reader.result as string,
        });
      };

      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const handleMultipleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

          if (colonIndex === -1) {
            return { label: s, price: 0 };
          }

          const label = s.slice(0, colonIndex).trim();

          const price = Number(
            s.slice(colonIndex + 1).trim()
          );

          return {
            label,
            price: Number.isFinite(price) ? price : 0,
          };
        })
        .filter((o) => o.label.length > 0);

      const primaryImage = formData.image;

      const payload: Record<string, unknown> = {
        ...formData,
        category:
          typeof formData.category === "string"
            ? formData.category.toLowerCase().trim()
            : "gemstones",

        images: extraImages.slice(0, 4),

        options,

        ringMaterialEnabled,
        ringMaterials,
      };

      if (
        typeof primaryImage === "string" &&
        primaryImage.startsWith("data:image") &&
        getBase64SizeBytes(primaryImage) > 1024 * 1024
      ) {
        throw new Error(
          "Image too large. Please upload an image under 1MB."
        );
      }

      for (const img of extraImages) {
        if (
          img.startsWith("data:image") &&
          getBase64SizeBytes(img) > 1024 * 1024
        ) {
          throw new Error(
            "An additional image is too large. Each must be under 1MB."
          );
        }
      }

      const requestPayload =
        editingId &&
        typeof primaryImage === "string" &&
        primaryImage &&
        !primaryImage.startsWith("data:image")
          ? (({ image: _image, ...rest }) => rest)(payload)
          : payload;

      const res = await fetch(
        editingId
          ? `/api/products/${editingId}`
          : "/api/products",
        {
          method: editingId ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(requestPayload),
        }
      );

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

        setRingMaterialEnabled(false);
        setRingMaterials([]);

        setNewRingLabel("");
        setNewRingPrice(0);

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
      {/* Your entire existing UI remains SAME */}

      {/* KEEP ALL YOUR TABLE + PRODUCT UI EXACTLY SAME */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => !saving && setIsModalOpen(false)}
        title={editingId ? "Edit Product" : "Add New Product"}
      >
        <div className="space-y-4">
          {/* KEEP ALL YOUR EXISTING FIELDS SAME */}

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => !saving && setIsModalOpen(false)}
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
              {saving ? (
                <Spinner className="w-5 h-5 text-white" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
