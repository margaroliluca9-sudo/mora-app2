import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  PlusCircle,
  Save,
  Download,
  HardHat,
  Factory,
  Wrench,
  History,
  User,
  X,
  Trash2,
  Lock,
  Settings,
  ChevronRight,
  ChevronDown,
  Monitor,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  CloudUpload,
  Database,
  FileSpreadsheet,
  RefreshCw,
  Layers,
  Calendar,
  ClipboardList,
  Share2,
  TrendingUp,
  Edit,
  Weight,
  Maximize2,
  Users,
  Unlock,
  Clock,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Eye,
  LogIn,
  Tablet,
  Laptop,
  ChevronsUpDown,
  Check,
  Menu,
  SaveAll,
  LayoutGrid,
  Wifi, // Icona Wifi
  WifiOff, // Icona Wifi Off
} from "lucide-react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  getDocs,
  arrayUnion,
  arrayRemove,
  enableIndexedDbPersistence, // Import per la persistenza offline
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadString,
} from "firebase/storage";

// --- Configurazione Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCQ3VhCtvxIP2cxtdSgMzYXaTg4E1zPlZE",
  authDomain: "mora-app-36607.firebaseapp.com",
  projectId: "mora-app-36607",
  storageBucket: "mora-app-36607.firebasestorage.app",
  messagingSenderId: "1039836991600",
  appId: "1:1039836991600:web:dc33445a0cd54a9473e4b5",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = "mora-maintenance-v1";

// --- ABILITAZIONE OFFLINE (PERSISTENZA) ---
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == "failed-precondition") {
      console.log("La persistenza fallisce se più tab sono aperti.");
    } else if (err.code == "unimplemented") {
      console.log("Il browser corrente non supporta la persistenza.");
    }
  });
} catch (e) {
  console.log("Persistenza già abilitata o errore:", e);
}

const ADMIN_PASSWORD = "Mora1932";

// --- HELPER ---
const getDeviceDetails = () => {
  const ua = navigator.userAgent;
  if (/iPad/i.test(ua) || (/Mac/i.test(ua) && "ontouchend" in document))
    return "iPad";
  if (/Tablet|Android/i.test(ua) && !/Mobile/i.test(ua))
    return "Tablet Android";
  if (/iPhone/i.test(ua)) return "iPhone";
  if (/Android/i.test(ua)) return "Android Smartphone";
  if (/Win/i.test(ua)) return "PC Windows";
  if (/Mac/i.test(ua)) return "Mac";
  if (/Linux/i.test(ua)) return "Linux PC";
  return "Dispositivo Web";
};

// --- COMPONENTI AUSILIARI ---

