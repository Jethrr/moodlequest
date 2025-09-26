"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteQuestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quest: { quest_id: number; title: string } | null;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

export function DeleteQuestDialog({ 
  isOpen, 
  onClose, 
  quest, 
  onConfirm, 
  loading 
}: DeleteQuestDialogProps) {
  
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Delete failed:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Quest</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the quest "{quest?.title}"? This action cannot be undone.
            <br />
            <br />
            <strong>This will permanently remove:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>The quest and all its data</li>
              <li>Student progress records for this quest</li>
              <li>Any associated rewards or achievements</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Quest
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
