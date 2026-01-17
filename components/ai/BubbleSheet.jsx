"use client";

import React from "react";

export function BubbleSheet({ count = 20 }) {
  // Helper for 0-9 Digit Columns (Standard OMR Size)
  const RenderDigitColumn = () => (
    <div className="flex flex-col gap-[3px]">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="w-[18px] h-[18px] border-[1.2px] border-black rounded-full flex items-center justify-center text-[9px] font-bold"
        >
          {i}
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="bg-white p-6 rounded-none w-[210mm] mx-auto text-black print:p-0 print:m-0 font-sans"
      style={{ minHeight: "297mm" }}
    >
      {/* 1. BOARD HEADER */}
      <div className="text-center border-b-2 border-black pb-2 mb-4">
        <h1 className="text-xl font-black uppercase tracking-tight">
          Khyber Pakhtunkhwa Boards of Intermediate & Secondary Education
        </h1>
        <p className="text-[12px] font-bold uppercase tracking-widest italic">
          Peshawar / Mardan / Kohat / Abbottabad / Swat
        </p>
        <h2 className="text-md font-black mt-1 bg-black text-white inline-block px-4 py-0.5 rounded">
          OMR ANSWER SHEET (OBJECTIVE)
        </h2>
      </div>

      {/* 2. TOP SECTION: DATA & GRIDS */}
      <div className="flex gap-4 mb-6 ">
        {/* LEFT: PERSONAL DATA */}
        <div className=" border-2 border-black p-3 space-y-4">
          <div className="space-y-3">
            {[
              "Name of Candidate (Block Letters)",
              "Father's Name",
              "Subject",
              "Examination / Center Name",
            ].map((field) => (
              <div key={field} className="flex flex-col gap-6 border-b border-gray-400">
                <p className="text-[9px] font-black uppercase text-gray-600 leading-none">
                  {field}
                </p>
                <div className="h-5"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="border-t border-black text-center pt-1">
              <p className="text-[8px] font-black uppercase">
                Candidate's Signature
              </p>
            </div>
            <div className="border-t border-black text-center pt-1">
              <p className="text-[8px] font-black uppercase">
                Invigilator's Signature
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE: PAPER CODE (VERSION) */}
        <div className="w-24 border-2 border-black p-2 bg-gray-50 flex flex-col items-center">
          <p className="text-[9px] font-black uppercase mb-2 text-center">
            Paper Code
          </p>
          <div className="grid grid-cols-1 gap-2">
            {["A", "B", "C", "D"].map((v) => (
              <div key={v} className="flex flex-col items-center gap-0.5">
                <div className="w-7 h-7 border-2 border-black rounded-full flex items-center justify-center text-xs font-black">
                  {v}
                </div>
                <span className="text-[7px] font-bold uppercase">Code {v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: ROLL NUMBER GRID */}
        <div className="flex-1 border-2 border-black p-2 bg-gray-50">
          <p className="text-[9px] font-black text-center mb-1 uppercase">
            Roll Number
          </p>
          <div className="flex gap-1.5 w-full">
            {[...Array(6)].map((_, col) => (
              <div key={col} className="flex flex-col gap-1.5">
                <div className="w-[50px] h-[18px] border-2 border-black bg-white flex items-center justify-center text-[10px] font-bold italic text-gray-300">
                  #
                </div>
                <RenderDigitColumn />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. INSTRUCTION BOX */}
      <div className="border-2 border-black p-2 mb-6 text-[10px] leading-tight">
        <span className="font-black underline">INSTRUCTIONS:</span> Use{" "}
        <span className="font-black">Black/Blue Ball Point</span> only. Fill the
        circle completely like this:{" "}
        <span className="inline-block w-3 h-3 bg-black rounded-full align-middle mx-1"></span>
        . Improperly filled, half-filled, or crossed bubbles will result in{" "}
        <span className="font-black text-red-600 uppercase">Zero Marks</span>{" "}
        for that question. No cutting or overwriting is allowed.
      </div>

      {/* 4. RESPONSE AREA (3 Columns) */}
      <div className="border-2 border-black">
        <div className="grid grid-cols-3 divide-x-2 divide-black">
          {[0, 15, 30].map((start) => (
            <div key={start} className="p-4 space-y-3">
              {Array.from({ length: 15 }).map((_, idx) => {
                const qNum = start + idx + 1;
                // Only show up to count limit if needed
                if (qNum > 45) return null;
                return (
                  <div key={qNum} className="flex items-center justify-between">
                    <span className="text-xs font-black text-black w-5">
                      {qNum}.
                    </span>
                    <div className="flex gap-3">
                      {["A", "B", "C", "D"].map((opt) => (
                        <div
                          key={opt}
                          className="w-6 h-6 border-[1.5px] border-black rounded-full flex items-center justify-center text-[10px] font-bold"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 5. FOR OFFICE USE ONLY SECTION */}
      <div className="mt-6 border-2 border-black p-3 bg-gray-100/50 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black uppercase italic">
            For Office Use Only
          </p>
          <div className="flex gap-4 mt-2">
            <div className="w-24 h-8 border border-black bg-white flex items-center justify-center text-[9px] font-bold">
              Examiner Sign
            </div>
            <div className="w-24 h-8 border border-black bg-white flex items-center justify-center text-[9px] font-bold">
              Checker Sign
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-block border-2 border-black p-2 bg-white">
            <p className="text-[8px] font-black uppercase">
              Total Marks Obtained
            </p>
            <div className="h-6 text-center text-lg font-black italic">
              / {count}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
