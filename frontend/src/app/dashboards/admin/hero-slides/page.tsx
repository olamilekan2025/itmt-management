"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Slide {
  _id: string;
  eyebrow: string;
  headline: string;
  subtext: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function HeroSlidesAdminPage() {
  const { data: session } = useSession();
  const accessToken = session?.accessToken as string | undefined;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create form
  const [eyebrow, setEyebrow] = useState("");
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [order, setOrder] = useState(0);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Create state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Slide actions
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Slide | null>(null);

  // Edit modal
  const [editTarget, setEditTarget] = useState<Slide | null>(null);
  const [editEyebrow, setEditEyebrow] = useState("");
  const [editHeadline, setEditHeadline] = useState("");
  const [editSubtext, setEditSubtext] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const sortedSlides = useMemo(
    () => [...slides].sort((a, b) => a.order - b.order),
    [slides]
  );

  const activeSlides = slides.filter((slide) => slide.isActive).length;

  async function loadSlides() {
    if (!accessToken || !API_URL) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/hero-slides/all`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to load hero slides.");
      }

      setSlides(Array.isArray(data.slides) ? data.slides : []);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load hero slides.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSlides();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      return;
    }

    const maxSize = 8 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error("Image must be smaller than 8MB.");
      return;
    }

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeSelectedImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview(null);
  }

  function resetForm() {
    setEyebrow("");
    setHeadline("");
    setSubtext("");
    setOrder(slides.length);
    removeSelectedImage();
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!accessToken || !API_URL) {
      toast.error("Authentication or API configuration is missing.");
      return;
    }

    if (!image) {
      toast.error("Please choose an image for the slide.");
      return;
    }

    if (!eyebrow.trim()) {
      toast.error("Please enter an eyebrow.");
      return;
    }

    if (!headline.trim()) {
      toast.error("Please enter a headline.");
      return;
    }

    if (!subtext.trim()) {
      toast.error("Please enter supporting text.");
      return;
    }

    setIsSubmitting(true);

    try {
      const body = new FormData();

      body.append("eyebrow", eyebrow.trim());
      body.append("headline", headline.trim());
      body.append("subtext", subtext.trim());
      body.append("order", String(order));
      body.append("image", image);

      const res = await fetch(`${API_URL}/hero-slides`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Unable to create slide.");
        return;
      }

      toast.success("Hero slide created successfully.");

      resetForm();

      await loadSlides();
    } catch (error) {
      console.error(error);
      toast.error("Unable to create slide.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditModal(slide: Slide) {
    setEditTarget(slide);
    setEditEyebrow(slide.eyebrow);
    setEditHeadline(slide.headline);
    setEditSubtext(slide.subtext);
    setEditOrder(slide.order);
  }

  function closeEditModal() {
    if (isEditing) return;

    setEditTarget(null);
    setEditEyebrow("");
    setEditHeadline("");
    setEditSubtext("");
    setEditOrder(0);
  }

  async function handleEdit(event: React.FormEvent) {
    event.preventDefault();

    if (!editTarget || !accessToken || !API_URL) {
      return;
    }

    if (!editEyebrow.trim()) {
      toast.error("Please enter an eyebrow.");
      return;
    }

    if (!editHeadline.trim()) {
      toast.error("Please enter a headline.");
      return;
    }

    if (!editSubtext.trim()) {
      toast.error("Please enter supporting text.");
      return;
    }

    setIsEditing(true);

    try {
      const res = await fetch(`${API_URL}/hero-slides/${editTarget._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          eyebrow: editEyebrow.trim(),
          headline: editHeadline.trim(),
          subtext: editSubtext.trim(),
          order: editOrder,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Unable to update slide.");
        return;
      }

      toast.success("Hero slide updated successfully.");

      closeEditModal();

      await loadSlides();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update slide.");
    } finally {
      setIsEditing(false);
    }
  }

  async function toggleActive(slide: Slide) {
    if (!accessToken || !API_URL) return;

    setUpdatingId(slide._id);

    try {
      const res = await fetch(`${API_URL}/hero-slides/${slide._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          isActive: !slide.isActive,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Unable to update slide.");
        return;
      }

      toast.success(
        slide.isActive
          ? "Slide hidden from homepage."
          : "Slide is now visible."
      );

      await loadSlides();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update slide.");
    } finally {
      setUpdatingId(null);
    }
  }

  function requestDelete(slide: Slide) {
    setDeleteTarget(slide);
  }

  function closeDeleteModal() {
    if (deletingId) return;
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget || !accessToken || !API_URL) return;

    const id = deleteTarget._id;

    setDeletingId(id);

    try {
      const res = await fetch(`${API_URL}/hero-slides/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Unable to delete slide.");
        return;
      }

      toast.success("Hero slide deleted.");

      setDeleteTarget(null);

      await loadSlides();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete slide.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-0 lg:py-8">

        {/* ========================================================= */}
        {/* PAGE HEADER */}
        {/* ========================================================= */}

        <div className="relative overflow-hidden rounded-3xl bg-brand-navy px-6 py-7 shadow-xl sm:px-8 lg:px-10 lg:py-9">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />
                Homepage content
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Hero Section
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                Create and manage the visual stories displayed across the
                ITMT public homepage.
              </p>
            </div>

            {/* Stats */}
            <div className="grid w-full grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md lg:w-auto">
              <div className="border-r border-white/10 px-6 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                  Total slides
                </p>

                <p className="mt-1 text-2xl font-semibold text-white">
                  {slides.length}
                </p>
              </div>

              <div className="px-6 py-4">
                <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                  Published
                </p>

                <p className="mt-1 flex items-center gap-1.5 text-2xl font-semibold text-brand-gold">
                  {activeSlides}
                  <CheckCircle2 className="h-4 w-4" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CREATE PANEL */}
        {/* ========================================================= */}

        <form
          onSubmit={handleCreate}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
        >
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-navy text-white shadow-sm">
                <Plus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-brand-navy">
                  Create new slide
                </h2>

                <p className="text-xs text-slate-500">
                  Add a new hero banner to your homepage rotation.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_360px]">

            {/* Form fields */}
            <div className="space-y-6">

              {/* Eyebrow + order */}
              <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                <div>
                  <label
                    htmlFor="eyebrow"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Eyebrow
                  </label>

                  <input
                    id="eyebrow"
                    required
                    maxLength={80}
                    value={eyebrow}
                    onChange={(e) => setEyebrow(e.target.value)}
                    placeholder="Academic Excellence"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                  />

                  <div className="mt-1.5 text-right text-[11px] text-slate-400">
                    {eyebrow.length}/80
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="order"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Display order
                  </label>

                  <input
                    id="order"
                    type="number"
                    min={0}
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-sm text-slate-900 outline-none transition-all focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label
                  htmlFor="headline"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Headline
                </label>

                <input
                  id="headline"
                  required
                  maxLength={160}
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Shape the future of transport and management"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 text-base font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                />

                <div className="mt-1.5 text-right text-[11px] text-slate-400">
                  {headline.length}/160
                </div>
              </div>

              {/* Subtext */}
              <div>
                <label
                  htmlFor="subtext"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Supporting text
                </label>

                <textarea
                  id="subtext"
                  required
                  rows={5}
                  maxLength={320}
                  value={subtext}
                  onChange={(e) => setSubtext(e.target.value)}
                  placeholder="Introduce students to a world-class learning experience built around innovation, leadership and professional excellence."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                />

                <div className="mt-1.5 text-right text-[11px] text-slate-400">
                  {subtext.length}/320
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Recommended image: wide landscape, high resolution.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-navy px-6 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating slide...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create slide
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Image uploader */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Hero image
              </label>

              {imagePreview ? (
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <div className="aspect-[16/9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt="Selected hero preview"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">
                        {image?.name}
                      </p>

                      <p className="text-[11px] text-white/60">
                        {image
                          ? `${(image.size / 1024 / 1024).toFixed(2)} MB`
                          : ""}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeSelectedImage}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="hero-image"
                  className="group flex aspect-[16/9] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-6 text-center transition-all hover:border-brand-navy/30 hover:bg-brand-navy/[0.02]"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-navy shadow-sm ring-1 ring-slate-100 transition-transform group-hover:-translate-y-1">
                    <ImagePlus className="h-6 w-6" />
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    Upload hero image
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    PNG, JPG or WebP · Max 8MB
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <UploadCloud className="h-3.5 w-3.5" />
                    Choose image
                  </div>
                </label>
              )}

              <input
                id="hero-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                Use a high-quality landscape image that works well with
                dark text overlays.
              </p>
            </div>
          </div>
        </form>

        {/* ========================================================= */}
        {/* EXISTING SLIDES */}
        {/* ========================================================= */}

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-brand-navy">
                Homepage slides
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Control which banners appear and their rotation order.
              </p>
            </div>

            {slides.length > 0 && (
              <span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200 sm:block">
                {slides.length}{" "}
                {slides.length === 1 ? "slide" : "slides"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-[16/8] animate-pulse bg-slate-100" />

                  <div className="space-y-3 p-5">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                    <div className="h-9 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedSlides.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <ImagePlus className="h-6 w-6" />
              </div>

              <h3 className="mt-5 font-semibold text-brand-navy">
                No hero slides yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Create your first homepage hero slide using the form
                above. It will appear here once uploaded.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {sortedSlides.map((slide) => (
                <article
                  key={slide._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/8] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slide.imageUrl}
                      alt=""
                      className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
                        slide.isActive ? "" : "grayscale"
                      }`}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                    {/* Order */}
                    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur-md">
                      <GripVertical className="h-3.5 w-3.5" />
                      {slide.order}
                    </div>

                    {/* Status */}
                    <div className="absolute right-4 top-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold backdrop-blur-md ${
                          slide.isActive
                            ? "bg-emerald-500/90 text-white"
                            : "bg-black/45 text-white"
                        }`}
                      >
                        {slide.isActive ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}

                        {slide.isActive ? "Published" : "Hidden"}
                      </span>
                    </div>

                    {/* Headline */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-gold">
                        {slide.eyebrow}
                      </p>

                      <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-white">
                        {slide.headline}
                      </h3>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="p-4">
                    <p className="mb-4 line-clamp-2 text-sm leading-5 text-slate-500">
                      {slide.subtext}
                    </p>

                    <div className="flex items-center gap-2">
                      {/* Publish / Hide */}
                      <button
                        type="button"
                        onClick={() => toggleActive(slide)}
                        disabled={updatingId === slide._id}
                        className={`inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
                          slide.isActive
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {updatingId === slide._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : slide.isActive ? (
                          <>
                            <EyeOff className="h-4 w-4" />
                            Hide slide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Publish slide
                          </>
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() => openEditModal(slide)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-brand-navy transition-all hover:bg-brand-navy/5"
                        aria-label={`Edit ${slide.headline}`}
                        title="Edit slide"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => requestDelete(slide)}
                        disabled={deletingId === slide._id}
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition-all hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                        aria-label={`Delete ${slide.headline}`}
                        title="Delete slide"
                      >
                        {deletingId === slide._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* =========================================================== */}
      {/* EDIT SLIDE MODAL */}
      {/* =========================================================== */}

      {editTarget && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md"
    role="dialog"
    aria-modal="true"
    aria-labelledby="edit-slide-title"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        closeEditModal();
      }
    }}
  >
    <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.3)]">

      {/* HEADER */}
      <div className="relative shrink-0 overflow-hidden bg-brand-navy px-5 py-4 text-white sm:px-6">
        <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-brand-gold/10 blur-2xl" />
        <div className="absolute -bottom-20 left-1/3 h-32 w-32 rounded-full bg-brand-blue/10 blur-2xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10">
              <Pencil className="h-4 w-4 text-brand-gold" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-gold" />

                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold">
                  Homepage
                </span>
              </div>

              <h2
                id="edit-slide-title"
                className="mt-0.5 truncate text-base font-semibold sm:text-lg"
              >
                Edit hero slide
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeEditModal}
            disabled={isEditing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-white/80 transition-all hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close edit modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SCROLLABLE BODY */}
      <form
        onSubmit={handleEdit}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-4 p-5 sm:p-6">

            {/* CURRENT IMAGE */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <div className="aspect-[16/5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={editTarget.imageUrl}
                  alt={editTarget.headline}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent px-4 pb-3 pt-8">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                    Current image
                  </span>

                  <span className="rounded-lg border border-white/20 bg-black/25 px-2.5 py-1 text-[10px] font-medium text-white/80 backdrop-blur-md">
                    16:5
                  </span>
                </div>
              </div>
            </div>

            {/* EYEBROW + ORDER */}
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <div>
                <label
                  htmlFor="edit-eyebrow"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Eyebrow
                </label>

                <input
                  id="edit-eyebrow"
                  required
                  maxLength={80}
                  value={editEyebrow}
                  onChange={(e) => setEditEyebrow(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                />

                <div className="mt-1 text-right text-[10px] text-slate-400">
                  {editEyebrow.length}/80
                </div>
              </div>

              <div>
                <label
                  htmlFor="edit-order"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Order
                </label>

                <input
                  id="edit-order"
                  type="number"
                  min={0}
                  value={editOrder}
                  onChange={(e) => setEditOrder(Number(e.target.value))}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none transition-all focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
                />

                <div className="mt-1 text-[10px] text-slate-400">
                  Display position
                </div>
              </div>
            </div>

            {/* HEADLINE */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="edit-headline"
                  className="text-xs font-semibold text-slate-700"
                >
                  Headline
                </label>

                <span className="text-[10px] text-slate-400">
                  {editHeadline.length}/160
                </span>
              </div>

              <input
                id="edit-headline"
                required
                maxLength={160}
                value={editHeadline}
                onChange={(e) => setEditHeadline(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              />
            </div>

            {/* SUPPORTING TEXT */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="edit-subtext"
                  className="text-xs font-semibold text-slate-700"
                >
                  Supporting text
                </label>

                <span className="text-[10px] text-slate-400">
                  {editSubtext.length}/320
                </span>
              </div>

              <textarea
                id="edit-subtext"
                required
                rows={3}
                maxLength={320}
                value={editSubtext}
                onChange={(e) => setEditSubtext(e.target.value)}
                className="min-h-[76px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm leading-5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-brand-navy focus:bg-white focus:ring-4 focus:ring-brand-navy/5"
              />
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
          <div className="flex items-center justify-between gap-3">

            <p className="hidden text-[10px] text-slate-400 sm:block">
              Changes will be applied to this homepage slide.
            </p>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                disabled={isEditing}
                className="h-10 rounded-xl px-4 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-200/70 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isEditing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-navy px-5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-brand-dark hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Save changes
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </form>
    </div>
  </div>
)}
      

      {/* =========================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* =========================================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-slide-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="p-6 sm:p-7">
              {/* Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <Trash2 className="h-5 w-5" />
              </div>

              <h2
                id="delete-slide-title"
                className="mt-5 text-lg font-semibold text-brand-navy"
              >
                Delete this slide?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to permanently delete this homepage hero slide.
                This action cannot be undone.
              </p>

              {/* Slide preview */}
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={deleteTarget.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {deleteTarget.headline}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Display order {deleteTarget.order}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
                className="h-11 rounded-xl px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete slide
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