function NavButton({ icon: Icon, label, active, onClick, desktop = false }) {
  if (desktop) {
    return (
      <button
        onClick={onClick}
        className={`px-5 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all duration-200 ${
          active
            ? "bg-white text-blue-700 shadow-md"
            : "text-blue-100 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center gap-1.5 group"
    >
      <div
        className={`p-2.5 rounded-2xl transition-all duration-200 ${
          active
            ? "bg-blue-50 text-blue-600"
            : "text-slate-400 group-hover:text-blue-500 group-hover:bg-slate-50"
        }`}
      >
        <Icon
          className={active ? "w-6 h-6" : "w-6 h-6"}
          strokeWidth={active ? 2.5 : 2}
        />
      </div>
      <span
        className={`text-[9px] font-black uppercase tracking-tight transition-colors ${
          active ? "text-blue-600" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

function AdminTab({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
        active
          ? "bg-blue-700 text-white shadow-md"
          : "text-slate-400 hover:bg-slate-50"
      }`}
    >
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
}

function AdminLoginModal({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const handleLogin = () => {
    if (pin === ADMIN_PASSWORD) onSuccess();
    else {
      setError(true);
      setPin("");
    }
  };
  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[150] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-xs w-full p-10 space-y-8 animate-in zoom-in-95 border border-white/20">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Lock className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">
            Accesso Admin
          </h3>
          <p className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-3">
            Area Riservata
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            autoFocus
            className={`w-full p-5 bg-slate-50 border-4 rounded-2xl text-center text-3xl font-black tracking-[0.5em] outline-none transition-all ${
              error
                ? "border-red-500 animate-bounce bg-red-50"
                : "border-slate-100 focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-50"
            }`}
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleLogin}
            className="w-full py-4 bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-blue-800 hover:-translate-y-0.5 transition-all"
          >
            Conferma
          </button>
          <button
            onClick={onCancel}
            className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({
  onConfirm,
  onCancel,
  pin,
  setPin,
  error,
  title,
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full text-center space-y-6 shadow-2xl">
        <Lock className="w-12 h-12 text-red-500 mx-auto" />
        <div className="space-y-2">
          <h4 className="font-black text-slate-800 uppercase text-sm">
            {title}
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase">
            PIN richiesto
          </p>
        </div>
        <input
          type="password"
          placeholder="••••"
          className={`w-full p-4 bg-slate-50 border-2 rounded-xl text-center text-2xl font-black outline-none transition-all ${
            error ? "border-red-500" : "border-slate-100 focus:border-blue-500"
          }`}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
          }}
          onKeyDown={(e) => e.key === "Enter" && onConfirm()}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onConfirm}
            className="py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-red-200 active:scale-95 transition-all"
          >
            Elimina
          </button>
          <button
            onClick={onCancel}
            className="py-4 bg-slate-100 text-slate-400 rounded-xl font-black text-xs uppercase active:scale-95 transition-all"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

function EditLogModal({ log, customers, technicians, machineTypes, onClose }) {
  const [data, setData] = useState({ ...log });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "maintenance_logs",
          log.id
        ),
        {
          technician: data.technician,
          customer: data.customer,
          machineId: data.machineId.toUpperCase(),
          machineType: data.machineType,
          capacity: data.capacity,
          description: data.description,
          dateString: data.dateString,
        }
      );
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-black text-slate-600 uppercase tracking-widest text-xs">
            Modifica Rapporto
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                Tecnico
              </label>
              <select
                className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
                value={data.technician}
                onChange={(e) =>
                  setData({ ...data, technician: e.target.value })
                }
              >
                {technicians.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                Data (GG/MM/AAAA)
              </label>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
                value={data.dateString}
                onChange={(e) =>
                  setData({ ...data, dateString: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
              Cliente
            </label>
            <select
              className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
              value={data.customer}
              onChange={(e) => setData({ ...data, customer: e.target.value })}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                Matricola
              </label>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-black uppercase"
                value={data.machineId}
                onChange={(e) =>
                  setData({ ...data, machineId: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                Tipo
              </label>
              <select
                className="w-full p-3 bg-slate-50 rounded-xl border text-xs font-bold"
                value={data.machineType}
                onChange={(e) =>
                  setData({ ...data, machineType: e.target.value })
                }
              >
                {machineTypes.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
                Portata
              </label>
              <input
                type="text"
                className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
                value={data.capacity || ""}
                onChange={(e) => setData({ ...data, capacity: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
              Descrizione
            </label>
            <textarea
              rows="4"
              className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-medium"
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
            />
          </div>
        </div>
        <div className="p-6 border-t bg-slate-50">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
          >
            {loading ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMachineModal({ machine, customers, machineTypes, onClose }) {
  const [data, setData] = useState({ ...machine });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await setDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "machines",
          machine.id.toLowerCase()
        ),
        {
          id: machine.id, // Keep original ID case
          customerName: data.customerName,
          type: data.type,
          capacity: data.capacity,
        },
        { merge: true }
      );
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 z-[200] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
          <h3 className="font-black text-slate-600 uppercase tracking-widest text-xs">
            Modifica Gru: {machine.id}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
              Cliente
            </label>
            <select
              className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
              value={data.customerName}
              onChange={(e) =>
                setData({ ...data, customerName: e.target.value })
              }
            >
              {customers.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
              Tipo
            </label>
            <select
              className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
            >
              {machineTypes.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">
              Portata
            </label>
            <input
              type="text"
              className="w-full p-3 bg-slate-50 rounded-xl border text-sm font-bold"
              value={data.capacity || ""}
              onChange={(e) => setData({ ...data, capacity: e.target.value })}
              placeholder="Es. 1000kg"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest mt-4"
          >
            {loading ? "..." : "Salva Modifiche"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MachineHistoryModal({ machineId, machines, allLogs, onClose }) {
  const liveMachine = useMemo(() => {
    return (
      machines.find((m) => m.id.toLowerCase() === machineId.toLowerCase()) || {
        id: machineId,
        customerName: "...",
        type: "...",
        capacity: "...",
      }
    );
  }, [machines, machineId]);

  const machineLogs = useMemo(() => {
    return allLogs.filter((l) => l.machineId === liveMachine.id);
  }, [allLogs, liveMachine]);

  const [tab, setTab] = useState("history");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(
        storage,
        `machines/${liveMachine.id}/${Date.now()}_${file.name}`
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await updateDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "machines",
          liveMachine.id.toLowerCase()
        ),
        {
          attachments: arrayUnion({
            name: file.name,
            url: downloadURL,
            type: file.type,
            uploadedAt: Date.now(),
          }),
        }
      );
    } catch (err) {
      console.error("Upload failed", err);
      alert("Errore caricamento: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (att) => {
    if (!window.confirm("Eliminare questo file?")) return;
    try {
      await updateDoc(
        doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          "machines",
          liveMachine.id.toLowerCase()
        ),
        {
          attachments: arrayRemove(att),
        }
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-50 w-full max-w-4xl h-[90vh] rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-blue-700 p-6 flex flex-col gap-4 text-white shrink-0 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <Factory className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter leading-none">
                  {liveMachine.customerName || liveMachine.customer}
                </h2>
                <div className="flex flex-wrap gap-2 text-xs font-medium text-blue-200 mt-2">
                  <span className="bg-white/20 px-2 py-1 rounded border border-white/10">
                    MAT: {liveMachine.id}
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded border border-white/10">
                    TIPO: {liveMachine.type}
                  </span>
                  {liveMachine.capacity && (
                    <span className="bg-white/20 px-2 py-1 rounded border border-white/10">
                      PORTATA: {liveMachine.capacity}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setTab("history")}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                tab === "history"
                  ? "bg-white text-blue-700 shadow-md"
                  : "bg-blue-800/50 text-blue-300 hover:bg-blue-800"
              }`}
            >
              Interventi ({machineLogs.length})
            </button>
            <button
              onClick={() => setTab("docs")}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                tab === "docs"
                  ? "bg-white text-blue-700 shadow-md"
                  : "bg-blue-800/50 text-blue-300 hover:bg-blue-800"
              }`}
            >
              Documenti ({(liveMachine.attachments || []).length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100">
          {tab === "history" ? (
            <div className="space-y-6">
              {machineLogs.map((log, idx) => (
                <div key={log.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full ring-4 ring-blue-100 mt-2 shrink-0"></div>
                    {idx !== machineLogs.length - 1 && (
                      <div className="w-0.5 bg-blue-200 flex-1 my-2"></div>
                    )}
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-1 hover:border-blue-300 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-blue-600 font-black text-xs uppercase tracking-widest">
                        {log.dateString}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase">
                          {log.technician}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed font-medium">
                      "{log.description}"
                    </p>
                  </div>
                </div>
              ))}
              {machineLogs.length === 0 && (
                <div className="text-center py-20 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  Nessun intervento registrato
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors relative">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={uploading}
                  accept="image/*,application/pdf"
                />
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                    {uploading ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <CloudUpload className="w-6 h-6" />
                    )}
                  </div>
                  <span className="font-black text-xs uppercase text-slate-500 tracking-widest">
                    {uploading
                      ? "Caricamento in corso..."
                      : "Tocca per caricare foto o PDF"}
                  </span>
                </div>
              </div>

              {/* File List */}
              <div className="grid grid-cols-2 gap-4">
                {(liveMachine.attachments || []).map((att, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 relative group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      {att.type?.includes("image") ? (
                        <ImageIcon className="w-5 h-5 text-purple-500" />
                      ) : (
                        <FileText className="w-5 h-5 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(att.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteAttachment(att)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {(!liveMachine.attachments ||
                liveMachine.attachments.length === 0) && (
                <div className="text-center py-10 text-slate-400 font-bold uppercase text-xs tracking-widest">
                  Nessun documento allegato
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ onNavigate }) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate("new")}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all hover:shadow-2xl hover:border-blue-200"
        >
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
            <PlusCircle className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
              Nuovo
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Inserisci Rapporto
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("history")}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all hover:shadow-2xl hover:border-emerald-200"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <History className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-emerald-600 transition-colors">
              Storico
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Cerca Interventi
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("admin")}
          className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center gap-4 group hover:scale-[1.02] transition-all hover:shadow-2xl hover:border-slate-300"
        >
          <div className="w-20 h-20 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors duration-300">
            <Settings className="w-10 h-10" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-1 group-hover:text-slate-700 transition-colors">
              Admin
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Gestione Dati
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

// --- APP PRINCIPALE ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // Partenza dalla Dashboard
  const [logs, setLogs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [machines, setMachines] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [manualViewMode, setManualViewMode] = useState(null);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [pendingTab, setPendingTab] = useState(null);

  // Stato connessione
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listener per lo stato online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!window.tailwind && !document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const currentViewIsMobile = useMemo(() => {
    if (manualViewMode === "mobile") return true;
    if (manualViewMode === "desktop") return false;
    return isMobileView;
  }, [manualViewMode, isMobileView]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        const doLogin = async () => {
          try {
            if (
              typeof __initial_auth_token !== "undefined" &&
              __initial_auth_token
            ) {
              await signInWithCustomToken(auth, __initial_auth_token);
            } else {
              await signInAnonymously(auth);
            }
          } catch (e) {
            console.error("Login error:", e);
          }
        };
        doLogin();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const logAccess = async () => {
      const savedTechName = localStorage.getItem("mora_tech_last_name");
      const sessionKey = `mora_access_logged_${new Date().toDateString()}`;
      if (savedTechName && !sessionStorage.getItem(sessionKey)) {
        try {
          await addDoc(
            collection(db, "artifacts", appId, "public", "data", "access_logs"),
            {
              technician: savedTechName,
              uid: user.uid,
              timestamp: serverTimestamp(),
              device: getDeviceDetails(),
              userAgent: navigator.userAgent,
            }
          );
          sessionStorage.setItem(sessionKey, "true");
        } catch (e) {
          console.error("Error logging access", e);
        }
      }
    };
    logAccess();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubLogs = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "maintenance_logs"),
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetched.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setLogs(fetched);
        setLoading(false);
      }
    );
    const unsubCustomers = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "customers"),
      (snapshot) => {
        setCustomers(
          snapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      }
    );
    const unsubTechs = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "technicians"),
      (snapshot) => {
        setTechnicians(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );
    const unsubMachines = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "machines"),
      (snapshot) => {
        setMachines(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      }
    );
    const unsubTypes = onSnapshot(
      collection(db, "artifacts", appId, "public", "data", "machine_types"),
      (snapshot) => {
        const types = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        if (types.length === 0) {
          setMachineTypes([
            { id: "carroponte", name: "Carroponte" },
            { id: "gru_bandiera", name: "Gru Bandiera" },
          ]);
        } else {
          setMachineTypes(types.sort((a, b) => a.name.localeCompare(b.name)));
        }
      }
    );
    return () => {
      unsubLogs();
      unsubCustomers();
      unsubTechs();
      unsubMachines();
      unsubTypes();
    };
  }, [user]);

  const sortedTechnicians = useMemo(() => {
    const counts = {};
    logs.forEach((log) => {
      counts[log.technician] = (counts[log.technician] || 0) + 1;
    });
    return [...technicians].sort((a, b) => {
      const countA = counts[a.name] || 0;
      const countB = counts[b.name] || 0;
      if (countB !== countA) return countB - countA;
      return a.name.localeCompare(b.name);
    });
  }, [technicians, logs]);

  const machineMap = useMemo(() => {
    const map = {};
    machines.forEach((m) => {
      if (m.id)
        map[m.id.toLowerCase().trim()] = {
          customer: m.customerName,
          type: m.type,
          capacity: m.capacity || "",
        };
    });
    return map;
  }, [machines]);

  const handleTabChange = (tab) => {
    if (tab === "admin" && !isAdminAuthenticated) {
      setPendingTab("admin");
      setShowAdminLogin(true);
    } else {
      setActiveTab(tab);
    }
  };

  const onAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminLogin(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const toggleViewMode = () => {
    if (currentViewIsMobile) setManualViewMode("desktop");
    else setManualViewMode("mobile");
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 font-sans relative transition-all ${
        currentViewIsMobile ? "pb-24" : ""
      }`}
    >
      <header className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
              <HardHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black leading-none uppercase tracking-tighter">
                Manutenzioni Mora
              </h1>
            </div>
          </div>

          {!currentViewIsMobile && (
            <div className="flex items-center gap-1 bg-blue-800/50 p-1.5 rounded-2xl border border-white/5">
              <NavButton
                icon={PlusCircle}
                label="Nuovo"
                active={activeTab === "new"}
                onClick={() => handleTabChange("new")}
                desktop
              />
              <NavButton
                icon={History}
                label="Storico"
                active={activeTab === "history"}
                onClick={() => handleTabChange("history")}
                desktop
              />
              <NavButton
                icon={Settings}
                label="Admin"
                active={activeTab === "admin"}
                onClick={() => handleTabChange("admin")}
                desktop
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                isOnline
                  ? "bg-green-500/20 text-green-200"
                  : "bg-red-500/20 text-red-200"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-green-400 animate-pulse" : "bg-red-500"
                }`}
              ></span>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </div>
            <button
              onClick={toggleViewMode}
              title="Cambia visualizzazione"
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-blue-100 hover:text-white"
            >
              {currentViewIsMobile ? (
                <Monitor className="w-5 h-5" />
              ) : (
                <Smartphone className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {currentViewIsMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-[60] flex shadow-[0_-4px_20px_rgba(0,0,0,0.05)] h-20 px-6 pb-4 pt-2 justify-around items-center">
          <NavButton
            icon={PlusCircle}
            label="Nuovo"
            active={activeTab === "new"}
            onClick={() => handleTabChange("new")}
          />
          <NavButton
            icon={History}
            label="Storico"
            active={activeTab === "history"}
            onClick={() => handleTabChange("history")}
          />
          <NavButton
            icon={Settings}
            label="Admin"
            active={activeTab === "admin"}
            onClick={() => handleTabChange("admin")}
          />
        </nav>
      )}

      <main
        className={`max-w-6xl mx-auto ${currentViewIsMobile ? "p-4" : "p-8"} ${
          manualViewMode === "mobile" ? "max-w-[480px]" : ""
        } transition-all duration-300`}
      >
        {!user ? (
          <div className="flex flex-col items-center justify-center py-40 text-slate-400 gap-4">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="font-black uppercase tracking-[0.3em] text-xs">
              Caricamento...
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {activeTab === "dashboard" && (
              <DashboardView onNavigate={(tab) => handleTabChange(tab)} />
            )}
            {activeTab === "new" && (
              <NewEntryForm
                user={user}
                customers={customers}
                technicians={sortedTechnicians}
                machineTypes={machineTypes}
                machineMap={machineMap}
                machines={machines}
                onSuccess={() => setActiveTab("history")}
                isMobile={currentViewIsMobile}
              />
            )}
            {activeTab === "history" && (
              <HistoryView
                logs={logs}
                machineMap={machineMap}
                loading={loading}
                isMobile={currentViewIsMobile}
                isAdmin={isAdminAuthenticated}
                customers={customers}
                technicians={technicians}
                machineTypes={machineTypes}
                machines={machines}
                onAuthAdmin={() => {
                  setPendingTab(null);
                  setShowAdminLogin(true);
                }}
              />
            )}
            {activeTab === "admin" && isAdminAuthenticated && (
              <AdminPanel
                logs={logs}
                customers={customers}
                technicians={technicians}
                machines={machines}
                machineTypes={machineTypes}
                isMobile={currentViewIsMobile}
              />
            )}
          </div>
        )}
      </main>

      {showAdminLogin && (
        <AdminLoginModal
          onSuccess={onAdminLoginSuccess}
          onCancel={() => {
            setShowAdminLogin(false);
            setPendingTab(null);
          }}
        />
      )}
    </div>
  );
}
