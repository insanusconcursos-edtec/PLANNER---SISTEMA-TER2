
import { StudyPlan, RoutineConfig, GoalType, StudentLevel, Meta, CycleSystem } from '../types';

/**
 * Calculates how many minutes a goal takes based on student level.
 */
export const calculateGoalMinutes = (meta: Meta, level: StudentLevel): number => {
  switch (meta.type) {
    case GoalType.AULA:
      return meta.submetasAulas?.reduce((acc, sub) => acc + sub.duration, 0) || 0;
    
    case GoalType.QUESTOES:
      const qPages = meta.pages || 0;
      const qFactor = level === StudentLevel.BEGINNER ? 10 : level === StudentLevel.INTERMEDIATE ? 6 : 2;
      return qPages * qFactor;
    
    case GoalType.LEI_SECA:
      const lPages = meta.pages || 0;
      const lFactor = level === StudentLevel.BEGINNER ? 5 : level === StudentLevel.INTERMEDIATE ? 3 : 1;
      const mult = meta.multiplier || 1;
      return lPages * lFactor * mult;
    
    case GoalType.RESUMO:
      // Adm defines it directly as duration for resumo (or we use meta.pages as a proxy if we had to)
      // but prompt says "indicar quanto tempo o usuário levará" -> we'll store this in 'pages' or a custom field.
      // Let's assume meta.pages stores the minutes for RESUMO.
      return meta.pages || 30;

    default:
      return 30;
  }
};

/**
 * Distributes goals over days.
 */
export const distributeGoals = (
  plan: StudyPlan, 
  routine: RoutineConfig, 
  level: StudentLevel,
  startDate: Date = new Date()
) => {
  const scheduledGoals: any[] = [];
  const activeDays = Object.entries(routine.days)
    .filter(([_, mins]) => mins > 0)
    .map(([day, _]) => parseInt(day));

  if (activeDays.length === 0) return [];

  // Flatten goals according to cycle logic
  // For simplicity in this demo, we'll flatten everything following the order
  let allGoals: { meta: Meta; disciplineName: string; subjectName: string }[] = [];
  
  // Simple flattening (Continuous)
  plan.disciplines.sort((a, b) => a.order - b.order).forEach(disc => {
    disc.subjects.sort((a, b) => a.order - b.order).forEach(subj => {
      subj.metas.sort((a, b) => a.order - b.order).forEach(meta => {
        allGoals.push({ meta, disciplineName: disc.name, subjectName: subj.title });
      });
    });
  });

  let currentDate = new Date(startDate);
  let goalIdx = 0;
  let remainingMinsToday = 0;

  // This is a naive scheduler to demonstrate the logic. 
  // Real world would need to handle "AULAS" sub-goal splitting logic carefully.
  while (goalIdx < allGoals.length) {
    const dayOfWeek = currentDate.getDay();
    const availableMins = routine.days[dayOfWeek] || 0;

    if (availableMins <= 0) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    remainingMinsToday = availableMins;
    
    while (goalIdx < allGoals.length && remainingMinsToday > 0) {
      const { meta, disciplineName, subjectName } = allGoals[goalIdx];
      
      // Special Logic for AULAS: don't start a sub-meta if you can't finish it
      if (meta.type === GoalType.AULA && meta.submetasAulas) {
        let anySubScheduled = false;
        // We might need to split this Meta into its sub-goals for accurate scheduling
        // But the prompt says "show META DE AULA in calendar" 
        // Logic: if total minutes fits, add it. If not, only add what fits?
        // Actually, prompt: "Se o sistema identificar que a minutagem da submeta de aula vai ultrapassar o tempo livre... joga para o dia seguinte"
        
        const totalDuration = calculateGoalMinutes(meta, level);
        if (totalDuration <= remainingMinsToday) {
          scheduledGoals.push({
            date: new Date(currentDate),
            meta,
            disciplineName,
            subjectName,
            duration: totalDuration
          });
          remainingMinsToday -= totalDuration;
          goalIdx++;
        } else {
          // Doesn't fit today. End the day even if time is left.
          remainingMinsToday = 0;
        }
      } else {
        // Normal goal logic
        const duration = calculateGoalMinutes(meta, level);
        if (duration <= remainingMinsToday) {
           scheduledGoals.push({
            date: new Date(currentDate),
            meta,
            disciplineName,
            subjectName,
            duration: duration
          });
          remainingMinsToday -= duration;
          goalIdx++;
        } else {
          // Splits if possible? Prompt says for Aulas it shouldn't split. 
          // For others, let's assume it pushes to next day.
          remainingMinsToday = 0;
        }
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return scheduledGoals;
};
