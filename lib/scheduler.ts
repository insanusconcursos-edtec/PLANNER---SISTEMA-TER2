
import { StudyPlan, RoutineConfig, GoalType, StudentLevel, Meta, UserProgress, SubGoalAula } from '../types';

export const calculateGoalMinutes = (meta: Meta, level: StudentLevel): number => {
  switch (meta.type) {
    case GoalType.AULA:
      return meta.submetasAulas?.reduce((acc, sub) => acc + sub.duration, 0) || 0;
    case GoalType.QUESTOES:
      const qFactor = level === StudentLevel.BEGINNER ? 10 : level === StudentLevel.INTERMEDIATE ? 6 : 2;
      return (meta.pages || 0) * qFactor;
    case GoalType.LEI_SECA:
      const lFactor = level === StudentLevel.BEGINNER ? 5 : level === StudentLevel.INTERMEDIATE ? 3 : 1;
      return (meta.pages || 0) * lFactor * (meta.multiplier || 1);
    case GoalType.RESUMO:
    case GoalType.REVISAO:
      return meta.pages || 30;
    default:
      return 30;
  }
};

export const distributeGoals = (
  plan: StudyPlan, 
  routine: RoutineConfig, 
  level: StudentLevel,
  progress: UserProgress[] = [],
  startDate: Date = new Date()
) => {
  const scheduledGoals: any[] = [];
  const activeDays = Object.entries(routine.days)
    .filter(([_, mins]) => mins > 0)
    .map(([day, _]) => parseInt(day));

  if (activeDays.length === 0) return [];

  // IDs de submetas concluídas
  const completedSubMetaIds = new Set(progress.filter(p => p.subMetaId).map(p => p.subMetaId));
  // IDs de metas (normais) concluídas
  const completedMetaIds = new Set(progress.filter(p => !p.subMetaId).map(p => p.metaId));

  let pendingItems: { meta: Meta; disciplineName: string; subjectName: string; subMeta?: SubGoalAula }[] = [];
  
  plan.disciplines.sort((a, b) => a.order - b.order).forEach(disc => {
    disc.subjects.sort((a, b) => a.order - b.order).forEach(subj => {
      subj.metas.sort((a, b) => a.order - b.order).forEach(meta => {
        if (meta.type === GoalType.AULA && meta.submetasAulas) {
          // Para AULAS, adicionamos as submetas individualmente se não concluídas
          meta.submetasAulas.forEach(sm => {
            if (!completedSubMetaIds.has(sm.id)) {
              pendingItems.push({ meta, disciplineName: disc.name, subjectName: subj.title, subMeta: sm });
            }
          });
        } else if (!completedMetaIds.has(meta.id)) {
          pendingItems.push({ meta, disciplineName: disc.name, subjectName: subj.title });
        }
      });
    });
  });

  // Gerar Revisões (Mantenha a lógica anterior)
  progress.forEach(p => {
    const originalMeta = plan.disciplines.flatMap(d => d.subjects.flatMap(s => s.metas)).find(m => m.id === p.metaId);
    if (originalMeta?.revisionEnabled && originalMeta.revisionIntervals && !p.subMetaId) {
      const intervals = originalMeta.revisionIntervals.split(',').map(n => parseInt(n.trim()));
      intervals.forEach((days, idx) => {
        const revDate = new Date(p.completedAt);
        revDate.setDate(revDate.getDate() + days);
        if (revDate >= startDate) {
           scheduledGoals.push({
             date: revDate,
             meta: { ...originalMeta, id: `rev-${p.metaId}-${idx}`, type: GoalType.REVISAO, title: `REVISÃO: ${originalMeta.title}`, parentMetaId: p.metaId },
             disciplineName: "REVISÃO",
             subjectName: originalMeta.title,
             duration: originalMeta.type === GoalType.RESUMO ? (originalMeta.pages || 30) : 20
           });
        }
      });
    }
  });

  let currentDate = new Date(startDate);
  let itemIdx = 0;

  while (itemIdx < pendingItems.length) {
    const dayOfWeek = currentDate.getDay();
    const availableMins = routine.days[dayOfWeek] || 0;

    if (availableMins <= 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    let remainingMinsToday = availableMins;
    
    while (itemIdx < pendingItems.length && remainingMinsToday > 0) {
      const item = pendingItems[itemIdx];
      const duration = item.subMeta ? item.subMeta.duration : calculateGoalMinutes(item.meta, level);

      // REGRA DE OURO: Se for AULA (subMeta) e não couber hoje, pula o dia para não interromper
      if (duration > remainingMinsToday) {
        remainingMinsToday = 0; // Força encerramento do dia
      } else {
        scheduledGoals.push({
          date: new Date(currentDate),
          meta: item.meta,
          subMeta: item.subMeta,
          disciplineName: item.disciplineName,
          subjectName: item.subjectName,
          duration: duration
        });
        remainingMinsToday -= duration;
        itemIdx++;
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return scheduledGoals.sort((a, b) => a.date.getTime() - b.date.getTime());
};
