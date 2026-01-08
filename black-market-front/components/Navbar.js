'use client';
import { Search, ShoppingCart, Menu, Layers, Package } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext'; // <--- Importar Contexto
import CartSidebar from './CartSidebar'; // <--- Importar el Sidebar

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart(); // <--- Usar hooks del carrito

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-yellow-300 bg-clip-text text-transparent">
                BLACK MARKET
              </h1>
            </Link>

            {/* Menú Central */}
            <div className="hidden md:flex items-center space-x-8 mx-8">
              <Link href="/singles" className="flex items-center gap-2 text-slate-300 hover:text-amber-500 font-medium transition-colors">
                  <Layers size={18} /> Singles
              </Link>
              <Link href="/sellado" className="flex items-center gap-2 text-slate-300 hover:text-blue-400 font-medium transition-colors">
                  <Package size={18} /> Sellado
              </Link>
            </div>

            {/* Búsqueda */}
            <div className="hidden lg:block flex-1 max-w-sm">
              <form onSubmit={handleSearch} className="relative group">
                <input
                  type="text"
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:border-amber-500 text-sm transition-all group-hover:border-slate-600"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors">
                  <Search size={16} />
                </button>
              </form>
            </div>

            {/* Iconos Derecha */}
            <div className="flex items-center space-x-6 ml-4">
              {/* Botón del Carrito */}
              <div 
                className="relative cursor-pointer group"
                onClick={() => setIsCartOpen(true)} // <--- Abrir Sidebar
              >
                <ShoppingCart className="text-slate-300 group-hover:text-amber-500 transition-colors" size={24} />
                {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm animate-in zoom-in">
                        {totalItems}
                    </span>
                )}
              </div>
              
              <div className="md:hidden text-slate-300">
                <Menu size={28} />
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Renderizamos el Sidebar aquí para que esté disponible en toda la navegación */}
      <CartSidebar /> 
    </>
  );
}