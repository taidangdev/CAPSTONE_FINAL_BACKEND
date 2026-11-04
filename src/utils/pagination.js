import prisma from '../config/prisma.js';

export async function paginate(model, queryArgs, { soTrang, soPhanTuTrenTrang }) {
  const [items, totalCount] = await prisma.$transaction([
    model.findMany({
      ...queryArgs,
      skip: (soTrang - 1) * soPhanTuTrenTrang,
      take: soPhanTuTrenTrang,
    }),
    model.count({ where: queryArgs.where }),
  ]);

  return {
    currentPage: soTrang,
    count: items.length,
    totalPages: Math.ceil(totalCount / soPhanTuTrenTrang),
    totalCount,
    items,
  };
}
