'use client';

import { useState, useEffect } from 'react';
import { Search, Save, Lock, Upload, FileText, Trash2, Package, Image as ImageIcon, Check, X, RefreshCw, 
  ShoppingBag, Calendar, User, Phone } from 'lucide-react';

// --- CONSTANTES ---
const CONDITIONS = [
  { value: 'NM', label: 'NM' },
  { value: 'LP', label: 'LP' },
  { value: 'MP', label: 'MP' },
  { value: 'HP', label: 'HP' },
  { value: 'DMG', label: 'DMG' },
];

const LANGUAGES = [
  { value: 'EN', label: 'Inglés' },
  { value: 'ES', label: 'Español' },
  { value: 'JP', label: 'Japonés' },
  { value: 'PT', label: 'Portugués' },
  { value: 'IT', label: 'Italiano' },
  { value: 'FR', label: 'Francés' },
  { value: 'DE', label: 'Alemán' },
  { value: 'CN', label: 'Chino' },
  { value: 'RU', label: 'Ruso' },
];

export default function AdminPage() {
  // --- AUTH ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // --- TABS ---
  const [activeTab, setActiveTab] = useState('manual'); // 'manual', 'import', 'sealed'

  // --- ESTADOS MANUAL (Singles) ---
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  
  // Formulario Manual
  const [manualForm, setManualForm] = useState({ 
    price: 1000, 
    stock: 1, 
    condition: 'NM', 
    language: 'EN', 
    is_foil: false 
  });

  // --- ESTADOS IMPORT (Texto) ---
  const [importText, setImportText] = useState('');
  const [importList, setImportList] = useState([]); // Lista de cartas procesadas para revisión
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingBulk, setIsSavingBulk] = useState(false);

  // --- ESTADOS SELLADO ---
  const [sealedForm, setSealedForm] = useState({
    name: '',
    category: 'Booster Box', 
    set_code: '',
    price: 50000,
    stock: 5,
    image_url: ''
  });

  // --- NUEVO: ESTADOS DE PEDIDOS ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'blacklotus') setIsAuthenticated(true);
    else alert("Acceso denegado.");
  };

  // --- FETCH PEDIDOS ---
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
        const res = await fetch('http://localhost:4000/api/orders');
        const data = await res.json();
        setOrders(data);
    } catch (e) { console.error(e); alert("Error cargando pedidos"); }
    finally { setLoadingOrders(false); }
  };

  // Cargar pedidos automáticamente cuando cambias a la tab 'orders'
  useEffect(() => {
    if (isAuthenticated && activeTab === 'orders') {
        fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl text-center max-w-sm w-full">
                <Lock className="text-amber-500 w-12 h-12 mx-auto mb-4" />
                <h1 className="text-2xl font-bold mb-6">Black Market Admin</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 outline-none" placeholder="Clave de acceso" />
                    <button className="w-full bg-amber-600 hover:bg-amber-500 font-bold py-3 rounded-lg">Entrar</button>
                </form>
            </div>
        </div>
    );
  }

  // --- API HELPER ---
  const saveToInventory = async (payload) => {
    try {
        const res = await fetch('http://localhost:4000/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return res.ok;
    } catch (e) { console.error(e); return false; }
  };

  // ==========================================
  // LÓGICA MANUAL
  // ==========================================
  const handleSearch = async (e) => {
    e.preventDefault(); 
    if(!query) return;
    setLoading(true);
    setResults([]);
    setSelectedCard(null);
    try {
        const res = await fetch(`http://localhost:4000/api/search?q=${query}`);
        const data = await res.json(); 
        setResults(data);
    } catch (err) { alert("Error buscando"); } finally { setLoading(false); }
  };

  const saveManual = async () => {
    if(!selectedCard) return;
    const payload = { 
        ...manualForm,
        price: Number(manualForm.price),
        stock: Number(manualForm.stock),
        type: 'SINGLE', 
        scryfall_id: selectedCard.scryfall_id, 
        card_name: selectedCard.name, 
        set_code: selectedCard.set_code, 
        collector_number: selectedCard.collector_number, 
        image_url: selectedCard.image_url 
    };

    if(await saveToInventory(payload)) {
        alert("✅ Single Guardado!"); 
        setSelectedCard(null); 
    } else {
        alert("❌ Error al guardar");
    }
  };

  // ==========================================
  // LÓGICA IMPORTACIÓN (TEXTO -> REVISIÓN -> GUARDAR)
  // ==========================================
  
  // 1. Cargar archivo de texto al textarea
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setImportText(event.target.result);
    reader.readAsText(file);
  };

  // 2. Procesar Texto y Buscar en Scryfall
  const processImportText = async () => {
    if (!importText.trim()) return;
    setIsProcessing(true);
    setImportList([]); // Limpiar lista anterior

    const lines = importText.split('\n');
    const identifiers = [];
    const metadataMap = {}; // Usaremos un mapa para guardar la metadata del texto por ID temporal

    // Regex ManaBox / Formato Texto: "Cantidad Nombre (SET) CN Flags"
    // Ej: "1 Sol Ring (UNF) 200 *F*"
    const regex = /^(\d+)\s+(.+)\s+\(([A-Za-z0-9]+)\)\s+([A-Za-z0-9]+)(.*)$/;

    lines.forEach(line => {
        const match = line.trim().match(regex);
        if (match) {
            const [_, qty, name, set, cn, flags] = match;
            const tempId = `${set.toLowerCase()}-${cn}`;
            
            identifiers.push({ set: set.toLowerCase(), collector_number: cn });
            
            // Guardamos los datos que vienen del texto para aplicarlos después
            metadataMap[tempId] = {
                qty: parseInt(qty) || 1,
                is_foil: flags.includes('*F*') || flags.toLowerCase().includes('foil'),
                raw_line: line
            };
        }
    });

    if (identifiers.length === 0) {
        alert("No se encontraron cartas con el formato válido.\nEjemplo: '1 Sol Ring (UNF) 200'");
        setIsProcessing(false);
        return;
    }

    try {
        // Consultar Scryfall (endpoint bulk que ya creamos en server.js)
        const res = await fetch('http://localhost:4000/api/search-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifiers })
        });
        const scryfallData = await res.json();

        // Mezclar Scryfall + Metadata del texto + Valores por defecto editables
        const combinedList = scryfallData.map(card => {
            const tempId = `${card.set_code}-${card.collector_number}`;
            const meta = metadataMap[tempId] || { qty: 1, is_foil: false };

            return {
                scryfall_card: card, // Guardamos la ref original
                // Campos editables por el usuario
                price: 0, // Por defecto 0, usuario debe poner precio
                stock: meta.qty,
                condition: 'NM',
                language: 'EN',
                is_foil: meta.is_foil,
                // ID único para la lista (por si hay duplicados usamos random)
                list_id: Math.random().toString(36).substr(2, 9)
            };
        });

        setImportList(combinedList);
        setImportText(''); // Limpiar textarea para dar paso a la revisión

    } catch (err) {
        console.error(err);
        alert("Error consultando Scryfall.");
    } finally {
        setIsProcessing(false);
    }
  };

  // 3. Funciones para editar la Lista de Revisión
  const updateImportItem = (index, field, value) => {
    const newList = [...importList];
    newList[index][field] = value;
    setImportList(newList);
  };

  const removeImportItem = (index) => {
    const newList = [...importList];
    newList.splice(index, 1);
    setImportList(newList);
  };

  // --- FUNCIÓN PARA ACTUALIZAR ESTADO ---
  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic UI: Actualizamos localmente para que se sienta rápido
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
        const res = await fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (!res.ok) throw new Error("Fallo al actualizar");
    } catch (error) {
        alert("Error al actualizar el estado en el servidor");
        fetchOrders(); // Revertimos recargando datos reales
    }
  };

  // --- HELPER PARA ETIQUETAS DE ESTADO ---
  const getStatusBadge = (status) => {
      switch (status) {
          case 'PENDING': return <span className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-600">⏳ Pendiente</span>;
          case 'IN_PROGRESS': return <span className="bg-blue-900/50 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30 animate-pulse">🔨 En Curso</span>;
          case 'READY': return <span className="bg-amber-900/50 text-amber-500 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">📦 Listo para Retiro</span>;
          case 'COMPLETED': return <span className="bg-green-900/50 text-green-500 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">✅ Retirado</span>;
          case 'REJECTED': return <span className="bg-red-900/50 text-red-500 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">❌ Cancelado</span>;
          default: return <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-xs">Desconocido</span>;
      }
  };

  // 4. Guardar Todo
  const saveAllImports = async () => {
    if (importList.length === 0) return;
    setIsSavingBulk(true);

    let successCount = 0;
    for (const item of importList) {
        const payload = {
            type: 'SINGLE',
            scryfall_id: item.scryfall_card.scryfall_id,
            card_name: item.scryfall_card.name,
            set_code: item.scryfall_card.set_code,
            collector_number: item.scryfall_card.collector_number,
            image_url: item.scryfall_card.image_url,
            // Valores editados
            price: Number(item.price),
            stock: Number(item.stock),
            condition: item.condition,
            language: item.language,
            is_foil: item.is_foil
        };

        const ok = await saveToInventory(payload);
        if (ok) successCount++;
    }

    setIsSavingBulk(false);
    alert(`Proceso finalizado.\n✅ Guardadas: ${successCount}\n❌ Fallidas: ${importList.length - successCount}`);
    
    if (successCount === importList.length) {
        setImportList([]); // Limpiar todo si salió perfecto
    } else {
        // Opcional: Dejar solo las fallidas en la lista? Por ahora limpiamos o dejamos a criterio.
        // Dejaremos la lista como está para reintentar si se quiere, o el usuario puede borrar manual.
    }
  };


  // ==========================================
  // LÓGICA SELLADO
  // ==========================================
  const saveSealedProduct = async () => {
    if (!sealedForm.name || !sealedForm.image_url) {
        alert("Datos incompletos"); return;
    }
    const success = await saveToInventory({
        type: 'SEALED',
        card_name: sealedForm.name,
        category: sealedForm.category,
        set_code: sealedForm.set_code,
        price: Number(sealedForm.price),
        stock: Number(sealedForm.stock),
        image_url: sealedForm.image_url,
        condition: 'NM', language: 'EN' 
    });

    if (success) {
        alert("¡Producto Sellado Agregado!");
        setSealedForm({ ...sealedForm, name: '', image_url: '' });
    } else {
        alert("Error al guardar");
    }
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 font-sans">
      {/* NAVBAR */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Lock className="text-amber-500" size={20}/>
                <h1 className="font-bold text-white text-xl tracking-wide">BLACK MARKET <span className="text-amber-500">ADMIN</span></h1>
            </div>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['manual', 'import', 'sealed', 'orders'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md font-bold transition-all text-sm uppercase flex items-center gap-2 ${activeTab === tab ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                    >
                        {tab === 'manual' && <><Search size={16}/> Búsqueda</>}
                        {tab === 'import' && <><FileText size={16}/> Importar</>}
                        {tab === 'sealed' && <><Package size={16}/> Sellado</>}
                        {/* AQUÍ AGREGAMOS EL BOTÓN QUE FALTABA */}
                        {tab === 'orders' && <><ShoppingBag size={16}/> Pedidos</>}
                    </button>
                ))}
            </div>
          </div>
      </nav>
      
      <div className="max-w-7xl mx-auto p-8">
        
        {/* === TAB 1: MANUAL (SINGLES) === */}
        {activeTab === 'manual' && (
            <div className="flex gap-8 animate-in fade-in duration-300">
                {/* Panel Izquierdo */}
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar carta..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-amber-500 outline-none text-lg placeholder-slate-500 shadow-inner" />
                        <button disabled={loading} className="bg-slate-800 hover:bg-slate-700 text-amber-500 px-8 rounded-xl transition flex items-center justify-center border border-slate-700">
                            {loading ? <RefreshCw className="animate-spin" /> : <Search size={24} />}
                        </button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {results.map((card) => (
                        <div key={card.scryfall_id} onClick={() => setSelectedCard(card)} className={`group cursor-pointer relative rounded-xl overflow-hidden transition-all duration-200 ${selectedCard?.scryfall_id === card.scryfall_id ? 'ring-4 ring-amber-500 scale-105 z-10 shadow-xl shadow-amber-900/20' : 'border-2 border-slate-800 hover:border-slate-600'}`}>
                            <img src={card.image_url} className="w-full h-full object-cover" loading="lazy" />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-xs text-white truncate">{card.name}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Panel Derecho */}
                {selectedCard && (
                    <div className="w-80 bg-slate-900 p-6 rounded-2xl border border-slate-800 h-fit sticky top-24 shadow-2xl animate-in slide-in-from-right-10 duration-300">
                        <div className="mb-6 flex gap-4 border-b border-slate-800 pb-4">
                             <img src={selectedCard.image_url} className="w-20 rounded-lg shadow-md" />
                             <div className="overflow-hidden">
                                 <h3 className="text-white font-bold text-lg leading-tight truncate">{selectedCard.name}</h3>
                                 <span className="text-xs bg-slate-800 text-amber-500 px-2 py-1 rounded mt-1 inline-block border border-slate-700">{selectedCard.set_code.toUpperCase()} #{selectedCard.collector_number}</span>
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Estado</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-amber-500 outline-none"
                                        value={manualForm.condition} onChange={e => setManualForm({...manualForm, condition: e.target.value})}>
                                        {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Idioma</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-amber-500 outline-none"
                                        value={manualForm.language} onChange={e => setManualForm({...manualForm, language: e.target.value})}>
                                        {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Stock</label>
                                    <input type="number" min="1" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-amber-500 outline-none" 
                                        value={manualForm.stock} onChange={e=>setManualForm({...manualForm, stock: e.target.value})} />
                                </div>
                                <div className="flex items-end">
                                    <label className={`w-full flex items-center justify-center gap-2 border rounded-lg p-2 cursor-pointer transition-all ${manualForm.is_foil ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                        <input type="checkbox" className="hidden" checked={manualForm.is_foil} onChange={e => setManualForm({...manualForm, is_foil: e.target.checked})} />
                                        <span className="text-sm font-bold">✨ Foil</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Precio (CLP)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-slate-500">$</span>
                                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 pl-6 text-white font-mono focus:border-amber-500 outline-none" 
                                        value={manualForm.price} onChange={e=>setManualForm({...manualForm, price: e.target.value})} />
                                </div>
                            </div>
                            <button onClick={saveManual} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2 mt-2">
                                <Save size={18}/> Guardar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* === TAB 2: IMPORTAR TEXTO === */}
        {activeTab === 'import' && (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
                {importList.length === 0 && (
                    <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-xl mb-8">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Importar desde Texto</h2>
                            <textarea className="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-300 focus:border-amber-500 outline-none mb-4"
                                placeholder={"1 Black Lotus (LEA) 232\n1 Sol Ring (UNF) 100 *F*"}
                                value={importText} onChange={(e) => setImportText(e.target.value)} />
                            <div className="flex justify-between items-center">
                                <label className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-2">
                                    <Upload size={16}/> Subir archivo .txt
                                    <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                                </label>
                                <button onClick={processImportText} disabled={isProcessing || !importText.trim()} className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-3 rounded-xl font-bold transition">
                                    {isProcessing ? 'Procesando...' : <><RefreshCw size={18}/> Procesar Lista</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Aquí iría la tabla de revisión si tienes el código completo */}
                {importList.length > 0 && <div className="text-center text-slate-500">Vista previa de importación (código abreviado para el ejemplo)</div>}
            </div>
        )}

        {/* === TAB 3: SELLADO === */}
        {activeTab === 'sealed' && (
            <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
                <div className="bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
                        <Package className="text-blue-500" size={32} />
                        <div>
                            <h2 className="text-2xl font-bold text-white">Ingresar Producto Sellado</h2>
                            <p className="text-slate-400 text-sm">Cajas, Mazos, Bundles y Accesorios</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Nombre del Producto */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Nombre del Producto</label>
                            <input 
                                type="text" 
                                placeholder="Ej: Play Booster Box - Modern Horizons 3"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none transition"
                                value={sealedForm.name}
                                onChange={e => setSealedForm({...sealedForm, name: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-4">
                            {/* Categoría */}
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Categoría</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={sealedForm.category}
                                    onChange={e => setSealedForm({...sealedForm, category: e.target.value})}
                                >
                                    <option>Booster Box</option>
                                    <option>Booster Pack</option> {/* <-- Agregado */}
                                    <option>Commander Deck</option>
                                    <option>Bundle</option>
                                    <option>Prerelease Kit</option>
                                    <option>Collector Booster</option>
                                    <option>Starter Kit</option> {/* <-- Agregado (Mazos de inicio) */}
                                    <option>Gift Edition</option> {/* <-- Agregado (Ediciones especiales) */}
                                    <option>Accessory</option> {/* Protectores, dados, playmats */}
                                </select>
                            </div>
                            {/* Set Code (Opcional) */}
                            <div className="w-1/3">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Set (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: MH3"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white uppercase focus:border-blue-500 outline-none"
                                    value={sealedForm.set_code}
                                    onChange={e => setSealedForm({...sealedForm, set_code: e.target.value.toUpperCase()})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            {/* Precio */}
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Precio (CLP)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={sealedForm.price}
                                    onChange={e => setSealedForm({...sealedForm, price: e.target.value})}
                                />
                            </div>
                            {/* Stock */}
                            <div className="w-1/3">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Stock</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                    value={sealedForm.stock}
                                    onChange={e => setSealedForm({...sealedForm, stock: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* URL Imagen */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                <ImageIcon size={16}/> URL de la Imagen
                            </label>
                            <input 
                                type="text" 
                                placeholder="Pega aquí el enlace de la foto..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm focus:border-blue-500 outline-none"
                                value={sealedForm.image_url}
                                onChange={e => setSealedForm({...sealedForm, image_url: e.target.value})}
                            />
                        </div>

                        {/* Previsualización */}
                        {sealedForm.image_url && (
                            <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center">
                                <img src={sealedForm.image_url} alt="Vista previa" className="h-40 object-contain rounded" />
                            </div>
                        )}

                        <button 
                            onClick={saveSealedProduct}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={20} /> Guardar Producto Sellado
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* === TAB 4: PEDIDOS (AQUÍ ESTÁ LO QUE FALTABA) === */}
        {activeTab === 'orders' && (
            <div className="animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ShoppingBag className="text-amber-500"/> Gestión de Pedidos
                    </h2>
                    <button onClick={fetchOrders} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold border border-slate-700">
                        <RefreshCw size={16} className={loadingOrders ? 'animate-spin' : ''}/> Actualizar
                    </button>
                </div>

                {loadingOrders ? (
                    <div className="text-center py-20 text-slate-500">Cargando pedidos...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
                        <p className="text-slate-500 text-lg">No hay pedidos pendientes.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div key={order.id} className={`bg-slate-900 border rounded-xl overflow-hidden shadow-lg transition-all ${order.status === 'COMPLETED' ? 'border-slate-800 opacity-75' : 'border-slate-700'}`}>
                                
                                {/* Header del Pedido */}
                                <div className="bg-slate-950 p-4 border-b border-slate-800 flex flex-wrap justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-amber-600 text-white font-mono font-bold px-3 py-1 rounded text-lg">
                                            #{order.id}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white flex items-center gap-2">
                                                <User size={16} className="text-slate-400"/> {order.customer_name}
                                            </h3>
                                            <p className="text-sm text-slate-400 flex items-center gap-2">
                                                <Phone size={14} className="text-slate-500"/> {order.contact_info}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Estado y Fecha */}
                                    <div className="text-right flex flex-col items-end gap-1">
                                        {getStatusBadge(order.status || 'PENDING')}
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Calendar size={12}/> {new Date(order.created_at).toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                </div>

                                {/* Lista de Ítems */}
                                <div className="p-4 bg-slate-900/50 max-h-60 overflow-y-auto">
                                    <table className="w-full text-left text-sm text-slate-300">
                                        <thead className="text-xs text-slate-500 uppercase border-b border-slate-800">
                                            <tr>
                                                <th className="pb-2">Cant</th>
                                                <th className="pb-2">Producto</th>
                                                <th className="pb-2">Set</th>
                                                <th className="pb-2 text-right">Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {order.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-800/50">
                                                    <td className="py-2 font-mono text-amber-500 font-bold w-12 text-center">{item.quantity}x</td>
                                                    <td className="py-2 font-medium text-white">{item.card_name}</td>
                                                    <td className="py-2 text-xs uppercase text-slate-500">{item.set_code} ({item.condition}) {item.is_foil && '✨'}</td>
                                                    <td className="py-2 text-right font-mono text-slate-400">${item.price.toLocaleString('es-CL')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Footer de Acciones (Botones Dinámicos) */}
                                <div className="bg-slate-950 p-3 border-t border-slate-800 flex justify-between items-center">
                                    <div className="text-xl font-bold text-green-500 ml-2">
                                        Total: ${order.total.toLocaleString('es-CL')}
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Botones según el estado actual (Roadmap) */}
                                        
                                        {(!order.status || order.status === 'PENDING') && (
                                            <>
                                                <button 
                                                    onClick={() => updateOrderStatus(order.id, 'REJECTED')}
                                                    className="px-3 py-2 rounded-lg text-xs font-bold text-red-400 hover:bg-red-900/20 border border-transparent hover:border-red-900/50 transition"
                                                >
                                                    Cancelar
                                                </button>
                                                <button 
                                                    onClick={() => updateOrderStatus(order.id, 'IN_PROGRESS')}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition"
                                                >
                                                    🔨 Poner En Curso
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'IN_PROGRESS' && (
                                            <button 
                                                onClick={() => updateOrderStatus(order.id, 'READY')}
                                                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-amber-900/20 flex items-center gap-2 transition"
                                            >
                                                📦 Listo para Retiro
                                            </button>
                                        )}

                                        {order.status === 'READY' && (
                                            <button 
                                                onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-green-900/20 flex items-center gap-2 transition"
                                            >
                                                ✅ Marcar Retirado
                                            </button>
                                        )}

                                        {(order.status === 'COMPLETED' || order.status === 'REJECTED') && (
                                            <span className="text-xs text-slate-500 italic px-2">Pedido finalizado</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
}
