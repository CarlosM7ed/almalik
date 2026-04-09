import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function main() {
  const existing = await db.affiliate.findUnique({ where: { email: 'admin@almalik.com' } });
  if (existing) {
    console.log('Admin account already exists:', existing.email);
    // Update password in case it changed
    await db.affiliate.update({
      where: { email: 'admin@almalik.com' },
      data: { password: 'admin123', name: 'Administrador', isActive: true },
    });
    console.log('Admin account updated');
  } else {
    const admin = await db.affiliate.create({
      data: {
        name: 'Administrador',
        email: 'admin@almalik.com',
        password: 'admin123',
        referralCode: 'ADMIN01',
        commissionRate: 0.3,
        isActive: true,
      },
    });
    console.log('Admin account created:', admin.email);
  }
}

main().catch(console.error).finally(() => db.$disconnect());
