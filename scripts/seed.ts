/**
 * Seeds the local Firebase emulators with demo data: an admin, an
 * instructor, two published courses (with lessons), and a draft course
 * pending review - enough to exercise the full marketplace loop:
 * browse -> checkout -> enrol -> learn -> instructor earnings -> admin approval.
 *
 * Run: npm run emulators (separate terminal), then npm run seed
 */
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";

const app = initializeApp({ projectId: "s8-lms-dev" });
const auth = getAuth(app);
const db = getFirestore(app);

async function upsertUser(email: string, password: string, displayName: string, role: string) {
  let user;
  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({ email, password, displayName });
  }
  await auth.setCustomUserClaims(user.uid, { role });
  await db.collection("users").doc(user.uid).set(
    {
      uid: user.uid,
      role,
      status: "active",
      profile: { displayName, email },
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return user.uid;
}

async function main() {
  console.log("Seeding S8 LMS emulator data...");

  const adminUid = await upsertUser("admin@s8analytics.com", "password123", "S8 Admin", "admin");
  const instructorUid = await upsertUser("angshuman@s8analytics.com", "password123", "Angshuman Biswas", "instructor");
  const studentUid = await upsertUser("student@example.com", "password123", "Demo Student", "student");

  await db.collection("instructors").doc(instructorUid).set({
    uid: instructorUid,
    publicProfile: {
      displayName: "Angshuman Biswas",
      title: "Head of Analytics Training",
      bio: "18+ years of experience helping professionals use Excel and AI to make faster, better decisions.",
      expertise: ["Excel", "AI", "Data Analytics"],
      languages: ["English"],
    },
    verificationStatus: "verified",
    ratingSummary: { average: 4.8, count: 132 },
    policyStatus: "ok",
    commissionRateOverride: 0.2,
    createdAt: new Date().toISOString(),
  });

  const now = new Date().toISOString();

  async function createCourse(opts: {
    title: string;
    subtitle: string;
    categoryId: string;
    level: "beginner" | "intermediate" | "advanced";
    listPrice: number;
    status: "published" | "in_review";
    outcomes: string[];
    lessons: string[];
  }) {
    const ref = db.collection("courses").doc();
    await ref.set({
      courseId: ref.id,
      instructorId: instructorUid,
      categoryId: opts.categoryId,
      title: opts.title,
      subtitle: opts.subtitle,
      level: opts.level,
      language: "English",
      status: opts.status,
      curriculum: [{ moduleId: "m1", title: "Module 1", lessonIds: opts.lessons.map((_, i) => `l${i + 1}`) }],
      priceConfig: { currency: "INR", listPrice: opts.listPrice, isFree: opts.listPrice === 0 },
      accessRules: { certificateEligible: true },
      reviewState: {},
      outcomes: opts.outcomes,
      prerequisites: [],
      createdAt: now,
      updatedAt: now,
    });

    for (let i = 0; i < opts.lessons.length; i++) {
      await ref.collection("lessons").doc(`l${i + 1}`).set({
        lessonId: `l${i + 1}`,
        courseId: ref.id,
        moduleId: "m1",
        type: "video",
        title: opts.lessons[i],
        contentRef: `courses/${ref.id}/public/lesson-${i + 1}.mp4`,
        previewFlag: i === 0,
        completionRule: "view",
        order: i,
      });
    }
    return ref.id;
  }

  await createCourse({
    title: "Excel + AI for Fast Reporting",
    subtitle: "Ask Excel the right questions with AI and automate your weekly reporting.",
    categoryId: "excel",
    level: "beginner",
    listPrice: 99900,
    status: "published",
    outcomes: [
      "Ask Excel the right questions with AI",
      "Build dashboards in under an hour",
      "Automate weekly reporting",
      "Clean messy data fast",
    ],
    lessons: ["Welcome & setup", "AI-assisted formulas", "Building your first dashboard", "Automating reports"],
  });

  await createCourse({
    title: "Practical Prompt Engineering",
    subtitle: "Prompt Lab exercises with rubric-based feedback.",
    categoryId: "ai",
    level: "intermediate",
    listPrice: 149900,
    status: "published",
    outcomes: ["Write reliable prompts", "Debug model outputs", "Build a prompt library"],
    lessons: ["Prompt fundamentals", "Prompt Lab exercise 1", "Prompt Lab exercise 2"],
  });

  await createCourse({
    title: "Power BI for Business Analysts (Draft)",
    subtitle: "Pending S8 review - shows up in the admin approval queue.",
    categoryId: "analytics",
    level: "intermediate",
    listPrice: 129900,
    status: "in_review",
    outcomes: ["Model data in Power BI", "Build exec dashboards"],
    lessons: ["Intro to Power BI", "Data modeling"],
  });

  console.log("Done. Demo logins (password123):");
  console.log(`  admin: admin@s8analytics.com (uid ${adminUid})`);
  console.log(`  instructor: angshuman@s8analytics.com (uid ${instructorUid})`);
  console.log(`  student: student@example.com (uid ${studentUid})`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
