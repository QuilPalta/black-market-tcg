'use client';
import { useState } from 'react';
import { Search, Save, Lock, Upload, FileText, Trash2, Package, Image as ImageIcon } from 'lucide-react';

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
  const [manualForm, setManualForm] = useState({ price: 1000, stock: 1, condition: 'NM', language: 'EN', is_foil: false });

  // --- ESTADOS IMPORT (ManaBox) ---
  const [importText, setImportText] = useState('');
  const [parsedCards, setParsedCards] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- ESTADOS SELLADO (Nuevo) ---
  const [sealedForm, setSealedForm] = useState({
    name: '',
    category: 'Booster Box', // Default
    set_code: '',
    price: 50000,
    stock: 5,
    image_url: ''
  });

  // --- LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'blacklotus') setIsAuthenticated(true);
    else alert("Acceso denegado.");
  };

  if (!isAuthenticated) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl text-center">
                <Lock className="text-amber-500 w-12 h-12 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-4">Black Market Admin</h1>
                <form onSubmit={handleLogin}><input type="password" value={passwordInput} onChange={e=>setPasswordInput(e.target.value)} className="bg-slate-950 border border-slate-700 rounded px-4 py-2 text-white" placeholder="Clave de acceso" /><button className="mt-4 w-full bg-amber-600 text-white font-bold py-2 rounded">Entrar</button></form>
            </div>
        </div>
    );
  }

  // --- FUNCIONES COMUNES ---
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

  // --- LÓGICA SINGLES (Manual/Import) - Resumida para no repetir código innecesario ---
  const handleSearch = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
        const res = await fetch(`http://localhost:4000/api/search?q=${query}`);
        const data = await res.json(); setResults(data);
    } catch (err) { alert("Error buscando"); } finally { setLoading(false); }
  };

  const saveManual = async () => {
    if(!selectedCard) return;
    await saveToInventory({ ...manualForm, type: 'SINGLE', scryfall_id: selectedCard.scryfall_id, card_name: selectedCard.name, set_code: selectedCard.set_code, collector_number: selectedCard.collector_number, image_url: selectedCard.image_url });
    alert("Single Guardado!"); setSelectedCard(null);
  };

  // ==========================================
  // LÓGICA IMPORTACIÓN (MANABOX)
  // ==========================================
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        setImportText(event.target.result);
    };
    reader.readAsText(file);
  };

  const processImport = async () => {
    setIsProcessing(true);
    const lines = importText.split('\n');
    const identifiers = [];
    const metadata = []; // Guardamos cantidad, foil, etc. para unirlo después

    // 1. Parsear TXT (Formato: "1 Saheeli (DRC) 3 *F*")
    // Regex: Cantidad | Nombre | (SET) | Numero | Flags
    const regex = /^(\d+)\s+(.+)\s+\(([A-Za-z0-9]+)\)\s+([A-Za-z0-9]+)(.*)$/;

    lines.forEach(line => {
        const match = line.trim().match(regex);
        if (match) {
            const [_, qty, name, set, cn, flags] = match;
            identifiers.push({ set: set.toLowerCase(), collector_number: cn });
            metadata.push({ 
                qty: parseInt(qty), 
                is_foil: flags.includes('*F*'),
                temp_id: `${set}-${cn}` // ID temporal para unir
            });
        }
    });

    if (identifiers.length === 0) {
        alert("No se detectaron cartas válidas. Revisa el formato.");
        setIsProcessing(false);
        return;
    }

    // 2. Pedir datos a Scryfall (En lotes de 75 si fuera necesario, aquí simplificado a 1 lote)
    try {
        // Nota: Si tienes más de 75 cartas, aquí deberías hacer un loop chunking.
        const res = await fetch('http://localhost:4000/api/search-bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifiers: identifiers })
        });
        const scryfallData = await res.json();

        // 3. Unir datos de Scryfall con metadatos del TXT (Cantidad, Foil)
        const combined = scryfallData.map(card => {
            // Buscamos el metadata correspondiente (puede haber duplicados, esto es simple matching)
            const meta = metadata.find(m => 
                m.temp_id.toLowerCase() === `${card.set_code}-${card.collector_number}`.toLowerCase()
            );
            return {
                ...card,
                stock_to_add: meta ? meta.qty : 1,
                is_foil_to_add: meta ? meta.is_foil : false,
                price_to_add: 0, // Precio por defecto
                condition_to_add: 'NM',
                language_to_add: 'EN'
            };
        });

        setParsedCards(combined);

    } catch (err) {
        console.error(err);
        alert("Error procesando importación");
    } finally {
        setIsProcessing(false);
    }
  };

  // --- LÓGICA SELLADO ---
  const saveSealedProduct = async () => {
    if (!sealedForm.name || !sealedForm.image_url) {
        alert("El nombre y la URL de la imagen son obligatorios");
        return;
    }

    const success = await saveToInventory({
        type: 'SEALED', // Importante: Marca el producto como sellado
        card_name: sealedForm.name,
        category: sealedForm.category,
        set_code: sealedForm.set_code,
        price: sealedForm.price,
        stock: sealedForm.stock,
        image_url: sealedForm.image_url,
        // Datos rellenos que no aplican a sellado pero la DB pide
        condition: 'NM', language: 'EN' 
    });

    if (success) {
        alert("¡Producto Sellado Agregado!");
        setSealedForm({ ...sealedForm, name: '', image_url: '' }); // Limpiar formulario
    } else {
        alert("Error al guardar");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="font-bold text-amber-500 text-xl">ADMINISTRACIÓN</h1>
            <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['manual', 'import', 'sealed'].map((tab) => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded font-bold transition-all text-sm uppercase ${activeTab === tab ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab === 'manual' && 'Búsqueda'}
                        {tab === 'import' && 'ManaBox'}
                        {tab === 'sealed' && 'Ingreso Sellado'}
                    </button>
                ))}
            </div>
          </div>
      </nav>
      
      <div className="max-w-7xl mx-auto p-8">
        
        {/* === TAB 1: MANUAL (SINGLES) === */}
        {activeTab === 'manual' && (
            <div className="flex gap-8">
                <div className="flex-1">
                    <form onSubmit={handleSearch} className="flex gap-4 mb-8">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar Single en Scryfall..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3" />
                        <button disabled={loading} className="bg-slate-800 px-6 rounded-lg">{loading ? '...' : <Search />}</button>
                    </form>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {results.map((card) => (
                        <div key={card.scryfall_id} onClick={() => setSelectedCard(card)} className={`cursor-pointer border-2 rounded-xl overflow-hidden ${selectedCard?.scryfall_id === card.scryfall_id ? 'border-amber-500' : 'border-transparent'}`}>
                            <img src={card.image_url} className="w-full" />
                        </div>
                        ))}
                    </div>
                </div>
                {selectedCard && (
                    <div className="w-72 bg-slate-900 p-6 rounded-xl border border-slate-800 h-fit sticky top-24">
                        <h3 className="text-amber-500 font-bold mb-4">Guardar Single</h3>
                        <p className="font-bold mb-4">{selectedCard.name}</p>
                        <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 mb-2" value={manualForm.price} onChange={e=>setManualForm({...manualForm, price: e.target.value})} />
                        <button onClick={saveManual} className="w-full bg-green-600 py-2 rounded font-bold">Guardar</button>
                    </div>
                )}
            </div>
        )}

        {/* === TAB 3: SELLADO (NUEVO) === */}
        {activeTab === 'sealed' && (
            <div className="max-w-2xl mx-auto">
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
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                                value={sealedForm.name}
                                onChange={e => setSealedForm({...sealedForm, name: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-4">
                            {/* Categoría */}
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Categoría</label>
                                <select 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    value={sealedForm.category}
                                    onChange={e => setSealedForm({...sealedForm, category: e.target.value})}
                                >
                                    <option>Booster Box</option>
                                    <option>Commander Deck</option>
                                    <option>Bundle</option>
                                    <option>Prerelease Kit</option>
                                    <option>Collector Booster</option>
                                    <option>Accessory</option>
                                </select>
                            </div>
                            {/* Set Code (Opcional) */}
                            <div className="w-1/3">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Set (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: MH3"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white uppercase"
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
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                                    value={sealedForm.price}
                                    onChange={e => setSealedForm({...sealedForm, price: e.target.value})}
                                />
                            </div>
                            {/* Stock */}
                            <div className="w-1/3">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Stock</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
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
                                placeholder="Pega aquí el enlace de la foto (Google Images, Amazon, etc)..."
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-sm"
                                value={sealedForm.image_url}
                                onChange={e => setSealedForm({...sealedForm, image_url: e.target.value})}
                            />
                            <p className="text-xs text-slate-500 mt-2">Tip: Busca la caja en Google Imágenes, haz clic derecho y después "Copiar dirección de imagen".</p>
                        </div>

                        {/* Previsualización */}
                        {sealedForm.image_url && (
                            <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center">
                                <img src={sealedForm.image_url} alt="Vista previa" className="h-40 object-contain" />
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
      </div>
    </div>
  );
}