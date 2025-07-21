import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const now = new Date();
  const classDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
  const testDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // +5 days

  const hashPassword = (pw: string) => bcrypt.hash(pw, 10);

  const admins = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin1@example.com" },
      update: {},
      create: {
        email: "admin1@example.com",
        name: "Super Admin One",
        password_hash: await hashPassword("Admin@123"),
        role: "admin",
        dob: new Date("1980-01-01"),
        phone: "9999990001"
      }
    }),
    prisma.user.upsert({
      where: { email: "admin2@example.com" },
      update: {},
      create: {
        email: "admin2@example.com",
        name: "Super Admin Two",
        password_hash: await hashPassword("Admin@123"),
        role: "admin",
        dob: new Date("1982-02-02"),
        phone: "9999990002"
      }
    }),
    prisma.user.upsert({
      where: { email: "admin3@example.com" },
      update: {},
      create: {
        email: "admin3@example.com",
        name: "Super Admin Three",
        password_hash: await hashPassword("Admin@123"),
        role: "admin",
        dob: new Date("1985-03-03"),
        phone: "9999990003"
      }
    })
  ]);

  const studentUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "student1@example.com",
        name: "Student One",
        password_hash: await hashPassword("Student@123"),
        role: "student",
        dob: new Date("2005-06-15"),
        phone: "8888880001"
      }
    }),
    prisma.user.create({
      data: {
        email: "student2@example.com",
        name: "Student Two",
        password_hash: await hashPassword("Student@123"),
        role: "student",
        dob: new Date("2006-07-16"),
        phone: "8888880002"
      }
    }),
    prisma.user.create({
      data: {
        email: "student3@example.com",
        name: "Student Three",
        password_hash: await hashPassword("Student@123"),
        role: "student",
        dob: new Date("2007-08-17"),
        phone: "8888880003"
      }
    })
  ]);

  const students = await Promise.all(studentUsers.map((u, i) =>
    prisma.student.create({
      data: {
        user_id: u.id,
        parent_whatsapp: `91987654320${i + 1}`
      }
    })
  ));

  const educatorUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "educator1@example.com",
        name: "Educator One",
        password_hash: await hashPassword("Educator@123"),
        role: "educator",
        dob: new Date("1985-03-25"),
        phone: "7777770001"
      }
    }),
    prisma.user.create({
      data: {
        email: "educator2@example.com",
        name: "Educator Two",
        password_hash: await hashPassword("Educator@123"),
        role: "educator",
        dob: new Date("1986-04-26"),
        phone: "7777770002"
      }
    }),
    prisma.user.create({
      data: {
        email: "educator3@example.com",
        name: "Educator Three",
        password_hash: await hashPassword("Educator@123"),
        role: "educator",
        dob: new Date("1987-05-27"),
        phone: "7777770003"
      }
    })
  ]);

  const educators = await Promise.all(educatorUsers.map((u, i) =>
    prisma.educator.create({
      data: {
        user_id: u.id,
        bio: `Expert in Subject ${i + 1}`,
        expertise: i === 0 ? "Math" : i === 1 ? "Physics" : "Chemistry"
      }
    })
  ));

  const course = await prisma.course.create({
    data: {
      title: "Class 10 - Science",
      subject: "Science",
      description: "Complete syllabus for CBSE Class 10 Science",
      class: "10"
    }
  });

  const syllabus = await prisma.syllabusSection.createMany({
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
      },
      {
        course_id: course.id,
        title: "Metals and Non-metals",
        description: "Properties and uses.",
        order: 3
      }
    ]
  });

  const allSyllabus = await prisma.syllabusSection.findMany({
    where: { course_id: course.id }
  });

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const educator = educators[i % educators.length];

    const enrollment = await prisma.enrollment.create({
      data: {
        student_id: student.user_id,
        course_id: course.id,
        educator_id: educator.user_id,
        progress: "Started",
        percent_complete: 10
      }
    });

    const classSchedule = await prisma.classSchedule.create({
      data: {
        student_id: student.user_id,
        educator_id: educator.user_id,
        course_id: course.id,
        scheduled_at: classDate,
        join_url: `https://meet.google.com/class-${i}`,
        status: "scheduled",
        discussion_topics: "Basics of Chapter 1",
        syllabusSections: {
          connect: [allSyllabus[i % 3]].map(s => ({ id: s.id }))
        }
      }
    });

    const test = await prisma.test.create({
      data: {
        course_id: course.id,
        educator_id: educator.user_id,
        student_id: student.user_id,
        scheduled_at: testDate,
        join_url: `https://meet.google.com/test-${i}`,
        test_format: "online",
        status: "scheduled",
        syllabusSections: {
          connect: [allSyllabus[(i + 1) % 3]].map(s => ({ id: s.id }))
        }
      }
    });

    await prisma.testResult.create({
      data: {
        test_id: test.id,
        student_id: student.user_id,
        marks_scored: 45 - i,
        total_marks: 50,
        feedback: "Good performance, keep improving."
      }
    });
  }

  console.log("✅ Seeded admins, students, educators, course, syllabus, enrollments, classes, tests, and results.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
