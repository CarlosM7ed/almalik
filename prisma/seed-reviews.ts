import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedReviews() {
  // Get first 10 products ordered by creation date
  const products = await prisma.product.findMany({
    take: 10,
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true },
  });

  if (products.length === 0) {
    console.log("No products found. Make sure the database is seeded.");
    return;
  }

  // Clear existing reviews
  await prisma.review.deleteMany({});

  const reviews = [
    // Product 0
    {
      productId: products[0].id,
      productName: products[0].name,
      author: "Mariana S.",
      rating: 5,
      title: "Absolutamente maravilhoso",
      comment: "A fixação é incrível, dura o dia todo. Recebi muitos elogios!",
      verified: true,
      helpful: 12,
    },
    {
      productId: products[0].id,
      productName: products[0].name,
      author: "João P.",
      rating: 4,
      title: "Muito bom",
      comment: "Fragrância elegante e sofisticada. Apenas achei a projeção um pouco leve.",
      verified: true,
      helpful: 5,
    },
    // Product 1
    {
      productId: products[1].id,
      productName: products[1].name,
      author: "Ana R.",
      rating: 5,
      title: "Minha fragrância assinatura",
      comment:
        "Uso há 6 meses e não troco por nada. Perfeita para todas as ocasiões.",
      verified: true,
      helpful: 18,
    },
    {
      productId: products[1].id,
      productName: products[1].name,
      author: "Carlos M.",
      rating: 5,
      title: "Qualidade excepcional",
      comment:
        "Embalagem perfeita, chega rápido e o perfume é autêntico. Super recomendo.",
      verified: true,
      helpful: 9,
    },
    // Product 2
    {
      productId: products[2].id,
      productName: products[2].name,
      author: "Sofia L.",
      rating: 4,
      title: "Bela surpresa",
      comment:
        "Comprei por impulso e não me arrependo. Notas muito bem equilibradas.",
      verified: false,
      helpful: 3,
    },
    // Product 3
    {
      productId: products[3].id,
      productName: products[3].name,
      author: "Pedro H.",
      rating: 5,
      title: "Oud de qualidade",
      comment:
        "Para quem aprecia oud, este é um dos melhores nessa faixa de preço.",
      verified: true,
      helpful: 15,
    },
    // Product 4
    {
      productId: products[4].id,
      productName: products[4].name,
      author: "Luísa F.",
      rating: 5,
      title: "Presente perfeito",
      comment:
        "Comprei de presente e a pessoa adorou! A embalagem é linda.",
      verified: true,
      helpful: 7,
    },
    // Product 5
    {
      productId: products[5].id,
      productName: products[5].name,
      author: "Ricardo T.",
      rating: 4,
      title: "Muito positivo",
      comment:
        "Excelente custo-benefício. Fragrância marcante e com boa duração.",
      verified: true,
      helpful: 6,
    },
    // Product 6
    {
      productId: products[6].id,
      productName: products[6].name,
      author: "Beatriz C.",
      rating: 5,
      title: "Amei!",
      comment:
        "O aroma é simplesmente divino. As notas de topo são frescas e a base é quente e envolvente.",
      verified: true,
      helpful: 11,
    },
    // Product 7
    {
      productId: products[7].id,
      productName: products[7].name,
      author: "Fernando G.",
      rating: 5,
      title: "Impressionante",
      comment:
        "Não esperava tanta qualidade por esse preço. Superou todas as expectativas.",
      verified: false,
      helpful: 8,
    },
    // Product 8
    {
      productId: products[8].id,
      productName: products[8].name,
      author: "Diana M.",
      rating: 4,
      title: "Muito bom, recomendo",
      comment:
        "Fragrância versátil que funciona bem tanto no dia a dia como à noite.",
      verified: true,
      helpful: 4,
    },
    // Product 9
    {
      productId: products[9].id,
      productName: products[9].name,
      author: "Miguel A.",
      rating: 5,
      title: "Perfume incrível",
      comment:
        "Já é a terceira vez que compro na Alma Lik. Qualidade impecável como sempre.",
      verified: true,
      helpful: 13,
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({ data: review });
  }

  console.log(`Created ${reviews.length} reviews`);
}

seedReviews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
