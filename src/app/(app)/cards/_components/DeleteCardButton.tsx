"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { deleteCard } from "../actions";

// Client leaf owning the delete flow (confirm → action → toast → wallet).
// Hard delete, no trash view (Decision 1).
export function DeleteCardButton({ id, storeName }: { id: string; storeName: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onDelete = async () => {
    const result = await deleteCard({ id });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    toast.success("Card deleted"); // survives navigation: Toaster is in the root layout
    router.push("/cards");
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <ConfirmDialog
        trigger={
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Delete card"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 />
          </Button>
        }
        title="Delete this card?"
        description={`${storeName} will be removed from your wallet.`}
        confirmLabel="Delete card"
        onConfirm={onDelete}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
