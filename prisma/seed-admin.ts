import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function seedAdmin() {
  const existingAdmin = await db.user.findUnique({
    where: { email: 'admin@almalik.com' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists:', existingAdmin.email);
    console.log('ID:', existingAdmin.id);
    console.log('Name:', existingAdmin.name);
    console.log('Role:', existingAdmin.role);
    await db.$disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('almalik2024', 12);

  const admin = await db.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@almalik.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('ID:', admin.id);
  console.log('Email:', admin.email);
  console.log('Name:', admin.name);
  console.log('Role:', admin.role);

  await db.$disconnect();
}

seedAdmin().catch((e) => {
  console.error('Error seeding admin:', e);
  process.exit(1);
});
