import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "../context/CartContext";
import { Toaster } from 'sonner'; // <--- 1. IMPORTAR

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Black Market",
  description: "Tu tienda premium de Magic: The Gathering",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-slate-950 text-slate-200`}>
        <CartProvider>
          {children}
          {/* 2. AGREGAR EL COMPONENTE TOASTER AQUÍ */}
          {/* 'richColors' hace que los errores sean rojos y éxitos verdes automáticamente */}
          <Toaster position="bottom-center" richColors theme="dark" />
        </CartProvider>
      </body>
    </html>
  );
}