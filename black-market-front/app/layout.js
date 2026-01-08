import { Inter } from "next/font/google";
import "./globals.css"; // <--- ESTA LÍNEA ES LA CLAVE. Sin ella, no hay diseño.

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Black Market",
  description: "Tu tienda premium de Magic: The Gathering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Aplicamos la fuente Inter y el fondo oscuro base */}
      <body className={`${inter.className} bg-slate-950 text-slate-200`}>
        {children}
      </body>
    </html>
  );
}