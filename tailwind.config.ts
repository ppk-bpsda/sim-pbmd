import type { Config } from "tailwindcss";

// Design tokens SIM-PBMD
// Palet: profesional, terpercaya, tidak ramai — dasar navy gelap untuk sidebar/topbar,
// putih/abu muda untuk kanvas kerja, aksen biru untuk aksi utama, dan warna status
// (hijau/kuning/merah) hanya dipakai untuk indikator status, bukan dekorasi.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          900: "#0B1E33", // navy tua - sidebar/topbar
          800: "#0F2A47",
          700: "#15375C",
          600: "#1D4E89", // aksen biru - tombol utama
          500: "#2B6CB0",
          100: "#E7EEF6", // background section highlight
          50: "#F5F8FB",
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
          info: "#2B6CB0",
          infoBg: "#E7EEF6",
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
