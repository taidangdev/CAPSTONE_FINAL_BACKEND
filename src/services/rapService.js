import prisma from '../config/prisma.js';
import { groupBy } from '../utils/groupBy.js';

const SHOWTIME_SELECT = {
  maLichChieu: true,
  maRap: true,
  ngayGioChieu: true,
  giaVe: true,
};

const MOVIE_SUMMARY_SELECT = {
  maPhim: true,
  tenPhim: true,
  hinhAnh: true,
  hot: true,
  dangChieu: true,
  sapChieu: true,
};

function toShowtimeResponse({ ngayGioChieu, rapPhim, maLichChieu, maRap, giaVe }) {
  return { maLichChieu, maRap, tenRap: rapPhim.tenRap, ngayChieuGioChieu: ngayGioChieu, giaVe };
}

function groupShowtimesByMovie(rooms) {
  const showtimes = rooms.flatMap(({ tenRap, lichChieu }) =>
    lichChieu.map((showtime) => ({ ...showtime, rapPhim: { tenRap } })),
  );

  return groupBy(showtimes, ({ phim }) => phim.maPhim).map((movieShowtimes) => ({
    ...movieShowtimes[0].phim,
    lstLichChieuTheoPhim: movieShowtimes.map(toShowtimeResponse),
  }));
}

function toClusterSchedule({ rapPhim, ...cluster }) {
  return { ...cluster, danhSachPhim: groupShowtimesByMovie(rapPhim) };
}

function toClusterShowtimes(clusterShowtimes) {
  const { maCumRap, tenCumRap, diaChi } = clusterShowtimes[0].rapPhim.cumRap;
  return { maCumRap, tenCumRap, diaChi, lichChieuPhim: clusterShowtimes.map(toShowtimeResponse) };
}

function toSystemShowtimes(systemShowtimes) {
  const clusters = groupBy(systemShowtimes, ({ rapPhim }) => rapPhim.cumRap.maCumRap);
  return {
    ...systemShowtimes[0].rapPhim.cumRap.heThongRap,
    cumRapChieu: clusters.map(toClusterShowtimes),
  };
}

export function getCinemaSystems({ maHeThongRap }) {
  return prisma.heThongRap.findMany({ where: { maHeThongRap } });
}

export async function getClustersBySystem({ maHeThongRap }) {
  const clusters = await prisma.cumRap.findMany({
    where: { maHeThongRap },
    select: {
      maCumRap: true,
      tenCumRap: true,
      diaChi: true,
      rapPhim: { select: { maRap: true, tenRap: true } },
    },
  });
  return clusters.map(({ rapPhim, ...cluster }) => ({ ...cluster, danhSachRap: rapPhim }));
}

export async function getSystemSchedules({ maHeThongRap }) {
  const systems = await prisma.heThongRap.findMany({
    where: { maHeThongRap },
    include: {
      cumRap: {
        select: {
          maCumRap: true,
          tenCumRap: true,
          diaChi: true,
          rapPhim: {
            select: {
              tenRap: true,
              lichChieu: {
                select: { ...SHOWTIME_SELECT, phim: { select: MOVIE_SUMMARY_SELECT } },
                orderBy: { ngayGioChieu: 'asc' },
              },
            },
          },
        },
      },
    },
  });
  return systems.map(({ cumRap, ...system }) => ({ ...system, lstCumRap: cumRap.map(toClusterSchedule) }));
}

export async function getMovieSchedule(maPhim) {
  const [movie, showtimes] = await Promise.all([
    prisma.phim.findUniqueOrThrow({ where: { maPhim } }),
    prisma.lichChieu.findMany({
      where: { maPhim },
      select: {
        ...SHOWTIME_SELECT,
        rapPhim: {
          select: {
            tenRap: true,
            cumRap: {
              select: {
                maCumRap: true,
                tenCumRap: true,
                diaChi: true,
                heThongRap: true,
              },
            },
          },
        },
      },
      orderBy: { ngayGioChieu: 'asc' },
    }),
  ]);

  const systems = groupBy(showtimes, ({ rapPhim }) => rapPhim.cumRap.heThongRap.maHeThongRap);
  return { ...movie, heThongRapChieu: systems.map(toSystemShowtimes) };
}
