'use client';
import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Trash2, MapPin, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import Navbar from '../../components/Navbar'; // Asegúrate de importar tu Navbar
import { API_URL } from '@/utils/api';

export default function CartPage() {
  const { cart, removeFromCart, totalItems, totalPrice, updateQuantity } = useCart(); // Asegúrate de tener setCart o una forma de limpiar el carrito en tu contexto si quieres vaciarlo al final.
  
  // Si no tienes una función clearCart en el contexto, puedes hacerlo manualmente o agregarla al contexto después.
  // Por ahora, asumiremos que tras el éxito redirigimos o mostramos mensaje.

  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // Guardará el ID del pedido

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: formData.name,
          contact_info: formData.contact,
          items: cart,
          total: totalPrice
        })
      });

      const data = await res.json();

      if (res.ok) {
        setOrderSuccess(data.orderId);
        toast.success("¡Pedido realizado con éxito!");
        // Aquí idealmente vaciarías el carrito: clearCart();
        localStorage.removeItem('black_market_cart'); // Limpieza manual básica
        // Recargar la página forzaría el vaciado visual si el contexto lee de localStorage al inicio
      } else {
        toast.error("Error al procesar el pedido");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- VISTA DE ÉXITO ---
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto p-8 pt-20 text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">¡Solicitud Recibida!</h1>
          <p className="text-slate-400 mb-8">Tu pedido ha sido registrado correctamente.</p>
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl mb-8">
            <p className="text-sm text-slate-500 uppercase font-bold mb-2">Número de Pedido</p>
            <p className="text-4xl font-mono text-amber-500 font-bold">#{orderSuccess}</p>
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 p-6 rounded-xl text-left mb-8">
            <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
                <MapPin size={20}/> Pasos a seguir:
            </h3>
            <ul className="list-disc list-inside text-slate-300 space-y-2 text-sm">
                <li>Acércate a nuestra tienda en <strong>Av. Providencia 1234, Local 5</strong>.</li>
                <li>Indica tu número de pedido al vendedor.</li>
                <li>Realiza el pago presencialmente (Efectivo/Transferencia/Débito).</li>
                <li>¡Disfruta tus cartas!</li>
            </ul>
          </div>

          <Link href="/" className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-bold transition">
            Volver a la tienda <ArrowRight size={20}/>
          </Link>
        </div>
      </div>
    );
  }

  // --- VISTA CARRITO VACÍO ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 pt-20 text-center">
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <Link href="/" className="text-amber-500 hover:underline">Volver a comprar</Link>
        </div>
      </div>
    );
  }

  // --- VISTA PRINCIPAL (CHECKOUT) ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLUMNA IZQUIERDA: RESUMEN ITEMS */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-slate-400 uppercase text-xs tracking-wider">
                    Resumen del Pedido ({totalItems} items)
                </div>
                <div className="divide-y divide-slate-800">
                    {cart.map(item => (
                        <div key={item.id} className="p-4 flex gap-4 items-center">
                            <div className="relative w-16 h-20 bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                <Image src={item.image_url} alt={item.card_name} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">{item.card_name}</h3>
                                <p className="text-xs text-slate-400">{item.set_code} • {item.condition} {item.is_foil && '• Foil'}</p>
                                <p className="text-amber-500 font-mono text-sm mt-1">
                                    {item.quantity} x ${item.price.toLocaleString('es-CL')}
                                </p>
                            </div>
                            <div className="text-right font-bold text-white">
                                ${(item.price * item.quantity).toLocaleString('es-CL')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AVISOS LEGALES / INFO TIENDA */}
            <div className="bg-amber-900/10 border border-amber-500/20 p-6 rounded-xl space-y-4">
                <div className="flex gap-3">
                    <AlertTriangle className="text-amber-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-amber-500 mb-1">Información Importante</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Al confirmar este pedido, estás generando una <strong>solicitud de reserva</strong>.
                            El pago se realiza <strong>exclusivamente en nuestra tienda física</strong> al momento de retirar.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-amber-500/20">
                    <MapPin className="text-amber-500 flex-shrink-0" />
                    <div>
                        <h3 className="font-bold text-amber-500 mb-1">Punto de Retiro</h3>
                        <p className="text-sm text-slate-300">
                            Av. Providencia 1234, Local 5, Santiago.<br/>
                            Horario: Lun-Vie 10:00 - 19:00
                        </p>
                    </div>
                </div>
                <p className="text-xs text-slate-500 italic pt-2">
                    * Black Market se reserva el derecho de cancelar pedidos si el stock físico presenta discrepancias o si el pedido no es retirado en 48 horas.
                </p>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 sticky top-24 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-6">Datos de Contacto</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition"
                            placeholder="Ej: Juan Pérez"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email o Teléfono</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none transition"
                            placeholder="Para contactarte sobre tu pedido"
                            value={formData.contact}
                            onChange={e => setFormData({...formData, contact: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400">Total a Pagar</span>
                            <span className="text-2xl font-bold text-white">${totalPrice.toLocaleString('es-CL')}</span>
                        </div>
                        <p className="text-xs text-right text-slate-500 mb-6">Pago presencial en tienda</p>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-green-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                        </button>
                    </div>
                </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}