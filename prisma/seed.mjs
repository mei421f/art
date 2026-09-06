import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const projects = [
  {
    slug: "rova",
    order: 1,
    titleFa: "روا",
    titleEn: "ROVA",
    taglineFa: "برندینگ عطر",
    taglineEn: "Perfume Branding",
    descriptionFa:
      "طراحی هویت بصری و بسته‌بندی برای برند عطر روا؛ با تمرکز بر حس لوکس، سکوت بصری و تایپوگرافی ظریف.",
    descriptionEn:
      "Visual identity and packaging design for ROVA, a perfume brand built around quiet luxury and refined typography.",
    category: "Branding",
    year: "2025",
    coverImage: null,
    published: true
  },
  {
    slug: "kova",
    order: 2,
    titleFa: "کووا",
    titleEn: "KOVA",
    taglineFa: "برندینگ مکمل ورزشی",
    taglineEn: "Sports Nutrition Branding",
    descriptionFa:
      "هویت برند و بسته‌بندی برای کووا؛ زبان بصری پرانرژی و مدرن برای دنیای تغذیه ورزشی.",
    descriptionEn:
      "Brand identity and packaging for KOVA, an energetic and modern visual language for sports nutrition.",
    category: "Branding",
    year: "2025",
    coverImage: null,
    published: true
  }
];

async function main() {
  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: project,
      create: project
    });
  }
  console.log(`Seeded ${projects.length} projects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
