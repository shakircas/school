// import mongoose from "mongoose";
// import Subject from "@/models/Subject";
// import Class from "@/models/Class";
// import connectDB from "@/lib/db";

// async function migrate() {
//   await connectDB();

//   const classes = await Class.find({});

//   for (const cls of classes) {
//     let changed = false;

//     for (const day of cls.schedule || []) {
//       for (const p of day.periods || []) {
//         // Already migrated → skip
//         if (p.subjectId && p.subjectName) continue;

//         if (p.subject) {
//           const subject = await Subject.findOne({
//             name: p.subject,
//           });

//           if (subject) {
//             p.subjectId = subject._id;
//             p.subjectName = subject.name;
//           } else {
//             // fallback
//             p.subjectName = p.subject;
//           }

//           changed = true;
//         }
//       }
//     }

//     if (changed) {
//       await cls.save();
//       console.log(`✔ Migrated class ${cls.name}`);
//     }
//   }

//   console.log("🎉 Migration completed");
//   process.exit(0);
// }

// migrate();

import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// ---- FIX __dirname for ES modules ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- IMPORTANT: use relative imports ----
import Subject from "../models/Subject.js";
import Class from "../models/Class.js";
import connectDB from "../lib/db.js";

async function migrate() {
  await connectDB();

  const classes = await Class.find({});

  for (const cls of classes) {
    let changed = false;

    for (const day of cls.schedule || []) {
      for (const p of day.periods || []) {
        // Already migrated
        if (p.subjectId && p.subjectName) continue;

        if (p.subject) {
          const subject = await Subject.findOne({
            name: p.subject.trim(),
          });

          if (subject) {
            p.subjectId = subject._id;
            p.subjectName = subject.name;
          } else {
            // fallback if subject not found
            p.subjectName = p.subject;
          }

          changed = true;
        }
      }
    }

    if (changed) {
      await cls.save();
      console.log(`✔ Migrated class: ${cls.name}`);
    }
  }

  console.log("🎉 Migration completed successfully");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
