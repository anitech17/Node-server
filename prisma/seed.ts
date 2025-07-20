import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);
  const educatorPassword = await bcrypt.hash("Educator@123", 10);

  // Create Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      password_hash: adminPassword,
      role: "admin",
      dob: new Date("1990-01-01"),
      phone: "9999999999",
    }
  });

  // Create Student user
  const studentUser = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Test Student",
      password_hash: studentPassword,
      role: "student",
      dob: new Date("2005-06-15"),
      phone: "8888888888",
    }
  });

  // Create Educator user
  const educatorUser = await prisma.user.upsert({
    where: { email: "educator@example.com" },
    update: {},
    create: {
      email: "educator@example.com",
      name: "Test Educator",
      password_hash: educatorPassword,
      role: "educator",
      dob: new Date("1985-03-25"),
      phone: "7777777777",
    }
  });

  // Create Student profile
  const student = await prisma.student.upsert({
    where: { user_id: studentUser.id },
    update: {},
    create: {
      user_id: studentUser.id,
      parent_whatsapp: "919876543210"
    }
  });

  // Create Educator profile
  const educator = await prisma.educator.upsert({
    where: { user_id: educatorUser.id },
    update: {},
    create: {
      user_id: educatorUser.id,
      bio: "Expert in Math and Physics with 10+ years of experience.",
      expertise: "Math, Physics"
    }
  });

// Create a course
const course = await prisma.course.upsert({
  where: { title: "Class 10 - Science" },
  update: {},
  create: {
    title: "Class 10 - Science",
    subject: "Science",
    description: "Complete syllabus for CBSE Class 10 Science",
    class: "10" // 👈 Added this line
  }
});

  // Create syllabus sections
  await prisma.syllabusSection.createMany({
    data: [
      {
        course_id: course.id,
        title: "Chemical Reactions",
        description: "Basics of chemical reactions and equations.",
        order: 1
      },
      {
        course_id: course.id,
        title: "Acids, Bases and Salts",
        description: "Introduction to acids and bases.",
        order: 2
      }
    ]
  });

  // Create enrollment
const enrollment = await prisma.enrollment.create({
  data: {
    student_id: student.user_id,
    course_id: course.id,
    educator_id: educator.user_id, // 👈 Required now
    progress: "Chapter 1 Completed",
    percent_complete: 20
  }
});


  // Create class schedule
  const classSchedule = await prisma.classSchedule.create({
    data: {
      student_id: student.user_id,
      educator_id: educator.user_id,
      scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days later
      join_url: "https://meet.google.com/class-abc",
      status: "scheduled",
      discussion_topics: "Chapter 1: Chemical Reactions"
    }
  });

  // Create a test
  const test = await prisma.test.create({
    data: {
      course_id: course.id,
      educator_id: educator.user_id,
      student_id: student.user_id,
      scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days later
      join_url: "https://meet.google.com/test-xyz",
      test_format: "online"
    }
  });

  // Create test result
  await prisma.testResult.create({
    data: {
      test_id: test.id,
      student_id: student.user_id,
      marks_scored: 45,
      total_marks: 50,
      feedback: "Great performance! Just revise equations once more."
    }
  });

  console.log("✅ Seeded users, student, educator, course, syllabus, enrollment, class, test, and result.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
