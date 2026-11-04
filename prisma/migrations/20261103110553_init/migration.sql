-- CreateTable
CREATE TABLE `NguoiDung` (
    `tai_khoan` VARCHAR(50) NOT NULL,
    `ho_ten` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `so_dt` VARCHAR(20) NULL,
    `mat_khau` VARCHAR(255) NOT NULL,
    `loai_nguoi_dung` ENUM('KhachHang', 'QuanTri') NOT NULL DEFAULT 'KhachHang',

    UNIQUE INDEX `NguoiDung_email_key`(`email`),
    PRIMARY KEY (`tai_khoan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Phim` (
    `ma_phim` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_phim` VARCHAR(255) NOT NULL,
    `trailer` VARCHAR(255) NULL,
    `hinh_anh` VARCHAR(255) NULL,
    `mo_ta` TEXT NULL,
    `ngay_khoi_chieu` DATE NOT NULL,
    `danh_gia` INTEGER NOT NULL DEFAULT 0,
    `hot` BOOLEAN NOT NULL DEFAULT false,
    `dang_chieu` BOOLEAN NOT NULL DEFAULT false,
    `sap_chieu` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`ma_phim`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Banner` (
    `ma_banner` INTEGER NOT NULL AUTO_INCREMENT,
    `ma_phim` INTEGER NOT NULL,
    `hinh_anh` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`ma_banner`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HeThongRap` (
    `ma_he_thong_rap` VARCHAR(50) NOT NULL,
    `ten_he_thong_rap` VARCHAR(100) NOT NULL,
    `logo` VARCHAR(255) NULL,

    PRIMARY KEY (`ma_he_thong_rap`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CumRap` (
    `ma_cum_rap` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_cum_rap` VARCHAR(100) NOT NULL,
    `dia_chi` VARCHAR(255) NOT NULL,
    `ma_he_thong_rap` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`ma_cum_rap`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RapPhim` (
    `ma_rap` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_rap` VARCHAR(100) NOT NULL,
    `ma_cum_rap` INTEGER NOT NULL,

    PRIMARY KEY (`ma_rap`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ghe` (
    `ma_ghe` INTEGER NOT NULL AUTO_INCREMENT,
    `ten_ghe` VARCHAR(10) NOT NULL,
    `loai_ghe` ENUM('Thuong', 'Vip') NOT NULL DEFAULT 'Thuong',
    `ma_rap` INTEGER NOT NULL,

    UNIQUE INDEX `Ghe_ma_rap_ten_ghe_key`(`ma_rap`, `ten_ghe`),
    PRIMARY KEY (`ma_ghe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LichChieu` (
    `ma_lich_chieu` INTEGER NOT NULL AUTO_INCREMENT,
    `ma_rap` INTEGER NOT NULL,
    `ma_phim` INTEGER NOT NULL,
    `ngay_gio_chieu` DATETIME(3) NOT NULL,
    `gia_ve` INTEGER NOT NULL,

    INDEX `LichChieu_ma_phim_idx`(`ma_phim`),
    UNIQUE INDEX `LichChieu_ma_rap_ngay_gio_chieu_key`(`ma_rap`, `ngay_gio_chieu`),
    PRIMARY KEY (`ma_lich_chieu`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DatVe` (
    `tai_khoan` VARCHAR(50) NOT NULL,
    `ma_lich_chieu` INTEGER NOT NULL,
    `ma_ghe` INTEGER NOT NULL,

    INDEX `DatVe_tai_khoan_idx`(`tai_khoan`),
    INDEX `DatVe_ma_ghe_idx`(`ma_ghe`),
    PRIMARY KEY (`ma_lich_chieu`, `ma_ghe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Banner` ADD CONSTRAINT `Banner_ma_phim_fkey` FOREIGN KEY (`ma_phim`) REFERENCES `Phim`(`ma_phim`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CumRap` ADD CONSTRAINT `CumRap_ma_he_thong_rap_fkey` FOREIGN KEY (`ma_he_thong_rap`) REFERENCES `HeThongRap`(`ma_he_thong_rap`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RapPhim` ADD CONSTRAINT `RapPhim_ma_cum_rap_fkey` FOREIGN KEY (`ma_cum_rap`) REFERENCES `CumRap`(`ma_cum_rap`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ghe` ADD CONSTRAINT `Ghe_ma_rap_fkey` FOREIGN KEY (`ma_rap`) REFERENCES `RapPhim`(`ma_rap`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LichChieu` ADD CONSTRAINT `LichChieu_ma_rap_fkey` FOREIGN KEY (`ma_rap`) REFERENCES `RapPhim`(`ma_rap`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LichChieu` ADD CONSTRAINT `LichChieu_ma_phim_fkey` FOREIGN KEY (`ma_phim`) REFERENCES `Phim`(`ma_phim`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DatVe` ADD CONSTRAINT `DatVe_tai_khoan_fkey` FOREIGN KEY (`tai_khoan`) REFERENCES `NguoiDung`(`tai_khoan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DatVe` ADD CONSTRAINT `DatVe_ma_lich_chieu_fkey` FOREIGN KEY (`ma_lich_chieu`) REFERENCES `LichChieu`(`ma_lich_chieu`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DatVe` ADD CONSTRAINT `DatVe_ma_ghe_fkey` FOREIGN KEY (`ma_ghe`) REFERENCES `Ghe`(`ma_ghe`) ON DELETE RESTRICT ON UPDATE CASCADE;
