// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const studentPassword = await bcrypt.hash("Student@123", 10);
  const educatorPassword = await bcrypt.hash("Educator@123", 10);

  // Admin user
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Super Admin",
      password_hash: adminPassword,
      role: "admin",
      dob: new Date("1990-01-01"),
      phone: "9999999999"
    }
  });

  // Student user
  await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      email: "student@example.com",
      name: "Test Student",
      password_hash: studentPassword,
      role: "student",
      dob: new Date("2005-06-15"),
      phone: "8888888888"
    }
  });

  // Educator user
  await prisma.user.upsert({
    where: { email: "educator@example.com" },
    update: {},
    create: {
      email: "educator@example.com",
      name: "Test Educator",
      password_hash: educatorPassword,
      role: "educator",
      dob: new Date("1985-03-25"),
      phone: "7777777777"
    }
  });

  console.log("Admin, Student, and Educator users seeded.");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
