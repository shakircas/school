"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  User,
  GraduationCap,
  FileText,
  Upload,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ScholarshipModal({ trigger }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep(4); // Success Step
      toast.success("Application submitted successfully!");
    }, 2000);
  };

  return (
    <Dialog onOpenChange={() => setStep(1)}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl rounded-3xl">
        {/* Progress Header */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <DollarSign size={20} />
              </div>
              <DialogTitle className="text-xl font-bold">
                Financial Aid Application
              </DialogTitle>
            </div>

            {step < 4 && (
              <div className="flex items-center gap-4 mt-6">
                <ProgressStep num={1} active={step >= 1} label="Student" />
                <div
                  className={`h-[2px] flex-1 ${step >= 2 ? "bg-emerald-500" : "bg-slate-700"}`}
                />
                <ProgressStep num={2} active={step >= 2} label="Academic" />
                <div
                  className={`h-[2px] flex-1 ${step >= 3 ? "bg-emerald-500" : "bg-slate-700"}`}
                />
                <ProgressStep num={3} active={step >= 3} label="Documents" />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Full Name</Label>
                  <Input placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label>Father/Guardian Name</Label>
                  <Input placeholder="Robert Doe" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input type="tel" placeholder="+92 300 0000000" required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Current Grade</Label>
                  <Input placeholder="e.g. Grade 9" required />
                </div>
                <div className="space-y-2">
                  <Label>Previous Grade %</Label>
                  <Input type="number" placeholder="85" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason for Scholarship</Label>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Tell us why you are applying..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer group">
                <Upload
                  className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-2"
                  size={32}
                />
                <p className="text-sm font-semibold text-slate-700">
                  Upload Monthly Income Slip
                </p>
                <p className="text-xs text-slate-500">PDF or JPG (Max 2MB)</p>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer group">
                <Upload
                  className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-2"
                  size={32}
                />
                <p className="text-sm font-semibold text-slate-700">
                  Previous Result Card
                </p>
                <p className="text-xs text-slate-500">Official Board Result</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-10 text-center animate-in zoom-in-95">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Application Received
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                Thank you for applying. Our committee will review your documents
                and contact you within 7-10 working days.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-8 bg-slate-900 rounded-xl"
              >
                Close Window
              </Button>
            </div>
          )}

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="flex justify-between mt-10">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft size={16} /> Previous
              </Button>

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2 rounded-xl"
                >
                  Continue <ChevronRight size={16} />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-slate-900 hover:bg-black gap-2 rounded-xl px-8"
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}{" "}
                  <Send size={16} />
                </Button>
              )}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProgressStep({ num, active, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${active ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-600 text-slate-400"}`}
      >
        {num}
      </div>
      <span
        className={`text-xs font-bold uppercase tracking-wider ${active ? "text-white" : "text-slate-500"}`}
      >
        {label}
      </span>
    </div>
  );
}
