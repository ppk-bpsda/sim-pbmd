"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileActionState } from "./actions";

const initialState: ProfileActionState = { error: null, success: false };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Menyimpan..." : "Simpan Perubahan"}
    </button>
  );
}

export function ProfileForm({
  fullName,
  phone,
  email,
}: {
  fullName: string;
  phone: string;
  email: string;
}) {
  const [state, formAction] = useFormState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full cursor-not-allowed rounded-md border border-surface-border bg-surface-muted px-3 py-2 text-sm text-slate-500"
        />
        <p className="mt-1 text-xs text-slate-400">
          Email tidak dapat diubah sendiri. Hubungi administrator bila perlu diganti.
        </p>
      </div>

      <div>
        <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-slate-700">
          Nama Lengkap
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName}
          className="w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
          Nomor Telepon
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone}
          placeholder="08xxxxxxxxxx"
          className="w-full rounded-md border border-surface-border px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <div className="rounded-md border border-status-danger/30 bg-status-dangerBg px-3 py-2 text-sm text-status-danger">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-status-success/30 bg-status-successBg px-3 py-2 text-sm text-status-success">
          Profil berhasil diperbarui.
        </div>
      )}

      <SaveButton />
    </form>
  );
}
