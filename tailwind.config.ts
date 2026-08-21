import type { Config } from "tailwindcss";

// Design tokens SIM-PBMD
// Palet: profesional, terpercaya, tidak ramai — dasar MAROON tua untuk sidebar/topbar
// (identitas visual yang berbeda dari kebanyakan aplikasi biru/hijau), putih/abu muda
// untuk kanvas kerja, aksen maroon untuk aksi utama, dan warna status (hijau/kuning/merah)
// TETAP dipertahankan terpisah dari brand agar makna status tidak pernah rancu dengan
// warna identitas aplikasi (mis. tombol "Hapus" tidak boleh terlihat sama seperti brand).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#3A0B16", // maroon sangat tua - sidebar/topbar
          800: "#4C0F1D",
          700: "#601526",
          600: "#7A1B30", // aksen maroon utama - tombol/aksi primer
          500: "#96233C",
          100: "#F3E4E7", // background section highlight (tint lembut, bukan pink mencolok)
          50: "#FAF3F4",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F7F8FA",
          border: "#E3E7ED",
        },
        status: {
          success: "#1E7F4C",
          successBg: "#E7F6EC",
          warning: "#B7791F",
          warningBg: "#FEF3E0",
          danger: "#C13A3A",
          dangerBg: "#FBEAEA",
          info: "#3F4C63", // slate netral, bukan biru terang — sekadar warna semantik "informasi", bukan identitas aplikasi
          infoBg: "#EEF0F3",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
