'use client';
import Image from 'next/image';
import { ShoppingBag, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner'; // <--- Importamos toast

export default function ProductCard({ card }) {
  // Traemos 'cart' para poder consultar cuántas tenemos ya
  const { addToCart, cart } = useCart();

  const name = card.card_name || card.name || 'Carta sin nombre';
  const set = card.set_code?.toUpperCase() || card.set_name || 'N/A';
  const price = Number(card.price) || 0;
  const stock = Number(card.stock) || 0;
  
  // Buscamos cuántas unidades de ESTA carta hay ya en el carrito
  // Usamos 'find' por ID y si no existe devolvemos 0
  const productInCart = cart.find(item => item.id === card.id);
  const quantityInCart = productInCart ? productInCart.quantity : 0;

  // Calculamos si ya alcanzamos el límite personal (Stock Real)
  const isMaxedOut = quantityInCart >= stock;
  // Calculamos si está agotada globalmente (Stock 0 desde el inicio)
  const isOutOfStock = stock <= 0;

  const getRarityColor = (rarity) => {
    switch(rarity?.toLowerCase()) {
      case 'mythic': return 'border-orange-500/50';
      case 'rare': return 'border-yellow-500/50';
      case 'uncommon': return 'border-blue-500/50';
      default: return 'border-slate-800';
    }
  };

  const handleAddToCart = () => {
    // 1. VALIDACIÓN: Si está agotado globalmente, no hacemos nada (aunque el botón estará deshabilitado)
    if (isOutOfStock) return;

    // 2. VALIDACIÓN: Si ya tienes todo el stock en tu carrito
    if (isMaxedOut) {
        toast.error(`¡No puedes agregar más! Solo quedan ${stock} unidades.`);
        return; // <--- IMPORTANTE: Aquí cortamos la ejecución. El carrito NO se abrirá.
    }
    
    // 3. ÉXITO: Si pasa las validaciones, agregamos y notificamos
    addToCart({
        ...card,
        card_name: name,
        price: price
    });
    toast.success(`${name} agregado al carrito`);
  };

  return (
    <div className={`group relative bg-slate-900 rounded-xl overflow-hidden border ${getRarityColor(card.rarity)} hover:border-amber-500 transition-all duration-300 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-1 flex flex-col`}>
      
      {/* --- IMAGEN --- */}
      <div className="relative aspect-[2.5/3.5] w-full overflow-hidden bg-slate-950">
        {isOutOfStock && (
            <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                <span className="bg-red-600 text-white px-3 py-1 rounded-md font-bold text-sm transform -rotate-12 border border-red-400 shadow-lg">
                    AGOTADO
                </span>
            </div>
        )}

        <Image 
            src={card.image_url || '/placeholder-card.png'} 
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${isOutOfStock ? 'grayscale opacity-50' : 'group-hover:scale-110'}`}
        />
        
        {!isOutOfStock && (
            <div className="absolute top-2 right-2 z-10 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow-sm backdrop-blur-md">
                {stock} disp.
            </div>
        )}
      </div>

      {/* --- INFO --- */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-2">
            <h3 className="text-white font-bold text-sm leading-tight truncate" title={name}>{name}</h3>
            <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold mt-1">{set} #{card.collector_number}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${card.condition === 'NM' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {card.condition || 'NM'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {card.language || 'EN'}
            </span>
            {card.is_foil && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-300 border border-pink-500/30 animate-pulse">
                    FOIL
                </span>
            )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-800/50">
            <span className={`text-lg font-bold font-mono ${isOutOfStock ? 'text-slate-600 decoration-slate-600 line-through' : 'text-amber-500'}`}>
                ${price.toLocaleString('es-CL')}
            </span>
            
            <button 
                onClick={handleAddToCart}
                // Deshabilitamos el botón visualmente si está agotado O si ya tenemos el máximo en carrito
                disabled={isOutOfStock || isMaxedOut} 
                className={`p-2 rounded-full transition-all duration-200 shadow-md ${
                    isOutOfStock 
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                    : isMaxedOut
                        ? 'bg-slate-800 text-amber-500/50 cursor-not-allowed border border-amber-500/20' // Estilo visual cuando llegas al tope
                        : 'bg-slate-800 text-white hover:bg-amber-600 hover:scale-105 active:scale-95 hover:shadow-amber-900/20'
                }`}
                title={isOutOfStock ? "Sin Stock" : isMaxedOut ? "Límite de stock alcanzado" : "Agregar al carrito"}
            >
                {/* Cambiamos el icono para dar feedback visual extra */}
                {isOutOfStock ? <AlertCircle size={18} /> : (isMaxedOut ? <ShoppingBag size={18} className="opacity-50"/> : <ShoppingBag size={18} />)}
            </button>
        </div>
      </div>
    </div>
  );
}