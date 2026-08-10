"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GEAR_CATEGORIES } from "@/lib/gear";

export type GearFormInitial = {
  id?: string;
  category: string;
  brand: string;
  model: string;
  name: string;
  size: string;
  year: string;
  purchaseDate: string;
  purchasePrice: string;
  sessionCount: string;
  notes: string;
  invoiceName?: string | null;
};

type Props = {
  mode: "create" | "edit";
  initial?: GearFormInitial;
};

const empty: GearFormInitial = {
  category: "aile",
  brand: "",
  model: "",
  name: "",
  size: "",
  year: "",
  purchaseDate: "",
  purchasePrice: "",
  sessionCount: "0",
  notes: "",
};

export default function GearForm({ mode, initial }: Props) {
  const router = useRouter();
  const base = initial ?? empty;
  const [category, setCategory] = useState(base.category);
  const [brand, setBrand] = useState(base.brand);
  const [model, setModel] = useState(base.model);
  const [name, setName] = useState(base.name);
  const [size, setSize] = useState(base.size);
  const [year, setYear] = useState(base.year);
  const [purchaseDate, setPurchaseDate] = useState(base.purchaseDate);
  const [purchasePrice, setPurchasePrice] = useState(base.purchasePrice);
  const [sessionCount, setSessionCount] = useState(base.sessionCount);
  const [notes, setNotes] = useState(base.notes);
  const [invoice, setInvoice] = useState<File | null>(null);
  const [removeInvoice, setRemoveInvoice] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const form = new FormData();
    form.set("category", category);
    form.set("brand", brand);
    form.set("model", model);
    form.set("name", name);
    form.set("size", size);
    form.set("year", year);
    form.set("purchaseDate", purchaseDate);
    form.set("purchasePrice", purchasePrice);
    form.set("sessionCount", sessionCount);
    form.set("notes", notes);
    if (invoice) form.set("invoice", invoice);
    if (removeInvoice) form.set("removeInvoice", "1");

    const url = mode === "create" ? "/api/gear" : `/api/gear/${base.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Erreur");
      return;
    }

    router.push(`/materiel/${data.gear.id}`);
    router.refresh();
  }

  const hasExistingInvoice = Boolean(base.invoiceName) && !removeInvoice;

  return (
    <form onSubmit={submit} className="auth-form trip-form gear-form">
      <h1>{mode === "create" ? "Ajouter du matériel" : "Modifier le matériel"}</h1>
      <p className="community-lead">
        Aile, barre, planche… date d’achat, facture et compteur de sorties.
      </p>

      <label>
        Catégorie
        <select value={category} onChange={(e) => setCategory(e.target.value)} required>
          {GEAR_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Marque
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Duotone, Core, Cabrinha…"
        />
      </label>

      <label>
        Modèle
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="Evo D/LAB"
          required
        />
      </label>

      <label>
        Surnom (optionnel)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="La 9m freeride"
        />
      </label>

      <div className="gear-form-row">
        <label>
          Taille
          <input
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="9m / 138 / M"
          />
        </label>
        <label>
          Année
          <input
            type="number"
            min={1980}
            max={2100}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
          />
        </label>
      </div>

      <div className="gear-form-row">
        <label>
          Date d’achat
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </label>
        <label>
          Prix (€)
          <input
            type="number"
            min={0}
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="1290"
          />
        </label>
      </div>

      <label>
        Nombre de sorties
        <input
          type="number"
          min={0}
          step={1}
          value={sessionCount}
          onChange={(e) => setSessionCount(e.target.value)}
        />
      </label>

      <label>
        Notes
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Réparations, serial, magasin…"
        />
      </label>

      <label>
        Facture (PDF ou image, max 4 Mo)
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onChange={(e) => {
            setInvoice(e.target.files?.[0] ?? null);
            if (e.target.files?.[0]) setRemoveInvoice(false);
          }}
        />
      </label>

      {hasExistingInvoice && (
        <p className="gear-invoice-hint">
          Facture actuelle : <strong>{base.invoiceName}</strong>
          {" · "}
          <button
            type="button"
            className="linkish"
            onClick={() => {
              setRemoveInvoice(true);
              setInvoice(null);
            }}
          >
            Retirer
          </button>
        </p>
      )}
      {removeInvoice && !invoice && (
        <p className="gear-invoice-hint">La facture sera retirée à l’enregistrement.</p>
      )}

      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Enregistrement…" : mode === "create" ? "Ajouter" : "Enregistrer"}
      </button>
    </form>
  );
}
