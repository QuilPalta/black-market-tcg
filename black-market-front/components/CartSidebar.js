'use client';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartSidebar() {
    const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice } = useCart();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end font-sans">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsCartOpen(false)}
            />

            {/* Sidebar */}
            <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-amber-500" /> Tu Carrito
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>

                {/* Lista Items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                            <ShoppingBag size={64} className="mb-4" />
                            <p>Tu carrito está vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="flex gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-800 hover:border-slate-700 transition relative group">
                                {/* Imagen */}
                                <div className="relative w-16 h-20 flex-shrink-0 bg-slate-800 rounded overflow-hidden">
                                    <img src={item.image_url} alt={item.card_name} className="w-full h-full object-cover" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-white line-clamp-1">{item.card_name}</h3>

                                        {/* --- AQUI: Tags con diseño unificado al ProductCard --- */}
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {/* Set Code */}
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-400 border border-slate-700 uppercase">
                                                {item.set_code}
                                            </span>

                                            {/* Condición */}
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.condition === 'NM' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                                {item.condition || 'NM'}
                                            </span>

                                            {/* Idioma */}
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                                {item.language || 'EN'}
                                            </span>

                                            {/* Foil */}
                                            {item.is_foil && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-300 border border-pink-500/30 animate-pulse">
                                                    FOIL
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Controles de Cantidad */}
                                    <div className="flex justify-between items-end mt-2">
                                        <div className="flex items-center gap-2 bg-slate-900 rounded px-1 border border-slate-800">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:text-amber-500 text-slate-400 disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>

                                            <span className="text-xs font-mono w-4 text-center text-white">{item.quantity}</span>

                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-amber-500 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                                disabled={item.quantity >= item.stock} // Deshabilitado si alcanzamos el stock
                                                title={item.quantity >= item.stock ? "Stock máximo alcanzado" : ""}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-amber-500 font-bold font-mono text-sm">
                                                ${(item.price * item.quantity).toLocaleString('es-CL')}
                                            </span>
                                            {/* Aviso sutil de stock máximo */}
                                            {item.quantity >= item.stock && (
                                                <span className="text-[9px] text-red-400">Máx. stock</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Botón Borrar */}
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-500 hover:bg-slate-900 rounded transition"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="p-6 bg-slate-950 border-t border-slate-800">
                        <div className="flex justify-between items-center mb-4 text-lg font-bold">
                            <span className="text-slate-300">Total</span>
                            <span className="text-amber-500 text-2xl">${totalPrice.toLocaleString('es-CL')}</span>
                        </div>

                        {/* CAMBIO AQUÍ: Usamos Link y cerramos el sidebar */}
                        <Link
                            href="/cart"
                            onClick={() => setIsCartOpen(false)}
                            className="block w-full text-center bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-lg font-bold shadow-lg shadow-amber-900/20 transition-all active:scale-95"
                        >
                            Ir a Pagar
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}