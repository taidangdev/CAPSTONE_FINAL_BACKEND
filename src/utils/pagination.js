export function getPaginationArgs({ soTrang, soPhanTuTrenTrang }) {
  return { skip: (soTrang - 1) * soPhanTuTrenTrang, take: soPhanTuTrenTrang };
}

export function buildPageContent(items, totalCount, { soTrang, soPhanTuTrenTrang }) {
  return {
    currentPage: soTrang,
    count: items.length,
    totalPages: Math.ceil(totalCount / soPhanTuTrenTrang),
    totalCount,
    items,
  };
}
