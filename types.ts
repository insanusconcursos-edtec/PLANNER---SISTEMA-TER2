
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum GoalType {
  AULA = 'AULA',
  MATERIAL = 'MATERIAL',
  QUESTOES = 'QUESTOES',
  LEI_SECA = 'LEI_SECA',
  RESUMO = 'RESUMO',
  REVISAO = 'REVISAO'
}

export enum StudentLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum CycleSystem {
  CONTINUOUS = 'CONTINUOUS',
  ROTATORY = 'ROTATORY'
}

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: UserRole;
  password?: string;
  level: StudentLevel;
  activePlanId?: string;
  accessiblePlans: { planId: string; expiresAt: string }[];
  routine: RoutineConfig;
  studyStats: StudyStats;
}

export interface RoutineConfig {
  days: { [key: string]: number }; // day name (0-6) -> minutes available
}

export interface StudyStats {
  totalMinutes: number;
  planStats: { [planId: string]: number };
}

export interface SubGoalAula {
  id: string;
  title: string;
  duration: number; // minutes
  link: string;
}

export interface Meta {
  id: string;
  type: GoalType;
  title: string;
  color: string;
  observations?: string;
  order: number;
  
  // Specific configs
  submetasAulas?: SubGoalAula[];
  pages?: number;
  link?: string;
  pdfUrl?: string;
  multiplier?: number; // Lei Seca (2x, 3x...)
  references?: string[]; // For Resumo
  
  // Revision System
  revisionEnabled: boolean;
  revisionIntervals?: string; // e.g. "1,7,15,30"
  repeatLastInterval?: boolean;
}

export interface Subject {
  id: string;
  title: string;
  order: number;
  metas: Meta[];
}

export interface Discipline {
  id: string;
  name: string;
  order: number;
  subjects: Subject[];
}

export interface Folder {
  id: string;
  name: string;
  disciplineIds: string[];
}

export interface Cycle {
  id: string;
  name: string;
  disciplineIds: string[];
  subjectsPerDiscipline: number;
  order: number;
}

export interface StudyPlan {
  id: string;
  name: string;
  imageUrl: string;
  disciplines: Discipline[];
  folders: Folder[];
  cycles: Cycle[];
  cycleSystem: CycleSystem;
  lastUpdated: string;
}

export interface UserProgress {
  userId: string;
  planId: string;
  completedMetaIds: string[];
  currentGoalIndex: number; // Global index in the distribution
  status: 'active' | 'paused';
}
