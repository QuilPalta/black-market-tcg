'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext'; // Hook del carrito

export default function SealedGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart(); // Usamos la función del contexto

  useEffect(() => {
    // Fetcheamos solo productos tipo SEALED
    fetch('http://localhost:4000/api/inventory?type=SEALED')
      .then((res) => res.json())
      .then((data) => {
        // Mostramos solo los 4 últimos o más relevantes para la home
        setProducts(data.slice(0, 4));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando sellado:", err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="py-12 bg-slate-900/50 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Producto Sellado</h2>
                <p className="text-slate-400 mt-1">Lo último en llegar a la tienda</p>
            </div>
            <a href="/sellado" className="text-blue-400 hover:text-blue-300 text-sm font-bold">Ver todo el sellado &rarr;</a>
        </div>
        
        {loading ? (
            <div className="flex justify-center py-20 text-blue-500">
                <Loader2 className="animate-spin" size={48} />
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((item) => (
                <div key={item.id} className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group hover:border-blue-500 transition-all shadow-lg hover:shadow-blue-900/20">
                <div className="h-56 overflow-hidden bg-slate-900 relative flex items-center justify-center p-4">
                    {/* Imagen desde DB */}
                    <img 
                        src={item.image_url || '/placeholder-sealed.png'} 
                        alt={item.card_name} 
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500" 
                    />
                    {/* Badge de Categoría */}
                    <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow border border-blue-400/50 uppercase tracking-wide">
                        {item.category || 'Producto'}
                    </div>
                </div>
                
                <div className="p-4 bg-gradient-to-b from-slate-950 to-slate-900">
                    <h3 className="text-white font-bold text-sm h-10 line-clamp-2 mb-3 leading-tight" title={item.card_name}>
                        {item.card_name}
                    </h3>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800/50">
                        <span className="text-lg font-bold text-blue-400 font-mono">
                            ${Number(item.price).toLocaleString('es-CL')}
                        </span>
                        <button 
                            onClick={() => addToCart(item)}
                            className="bg-slate-800 p-2.5 rounded-full hover:bg-blue-600 text-white transition-all hover:scale-110 active:scale-95 shadow-md"
                            title="Agregar al carrito"
                        >
                            <ShoppingBag size={18} />
                        </button>
                    </div>
                </div>
                </div>
            ))}
            {products.length === 0 && (
                <p className="col-span-4 text-center text-slate-500">No hay productos sellados disponibles.</p>
            )}
            </div>
        )}
      </div>
    </section>
  );
}