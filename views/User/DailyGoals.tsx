
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, GoalType, StudyPlan, UserProgress, SubGoalAula } from '../../types';
import { distributeGoals } from '../../lib/scheduler';
import { db } from '../../firebase';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import PDFReader from '../../components/PDFReader';

interface DailyGoalsProps {
  user: User;
  plans: StudyPlan[];
}

const UserDailyGoals: React.FC<DailyGoalsProps> = ({ user, plans }) => {
  const [expandedMetaId, setExpandedMetaId] = useState<string | null>(null);
  const [activeMetaId, setActiveMetaId] = useState<string | null>(null);
  const [activeSubMetaId, setActiveSubMetaId] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePlan = useMemo(() => plans.find(p => p.id === user.activePlanId), [user.activePlanId, plans]);

  useEffect(() => {
    if (user.id && user.activePlanId) {
       const q = query(collection(db, "progress"), where("userId", "==", user.id), where("planId", "==", user.activePlanId));
       const unsubscribe = onSnapshot(q, (snap) => {
          const list: UserProgress[] = [];
          snap.forEach(doc => list.push(doc.data() as UserProgress));
          setProgress(list);
       });
       return () => unsubscribe();
    }
  }, [user.id, user.activePlanId]);

  const dailyGoals = useMemo(() => {
    if (!activePlan) return [];
    const allScheduled = distributeGoals(activePlan, user.routine, user.level, progress);
    const today = new Date();
    const grouped: { [key: string]: any } = {};
    allScheduled.filter(g => g.date.toDateString() === today.toDateString()).forEach(g => {
      if (!grouped[g.meta.id]) {
        grouped[g.meta.id] = { ...g, subMetasParaHoje: [] };
      }
      if (g.subMeta) grouped[g.meta.id].subMetasParaHoje.push(g.subMeta);
    });
    return Object.values(grouped);
  }, [activePlan, user.routine, user.level, progress]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const handleConcluirMeta = async (metaId: string, subMetaId?: string) => {
    if (!activePlan) return;
    setIsRunning(false);
    
    const newProgress: UserProgress = {
      userId: user.id,
      planId: activePlan.id,
      metaId: metaId,
      subMetaId: subMetaId,
      completedAt: new Date().toISOString(),
      timeSpent: timer,
      status: 'completed'
    };

    try {
      await addDoc(collection(db, "progress"), newProgress);
      setActiveMetaId(null);
      setActiveSubMetaId(null);
      setTimer(0);
      alert("Sucesso! Atividade registrada.");
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-right duration-700">
      <header className="mb-10 flex justify-between items-end border-b border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-futuristic text-white uppercase tracking-tighter">Metas Diárias</h1>
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-[3px] mt-1 italic">
            {(new Date()).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        {activeMetaId && (
          <div className="glass-panel p-5 rounded-2xl border border-red-900/40 flex items-center gap-6 shadow-2xl animate-in zoom-in">
            <div className="text-center">
              <p className="text-[8px] uppercase font-black text-red-500 tracking-[2px] mb-1">Estudo Líquido</p>
              <p className="text-2xl font-futuristic text-white">{formatTime(timer)}</p>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setIsRunning(!isRunning)} className="w-10 h-10 bg-gray-900 rounded-full border border-gray-800 flex items-center justify-center">
                {isRunning ? '⏸️' : '▶️'}
              </button>
              <button onClick={() => handleConcluirMeta(activeMetaId, activeSubMetaId || undefined)} className="px-5 py-2 bg-red-600 rounded-xl text-[10px] font-black uppercase text-white">CONCLUIR</button>
            </div>
          </div>
        )}
      </header>

      <div className="space-y-6 pb-20">
        {dailyGoals.length === 0 && (
           <div className="py-24 text-center glass-panel rounded-[40px] border border-gray-800">
              <p className="text-gray-600 font-black uppercase tracking-widest text-xs">A meta diária foi atingida ou você não possui estudos para hoje.</p>
           </div>
        )}
        {dailyGoals.map((scheduled) => {
          const meta = scheduled.meta;
          const isAULA = meta.type === GoalType.AULA;
          const isCompleted = isAULA 
            ? meta.submetasAulas?.every(sm => progress.some(p => p.subMetaId === sm.id))
            : progress.some(p => p.metaId === meta.id);

          return (
            <div key={meta.id} className={`glass-panel rounded-3xl overflow-hidden border transition-all ${isCompleted ? 'opacity-40 border-green-900/30' : 'border-gray-800 hover:border-gray-600'}`}>
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* Utilizando a cor definida pelo administrador */}
                  <div className="w-1.5 h-14 rounded-full" style={{ backgroundColor: meta.color || '#ef4444' }}></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-black/60 text-gray-400 border border-gray-800 uppercase tracking-[2px]">
                        {meta.type}
                      </span>
                      {isCompleted && <span className="text-[8px] font-black text-green-500 uppercase">Finalizada ✓</span>}
                    </div>
                    <h3 className="text-md font-bold text-white uppercase font-futuristic tracking-tight leading-relaxed whitespace-pre-wrap">{meta.title}</h3>
                    <p className="text-[9px] text-gray-600 font-black uppercase">{scheduled.disciplineName} » {scheduled.subjectName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button onClick={() => setExpandedMetaId(expandedMetaId === meta.id ? null : meta.id)} className="p-2 text-gray-600 bg-gray-900/50 rounded-lg hover:text-white transition">
                    {expandedMetaId === meta.id ? '▲' : '▼'}
                  </button>
                  {!isAULA && !isCompleted && (
                    <button 
                      onClick={() => { setActiveMetaId(meta.id); setTimer(0); setIsRunning(true); setExpandedMetaId(meta.id); }}
                      className={`px-6 py-3 rounded-xl font-black text-[10px] transition-all uppercase tracking-widest ${activeMetaId === meta.id ? 'bg-gray-800 text-gray-600' : 'bg-red-600 text-white shadow-xl shadow-red-900/20 hover:scale-105'}`}
                    >
                      {activeMetaId === meta.id ? 'EM ANDAMENTO...' : 'INICIAR'}
                    </button>
                  )}
                </div>
              </div>

              {expandedMetaId === meta.id && (
                <div className="px-8 pb-8 pt-4 border-t border-gray-800 bg-black/40 animate-in slide-in-from-top duration-300">
                  {meta.observations && (
                    <div className="mb-6 p-4 rounded-xl bg-gray-900/80 border border-gray-800 text-[11px] text-gray-400">
                       <span className="text-red-500 font-black uppercase text-[9px] block mb-2 tracking-widest">DICA DO PROFESSOR:</span>
                       {meta.observations}
                    </div>
                  )}

                  {isAULA && (
                     <div className="space-y-3">
                        <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 italic">Aulas previstas para hoje:</p>
                        {scheduled.subMetasParaHoje.map((sm: SubGoalAula) => {
                          const smCompleted = progress.some(p => p.subMetaId === sm.id);
                          const smActive = activeSubMetaId === sm.id;
                          
                          return (
                            <div key={sm.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${smCompleted ? 'bg-green-900/10 border-green-900/20' : 'bg-gray-900/60 border-gray-800'}`}>
                               <div className="flex items-center gap-4">
                                  <div className={`w-2 h-2 rounded-full ${smCompleted ? 'bg-green-500' : smActive ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`}></div>
                                  <div>
                                    <span className={`text-xs ${smCompleted ? 'text-green-500 font-bold' : 'text-gray-300'}`}>{sm.title}</span>
                                    <span className="text-gray-600 text-[10px] ml-2 font-black">({sm.duration}min)</span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-3">
                                  {sm.link && <a href={sm.link} target="_blank" className="text-[9px] font-black text-gray-500 hover:text-white transition">LINK ↗</a>}
                                  {!smCompleted && (
                                    <button 
                                      onClick={() => { setActiveMetaId(meta.id); setActiveSubMetaId(sm.id); setTimer(0); setIsRunning(true); }}
                                      className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${smActive ? 'bg-gray-800 text-gray-500' : 'bg-red-600 text-white hover:bg-red-700'}`}
                                    >
                                      {smActive ? 'ASSISTINDO' : 'INICIAR'}
                                    </button>
                                  )}
                                  {smCompleted && <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">VISTO ✓</span>}
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  )}

                  <div className="mt-8 flex flex-wrap gap-4 justify-end">
                    {meta.pdfUrl && (
                       <button onClick={() => setActivePdfUrl(meta.pdfUrl!)} className="px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-[9px] font-black uppercase text-blue-500 hover:border-blue-500 transition">
                         ABRIR MATERIAL PDF 📄
                       </button>
                    )}
                    {meta.link && (
                       <a href={meta.link} target="_blank" className="px-5 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-white transition">
                         ACESSAR CONTEÚDO ↗
                       </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {activePdfUrl && (
        <PDFReader url={activePdfUrl} user={user} onClose={() => setActivePdfUrl(null)} />
      )}
    </div>
  );
};

export default UserDailyGoals;
