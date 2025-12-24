
import React, { useState, useRef } from 'react';
import { StudyPlan, Discipline, GoalType, CycleSystem, Folder, Subject, Meta, SubGoalAula } from '../../types';
import { db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface AdminPlansProps {
  plans: StudyPlan[];
  onUpdateLogo: (url: string) => void;
  onPreview: (planId: string) => void;
}

const AdminPlans: React.FC<AdminPlansProps> = ({ plans, onUpdateLogo, onPreview }) => {
  const [editingPlan, setEditingPlan] = useState<StudyPlan | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [modalType, setModalType] = useState<'FOLDER' | 'DISCIPLINE' | 'SUBJECT' | 'META' | null>(null);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [modalValue, setModalValue] = useState('');
  const [activeParentId, setActiveParentId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [editingSubject, setEditingSubject] = useState<{ discId: string, subjId: string } | null>(null);
  const [currentMeta, setCurrentMeta] = useState<Partial<Meta>>({
    type: GoalType.AULA,
    title: '',
    revisionEnabled: false,
    submetasAulas: [],
    color: '#ef4444',
    observations: '',
    pages: 0,
    link: '',
    multiplier: 1,
    revisionIntervals: '1,7,15,30',
    repeatLastInterval: false
  });

  const moveItem = <T,>(arr: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newArr = [...arr];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newArr.length) return arr;
    [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
    return newArr;
  };

  const handleCreatePlan = async () => {
    const newPlan: Omit<StudyPlan, 'id'> = {
      name: 'Novo Plano de Estudos',
      imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
      disciplines: [],
      folders: [],
      cycles: [],
      cycleSystem: CycleSystem.CONTINUOUS,
      lastUpdated: new Date().toISOString()
    };
    try {
      const docRef = await addDoc(collection(db, "plans"), newPlan);
      setEditingPlan({ ...newPlan, id: docRef.id } as StudyPlan);
    } catch (e) { console.error(e); }
  };

  const savePlan = async () => {
    if (!editingPlan || isSaving) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "plans", editingPlan.id), { 
        ...editingPlan, 
        lastUpdated: new Date().toISOString() 
      });
      setIsSaving(false);
      alert("Plano sincronizado com sucesso!");
    } catch (e) { 
      setIsSaving(false); 
      console.error(e); 
      alert("Erro ao sincronizar plano. Verifique sua conexão.");
    }
  };

  // Nova função de upload robusta
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingPlan) return;
    
    if (file.type !== 'application/pdf') {
      alert("Por favor, selecione apenas arquivos no formato PDF.");
      return;
    }

    if (file.size > 30 * 1024 * 1024) { // Limite 30MB
      alert("O arquivo é muito grande. Limite máximo: 30MB.");
      return;
    }

    setIsUploadingPDF(true);
    setUploadProgress(0);

    const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
    const storagePath = `plans/${editingPlan.id}/materials/${Date.now()}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      }, 
      (error) => {
        console.error("Upload Error:", error);
        setIsUploadingPDF(false);
        alert("Erro ao enviar arquivo. Verifique sua internet e tente novamente.");
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setCurrentMeta(prev => ({ ...prev, pdfUrl: downloadURL }));
        setIsUploadingPDF(false);
        setUploadProgress(100);
        alert("Arquivo PDF carregado com sucesso!");
      }
    );
  };

  const handleAction = () => {
    if (!editingPlan || !modalValue) return;
    const updatedPlan = { ...editingPlan };
    const newId = modalMode === 'ADD' ? Math.random().toString(36).substr(2, 9) : activeItemId!;

    if (modalType === 'FOLDER') {
      if (modalMode === 'ADD') updatedPlan.folders.push({ id: newId, name: modalValue, disciplineIds: [] });
      else updatedPlan.folders = updatedPlan.folders.map(f => f.id === newId ? { ...f, name: modalValue } : f);
    } else if (modalType === 'DISCIPLINE') {
      if (modalMode === 'ADD') updatedPlan.disciplines.push({ id: newId, name: modalValue, order: updatedPlan.disciplines.length, subjects: [] });
      else updatedPlan.disciplines = updatedPlan.disciplines.map(d => d.id === newId ? { ...d, name: modalValue } : d);
    } else if (modalType === 'SUBJECT' && activeParentId) {
      updatedPlan.disciplines = updatedPlan.disciplines.map(d => {
        if (d.id === activeParentId) {
          if (modalMode === 'ADD') return { ...d, subjects: [...d.subjects, { id: newId, title: modalValue, order: d.subjects.length, metas: [] }] };
          return { ...d, subjects: d.subjects.map(s => s.id === newId ? { ...s, title: modalValue } : s) };
        }
        return d;
      });
    }

    setEditingPlan(updatedPlan);
    setModalType(null);
    setModalValue('');
  };

  const saveMeta = () => {
    if (!editingPlan || !editingSubject || !currentMeta.title) return;
    const updatedPlan = { ...editingPlan };
    const metaToSave: Meta = {
      ...currentMeta as Meta,
      id: modalMode === 'ADD' ? Math.random().toString(36).substr(2, 9) : currentMeta.id!,
      order: currentMeta.order || 0
    };

    updatedPlan.disciplines = updatedPlan.disciplines.map(d => {
      if (d.id === editingSubject.discId) {
        return {
          ...d,
          subjects: d.subjects.map(s => {
            if (s.id === editingSubject.subjId) {
              const newMetas = modalMode === 'ADD' 
                ? [...s.metas, metaToSave]
                : s.metas.map(m => m.id === metaToSave.id ? metaToSave : m);
              return { ...s, metas: newMetas };
            }
            return s;
          })
        };
      }
      return d;
    });

    setEditingPlan(updatedPlan);
    setModalType(null);
  };

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setExpandedItems(newSet);
  };

  if (editingPlan) {
    return (
      <div className="max-w-6xl mx-auto pb-20 animate-in fade-in">
        <header className="mb-8 flex justify-between items-center bg-gray-950 p-6 rounded-2xl border border-gray-800 sticky top-4 z-20 shadow-xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setEditingPlan(null)} className="p-2 bg-gray-900 rounded-lg hover:text-white transition">←</button>
            <h1 className="text-xl font-futuristic text-white uppercase tracking-tighter">{editingPlan.name}</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={() => onPreview(editingPlan.id)} className="px-6 py-2 bg-gray-800 text-gray-300 font-bold rounded-lg text-xs font-futuristic hover:bg-gray-700 transition">PRÉVIA 👁️</button>
            <button onClick={savePlan} disabled={isSaving || isUploadingPDF} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg text-xs font-futuristic shadow-lg shadow-red-900/40 hover:bg-red-700 transition disabled:opacity-50">
              {isSaving ? 'SALVANDO...' : 'SINCRONIZAR 🔄'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
             <section className="glass-panel p-8 rounded-[32px] border border-gray-800">
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                   <h2 className="text-lg font-futuristic text-gray-200 uppercase tracking-widest">Estrutura do Plano</h2>
                   <div className="flex gap-2">
                      <button onClick={() => { setModalType('FOLDER'); setModalMode('ADD'); setModalValue(''); }} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-[10px] uppercase font-black hover:text-white transition">+ Pasta</button>
                      <button onClick={() => { setModalType('DISCIPLINE'); setModalMode('ADD'); setModalValue(''); }} className="px-3 py-1.5 bg-red-600 rounded-lg text-[10px] uppercase font-black text-white hover:bg-red-700 transition">+ Disciplina</button>
                   </div>
                </div>

                <div className="space-y-6">
                   {/* Pastas */}
                   {editingPlan.folders.map((folder, fIdx) => (
                      <div key={folder.id} className="bg-gray-900/20 border border-gray-800 rounded-2xl overflow-hidden group/folder">
                         <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/20" onClick={() => toggleExpand(folder.id)}>
                            <div className="flex items-center gap-4">
                               <div className="flex flex-col gap-1 opacity-0 group-hover/folder:opacity-100 transition">
                                  <button onClick={(e) => { e.stopPropagation(); setEditingPlan({...editingPlan, folders: moveItem(editingPlan.folders, fIdx, 'up')}) }} className="text-[10px] text-gray-500 hover:text-white">▲</button>
                                  <button onClick={(e) => { e.stopPropagation(); setEditingPlan({...editingPlan, folders: moveItem(editingPlan.folders, fIdx, 'down')}) }} className="text-[10px] text-gray-500 hover:text-white">▼</button>
                               </div>
                               <span className="text-xl">📂</span>
                               <span className="font-bold text-gray-300 uppercase text-xs tracking-widest leading-relaxed whitespace-pre-wrap">{folder.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                               <button onClick={(e) => { e.stopPropagation(); setModalType('FOLDER'); setModalMode('EDIT'); setActiveItemId(folder.id); setModalValue(folder.name); }} className="text-[9px] font-black text-blue-500 opacity-0 group-hover/folder:opacity-100 uppercase transition">Editar</button>
                               <button onClick={(e) => { e.stopPropagation(); if(confirm("Apagar pasta?")) setEditingPlan({...editingPlan, folders: editingPlan.folders.filter(f => f.id !== folder.id)}) }} className="text-[9px] font-black text-red-900 opacity-0 group-hover/folder:opacity-100 uppercase transition">Excluir</button>
                               <span className="text-gray-700">{expandedItems.has(folder.id) ? '▲' : '▼'}</span>
                            </div>
                         </div>
                      </div>
                   ))}

                   <div className="h-px bg-gray-900 my-8"></div>

                   {/* Disciplinas */}
                   {editingPlan.disciplines.map((disc, dIdx) => (
                      <div key={disc.id} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden group/disc">
                        <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-800/40" onClick={() => toggleExpand(disc.id)}>
                           <div className="flex items-center gap-4">
                              <div className="flex flex-col gap-1 opacity-0 group-hover/disc:opacity-100 transition">
                                 <button onClick={(e) => { e.stopPropagation(); setEditingPlan({...editingPlan, disciplines: moveItem(editingPlan.disciplines, dIdx, 'up')}) }} className="text-[10px] text-gray-500 hover:text-white">▲</button>
                                 <button onClick={(e) => { e.stopPropagation(); setEditingPlan({...editingPlan, disciplines: moveItem(editingPlan.disciplines, dIdx, 'down')}) }} className="text-[10px] text-gray-500 hover:text-white">▼</button>
                              </div>
                              <div className="w-1.5 h-6 bg-red-600 rounded-full"></div>
                              <span className="font-bold text-white uppercase text-sm tracking-widest leading-relaxed whitespace-pre-wrap">{disc.name}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <button onClick={(e) => { e.stopPropagation(); setModalType('DISCIPLINE'); setModalMode('EDIT'); setActiveItemId(disc.id); setModalValue(disc.name); }} className="text-[9px] font-black text-blue-500 opacity-0 group-hover/disc:opacity-100 uppercase transition">Renomear</button>
                              <button onClick={(e) => { e.stopPropagation(); if(confirm("Excluir disciplina e tudo nela?")) setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.filter(d => d.id !== disc.id)}) }} className="text-[9px] font-black text-red-900 opacity-0 group-hover/disc:opacity-100 uppercase transition">Excluir</button>
                              <button onClick={(e) => { e.stopPropagation(); setModalType('SUBJECT'); setModalMode('ADD'); setActiveParentId(disc.id); setModalValue(''); }} className="text-[10px] font-black text-red-500 bg-red-600/10 px-3 py-1 rounded-lg">+ Assunto</button>
                              <span className="text-gray-700">{expandedItems.has(disc.id) ? '▲' : '▼'}</span>
                           </div>
                        </div>
                        {expandedItems.has(disc.id) && (
                           <div className="p-4 bg-black/40 space-y-4 border-t border-gray-800/50">
                              {disc.subjects.map((subj, sIdx) => (
                                 <div key={subj.id} className="p-5 bg-gray-900/60 border border-gray-800 rounded-xl group/subj">
                                    <div className="flex justify-between items-center mb-6">
                                       <div className="flex items-center gap-3">
                                          <div className="flex flex-col gap-0.5 opacity-0 group-hover/subj:opacity-100 transition">
                                             <button onClick={() => setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.map(d => d.id === disc.id ? {...d, subjects: moveItem(d.subjects, sIdx, 'up')} : d)})} className="text-[8px] text-gray-500 hover:text-white">▲</button>
                                             <button onClick={() => setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.map(d => d.id === disc.id ? {...d, subjects: moveItem(d.subjects, sIdx, 'down')} : d)})} className="text-[8px] text-gray-500 hover:text-white">▼</button>
                                          </div>
                                          <span className="text-sm font-bold text-gray-300 leading-tight whitespace-pre-wrap">{subj.title}</span>
                                       </div>
                                       <div className="flex items-center gap-4">
                                          <button onClick={() => { setModalType('SUBJECT'); setModalMode('EDIT'); setActiveItemId(subj.id); setActiveParentId(disc.id); setModalValue(subj.title); }} className="text-[9px] font-black text-blue-500 opacity-0 group-hover/subj:opacity-100 uppercase transition">Editar</button>
                                          <button onClick={() => { if(confirm("Excluir assunto?")) setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.map(d => d.id === disc.id ? {...d, subjects: d.subjects.filter(s => s.id !== subj.id)} : d)}) }} className="text-[9px] font-black text-red-900 opacity-0 group-hover/subj:opacity-100 uppercase transition">Excluir</button>
                                          <button onClick={() => { setEditingSubject({discId: disc.id, subjId: subj.id}); setModalType('META'); setModalMode('ADD'); setCurrentMeta({ type: GoalType.AULA, title: '', revisionEnabled: false, submetasAulas: [], color: '#ef4444' }); }} className="text-[9px] font-black text-red-500 border border-red-900/30 px-2 py-1 rounded">+ Meta</button>
                                       </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                       {subj.metas.map((m, mIdx) => (
                                          <div key={m.id} className="px-3 py-1.5 bg-black border border-gray-800 rounded-lg text-[9px] font-black text-gray-500 flex items-center gap-3 group/meta transition hover:border-red-600/50" style={{ borderLeft: `3px solid ${m.color}` }}>
                                             <div className="flex flex-col gap-0.5 opacity-0 group-hover/meta:opacity-100 transition">
                                                <button onClick={() => setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.map(d => d.id === disc.id ? {...d, subjects: d.subjects.map(s => s.id === subj.id ? {...s, metas: moveItem(s.metas, mIdx, 'up')} : s)} : d)})} className="text-[7px] text-gray-500 hover:text-white">▲</button>
                                                <button onClick={() => setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.map(d => d.id === disc.id ? {...d, subjects: d.subjects.map(s => s.id === subj.id ? {...s, metas: moveItem(s.metas, mIdx, 'down')} : s)} : d)})} className="text-[7px] text-gray-500 hover:text-white">▼</button>
                                             </div>
                                             <span onClick={() => { setEditingSubject({discId: disc.id, subjId: subj.id}); setCurrentMeta(m); setModalType('META'); setModalMode('EDIT'); }} className="cursor-pointer hover:text-white">{m.type}: {m.title}</span>
                                             <button onClick={() => setEditingPlan({...editingPlan, disciplines: editingPlan.disciplines.map(d => d.id === disc.id ? {...d, subjects: d.subjects.map(s => s.id === subj.id ? {...s, metas: s.metas.filter(meta => meta.id !== m.id)} : s)} : d)})} className="text-red-900 hover:text-red-500 opacity-0 group-hover/meta:opacity-100 transition">×</button>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        )}
                      </div>
                   ))}
                </div>
             </section>
          </div>

          <aside className="space-y-6">
             <div className="glass-panel p-6 rounded-3xl border border-gray-800">
                <h3 className="text-xs font-futuristic text-red-500 uppercase tracking-widest mb-6 border-b border-gray-800 pb-2">Configurações Gerais</h3>
                <div className="space-y-6">
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block">Sistema de Ciclo</label>
                      <select value={editingPlan.cycleSystem} onChange={e => setEditingPlan({...editingPlan, cycleSystem: e.target.value as CycleSystem})} className="w-full bg-black border border-gray-800 p-3 rounded-xl text-white text-xs outline-none focus:border-red-600">
                         <option value={CycleSystem.CONTINUOUS}>Contínuo (Sequencial)</option>
                         <option value={CycleSystem.ROTATORY}>Rotativo (Rodadas)</option>
                      </select>
                   </div>
                </div>
             </div>
          </aside>
        </div>

        {/* Modal de Metas Avançado */}
        {modalType === 'META' && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
              <div className="w-full max-w-4xl glass-panel p-8 rounded-[40px] border border-gray-800 max-h-[90vh] overflow-y-auto custom-scrollbar">
                 <h2 className="text-xl font-futuristic text-red-500 uppercase tracking-widest text-center mb-8">
                    {modalMode === 'EDIT' ? 'Editar Meta' : 'Configurar Nova Meta'}
                 </h2>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Título da Meta</label>
                          <input value={currentMeta.title} onChange={e => setCurrentMeta({...currentMeta, title: e.target.value})} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white outline-none focus:border-red-600 font-bold" />
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Tipo</label>
                             <select value={currentMeta.type} onChange={e => setCurrentMeta({...currentMeta, type: e.target.value as GoalType})} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white text-xs">
                                {Object.values(GoalType).map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Cor Visual</label>
                             <input type="color" value={currentMeta.color} onChange={e => setCurrentMeta({...currentMeta, color: e.target.value})} className="w-full h-12 bg-black border border-gray-800 p-1 rounded-xl cursor-pointer" />
                          </div>
                       </div>
                       
                       {currentMeta.type === GoalType.AULA && (
                          <div className="p-6 bg-black/40 border border-gray-800 rounded-2xl space-y-4">
                             <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-[2px]">Submetas de Vídeo</span>
                                <button onClick={() => setCurrentMeta(prev => ({...prev, submetasAulas: [...(prev.submetasAulas || []), {id: Math.random().toString(36).substr(2, 9), title: 'Nova Aula', duration: 15, link: ''}]}))} className="text-[9px] font-black bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700 transition">+ Vídeo</button>
                             </div>
                             <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                {currentMeta.submetasAulas?.map(sm => (
                                   <div key={sm.id} className="grid grid-cols-12 gap-2 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                      <input value={sm.title} onChange={e => setCurrentMeta({...currentMeta, submetasAulas: currentMeta.submetasAulas?.map(s => s.id === sm.id ? {...s, title: e.target.value} : s)})} className="col-span-6 bg-black border border-gray-800 rounded p-2 text-[10px] text-white" placeholder="Título" />
                                      <input type="number" value={sm.duration} onChange={e => setCurrentMeta({...currentMeta, submetasAulas: currentMeta.submetasAulas?.map(s => s.id === sm.id ? {...s, duration: parseInt(e.target.value)} : s)})} className="col-span-2 bg-black border border-gray-800 rounded p-2 text-[10px] text-white" placeholder="Min" />
                                      <input value={sm.link} onChange={e => setCurrentMeta({...currentMeta, submetasAulas: currentMeta.submetasAulas?.map(s => s.id === sm.id ? {...s, link: e.target.value} : s)})} className="col-span-3 bg-black border border-gray-800 rounded p-2 text-[10px] text-white" placeholder="Link" />
                                      <button onClick={() => setCurrentMeta({...currentMeta, submetasAulas: currentMeta.submetasAulas?.filter(s => s.id !== sm.id)})} className="col-span-1 text-red-500 font-bold hover:text-red-400">×</button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )}

                       {(currentMeta.type === GoalType.QUESTOES || currentMeta.type === GoalType.LEI_SECA || currentMeta.type === GoalType.MATERIAL || currentMeta.type === GoalType.RESUMO) && (
                          <div className="p-6 bg-black/40 border border-gray-800 rounded-2xl space-y-5">
                             <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Material PDF & Link</label>
                                {currentMeta.pdfUrl && <span className="text-[9px] text-green-500 font-bold uppercase animate-pulse tracking-widest font-black">✓ PDF PRESENTE</span>}
                             </div>
                             
                             <div className="space-y-4">
                               <button 
                                 type="button" 
                                 disabled={isUploadingPDF}
                                 onClick={() => fileInputRef.current?.click()} 
                                 className="w-full py-4 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-white transition disabled:opacity-50 flex items-center justify-center gap-3"
                               >
                                  {isUploadingPDF ? `ENVIANDO ${uploadProgress}%...` : currentMeta.pdfUrl ? 'SUBSTITUIR PDF' : 'CARREGAR ARQUIVO .PDF'}
                                  {isUploadingPDF && <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>}
                               </button>
                               <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                             </div>

                             <div>
                                <label className="text-[10px] font-black text-gray-600 uppercase mb-2 block">Páginas (Para cálculo de tempo)</label>
                                <input type="number" value={currentMeta.pages} onChange={e => setCurrentMeta({...currentMeta, pages: parseInt(e.target.value)})} className="w-full bg-black border border-gray-800 p-3 rounded-xl text-white text-xs outline-none" />
                             </div>
                             <div>
                                <label className="text-[10px] font-black text-gray-600 uppercase mb-2 block">Link Externo Alternativo</label>
                                <input value={currentMeta.link} onChange={e => setCurrentMeta({...currentMeta, link: e.target.value})} className="w-full bg-black border border-gray-800 p-3 rounded-xl text-white text-xs outline-none focus:border-red-600" placeholder="https://..." />
                             </div>
                          </div>
                       )}
                    </div>

                    <div className="space-y-6">
                       <div className="p-8 bg-gray-900/30 border border-gray-800 rounded-[32px] space-y-6">
                          <div className="flex items-center justify-between">
                             <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Mecanismo de Revisão</h4>
                             <div className="relative inline-block w-10 h-6">
                                <input type="checkbox" checked={currentMeta.revisionEnabled} onChange={e => setCurrentMeta({...currentMeta, revisionEnabled: e.target.checked})} className="opacity-0 w-0 h-0 peer" id="rev-toggle" />
                                <label htmlFor="rev-toggle" className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-800 rounded-full transition-all peer-checked:bg-red-600"></label>
                             </div>
                          </div>
                          {currentMeta.revisionEnabled && (
                             <div className="space-y-5 animate-in slide-in-from-top duration-300">
                                <div>
                                   <label className="text-[9px] font-black text-gray-600 uppercase mb-2 block">Intervalos de Repetição (Dias)</label>
                                   <input value={currentMeta.revisionIntervals} onChange={e => setCurrentMeta({...currentMeta, revisionIntervals: e.target.value})} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white text-xs outline-none focus:border-red-600" placeholder="Ex: 1,7,15,30" />
                                </div>
                                <div className="flex items-center gap-3">
                                   <input type="checkbox" checked={currentMeta.repeatLastInterval} onChange={e => setCurrentMeta({...currentMeta, repeatLastInterval: e.target.checked})} className="w-4 h-4 accent-red-600" id="repeat-check" />
                                   <label htmlFor="repeat-check" className="text-[9px] font-bold text-gray-400 uppercase cursor-pointer">Repetir ciclo eterno</label>
                                </div>
                             </div>
                          )}
                       </div>
                       
                       <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block">Dicas e Observações ao Aluno</label>
                          <textarea value={currentMeta.observations} onChange={e => setCurrentMeta({...currentMeta, observations: e.target.value})} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-white text-xs h-40 outline-none focus:border-red-600 resize-none" placeholder="Digite orientações pedagógicas para esta meta..." />
                       </div>
                    </div>
                 </div>

                 <div className="flex gap-4 mt-12 border-t border-gray-800 pt-8">
                    <button onClick={() => setModalType(null)} className="flex-1 py-4 bg-gray-900 rounded-2xl text-[10px] font-black uppercase text-gray-500 tracking-widest hover:text-white transition">Descartar</button>
                    <button onClick={saveMeta} className="flex-1 py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase text-white tracking-widest shadow-lg shadow-red-900/30 hover:bg-red-700 transition">Confirmar Alterações</button>
                 </div>
              </div>
           </div>
        )}

        {/* Modal Simples para Pasta/Disciplina/Assunto */}
        {modalType && modalType !== 'META' && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md glass-panel p-10 rounded-[40px] border border-gray-800">
                 <h2 className="text-xl font-futuristic text-red-500 uppercase tracking-widest text-center mb-8">
                    {modalMode === 'EDIT' ? 'Renomear' : 'Novo'} {modalType === 'FOLDER' ? 'Pasta' : modalType === 'DISCIPLINE' ? 'Disciplina' : 'Assunto'}
                 </h2>
                 <input autoFocus value={modalValue} onChange={e => setModalValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAction()} className="w-full bg-black border border-gray-800 p-5 rounded-2xl text-white font-bold outline-none focus:border-red-600 mb-8" placeholder="Nome identificador..." />
                 <div className="flex gap-4">
                    <button onClick={() => setModalType(null)} className="flex-1 py-4 bg-gray-900 rounded-2xl text-[10px] font-black uppercase text-gray-500 hover:text-white transition">Cancelar</button>
                    <button onClick={handleAction} className="flex-1 py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase text-white hover:bg-red-700 transition">Salvar</button>
                 </div>
              </div>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
      <header className="flex justify-between items-end border-b border-gray-900 pb-8">
        <div>
          <h1 className="text-4xl font-futuristic text-white tracking-tighter uppercase">Planos de Estudos</h1>
          <p className="text-gray-500 mt-2 uppercase tracking-[2px] text-xs">Gestão Operacional Cloud</p>
        </div>
        <button onClick={handleCreatePlan} className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition-all shadow-2xl shadow-red-900/30 uppercase text-xs tracking-widest font-futuristic">
          + Criar Novo Plano
        </button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {plans.map(plan => (
          <div key={plan.id} className="glass-panel rounded-[40px] overflow-hidden border border-gray-800 group hover:border-red-500/50 transition-all cursor-pointer relative shadow-xl" onClick={() => setEditingPlan(plan)}>
            <div className="h-72 overflow-hidden relative">
              <img src={plan.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all duration-1000" alt={plan.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 pr-8">
                <h3 className="text-2xl font-bold text-white mb-2 leading-tight uppercase font-futuristic drop-shadow-lg">{plan.name}</h3>
                <div className="flex gap-3">
                   <span className="text-[9px] bg-red-600 text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-md">{plan.cycleSystem}</span>
                   <span className="text-[9px] bg-black/60 text-gray-400 px-3 py-1 rounded-full font-black uppercase tracking-widest border border-gray-800 backdrop-blur-sm">{plan.disciplines.length} Disciplinas</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;
