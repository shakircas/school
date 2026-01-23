import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react"; // Import the spinner icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function WithdrawalDialog({ isOpen, onClose, student, onConfirm }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("absenteeism");
  const [notes, setNotes] = useState("Consecutive absences (6+ days)");
  const [isLoading, setIsLoading] = useState(false); // New Loading State

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("Consecutive absences (6+ days)");
      setIsLoading(false); // Reset loading when modal opens
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    setIsLoading(true); // Start loading
    try {
      await onConfirm({
        withdrawalDate: date,
        reason: reason,
        notes: notes,
      });
    } finally {
      // We don't set loading to false here because the page
      // usually reloads or the modal closes on success.
      // But if there's an error, we reset it:
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-rose-600">
            Process Withdrawal
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-3 rounded-md border border-slate-100">
            <p className="text-sm text-slate-600">
              Withdrawing: <strong>{student?.name}</strong>
            </p>
            <p className="text-xs text-slate-500">
              Roll: {student?.rollNumber}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Withdrawal Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Select
              value={reason}
              onValueChange={setReason}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">
                  Transfer to another school
                </SelectItem>
                <SelectItem value="absenteeism">
                  Prolonged Absenteeism
                </SelectItem>
                <SelectItem value="relocation">Family relocation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Withdrawal"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
