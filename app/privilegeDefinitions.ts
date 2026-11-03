export type PrivilegeMember = {
  id: string;
  name: string;
  active: boolean;
  congregation_status: string;
};

export type PrivilegeSlot = {
  key: string;
  label: string;
  status?: "anciao" | "servo_ministerial";
  source?: string;
};
export type PrivilegeGroup = {
  key: string;
  label: string;
  eldersOnly?: boolean;
  slots: PrivilegeSlot[];
};
export type PrivilegeAssignments = Record<string, {
  values: Record<string, string>;
  updatedAt: string;
}>;

const responsibleAndHelper: PrivilegeSlot[] = [
  { key: "responsavel", label: "Responsável" },
  { key: "ajudante", label: "Ajudante" },
];
const elderAndServant: PrivilegeSlot[] = [
  { key: "responsavel_anciao", label: "Responsável — ancião", status: "anciao" },
  { key: "responsavel_servo", label: "Responsável — servo ministerial", status: "servo_ministerial" },
  { key: "ajudante", label: "Ajudante" },
];
const twoHelpers: PrivilegeSlot[] = [
  { key: "ajudante_1", label: "Ajudante 1" },
  { key: "ajudante_2", label: "Ajudante 2" },
];
const linkedSlots = (source: string): PrivilegeSlot[] => [
  { key: "responsavel", label: "Responsável", source },
  { key: "ajudante", label: "Ajudante" },
];

export const privilegeGroups: PrivilegeGroup[] = [
  { key: "balcao", label: "Balcão", slots: responsibleAndHelper },
  { key: "contas", label: "Contas", slots: responsibleAndHelper },
  { key: "quadro", label: "Quadro", slots: elderAndServant },
  { key: "territorios", label: "Territórios", slots: responsibleAndHelper },
  { key: "conferencia_publica", label: "Conferência Pública", slots: linkedSlots("superintendente_conferencia_publica") },
  { key: "onibus", label: "Ônibus", slots: elderAndServant },
  { key: "designacoes_mecanicas", label: "Designações Mecânicas", slots: responsibleAndHelper },
  { key: "cronometro", label: "Cronômetro", slots: twoHelpers },
  { key: "vida_ministerio", label: "Vida e Ministério", slots: linkedSlots("superintendente_vida_ministerio") },
  { key: "agua_oradores", label: "Levar água para os oradores", slots: twoHelpers },
  { key: "audio_video", label: "Áudio e Vídeo", slots: linkedSlots("superintendente_audio_video") },
  { key: "limpeza", label: "Limpeza", slots: [{ key: "responsavel", label: "Responsável" }] },
];

export const elderSlots: PrivilegeSlot[] = [
  { key: "coordenador", label: "Coordenador", status: "anciao" },
  { key: "ajudante_coordenador", label: "Ajudante do coordenador", status: "anciao" },
  { key: "secretario", label: "Secretário", status: "anciao" },
  { key: "ajudante_secretario", label: "Ajudante do secretário", status: "anciao" },
  { key: "superintendente_servico", label: "Superintendente de Serviço", status: "anciao" },
  { key: "ajudante_servico", label: "Ajudante do Superintendente de Serviço", status: "anciao" },
  { key: "superintendente_vida_ministerio", label: "Superintendente de Vida e Ministério", status: "anciao" },
  { key: "ajudante_vida_ministerio", label: "Ajudante de Vida e Ministério", status: "anciao" },
  { key: "superintendente_conferencia_publica", label: "Superintendente de Conferência Pública", status: "anciao" },
  { key: "ajudante_conferencia_publica", label: "Ajudante de Conferência Pública", status: "anciao" },
  { key: "superintendente_audio_video", label: "Superintendente de Áudio e Vídeo", status: "anciao" },
  { key: "ajudante_audio_video", label: "Ajudante de Áudio e Vídeo", status: "anciao" },
];
export const elderGroup: PrivilegeGroup = {
  key: "anciaos", label: "Designações de anciãos", eldersOnly: true, slots: elderSlots,
};

export function privilegeSlotValue(groupKey: string, slot: PrivilegeSlot, assignments: PrivilegeAssignments) {
  return slot.source
    ? assignments.anciaos?.values[slot.source] ?? ""
    : assignments[groupKey]?.values[slot.key] ?? "";
}

export function validatePrivilegeValues(group: PrivilegeGroup, input: unknown, members: PrivilegeMember[], assignments: PrivilegeAssignments) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Designações inválidas.");
  const supplied = input as Record<string, unknown>;
  const editable = group.slots.filter((slot) => !slot.source);
  if (Object.keys(supplied).some((key) => !editable.some((slot) => slot.key === key))) {
    throw new Error("Função inválida. Os responsáveis vinculados vêm das designações de anciãos.");
  }
  const values: Record<string, string> = {};
  const used = new Set<string>();
  for (const slot of group.slots) {
    const raw = slot.source ? privilegeSlotValue(group.key, slot, assignments) : supplied[slot.key];
    if (!slot.source && typeof raw !== "string") throw new Error(`Informe ${slot.label}, mesmo que sem designado.`);
    const id = typeof raw === "string" ? raw.trim() : "";
    if (!slot.source) values[slot.key] = id;
    if (!id) continue;
    const member = members.find((candidate) => candidate.id === id);
    if (!member || !member.active) throw new Error(`${slot.label}: escolha um participante ativo.`);
    if (slot.status && member.congregation_status !== slot.status) {
      throw new Error(`${slot.label}: escolha ${slot.status === "anciao" ? "um ancião" : "um servo ministerial"}.`);
    }
    // Um ancião pode acumular funções em áreas diferentes.
    if (!group.eldersOnly && used.has(id)) throw new Error("Escolha pessoas diferentes para as funções desta área.");
    used.add(id);
  }
  return values;
}
