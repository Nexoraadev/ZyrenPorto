"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
  name: string;
}

export function DeleteSkillButton({ id, name }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const supabase = createAdminClient();
    await supabase.from("skills").delete().eq("id", id);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-dark-500 font-mono">Yakin?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs text-blood-400 hover:text-blood-300 font-mono transition-colors px-2 py-1 rounded hover:bg-blood-950"
        >
          {loading ? "..." : "Ya"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-dark-500 hover:text-dark-300 font-mono transition-colors px-2 py-1 rounded hover:bg-dark-900"
        >
          Tidak
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-dark-600 hover:text-blood-400 transition-colors p-1.5 rounded hover:bg-blood-950/50"
      aria-label={`Delete ${name}`}
    >
      <Trash2 size={13} />
    </button>
  );
}
