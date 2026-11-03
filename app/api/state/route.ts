import { localDatabase } from "../../../server/database";

import { seedDemo } from "../../../server/seed";

import { elderGroup, privilegeGroups, validatePrivilegeValues, type PrivilegeAssignments } from "../../privilegeDefinitions";

import { sameGenderPair, midweekParticipationHistory, type MemberGender } from "../../assignmentGuidance";

import { ensureCurrentUser, renewAppSession, UnauthorizedError, EDITABLE_MODULES, type EditableModule } from "../../appAuth";

import { normalizeSongForStorage } from "../../songbook";

type AppRole = "admin" | "coordenador" | "publicador";

type CongregationStatus = "estudante" | "publicador" | "publicador_batizado" | "servo_ministerial" | "anciao";

type PioneerRole = "pioneiro_auxiliar" | "pioneiro_regular";

type FieldDay = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

type AssignmentStatus = "rascunho" | "aguardando" | "confirmada" | "recusada";

type AssignmentParticipant = "assignee" | "assistant";

type SpecialEventType = "visita_superintendente" | "assembleia" | "congresso" | "celebracao" | "discurso_especial" | "outro";

type PublicMeetingStatus = "rascunho" | "confirmada";

type MechanicalMeetingKind = "meio_semana" | "fim_de_semana";

type SimpleScheduleStatus = "rascunho" | "confirmada";

type FieldMinistryArrangement = "salao_reino" | "grupo_servico" | "todos_grupos";

type D1Rows<T> = {
  results: T[];
};

type CongregationRow = {
  id: string;
  name: string;
  city: string;
  meeting_title: string;
  created_at: string;
  updated_at: string;
};

type MemberRow = {
  gender?: MemberGender;
  participation_status?: string;
  id: string;
  congregation_id: string;
  name: string;
  email: string | null;
  whatsapp_phone: string | null;
  congregation_status: string | null;
  pioneer_roles: string | null;
  field_service_group_id: string | null;
  field_availability: string | null;
  role: AppRole;
  active: number;
  privileges: string;
  editable_modules: string | null;
  source: string;
  created_at: string;
  updated_at: string;
};

type SafeMemberRow = Omit<
  MemberRow,
  "active" | "congregation_status" | "pioneer_roles" | "field_availability" | "privileges" | "editable_modules"
> & {
  active: boolean;
  congregation_status: CongregationStatus;
  pioneer_roles: PioneerRole[];
  field_availability: FieldDay[];
  privileges: string[];
  editable_modules: EditableModule[];
};

type FieldServiceGroupRow = {
  id: string;
  congregation_id: string;
  name: string;
  overseer_member_id: string | null;
  assistant_member_id: string | null;
  created_at: string;
  updated_at: string;
};

type WeekRow = {
  id: string;
  congregation_id: string;
  week_start: string;
  meeting_date: string;
  bible_reading: string;
  opening_song: string;
  closing_song: string;
  status: "rascunho" | "revisao" | "publicada";
  created_at: string;
  updated_at: string;
};

type AssignmentRow = {
  id: string;
  congregation_id: string;
  week_id: string;
  section: string;
  section_tone: string;
  sequence: number;
  title: string;
  duration_min: number | null;
  role_key: string;
  assignee_member_id: string | null;
  assistant_member_id: string | null;
  status: AssignmentStatus;
  created_at: string;
  updated_at: string;
};

type TimeAwayRow = {
  id: string;
  congregation_id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  source: string;
  created_at: string;
  updated_at: string;
};

type InvitationRow = {
  id: string;
  congregation_id: string;
  member_id: string | null;
  email: string;
  whatsapp_phone: string | null;
  role: AppRole;
  status: "pendente" | "aceito" | "cancelado";
  access_code_hash: string | null;
  access_code_hint: string | null;
  access_code_created_at: string | null;
  password_hash: string | null;
  password_created_at: string | null;
  created_at: string;
  updated_at: string;
};

type SpecialEventRow = {
  special_talk_speaker: string | null;
  id: string;
  congregation_id: string;
  type: SpecialEventType;
  title: string;
  start_date: string;
  end_date: string;
  circuit_overseer_name: string | null;
  circuit_overseer_wife: string | null;
  midweek_service_talk_title: string | null;
  midweek_service_talk_song: string | null;
  weekend_public_talk_title: string | null;
  weekend_final_talk_title: string | null;
  weekend_final_talk_song: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type JwSyncLogRow = {
  id: string;
  congregation_id: string;
  checked_at: string;
  source_url: string;
  publications: string;
  imported_weeks: number;
  updated_weeks: number;
  message: string;
};

type PublicTalkThemeRow = {
  id: string;
  number: number;
  title: string;
  source: string;
  active: number;
  created_at: string;
  updated_at: string;
};

type WatchtowerStudyRow = {
  id: string;
  congregation_id: string;
  issue_title: string;
  study_title: string;
  study_week_label: string;
  study_start_date: string | null;
  study_end_date: string | null;
  source_url: string;
  sort_key: string;
  created_at: string;
  updated_at: string;
};

type WatchtowerSyncLogRow = {
  id: string;
  congregation_id: string;
  checked_at: string;
  source_url: string;
  publications: string;
  imported_studies: number;
  message: string;
};

type PublicMeetingRow = {
  id: string;
  congregation_id: string;
  week_id: string;
  meeting_date: string;
  chairman_member_id: string | null;
  watchtower_conductor_member_id: string | null;
  watchtower_reader_member_id: string | null;
  watchtower_study_id: string | null;
  public_talk_theme_id: string | null;
  public_talk_speaker: string | null;
  public_talk_speaker_congregation: string | null;
  outgoing_speaker: string | null;
  outgoing_talk_theme: string | null;
  outgoing_date: string | null;
  outgoing_time: string | null;
  outgoing_congregation: string | null;
  outgoing_address: string | null;
  outgoing_song: string | null;
  notes: string | null;
  status: PublicMeetingStatus;
  created_at: string;
  updated_at: string;
};

type PublicMeetingMonthDefaultRow = {
  id: string;
  congregation_id: string;
  month_key: string;
  default_weekday: "sabado" | "domingo";
  default_time: string | null;
  destination_congregation: string | null;
  destination_address: string | null;
  created_at: string;
  updated_at: string;
};

type PublicTalkHistoryRow = {
  id: string;
  congregation_id: string;
  public_talk_theme_id: string;
  talk_date: string;
  source_label: string;
  created_at: string;
  updated_at: string;
};

type SpeakerTalkRow = {
  id: string;
  congregation_id: string;
  member_id: string;
  theme_id: string;
  created_at: string;
  updated_at: string;
};

type MechanicalAssignmentRow = {
  id: string;
  congregation_id: string;
  assignment_date: string;
  meeting_kind: MechanicalMeetingKind;
  audio_member_id: string | null;
  video_member_id: string | null;
  external_attendant_member_id: string | null;
  internal_attendant_member_id: string | null;
  roaming_microphone_member_id: string | null;
  attendance_total: number | null;
  attendance_in_person: number | null;
  attendance_zoom: number | null;
  attendance_reported_at: string | null;
  status: SimpleScheduleStatus;
  created_at: string;
  updated_at: string;
};

type FieldMinistryAssignmentRow = {
  id: string;
  congregation_id: string;
  activity_date: string;
  weekday: FieldDay;
  start_time: string;
  arrangement: FieldMinistryArrangement;
  field_service_group_id: string | null;
  conductor_member_id: string | null;
  guest_conductor_name: string | null;
  location: string | null;
  notes: string | null;
  status: SimpleScheduleStatus;
  created_at: string;
  updated_at: string;
};

type MeetingTimingRow = {
  id: string;
  congregation_id: string;
  week_id: string;
  assignment_id: string | null;
  part_key: string;
  part_title: string;
  planned_seconds: number | null;
  actual_seconds: number | null;
  started_at: string | null;
  ended_at: string | null;
  recorded_by_member_id: string | null;
  reported_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type AccountAuditRow = {
  id: string;
  congregation_id: string;
  period_label: string;
  months_label: string;
  due_date: string;
  auditor_member_id: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type MaintenanceTaskRow = {
  id: string;
  completed_at: string;
};

type MemberVisitRow = {
  id: string;
  congregation_id: string;
  field_service_group_id: string;
  member_id: string;
  visit_date: string;
  notes: string | null;
  recorded_by_member_id: string | null;
  created_at: string;
  updated_at: string;
};

type MeetingAttendanceRow = {
  id: string;
  congregation_id: string;
  field_service_group_id: string;
  member_id: string;
  meeting_date: string;
  status: "presente" | "ausente" | "zoom";
  notes: string | null;
  recorded_by_member_id: string | null;
  created_at: string;
  updated_at: string;
};

type EventReminder = {
  eventId: string;
  weekId: string;
  type: "sem_reuniao" | "visita_superintendente" | "lembrete_previo" | "recapitulacao" | "celebracao" | "informativo";
  title: string;
  message: string;
};

type ImportedAssignment = {
  section: string;
  sectionTone: "teal" | "gold" | "red" | "meta";
  title: string;
  durationMin: number | null;
  roleKey: string;
};

type ImportedWeek = {
  weekStart: string;
  meetingDate: string;
  bibleReading: string;
  openingSong: string;
  closingSong: string;
  sourceUrl: string;
  sourcePeriod: string;
  assignments: ImportedAssignment[];
};

type ImportedWatchtowerStudy = {
  issueTitle: string;
  studyTitle: string;
  weekLabel: string;
  studyStartDate: string | null;
  studyEndDate: string | null;
  sourceUrl: string;
};

const CONGREGATION_ID = "cong-demo";

const PUBLISHER = "publicador";

const D1_BATCH_SIZE = 10;

const D1_READ_BATCH_SIZE = 4;

const D1_RETRY_DELAYS_MS = [300, 900, 1800, 3200, 5000];

let appReadyPromise: Promise<void> | null = null;

let schemaReadyPromise: Promise<void> | null = null;

const SCHEMA_READY_TASK_ID = "schema-ready-2026-09-14-special-talk";

const FIELD_MINISTRY_MAX_DATE = "2026-12-31";

const TIME_CONTROL_OPERATOR_NAMES = ["Participante 004", "Participante 005"];

const TIME_CONTROL_REPORT_RECIPIENT_NAMES = ["Participante 002", "Participante 003"];

const ACCOUNTS_MANAGER_NAME = "Participante 006";

const EXCLUDED_ACCOUNT_AUDITOR_NAMES = ["Participante 001"];

const ROLE_LABELS: Record<string, string> = {
  presidente_meio_semana: "Presidente Meio de Semana",
  presidente_reuniao_publica: "Presidente da Reunião Pública",
  oracao: "Oração",
  tesouros: "Tesouros da Palavra de Deus",
  joias: "Joias Espirituais",
  leitura: "Leitura da Bíblia",
  iniciando_conversas: "Iniciando Conversas",
  cultivando_interesse: "Cultivando o Interesse",
  fazendo_discipulos: "Fazendo Discípulos",
  explicando_crencas: "Explicando Suas Crenças",
  discurso: "Discurso",
  o_que_voce_diria: "O que Você Diria",
  necessidades_locais: "Necessidades Locais",
  vida_crista: "Vida Cristã",
  dirigente_estudo_biblico: "Dirigente do Estudo Bíblico de Congregação",
  leitor_estudo_biblico: "Leitor do Estudo Bíblico de Congregação",
  dirigente_sentinela: "Dirigente de A Sentinela",
  leitor_sentinela: "Leitor de A Sentinela",
  discurso_fora: "Discurso fora",
  dirigente_campo: "Dirigente de Campo",
  audio: "Áudio",
  video: "Vídeo",
  indicador_externo: "Indicador Externo",
  indicador_interno: "Indicador Interno",
  microfone_volante: "Microfone Volante",
};

const ministryPrivileges = [
  "iniciando_conversas",
  "cultivando_interesse",
  "fazendo_discipulos",
  "explicando_crencas",
  "discurso",
  "o_que_voce_diria",
];

const validCongregationStatuses = new Set<CongregationStatus>([
  "estudante",
  "publicador",
  "publicador_batizado",
  "servo_ministerial",
  "anciao",
]);

const validPioneerRoles = new Set<PioneerRole>(["pioneiro_auxiliar", "pioneiro_regular"]);

const validFieldDays = new Set<FieldDay>(["seg", "ter", "qua", "qui", "sex", "sab", "dom"]);

const validEditableModules = new Set<EditableModule>(EDITABLE_MODULES);

const validSpecialEventTypes = new Set<SpecialEventType>([
  "discurso_especial",
  "visita_superintendente",
  "assembleia",
  "congresso",
  "celebracao",
  "outro",
]);

const legacyPrivilegeMap: Record<string, string[]> = {
  presidente: ["presidente_meio_semana"],
  ministerio: ministryPrivileges,
  vida_crista: ["vida_crista", "necessidades_locais"],
  estudo_biblico: ["dirigente_estudo_biblico", "leitor_estudo_biblico"],
};

export async function GET(request: Request) {
  try {
    if (!requestHasIdentitySignal(request)) {
      throw new UnauthorizedError("Entre com uma conta fictícia indicada no README.");
    }
    const db = getDatabase();
    await ensureAppReady(db);
    const user = await withD1Retry(() => ensureCurrentUser(db, request));
    await ensureAccountAuditsReady(db);
    const state = await withD1Retry(() => getState(db, user));
    const cookie = await withD1Retry(() => renewAppSession(db, request));
    return Response.json(state, { headers: { "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) } });
  } catch (error) {
    return jsonError(error, isD1OverloadedError(error) ? 503 : error instanceof UnauthorizedError ? 401 : 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!requestHasIdentitySignal(request)) {
      throw new UnauthorizedError("Entre com uma conta fictícia indicada no README.");
    }
    const db = getDatabase();
    await ensureAppReady(db);
    const user = await withD1Retry(() => ensureCurrentUser(db, request));
    const body = (await request.json()) as { action?: string; payload?: Record<string, unknown> };
    const action = body.action ?? "";
    const payload = body.payload ?? {};
    let generatedAccessCode: {
      email: string;
      code: string;
      whatsappPhone: string | null;
      memberId: string | null;
      memberName: string | null;
    } | null = null;

    if (action === "savePrivilegeGroup") {
      requireAdmin(user);
      await savePrivilegeGroup(db, payload);
    } else if (action === "createMember") {
      requireScheduler(user);
      await createMember(db, payload);
    } else if (action === "updateMember") {
      requireScheduler(user);
      if (payload.memberId === user.id && payload.participationStatus && payload.participationStatus !== "ativo") throw new Error("Peça a outro administrador para alterar sua participação.");
      await updateMember(db, payload);
    } else if (action === "deleteMember") {
      requireScheduler(user);
      await deleteMember(db, payload, user);
    } else if (action === "syncJwPrograms") {
      requireScheduler(user);
      await syncJwPrograms(db);
    } else if (action === "syncWatchtowerStudies") {
      requireScheduler(user);
      await syncWatchtowerStudies(db);
    } else if (action === "importPublicMeetingHistory") {
      requireScheduler(user, "reuniao_publica");
      await importHistoricalPublicMeetings(db);
      await ensureImportedPublicTalkHistory(db);
    } else if (action === "updatePublicMeeting") {
      requireScheduler(user, "reuniao_publica");
      await updatePublicMeeting(db, payload);
    } else if (action === "updateReceivedCongregationForMonth") {
      requireScheduler(user, "reuniao_publica");
      await updateReceivedCongregationForMonth(db, payload);
    } else if (action === "updatePublicMeetingMonthDefaults") {
      requireScheduler(user, "reuniao_publica");
      await updatePublicMeetingMonthDefaults(db, payload);
    } else if (action === "resetPublicMeetingToMonthDefault") {
      requireScheduler(user, "reuniao_publica");
      await resetPublicMeetingToMonthDefault(db, payload);
    } else if (action === "addSpeakerTalk") {
      await requireSpeakerTalkEditor(db, user, payload, "add");
      await addSpeakerTalk(db, payload);
    } else if (action === "removeSpeakerTalk") {
      await requireSpeakerTalkEditor(db, user, payload, "remove");
      await removeSpeakerTalk(db, payload);
    } else if (action === "updateMechanicalAssignment") {
      requireScheduler(user, "mecanicas");
      await updateMechanicalAssignment(db, payload);
    } else if (action === "updateMechanicalMonth") {
      requireScheduler(user, "mecanicas");
      await updateMechanicalMonth(db, payload);
    } else if (action === "clearMechanicalMonth") {
      requireScheduler(user, "mecanicas");
      await clearMechanicalMonth(db, payload);
    } else if (action === "recordMechanicalAttendance") {
      await recordMechanicalAttendance(db, payload, user);
    } else if (action === "resetMeetingTimings") {
      requireAdmin(user);
      const weekId = readText(payload.weekId, "Semana");
      const week = await db
        .prepare("SELECT id FROM weeks WHERE id = ? AND congregation_id = ? LIMIT 1")
        .bind(weekId, CONGREGATION_ID)
        .first<Pick<WeekRow, "id">>();
      if (!week) throw new Error("Semana não encontrada para controle do tempo.");
      await db
        .prepare("DELETE FROM meeting_timings WHERE congregation_id = ? AND week_id = ?")
        .bind(CONGREGATION_ID, weekId)
        .run();
    } else if (action === "saveMeetingTimings") {
      const timingMember = await db
        .prepare("SELECT name FROM members WHERE id = ? AND congregation_id = ? LIMIT 1")
        .bind(user.id, CONGREGATION_ID)
        .first<Pick<MemberRow, "name">>();
      requireTimeControl(user, timingMember?.name);
      await saveMeetingTimings(db, payload, user.id);
    } else if (action === "updateAccountAudit") {
      const accountMember = await db
        .prepare("SELECT id, name FROM members WHERE id = ? AND congregation_id = ? LIMIT 1")
        .bind(user.id, CONGREGATION_ID)
        .first<Pick<MemberRow, "id" | "name">>();
      await updateAccountAudit(db, payload, user, accountMember);
    } else if (action === "updateFieldMinistryAssignment") {
      requireScheduler(user, "campo");
      await updateFieldMinistryAssignment(db, payload);
    } else if (action === "generateFieldMinistrySeptember") {
      requireScheduler(user, "campo");
      await ensureFieldMinistryMonth(db, "2026-09", { forceRebuild: true });
    } else if (action === "generateFieldMinistryMonth") {
      requireScheduler(user, "campo");
      await generateFieldMinistryMonth(db, payload);
    } else if (action === "createSpecialEvent") {
      await requireSpecialEventEditor(db, user, payload, "create");
      await createSpecialEvent(db, payload);
    } else if (action === "updateSpecialEvent") {
      await requireSpecialEventEditor(db, user, payload, "update");
      await updateSpecialEvent(db, payload);
    } else if (action === "deleteSpecialEvent") {
      await requireSpecialEventEditor(db, user, payload, "delete");
      await deleteSpecialEvent(db, payload);
    } else if (action === "createFieldServiceGroup") {
      requireScheduler(user);
      await createFieldServiceGroup(db, payload);
    } else if (action === "updateFieldServiceGroup") {
      requireScheduler(user);
      await updateFieldServiceGroup(db, payload);
    } else if (action === "recordMemberVisit") {
      requireScheduler(user, "pastoreio");
      await recordMemberVisit(db, payload, user.id);
    } else if (action === "recordMeetingAttendance") {
      requireScheduler(user, "pastoreio");
      await recordMeetingAttendance(db, payload, user.id);
    } else if (action === "recordMeetingAttendanceBatch") {
      requireScheduler(user, "pastoreio");
      await recordMeetingAttendanceBatch(db, payload, user.id);
    } else if (action === "addTimeAway") {
      requireScheduler(user);
      await addTimeAway(db, payload);
    } else if (action === "deleteTimeAway") {
      requireScheduler(user);
      await deleteTimeAway(db, payload);
    } else if (action === "updateAssignment") {
      requireScheduler(user, "designacao_vm");
      await updateAssignment(db, payload);
    } else if (action === "updateMemberWhatsApp") {
      requireScheduler(user);
      await updateMemberWhatsApp(db, payload);
    } else if (action === "generateWeek") {
      requireScheduler(user, "designacao_vm");
      await generateWeek(db, payload);
    } else if (action === "saveWeekDraft") {
      requireScheduler(user, "designacao_vm");
      await saveWeekDraft(db, payload);
    } else if (action === "publishWeek") {
      requireScheduler(user, "designacao_vm");
      await publishWeek(db, payload);
    } else if (action === "createInvitation") {
      requireScheduler(user);
      generatedAccessCode = await createInvitation(db, payload);
    } else if (action === "runMaintenance") {
      requireScheduler(user);
      await ensureBackgroundMaintenance(db);
    } else {
      return Response.json({ error: "Ação desconhecida." }, { status: 400 });
    }

    const nextState = await withD1Retry(() => getState(db, user));
    const cookie = await withD1Retry(() => renewAppSession(db, request));
    return Response.json(generatedAccessCode ? { ...nextState, generatedAccessCode } : nextState, {
      headers: { "Cache-Control": "no-store", ...(cookie ? { "Set-Cookie": cookie } : {}) },
    });
  } catch (error) {
    return jsonError(
      error,
      isD1OverloadedError(error) ? 503 : error instanceof ConflictError ? 409 : error instanceof UnauthorizedError ? 401 : 500,
    );
  }
}

function getDatabase(): D1Database { return localDatabase; }

function ensureAppReady(db: D1Database) { appReadyPromise ??= (async()=>{ await ensureSchemaReady(db); await seedDemo(db); })().catch(error=>{appReadyPromise=null;throw error;}); return appReadyPromise; }

async function ensureAccountAuditsReady(_db: D1Database) {}

function ensureSchemaReady(db: D1Database) {
  schemaReadyPromise ??= withD1Retry(() => ensureSchema(db)).catch((error) => {
    schemaReadyPromise = null;
    throw error;
  });
  return schemaReadyPromise;
}

function requestHasIdentitySignal(request: Request) { return Boolean(request.headers.get("cookie")?.includes("df_demo_session=")); }

async function ensureSchema(db: D1Database) {
  await db.prepare("CREATE TABLE IF NOT EXISTS congregation_privileges (congregation_id TEXT NOT NULL, group_key TEXT NOT NULL, assignments TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL, PRIMARY KEY (congregation_id, group_key))").run();
  let schemaReady: MaintenanceTaskRow | null = null;
  try {
    schemaReady = await db
      .prepare("SELECT id FROM maintenance_tasks WHERE id = ?")
      .bind(SCHEMA_READY_TASK_ID)
      .first<MaintenanceTaskRow>();
  } catch {
    schemaReady = null;
  }
  if (schemaReady) {
    await ensureSchemaUpgrades(db);
    return;
  }
  if (await existingSchemaLooksReady(db)) {
    await markSchemaReady(db);
    return;
  }

  if (await existingCoreSchemaLooksReady(db)) {
    await ensureSchemaUpgrades(db);
    await markSchemaReady(db);
    return;
  }

  await runBatches(db, [
    db.prepare("CREATE TABLE IF NOT EXISTS congregations (id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, meeting_title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS members (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT, whatsapp_phone TEXT, congregation_status TEXT NOT NULL DEFAULT 'publicador', pioneer_roles TEXT NOT NULL DEFAULT '[]', field_service_group_id TEXT, field_availability TEXT NOT NULL DEFAULT '[]', role TEXT NOT NULL DEFAULT 'publicador', active INTEGER NOT NULL DEFAULT 1, privileges TEXT NOT NULL DEFAULT '[]', editable_modules TEXT NOT NULL DEFAULT '[]', source TEXT NOT NULL DEFAULT 'manual', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS field_service_groups (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, name TEXT NOT NULL, overseer_member_id TEXT, assistant_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS special_events (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, circuit_overseer_name TEXT, circuit_overseer_wife TEXT, midweek_service_talk_title TEXT, midweek_service_talk_song TEXT, weekend_public_talk_title TEXT, weekend_final_talk_title TEXT, weekend_final_talk_song TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS jw_sync_logs (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, checked_at TEXT NOT NULL, source_url TEXT NOT NULL, publications TEXT NOT NULL DEFAULT '[]', imported_weeks INTEGER NOT NULL DEFAULT 0, updated_weeks INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS watchtower_sync_logs (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, checked_at TEXT NOT NULL, source_url TEXT NOT NULL, publications TEXT NOT NULL DEFAULT '[]', imported_studies INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS watchtower_studies (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, issue_title TEXT NOT NULL, study_title TEXT NOT NULL, study_week_label TEXT NOT NULL, study_start_date TEXT, study_end_date TEXT, source_url TEXT NOT NULL, sort_key TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS public_talk_themes (id TEXT PRIMARY KEY, number INTEGER NOT NULL, title TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'S-34', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS public_talk_history (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, public_talk_theme_id TEXT NOT NULL, talk_date TEXT NOT NULL, source_label TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS speaker_talks (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, theme_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS public_meetings (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, meeting_date TEXT NOT NULL, chairman_member_id TEXT, watchtower_conductor_member_id TEXT, watchtower_reader_member_id TEXT, watchtower_study_id TEXT, public_talk_theme_id TEXT, public_talk_speaker TEXT, public_talk_speaker_congregation TEXT, outgoing_speaker TEXT, outgoing_talk_theme TEXT, outgoing_date TEXT, outgoing_time TEXT, outgoing_congregation TEXT, outgoing_address TEXT, outgoing_song TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS mechanical_assignments (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, assignment_date TEXT NOT NULL, meeting_kind TEXT NOT NULL, audio_member_id TEXT, video_member_id TEXT, external_attendant_member_id TEXT, internal_attendant_member_id TEXT, roaming_microphone_member_id TEXT, attendance_total INTEGER, attendance_in_person INTEGER, attendance_zoom INTEGER, attendance_reported_at TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS field_ministry_assignments (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, activity_date TEXT NOT NULL, weekday TEXT NOT NULL, start_time TEXT NOT NULL DEFAULT '09:00', arrangement TEXT NOT NULL, field_service_group_id TEXT, conductor_member_id TEXT, guest_conductor_name TEXT, location TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS meeting_timings (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, assignment_id TEXT, part_key TEXT NOT NULL, part_title TEXT NOT NULL, planned_seconds INTEGER, actual_seconds INTEGER, started_at TEXT, ended_at TEXT, recorded_by_member_id TEXT, reported_at TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS maintenance_tasks (id TEXT PRIMARY KEY, completed_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS weeks (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_start TEXT NOT NULL, meeting_date TEXT NOT NULL, bible_reading TEXT NOT NULL, opening_song TEXT NOT NULL, closing_song TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS assignments (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, section TEXT NOT NULL, section_tone TEXT NOT NULL, sequence INTEGER NOT NULL, title TEXT NOT NULL, duration_min INTEGER, role_key TEXT NOT NULL, assignee_member_id TEXT, assistant_member_id TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS time_away (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, reason TEXT NOT NULL DEFAULT 'Folga', source TEXT NOT NULL DEFAULT 'manual', created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS invitations (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT, email TEXT NOT NULL, whatsapp_phone TEXT, role TEXT NOT NULL DEFAULT 'publicador', status TEXT NOT NULL DEFAULT 'pendente', access_code_hash TEXT, access_code_hint TEXT, access_code_created_at TEXT, password_hash TEXT, password_created_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS app_sessions (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS member_visits (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, field_service_group_id TEXT NOT NULL, member_id TEXT NOT NULL, visit_date TEXT NOT NULL, notes TEXT, recorded_by_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS meeting_attendance (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, field_service_group_id TEXT NOT NULL, member_id TEXT NOT NULL, meeting_date TEXT NOT NULL, status TEXT NOT NULL, notes TEXT, recorded_by_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS account_audits (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, period_label TEXT NOT NULL, months_label TEXT NOT NULL, due_date TEXT NOT NULL, auditor_member_id TEXT, completed_date TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_members_congregation ON members(congregation_id)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_members_email ON members(email) WHERE email IS NOT NULL"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_field_service_groups_congregation ON field_service_groups(congregation_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_special_events_congregation_dates ON special_events(congregation_id, start_date, end_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_jw_sync_logs_congregation ON jw_sync_logs(congregation_id, checked_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_watchtower_sync_logs_congregation ON watchtower_sync_logs(congregation_id, checked_at)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_watchtower_studies_congregation_dates ON watchtower_studies(congregation_id, study_start_date, study_end_date)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_public_talk_themes_number ON public_talk_themes(number)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_public_talk_history_theme_date ON public_talk_history(congregation_id, public_talk_theme_id, talk_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_public_talk_history_date ON public_talk_history(congregation_id, talk_date)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_speaker_talks_member_theme ON speaker_talks(congregation_id, member_id, theme_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_speaker_talks_theme ON speaker_talks(congregation_id, theme_id)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_public_meetings_congregation_week ON public_meetings(congregation_id, week_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_public_meetings_theme ON public_meetings(congregation_id, public_talk_theme_id, meeting_date)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_mechanical_assignments_congregation_date_kind ON mechanical_assignments(congregation_id, assignment_date, meeting_kind)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_mechanical_assignments_audio ON mechanical_assignments(congregation_id, audio_member_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_mechanical_assignments_video ON mechanical_assignments(congregation_id, video_member_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_field_ministry_assignments_congregation_date ON field_ministry_assignments(congregation_id, activity_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_field_ministry_assignments_conductor ON field_ministry_assignments(congregation_id, conductor_member_id)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_timings_week_part ON meeting_timings(congregation_id, week_id, part_key)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_timings_week ON meeting_timings(congregation_id, week_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_weeks_congregation ON weeks(congregation_id)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_weeks_congregation_meeting ON weeks(congregation_id, meeting_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_assignments_week ON assignments(week_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_assignments_assignee ON assignments(assignee_member_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_time_away_member_dates ON time_away(member_id, start_date, end_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_invitations_congregation ON invitations(congregation_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_invitations_member ON invitations(congregation_id, member_id)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_app_sessions_token ON app_sessions(token_hash)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_app_sessions_member ON app_sessions(congregation_id, member_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_app_sessions_expires ON app_sessions(expires_at)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_member_visits_group_member_date ON member_visits(congregation_id, field_service_group_id, member_id, visit_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_member_visits_member ON member_visits(congregation_id, member_id, visit_date)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_attendance_group_member_date ON meeting_attendance(congregation_id, field_service_group_id, member_id, meeting_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_attendance_group_date ON meeting_attendance(congregation_id, field_service_group_id, meeting_date)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_account_audits_congregation_period ON account_audits(congregation_id, period_label)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_account_audits_due ON account_audits(congregation_id, due_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_account_audits_auditor ON account_audits(congregation_id, auditor_member_id)"),
    db.prepare("PRAGMA optimize"),
  ]);
  await ensureMemberColumns(db);
  await ensureInvitationColumns(db);
  await ensureSpecialEventColumns(db);
  await ensureMechanicalAssignmentColumns(db);
  await ensurePublicMeetingColumns(db);
  await ensureFieldMinistryAssignmentColumns(db);
  await ensureMeetingTimingTable(db);
  await ensureAccountAuditTable(db);
  await ensurePublicMeetingMonthDefaultsTable(db);
  await markSchemaReady(db);
}

async function ensureSchemaUpgrades(db: D1Database) { await ensureMemberColumns(db); await ensureInvitationColumns(db); await ensureSpecialEventColumns(db); await ensureMechanicalAssignmentColumns(db); await ensurePublicMeetingColumns(db); await ensureFieldMinistryAssignmentColumns(db); await ensureGroupCareTables(db); await ensureMeetingTimingTable(db); await ensureAccountAuditTable(db); await ensurePublicMeetingMonthDefaultsTable(db); }

async function existingSchemaLooksReady(db: D1Database) {
  try {
    const tableRows = await db
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table'")
      .all<{ name: string }>();
    const tables = new Set(tableRows.results.map((row) => row.name));
    const requiredTables = [
      "congregations",
      "members",
      "field_service_groups",
      "special_events",
      "jw_sync_logs",
      "watchtower_sync_logs",
      "watchtower_studies",
      "public_talk_themes",
      "public_talk_history",
      "speaker_talks",
      "weeks",
      "assignments",
      "time_away",
      "public_meetings",
      "mechanical_assignments",
      "field_ministry_assignments",
      "meeting_timings",
      "invitations",
      "app_sessions",
      "maintenance_tasks",
      "member_visits",
      "meeting_attendance",
      "account_audits",
      "public_meeting_month_defaults",
    ];
    if (!requiredTables.every((table) => tables.has(table))) return false;
    return (
      (await tableHasColumns(db, "members", ["whatsapp_phone", "congregation_status", "pioneer_roles", "field_availability", "editable_modules", "gender", "participation_status"])) &&
      (await tableHasColumns(db, "invitations", ["member_id", "whatsapp_phone", "access_code_hash", "access_code_hint", "password_hash"])) &&
      (await tableHasColumns(db, "special_events", ["special_talk_speaker", "midweek_service_talk_title", "midweek_service_talk_song", "weekend_public_talk_title", "weekend_final_talk_title", "weekend_final_talk_song"])) &&
      (await tableHasColumns(db, "field_ministry_assignments", ["guest_conductor_name"])) &&
      (await tableHasColumns(db, "meeting_timings", ["planned_seconds", "actual_seconds", "reported_at"])) &&
      (await tableHasColumns(db, "account_audits", ["period_label", "months_label", "due_date", "auditor_member_id", "completed_date"])) &&
      (await tableHasColumns(db, "mechanical_assignments", ["attendance_total", "attendance_in_person", "attendance_zoom", "attendance_reported_at"])) &&
      (await tableHasColumns(db, "public_talk_history", ["public_talk_theme_id", "talk_date", "source_label"])) &&
      (await tableHasColumns(db, "speaker_talks", ["member_id", "theme_id"])) &&
      (await tableHasColumns(db, "public_meetings", ["outgoing_speaker", "outgoing_talk_theme", "outgoing_address"]))
    );
  } catch {
    return false;
  }
}

async function existingCoreSchemaLooksReady(db: D1Database) {
  try {
    const tableRows = await db
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table'")
      .all<{ name: string }>();
    const tables = new Set(tableRows.results.map((row) => row.name));
    const requiredCoreTables = [
      "congregations",
      "members",
      "field_service_groups",
      "special_events",
      "jw_sync_logs",
      "watchtower_sync_logs",
      "watchtower_studies",
      "public_talk_themes",
      "weeks",
      "assignments",
      "time_away",
      "public_meetings",
      "mechanical_assignments",
      "field_ministry_assignments",
      "invitations",
      "app_sessions",
      "maintenance_tasks",
    ];
    return requiredCoreTables.every((table) => tables.has(table));
  } catch {
    return false;
  }
}

async function tableHasColumns(db: D1Database, tableName: string, columns: string[]) {
  const rows = await db.prepare(`PRAGMA table_info(${tableName})`).all<{ name: string }>();
  const names = new Set(rows.results.map((row) => row.name));
  return columns.every((column) => names.has(column));
}

async function markSchemaReady(db: D1Database) {
  await db
    .prepare("INSERT OR REPLACE INTO maintenance_tasks (id, completed_at) VALUES (?, ?)")
    .bind(SCHEMA_READY_TASK_ID, new Date().toISOString())
    .run();
}

async function ensureMemberColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(members)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions = [
    ["whatsapp_phone", "ALTER TABLE members ADD COLUMN whatsapp_phone TEXT"],
    ["gender", "ALTER TABLE members ADD COLUMN gender TEXT"],
    ["participation_status", "ALTER TABLE members ADD COLUMN participation_status TEXT"],
    ["congregation_status", "ALTER TABLE members ADD COLUMN congregation_status TEXT NOT NULL DEFAULT 'publicador'"],
    ["pioneer_roles", "ALTER TABLE members ADD COLUMN pioneer_roles TEXT NOT NULL DEFAULT '[]'"],
    ["field_service_group_id", "ALTER TABLE members ADD COLUMN field_service_group_id TEXT"],
    ["field_availability", "ALTER TABLE members ADD COLUMN field_availability TEXT NOT NULL DEFAULT '[]'"],
    ["editable_modules", "ALTER TABLE members ADD COLUMN editable_modules TEXT NOT NULL DEFAULT '[]'"],
  ] as const;

  for (const [name, sql] of additions) {
    if (!names.has(name)) {
      await db.prepare(sql).run();
    }
  }
}

async function ensureInvitationColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(invitations)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions = [
    ["whatsapp_phone", "ALTER TABLE invitations ADD COLUMN whatsapp_phone TEXT"],
    ["member_id", "ALTER TABLE invitations ADD COLUMN member_id TEXT"],
    ["access_code_hash", "ALTER TABLE invitations ADD COLUMN access_code_hash TEXT"],
    ["access_code_hint", "ALTER TABLE invitations ADD COLUMN access_code_hint TEXT"],
    ["access_code_created_at", "ALTER TABLE invitations ADD COLUMN access_code_created_at TEXT"],
    ["password_hash", "ALTER TABLE invitations ADD COLUMN password_hash TEXT"],
    ["password_created_at", "ALTER TABLE invitations ADD COLUMN password_created_at TEXT"],
  ] as const;

  for (const [name, sql] of additions) {
    if (!names.has(name)) {
      await db.prepare(sql).run();
    }
  }
}

async function ensureSpecialEventColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(special_events)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions = [
    ["midweek_service_talk_title", "ALTER TABLE special_events ADD COLUMN midweek_service_talk_title TEXT"],
    ["special_talk_speaker", "ALTER TABLE special_events ADD COLUMN special_talk_speaker TEXT"],
    ["midweek_service_talk_song", "ALTER TABLE special_events ADD COLUMN midweek_service_talk_song TEXT"],
    ["weekend_public_talk_title", "ALTER TABLE special_events ADD COLUMN weekend_public_talk_title TEXT"],
    ["weekend_final_talk_title", "ALTER TABLE special_events ADD COLUMN weekend_final_talk_title TEXT"],
    ["weekend_final_talk_song", "ALTER TABLE special_events ADD COLUMN weekend_final_talk_song TEXT"],
  ] as const;

  for (const [name, sql] of additions) {
    if (!names.has(name)) {
      await db.prepare(sql).run();
    }
  }
}

async function ensureFieldMinistryAssignmentColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(field_ministry_assignments)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  if (!names.has("guest_conductor_name")) {
    await db.prepare("ALTER TABLE field_ministry_assignments ADD COLUMN guest_conductor_name TEXT").run();
  }
}

async function ensureMechanicalAssignmentColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(mechanical_assignments)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions = [
    ["attendance_total", "ALTER TABLE mechanical_assignments ADD COLUMN attendance_total INTEGER"],
    ["attendance_in_person", "ALTER TABLE mechanical_assignments ADD COLUMN attendance_in_person INTEGER"],
    ["attendance_zoom", "ALTER TABLE mechanical_assignments ADD COLUMN attendance_zoom INTEGER"],
    ["attendance_reported_at", "ALTER TABLE mechanical_assignments ADD COLUMN attendance_reported_at TEXT"],
  ] as const;

  for (const [name, sql] of additions) {
    if (!names.has(name)) {
      await db.prepare(sql).run();
    }
  }
}

async function ensurePublicMeetingColumns(db: D1Database) {
  const columns = await db.prepare("PRAGMA table_info(public_meetings)").all<{ name: string }>();
  const names = new Set(columns.results.map((column) => column.name));
  const additions = [
    ["public_talk_speaker_congregation", "ALTER TABLE public_meetings ADD COLUMN public_talk_speaker_congregation TEXT"],
    ["outgoing_speaker", "ALTER TABLE public_meetings ADD COLUMN outgoing_speaker TEXT"],
    ["outgoing_talk_theme", "ALTER TABLE public_meetings ADD COLUMN outgoing_talk_theme TEXT"],
    ["outgoing_date", "ALTER TABLE public_meetings ADD COLUMN outgoing_date TEXT"],
    ["outgoing_time", "ALTER TABLE public_meetings ADD COLUMN outgoing_time TEXT"],
    ["outgoing_congregation", "ALTER TABLE public_meetings ADD COLUMN outgoing_congregation TEXT"],
    ["outgoing_address", "ALTER TABLE public_meetings ADD COLUMN outgoing_address TEXT"],
    ["outgoing_song", "ALTER TABLE public_meetings ADD COLUMN outgoing_song TEXT"],
  ] as const;

  for (const [name, sql] of additions) {
    if (!names.has(name)) {
      await db.prepare(sql).run();
    }
  }
}

async function ensureGroupCareTables(db: D1Database) {
  await runBatches(db, [
    db.prepare("CREATE TABLE IF NOT EXISTS member_visits (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, field_service_group_id TEXT NOT NULL, member_id TEXT NOT NULL, visit_date TEXT NOT NULL, notes TEXT, recorded_by_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE TABLE IF NOT EXISTS meeting_attendance (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, field_service_group_id TEXT NOT NULL, member_id TEXT NOT NULL, meeting_date TEXT NOT NULL, status TEXT NOT NULL, notes TEXT, recorded_by_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_member_visits_group_member_date ON member_visits(congregation_id, field_service_group_id, member_id, visit_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_member_visits_member ON member_visits(congregation_id, member_id, visit_date)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_attendance_group_member_date ON meeting_attendance(congregation_id, field_service_group_id, member_id, meeting_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_attendance_group_date ON meeting_attendance(congregation_id, field_service_group_id, meeting_date)"),
  ]);
}

async function ensureMeetingTimingTable(db: D1Database) {
  await runBatches(db, [
    db.prepare("CREATE TABLE IF NOT EXISTS meeting_timings (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, assignment_id TEXT, part_key TEXT NOT NULL, part_title TEXT NOT NULL, planned_seconds INTEGER, actual_seconds INTEGER, started_at TEXT, ended_at TEXT, recorded_by_member_id TEXT, reported_at TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_meeting_timings_week_part ON meeting_timings(congregation_id, week_id, part_key)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_meeting_timings_week ON meeting_timings(congregation_id, week_id)"),
  ]);
}

async function ensureAccountAuditTable(db: D1Database) {
  await runBatches(db, [
    db.prepare("CREATE TABLE IF NOT EXISTS account_audits (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, period_label TEXT NOT NULL, months_label TEXT NOT NULL, due_date TEXT NOT NULL, auditor_member_id TEXT, completed_date TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_account_audits_congregation_period ON account_audits(congregation_id, period_label)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_account_audits_due ON account_audits(congregation_id, due_date)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_account_audits_auditor ON account_audits(congregation_id, auditor_member_id)"),
  ]);
}

async function ensurePublicMeetingMonthDefaultsTable(db: D1Database) {
  await runBatches(db, [
    db.prepare("CREATE TABLE IF NOT EXISTS public_meeting_month_defaults (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, month_key TEXT NOT NULL, default_weekday TEXT NOT NULL DEFAULT 'sabado', default_time TEXT, destination_congregation TEXT, destination_address TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_pmmd_congregation_month ON public_meeting_month_defaults(congregation_id, month_key)"),
  ]);
}

async function ensureBackgroundMaintenance(_db:D1Database) {}

async function generateFieldMinistryMonth(_db: D1Database, _payload: Record<string, unknown>) { throw new Error("A geração mensal de campo está desativada nesta edição."); }

async function ensureSpeakerTalksTable(db: D1Database) {
  await runBatches(db, [
    db.prepare("CREATE TABLE IF NOT EXISTS speaker_talks (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, theme_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)"),
    db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS idx_speaker_talks_member_theme ON speaker_talks(congregation_id, member_id, theme_id)"),
    db.prepare("CREATE INDEX IF NOT EXISTS idx_speaker_talks_theme ON speaker_talks(congregation_id, theme_id)"),
  ]);
}

async function ensureImportedPublicTalkHistory(_db: D1Database) {}

async function importHistoricalPublicMeetings(_db: D1Database) { throw new Error("Importação de históricos reais desativada."); }

async function ensureFieldMinistryMonth(_db:D1Database,_monthKey:string,_options:{forceRebuild:boolean}) { throw new Error("Geração mensal desativada na demonstração."); }

type FieldMinistryHistoryDates = {
  fridayMorning: Map<string, string>;
  fridayAfternoon: Map<string, string>;
  saturday: Map<string, string>;
  allGroups: Map<string, string>;
  holidays: Map<string, string>;
  groups: Map<string, Map<string, string>>;
};

async function findOrCreateMemberByName(db: D1Database, name: string, privileges: string[] = []) {
  const normalized = normalizeSearchText(name);
  const existing = await db
    .prepare("SELECT * FROM members WHERE congregation_id = ? AND lower(name) = lower(?) LIMIT 1")
    .bind(CONGREGATION_ID, name)
    .first<MemberRow>();
  if (existing) {
    await ensureMemberPrivileges(db, existing, privileges);
    return existing;
  }

  const now = new Date().toISOString();
  const id = `m-${slugify(normalized)}-${crypto.randomUUID().slice(0, 8)}`;
  await db
    .prepare("INSERT INTO members (id, congregation_id, name, role, active, privileges, source, created_at, updated_at) VALUES (?, ?, ?, 'publicador', 1, ?, 'pdf/s34', ?, ?)")
    .bind(id, CONGREGATION_ID, name, JSON.stringify(normalizePrivileges(privileges)), now, now)
    .run();
  return (await db.prepare("SELECT * FROM members WHERE id = ?").bind(id).first<MemberRow>())!;
}

async function ensureMemberPrivileges(db: D1Database, member: MemberRow, privileges: string[]) {
  const merged = normalizePrivileges([...parsePrivileges(member.privileges), ...privileges]);
  if (JSON.stringify(merged) === JSON.stringify(parsePrivileges(member.privileges))) return;
  await db
    .prepare("UPDATE members SET privileges = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(JSON.stringify(merged), new Date().toISOString(), member.id, CONGREGATION_ID)
    .run();
}

function toSafeMember(member: MemberRow): SafeMemberRow {
  return {
    ...member,
    active: Boolean(member.active),
    privileges: parsePrivileges(member.privileges),
    congregation_status: readCongregationStatus(member.congregation_status),
    pioneer_roles: parsePioneerRoles(member.pioneer_roles),
    field_service_group_id: member.field_service_group_id ?? null,
    field_availability: parseFieldDays(member.field_availability),
    editable_modules: parseEditableModules(member.editable_modules),
  };
}

async function runBatches(db: D1Database, operations: D1PreparedStatement[]) {
  for (let index = 0; index < operations.length; index += D1_BATCH_SIZE) {
    await withD1Retry(() => db.batch(operations.slice(index, index + D1_BATCH_SIZE)));
    if (index + D1_BATCH_SIZE < operations.length) {
      await wait(D1_RETRY_DELAYS_MS[0]);
    }
  }
}

async function d1Batch(db: D1Database, operations: D1PreparedStatement[]) {
  const results: unknown[] = [];
  for (let index = 0; index < operations.length; index += D1_READ_BATCH_SIZE) {
    const chunk = await withD1Retry(() => db.batch(operations.slice(index, index + D1_READ_BATCH_SIZE)));
    results.push(...chunk);
    if (index + D1_READ_BATCH_SIZE < operations.length) {
      await wait(30);
    }
  }
  return results;
}

async function withD1Retry<T>(operation: () => Promise<T>) {
  let lastError: unknown = null;
  for (let attempt = 0; attempt <= D1_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isD1OverloadedError(error) || attempt >= D1_RETRY_DELAYS_MS.length) {
        throw error;
      }
      await wait(D1_RETRY_DELAYS_MS[attempt]);
    }
  }
  throw lastError;
}

function wait(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

async function getState(db: D1Database, user: Awaited<ReturnType<typeof ensureCurrentUser>>) {
  const privilegeAssignments = user.role === "admin" ? await getPrivilegeAssignments(db) : {};
  const [
    congregationRows,
    members,
    fieldServiceGroups,
    specialEvents,
    latestJwSyncRows,
    latestWatchtowerSyncRows,
    weeks,
    assignments,
    publicMeetings,
    publicTalkHistory,
    speakerTalks,
    mechanicalAssignments,
    fieldMinistryAssignments,
    publicTalkThemes,
    watchtowerStudies,
    timeAway,
    invitations,
    memberVisits,
    meetingAttendance,
    meetingTimingRecords,
    accountAudits,
    publicMeetingMonthDefaults,
  ] = await d1Batch(db, [
    db
      .prepare("SELECT * FROM congregations WHERE id = ? LIMIT 1")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM members WHERE congregation_id = ? ORDER BY active DESC, name")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM field_service_groups WHERE congregation_id = ? ORDER BY name")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM special_events WHERE congregation_id = ? ORDER BY start_date, title")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM jw_sync_logs WHERE congregation_id = ? ORDER BY checked_at DESC LIMIT 1")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM watchtower_sync_logs WHERE congregation_id = ? ORDER BY checked_at DESC LIMIT 1")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM weeks WHERE congregation_id = ? ORDER BY meeting_date")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM assignments WHERE congregation_id = ? ORDER BY week_id, sequence")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM public_meetings WHERE congregation_id = ? ORDER BY meeting_date")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM public_talk_history WHERE congregation_id = ? ORDER BY talk_date DESC")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM speaker_talks WHERE congregation_id = ? ORDER BY member_id, theme_id")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM mechanical_assignments WHERE congregation_id = ? ORDER BY assignment_date, meeting_kind")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM field_ministry_assignments WHERE congregation_id = ? AND activity_date <= ? ORDER BY activity_date, arrangement, field_service_group_id")
      .bind(CONGREGATION_ID, FIELD_MINISTRY_MAX_DATE),
    db
      .prepare("SELECT * FROM public_talk_themes WHERE active = 1 ORDER BY number"),
    db
      .prepare("SELECT * FROM watchtower_studies WHERE congregation_id = ? ORDER BY sort_key, study_title")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM time_away WHERE congregation_id = ? ORDER BY start_date, member_id")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM invitations WHERE congregation_id = ? ORDER BY created_at DESC")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM member_visits WHERE congregation_id = ? ORDER BY visit_date DESC, member_id")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM meeting_attendance WHERE congregation_id = ? ORDER BY meeting_date DESC, member_id")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM meeting_timings WHERE congregation_id = ? ORDER BY week_id, part_key")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM account_audits WHERE congregation_id = ? ORDER BY due_date")
      .bind(CONGREGATION_ID),
    db
      .prepare("SELECT * FROM public_meeting_month_defaults WHERE congregation_id = ? ORDER BY month_key")
      .bind(CONGREGATION_ID),
  ]) as [
    D1Rows<CongregationRow>,
    D1Rows<MemberRow>,
    D1Rows<FieldServiceGroupRow>,
    D1Rows<SpecialEventRow>,
    D1Rows<JwSyncLogRow>,
    D1Rows<WatchtowerSyncLogRow>,
    D1Rows<WeekRow>,
    D1Rows<AssignmentRow>,
    D1Rows<PublicMeetingRow>,
    D1Rows<PublicTalkHistoryRow>,
    D1Rows<SpeakerTalkRow>,
    D1Rows<MechanicalAssignmentRow>,
    D1Rows<FieldMinistryAssignmentRow>,
    D1Rows<PublicTalkThemeRow>,
    D1Rows<WatchtowerStudyRow>,
    D1Rows<TimeAwayRow>,
    D1Rows<InvitationRow>,
    D1Rows<MemberVisitRow>,
    D1Rows<MeetingAttendanceRow>,
    D1Rows<MeetingTimingRow>,
    D1Rows<AccountAuditRow>,
    D1Rows<PublicMeetingMonthDefaultRow>,
  ];
  const congregation = congregationRows.results[0] ?? null;
  const latestJwSync = latestJwSyncRows.results[0] ?? null;
  const latestWatchtowerSync = latestWatchtowerSyncRows.results[0] ?? null;
  const fieldMinistryAssignmentsThrough2026 = fieldMinistryAssignments.results.filter(
    (assignment) => assignment.activity_date <= FIELD_MINISTRY_MAX_DATE,
  );

  const safeMembers = members.results.map(toSafeMember);
  const conflicts = detectConflicts(
    weeks.results,
    assignments.results,
    safeMembers,
    timeAway.results,
  );
  const eventReminders = buildEventReminders(weeks.results, specialEvents.results);
  const canManageMidweekAssignments = user.role === "admin" || user.editableModules.includes("designacao_vm");
  const publishedWeekIds = new Set(weeks.results.filter((week) => week.status === "publicada").map((week) => week.id));
  // Editores veem rascunhos da Vida e Ministério; visualizadores veem apenas semanas publicadas.
  const canSeeSchedule = true;
  // Contatos: só quem gerencia (admin) vê email/telefone dos outros membros.
  const canSeeContacts = user.role === "admin";
  const canSeePastoralData = user.role === "admin" || user.editableModules.includes("pastoreio");
  const currentMember = safeMembers.find((member) => member.id === user.id) ?? null;
  const currentMemberName = currentMember?.name ?? user.displayName;
  const canUseTimeControl = userCanUseTimeControl(user, currentMemberName);
  const canSeeAccountAudits = userCanSeeAccountAudits(user, currentMember);
  // Operadores precisam da programação completa para cronometrar, inclusive em revisão.
  // A permissão de editar designações continua independente do controle de tempo.
  const scopedAssignments = canManageMidweekAssignments || canUseTimeControl
    ? assignments.results
    : assignments.results.filter((assignment) => publishedWeekIds.has(assignment.week_id));
  const scopedPublicMeetings = canSeeSchedule
    ? publicMeetings.results
    : publicMeetings.results.filter(
        (meeting) =>
          meeting.chairman_member_id === user.id ||
          meeting.watchtower_reader_member_id === user.id ||
          normalizeSearchText(meeting.public_talk_speaker ?? "") === normalizeSearchText(currentMemberName) ||
          normalizeSearchText(meeting.outgoing_speaker ?? "") === normalizeSearchText(currentMemberName),
      );
  const scopedMechanicalAssignments = user.role === "admin" || user.editableModules.includes("mecanicas")
    ? mechanicalAssignments.results
    : mechanicalAssignments.results.filter((assignment) => assignment.status === "confirmada");
  const scopedFieldMinistryAssignments = canSeeSchedule
    ? fieldMinistryAssignmentsThrough2026
    : fieldMinistryAssignmentsThrough2026.filter((assignment) => assignment.conductor_member_id === user.id);
  const visibleMemberIds = new Set<string>([user.id]);
  for (const assignment of scopedAssignments) {
    if (assignment.assignee_member_id) visibleMemberIds.add(assignment.assignee_member_id);
    if (assignment.assistant_member_id) visibleMemberIds.add(assignment.assistant_member_id);
  }
  for (const meeting of scopedPublicMeetings) {
    if (meeting.chairman_member_id) visibleMemberIds.add(meeting.chairman_member_id);
    if (meeting.watchtower_conductor_member_id) visibleMemberIds.add(meeting.watchtower_conductor_member_id);
    if (meeting.watchtower_reader_member_id) visibleMemberIds.add(meeting.watchtower_reader_member_id);
  }
  for (const assignment of scopedMechanicalAssignments) {
    for (const memberId of [
      assignment.audio_member_id,
      assignment.video_member_id,
      assignment.external_attendant_member_id,
      assignment.internal_attendant_member_id,
      assignment.roaming_microphone_member_id,
    ]) {
      if (memberId) visibleMemberIds.add(memberId);
    }
  }
  for (const assignment of scopedFieldMinistryAssignments) {
    if (assignment.conductor_member_id) visibleMemberIds.add(assignment.conductor_member_id);
  }
  const scopedMembers = canSeeContacts
    ? safeMembers
    : safeMembers
        .map((member) =>
          member.id === user.id
            ? member
            : {
                ...member,
                email: null,
                whatsapp_phone: null,
              },
        );
  const scopedTimeAway = canSeeSchedule ? timeAway.results : timeAway.results.filter((away) => away.member_id === user.id);
  const visibleFieldGroupIds = new Set(
    scopedFieldMinistryAssignments
      .map((assignment) => assignment.field_service_group_id)
      .filter((id): id is string => Boolean(id)),
  );
  if (currentMember?.field_service_group_id) visibleFieldGroupIds.add(currentMember.field_service_group_id);
  const scopedConflicts = canManageMidweekAssignments
    ? conflicts
    : conflicts.filter(
        (conflict) =>
          conflict.memberId === user.id ||
          scopedAssignments.some((assignment) => assignment.id === conflict.assignmentId),
      );
  const safeInvitations = invitations.results.map((invitation) => ({
    id: invitation.id,
    member_id: invitation.member_id,
    email: invitation.email,
    whatsapp_phone: invitation.whatsapp_phone,
    role: invitation.role,
    status: invitation.status,
    access_code_hint: invitation.access_code_hint,
    access_code_created_at: invitation.access_code_created_at,
    password_created_at: invitation.password_created_at,
  }));
  const totals = {
    members: scopedMembers.filter((member) => member.active).length,
    weeks: weeks.results.length,
    conflicts: scopedConflicts.length,
    confirmed: scopedAssignments.filter((assignment) => assignment.status === "confirmada").length,
  };
  const attendanceReportMember = safeMembers.find((member) => normalizeSearchText(member.name) === normalizeSearchText("Participante 001"));
  const timeControlReportRecipients = canUseTimeControl
    ? TIME_CONTROL_REPORT_RECIPIENT_NAMES.map((name) => safeMembers.find((member) => normalizeSearchText(member.name) === normalizeSearchText(name)))
        .filter((member): member is SafeMemberRow => Boolean(member))
        .map((member) => ({
          name: member.name,
          whatsapp_phone: member.whatsapp_phone,
        }))
    : [];

  const visibleAssignmentIds = new Set(
    assignments.results
      .filter((assignment) => assignment.assignee_member_id === user.id || assignment.assistant_member_id === user.id)
      .map((assignment) => assignment.id),
  );
  const canViewAllMeetingTimings =
    canUseTimeControl ||
    currentMember?.congregation_status === "servo_ministerial" ||
    currentMember?.congregation_status === "anciao";
  const scopedMeetingTimingRecords = canViewAllMeetingTimings
    ? meetingTimingRecords.results
    : meetingTimingRecords.results.filter(
        (record) =>
          record.assignment_id != null &&
          visibleAssignmentIds.has(record.assignment_id) &&
          record.planned_seconds != null &&
          record.actual_seconds != null &&
          record.actual_seconds > record.planned_seconds,
      );

  return {
    user,
    privilegeAssignments,
    maintenancePending: false,
    congregation,
    members: scopedMembers,
    fieldServiceGroups: canSeeSchedule
      ? fieldServiceGroups.results
      : fieldServiceGroups.results.filter((group) => visibleFieldGroupIds.has(group.id)),
    specialEvents: specialEvents.results,
    latestJwSync: latestJwSync
      ? {
          ...latestJwSync,
          publications: parseStoredStringArray(latestJwSync.publications),
        }
      : null,
    latestWatchtowerSync: latestWatchtowerSync
      ? {
          ...latestWatchtowerSync,
          publications: parseStoredStringArray(latestWatchtowerSync.publications),
        }
      : null,
    eventReminders,
    weeks: weeks.results,
    assignments: scopedAssignments,
    publicMeetings: scopedPublicMeetings,
    publicMeetingMonthDefaults: publicMeetingMonthDefaults.results,
    publicTalkHistory: canSeeSchedule ? publicTalkHistory.results : [],
    speakerTalks: canSeeSchedule ? speakerTalks.results : [],
    mechanicalAssignments: scopedMechanicalAssignments,
    fieldMinistryAssignments: scopedFieldMinistryAssignments,
    accountAudits: canSeeAccountAudits ? accountAudits.results : [],
    memberVisits: canSeePastoralData ? memberVisits.results : [],
    meetingAttendance: canSeePastoralData ? meetingAttendance.results : [],
    meetingTimingRecords: scopedMeetingTimingRecords,
    attendanceReportWhatsApp: attendanceReportMember?.whatsapp_phone ?? null,
    timeControlReportRecipients,
    publicTalkThemes: publicTalkThemes.results.map((theme) => ({
      ...theme,
      active: Boolean(theme.active),
    })),
    watchtowerStudies: watchtowerStudies.results,
    timeAway: scopedTimeAway,
    invitations: canSeeContacts ? safeInvitations : [],
    roleLabels: ROLE_LABELS,
    conflicts: scopedConflicts,
    totals,
  };
}

function readParticipationStatus(value: unknown) {
  if (value === undefined) return "ativo";
  if (value === "ativo" || value === "inativo" || value === "mudou_congregacao") return value;
  throw new Error("Participação na congregação inválida.");
}

async function requireActiveParticipantNames(db: D1Database, names: Array<string | null | undefined>) {
  for (const name of new Set(names.filter((value): value is string => Boolean(value)))) {
    const member = await db.prepare("SELECT id, active FROM members WHERE congregation_id = ? AND lower(name) = lower(?) LIMIT 1")
      .bind(CONGREGATION_ID, name).first<Pick<MemberRow, "id" | "active">>();
    if (member && !member.active) throw new Error(`${name} está inativo ou mudou de congregação e não pode receber novas designações.`);
  }
}

async function requireActiveParticipants(db: D1Database, ids: Array<string | null | undefined>) {
  for (const id of new Set(ids.filter((value): value is string => Boolean(value)))) {
    const member = await db.prepare("SELECT id, name, active FROM members WHERE congregation_id = ? AND id = ? LIMIT 1")
      .bind(CONGREGATION_ID, id).first<Pick<MemberRow, "id" | "name" | "active">>();
    if (!member || !member.active) throw new Error(`${member?.name ?? "Participante"} está inativo ou mudou de congregação e não pode receber novas designações.`);
  }
}

async function getPrivilegeAssignments(db: D1Database): Promise<PrivilegeAssignments> {
  const rows = await db.prepare("SELECT group_key, assignments, updated_at FROM congregation_privileges WHERE congregation_id = ?")
    .bind(CONGREGATION_ID).all<{ group_key: string; assignments: string; updated_at: string }>();
  return Object.fromEntries(rows.results.map((row) => [row.group_key, {
    values: JSON.parse(row.assignments) as Record<string, string>, updatedAt: row.updated_at,
  }]));
}

async function savePrivilegeGroup(db: D1Database, payload: Record<string, unknown>) {
  const groupKey = readText(payload.groupKey, "Área");
  const group = [...privilegeGroups, elderGroup].find((entry) => entry.key === groupKey);
  if (!group) throw new Error("Área de privilégios inválida.");
  const rows = await db.prepare("SELECT * FROM members WHERE congregation_id = ?").bind(CONGREGATION_ID).all<MemberRow>();
  const assignments = await getPrivilegeAssignments(db);
  const expectedVersion = typeof payload.updatedAt === "string" ? payload.updatedAt : "";
  if ((assignments[groupKey]?.updatedAt ?? "") !== expectedVersion) {
    throw new ConflictError("Esta área foi alterada por outro administrador. Recarregue a página antes de salvar.", []);
  }
  const members = rows.results.map(toSafeMember);
  const values = validatePrivilegeValues(group, payload.values, members, assignments);
  // Também impede que o novo responsável seja o ajudante já salvo na mesma área.
  if (group.eldersOnly) {
    const nextAssignments = { ...assignments, anciaos: { values, updatedAt: "" } };
    for (const linkedGroup of privilegeGroups.filter((entry) => entry.slots.some((slot) => slot.source))) {
      const source = linkedGroup.slots.find((slot) => slot.source)?.source;
      const responsibleId = source ? nextAssignments.anciaos.values[source] : "";
      if (responsibleId && responsibleId === assignments[linkedGroup.key]?.values.ajudante) {
        throw new Error(`${linkedGroup.label}: o responsável não pode ser o ajudante da mesma área. Altere o ajudante primeiro.`);
      }
    }
  }
  const result = await db.prepare("INSERT INTO congregation_privileges (congregation_id, group_key, assignments, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (congregation_id, group_key) DO UPDATE SET assignments = excluded.assignments, updated_at = excluded.updated_at WHERE congregation_privileges.updated_at = ?")
    .bind(CONGREGATION_ID, groupKey, JSON.stringify(values), new Date().toISOString(), expectedVersion).run();
  if (!result.meta.changes) throw new ConflictError("Esta área foi alterada por outro administrador. Recarregue a página antes de salvar.", []);
}

async function createMember(db: D1Database, payload: Record<string, unknown>) {
  const gender = readMemberGender(payload.gender);
  const participationStatus = readParticipationStatus(payload.participationStatus);
  const name = readText(payload.name, "Nome");
  const email = optionalText(payload.email)?.toLowerCase() ?? null;
  const whatsappPhone = normalizeWhatsAppPhone(optionalText(payload.whatsappPhone));
  const role = readRole(payload.role);
  const congregationStatus = readCongregationStatus(payload.congregationStatus ?? payload.congregation_status);
  const pioneerRoles = readPioneerRoles(payload.pioneerRoles ?? payload.pioneer_roles);
  const fieldServiceGroupId = optionalText(payload.fieldServiceGroupId ?? payload.field_service_group_id);
  const fieldAvailability = readFieldDays(payload.fieldAvailability ?? payload.field_availability);
  const privileges = readDesignPrivileges(payload.privileges);
  const editableModules = readEditableModules(payload.editableModules ?? payload.editable_modules, role);
  const now = new Date().toISOString();
  await db
    .prepare("INSERT INTO members (id, congregation_id, name, email, whatsapp_phone, congregation_status, pioneer_roles, field_service_group_id, field_availability, role, active, privileges, editable_modules, source, created_at, updated_at, gender, participation_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'manual', ?, ?, ?, ?)")
    .bind(
      `m-${crypto.randomUUID()}`,
      CONGREGATION_ID,
      name,
      email,
      whatsappPhone,
      congregationStatus,
      JSON.stringify(pioneerRoles),
      fieldServiceGroupId,
      JSON.stringify(fieldAvailability),
      role,
      participationStatus === "ativo" ? 1 : 0,
      JSON.stringify(privileges),
      JSON.stringify(editableModules),
      now,
      now,
      gender,
      participationStatus,
    )
    .run();
}

async function updateMember(db: D1Database, payload: Record<string, unknown>) {
  const gender = readMemberGender(payload.gender);
  const participationStatus = readParticipationStatus(payload.participationStatus);
  const memberId = readText(payload.memberId, "Participante");
  const name = readText(payload.name, "Nome");
  const email = optionalText(payload.email)?.toLowerCase() ?? null;
  const whatsappPhone = normalizeWhatsAppPhone(optionalText(payload.whatsappPhone));
  const role = readRole(payload.role);
  const congregationStatus = readCongregationStatus(payload.congregationStatus ?? payload.congregation_status);
  const pioneerRoles = readPioneerRoles(payload.pioneerRoles ?? payload.pioneer_roles);
  const fieldServiceGroupId = optionalText(payload.fieldServiceGroupId ?? payload.field_service_group_id);
  const fieldAvailability = readFieldDays(payload.fieldAvailability ?? payload.field_availability);
  const privileges = readDesignPrivileges(payload.privileges);
  const editableModules = readEditableModules(payload.editableModules ?? payload.editable_modules, role);
  await db
    .prepare("UPDATE members SET name = ?, email = ?, whatsapp_phone = ?, congregation_status = ?, pioneer_roles = ?, field_service_group_id = ?, field_availability = ?, role = ?, privileges = ?, editable_modules = ?, gender = CASE WHEN ? THEN ? ELSE gender END, active = CASE WHEN ? THEN ? ELSE active END, participation_status = CASE WHEN ? THEN ? ELSE participation_status END, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(
      name,
      email,
      whatsappPhone,
      congregationStatus,
      JSON.stringify(pioneerRoles),
      fieldServiceGroupId,
      JSON.stringify(fieldAvailability),
      role,
      JSON.stringify(privileges),
      JSON.stringify(editableModules),
      Object.prototype.hasOwnProperty.call(payload, "gender") ? 1 : 0,
      gender,
      Object.prototype.hasOwnProperty.call(payload, "participationStatus") ? 1 : 0,
      participationStatus === "ativo" ? 1 : 0,
      Object.prototype.hasOwnProperty.call(payload, "participationStatus") ? 1 : 0,
      participationStatus,
      new Date().toISOString(),
      memberId,
      CONGREGATION_ID,
    )
    .run();
}

async function deleteMember(
  db: D1Database,
  payload: Record<string, unknown>,
  user: Awaited<ReturnType<typeof ensureCurrentUser>>,
) {
  const memberId = readText(payload.memberId, "Participante");
  if (memberId === user.id) {
    throw new Error("Você não pode excluir o próprio usuário logado.");
  }

  const member = await db
    .prepare("SELECT id, email FROM members WHERE id = ? AND congregation_id = ?")
    .bind(memberId, CONGREGATION_ID)
    .first<{ id: string; email: string | null }>();
  if (!member) throw new Error("Participante não encontrado.");

  const now = new Date().toISOString();
  const operations = [
    db
      .prepare("UPDATE assignments SET assignee_member_id = CASE WHEN assignee_member_id = ? THEN NULL ELSE assignee_member_id END, assistant_member_id = CASE WHEN assistant_member_id = ? THEN NULL ELSE assistant_member_id END, status = CASE WHEN assignee_member_id = ? OR assistant_member_id = ? THEN 'rascunho' ELSE status END, updated_at = ? WHERE congregation_id = ? AND (assignee_member_id = ? OR assistant_member_id = ?)")
      .bind(memberId, memberId, memberId, memberId, now, CONGREGATION_ID, memberId, memberId),
    db
      .prepare("UPDATE field_service_groups SET overseer_member_id = CASE WHEN overseer_member_id = ? THEN NULL ELSE overseer_member_id END, assistant_member_id = CASE WHEN assistant_member_id = ? THEN NULL ELSE assistant_member_id END, updated_at = ? WHERE congregation_id = ? AND (overseer_member_id = ? OR assistant_member_id = ?)")
      .bind(memberId, memberId, now, CONGREGATION_ID, memberId, memberId),
    db
      .prepare("UPDATE public_meetings SET chairman_member_id = CASE WHEN chairman_member_id = ? THEN NULL ELSE chairman_member_id END, watchtower_reader_member_id = CASE WHEN watchtower_reader_member_id = ? THEN NULL ELSE watchtower_reader_member_id END, watchtower_conductor_member_id = CASE WHEN watchtower_conductor_member_id = ? THEN NULL ELSE watchtower_conductor_member_id END, updated_at = ? WHERE congregation_id = ? AND (chairman_member_id = ? OR watchtower_reader_member_id = ? OR watchtower_conductor_member_id = ?)")
      .bind(memberId, memberId, memberId, now, CONGREGATION_ID, memberId, memberId, memberId),
    db
      .prepare("UPDATE mechanical_assignments SET audio_member_id = CASE WHEN audio_member_id = ? THEN NULL ELSE audio_member_id END, video_member_id = CASE WHEN video_member_id = ? THEN NULL ELSE video_member_id END, external_attendant_member_id = CASE WHEN external_attendant_member_id = ? THEN NULL ELSE external_attendant_member_id END, internal_attendant_member_id = CASE WHEN internal_attendant_member_id = ? THEN NULL ELSE internal_attendant_member_id END, roaming_microphone_member_id = CASE WHEN roaming_microphone_member_id = ? THEN NULL ELSE roaming_microphone_member_id END, status = CASE WHEN audio_member_id = ? OR video_member_id = ? OR external_attendant_member_id = ? OR internal_attendant_member_id = ? OR roaming_microphone_member_id = ? THEN 'rascunho' ELSE status END, updated_at = ? WHERE congregation_id = ? AND (audio_member_id = ? OR video_member_id = ? OR external_attendant_member_id = ? OR internal_attendant_member_id = ? OR roaming_microphone_member_id = ?)")
      .bind(memberId, memberId, memberId, memberId, memberId, memberId, memberId, memberId, memberId, memberId, now, CONGREGATION_ID, memberId, memberId, memberId, memberId, memberId),
    db
      .prepare("UPDATE field_ministry_assignments SET conductor_member_id = NULL, status = CASE WHEN conductor_member_id = ? THEN 'rascunho' ELSE status END, updated_at = ? WHERE congregation_id = ? AND conductor_member_id = ?")
      .bind(memberId, now, CONGREGATION_ID, memberId),
    db
      .prepare("UPDATE account_audits SET auditor_member_id = NULL, updated_at = ? WHERE congregation_id = ? AND auditor_member_id = ?")
      .bind(now, CONGREGATION_ID, memberId),
    db
      .prepare("DELETE FROM time_away WHERE congregation_id = ? AND member_id = ?")
      .bind(CONGREGATION_ID, memberId),
    db
      .prepare("DELETE FROM members WHERE id = ? AND congregation_id = ?")
      .bind(memberId, CONGREGATION_ID),
  ];

  if (member.email) {
    operations.push(
      db
        .prepare("DELETE FROM invitations WHERE congregation_id = ? AND lower(email) = ?")
        .bind(CONGREGATION_ID, member.email.toLowerCase()),
    );
  }

  await db.batch(operations);
}

async function createFieldServiceGroup(db: D1Database, payload: Record<string, unknown>) {
  const group = readFieldServiceGroupPayload(payload);
  await requireActiveParticipants(db, [group.overseerMemberId, group.assistantMemberId]);
  const now = new Date().toISOString();
  await db
    .prepare("INSERT INTO field_service_groups (id, congregation_id, name, overseer_member_id, assistant_member_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(
      `fsg-${crypto.randomUUID()}`,
      CONGREGATION_ID,
      group.name,
      group.overseerMemberId,
      group.assistantMemberId,
      now,
      now,
    )
    .run();
}

async function updateFieldServiceGroup(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Grupo");
  const group = readFieldServiceGroupPayload(payload);
  await requireActiveParticipants(db, [group.overseerMemberId, group.assistantMemberId]);
  await db
    .prepare("UPDATE field_service_groups SET name = ?, overseer_member_id = ?, assistant_member_id = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(group.name, group.overseerMemberId, group.assistantMemberId, new Date().toISOString(), id, CONGREGATION_ID)
    .run();
}

async function recordMemberVisit(db: D1Database, payload: Record<string, unknown>, recordedByMemberId: string) {
  const groupId = readText(payload.groupId ?? payload.field_service_group_id, "Grupo");
  const memberId = readText(payload.memberId ?? payload.member_id, "Publicador");
  const visitDate = readDate(payload.visitDate ?? payload.visit_date, "Data da visita");
  const notes = optionalText(payload.notes);
  const now = new Date().toISOString();
  await db
    .prepare("INSERT OR REPLACE INTO member_visits (id, congregation_id, field_service_group_id, member_id, visit_date, notes, recorded_by_member_id, created_at, updated_at) VALUES (COALESCE((SELECT id FROM member_visits WHERE congregation_id = ? AND field_service_group_id = ? AND member_id = ? AND visit_date = ?), ?), ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM member_visits WHERE congregation_id = ? AND field_service_group_id = ? AND member_id = ? AND visit_date = ?), ?), ?)")
    .bind(
      CONGREGATION_ID,
      groupId,
      memberId,
      visitDate,
      `visit-${crypto.randomUUID()}`,
      CONGREGATION_ID,
      groupId,
      memberId,
      visitDate,
      notes,
      recordedByMemberId,
      CONGREGATION_ID,
      groupId,
      memberId,
      visitDate,
      now,
      now,
    )
    .run();
}

async function recordMeetingAttendance(db: D1Database, payload: Record<string, unknown>, recordedByMemberId: string) {
  const groupId = readText(payload.groupId ?? payload.field_service_group_id, "Grupo");
  const memberId = readText(payload.memberId ?? payload.member_id, "Publicador");
  const meetingDate = readDate(payload.meetingDate ?? payload.meeting_date, "Data da reunião");
  const status = readAttendanceStatus(payload.status);
  const notes = optionalText(payload.notes);
  const now = new Date().toISOString();
  await db
    .prepare("INSERT OR REPLACE INTO meeting_attendance (id, congregation_id, field_service_group_id, member_id, meeting_date, status, notes, recorded_by_member_id, created_at, updated_at) VALUES (COALESCE((SELECT id FROM meeting_attendance WHERE congregation_id = ? AND field_service_group_id = ? AND member_id = ? AND meeting_date = ?), ?), ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM meeting_attendance WHERE congregation_id = ? AND field_service_group_id = ? AND member_id = ? AND meeting_date = ?), ?), ?)")
    .bind(
      CONGREGATION_ID,
      groupId,
      memberId,
      meetingDate,
      `att-${crypto.randomUUID()}`,
      CONGREGATION_ID,
      groupId,
      memberId,
      meetingDate,
      status,
      notes,
      recordedByMemberId,
      CONGREGATION_ID,
      groupId,
      memberId,
      meetingDate,
      now,
      now,
    )
    .run();
}

async function recordMeetingAttendanceBatch(
  db: D1Database,
  payload: Record<string, unknown>,
  recordedByMemberId: string | null,
) {
  const groupId = readText(payload.groupId ?? payload.field_service_group_id, "Grupo");
  const meetingDate = readDate(payload.meetingDate ?? payload.meeting_date, "Data da reunião");
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  if (entries.length === 0) return;
  const now = new Date().toISOString();
  for (const raw of entries) {
    const entry = (raw ?? {}) as Record<string, unknown>;
    const memberId = readText(entry.memberId ?? entry.member_id, "Publicador");
    const status = readAttendanceStatus(entry.status);
    const notes = optionalText(entry.notes);
    await db
      .prepare("INSERT OR REPLACE INTO meeting_attendance (id, congregation_id, field_service_group_id, member_id, meeting_date, status, notes, recorded_by_member_id, created_at, updated_at) VALUES (COALESCE((SELECT id FROM meeting_attendance WHERE congregation_id = ? AND field_service_group_id = ? AND member_id = ? AND meeting_date = ?), ?), ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM meeting_attendance WHERE congregation_id = ? AND field_service_group_id = ? AND member_id = ? AND meeting_date = ?), ?), ?)")
      .bind(
        CONGREGATION_ID,
        groupId,
        memberId,
        meetingDate,
        `att-${crypto.randomUUID()}`,
        CONGREGATION_ID,
        groupId,
        memberId,
        meetingDate,
        status,
        notes,
        recordedByMemberId,
        CONGREGATION_ID,
        groupId,
        memberId,
        meetingDate,
        now,
        now,
      )
      .run();
  }
}

async function requireSpecialEventEditor(
  db: D1Database,
  user: Awaited<ReturnType<typeof ensureCurrentUser>>,
  payload: Record<string, unknown>,
  mode: "create" | "update" | "delete",
) {
  if (user.role === "admin") return;
  const member = await db.prepare("SELECT name FROM members WHERE id = ? AND congregation_id = ? LIMIT 1")
    .bind(user.id, CONGREGATION_ID).first<{ name: string }>();
  const allowed = member && ["Participante 009", "Participante 009"].some(
    (name) => normalizeSearchText(name) === normalizeSearchText(member.name),
  );
  if (!allowed) throw new UnauthorizedError("Você não tem permissão para cadastrar eventos especiais.");
  if (mode !== "create") {
    const existing = await db.prepare("SELECT type FROM special_events WHERE id = ? AND congregation_id = ? LIMIT 1")
      .bind(readText(payload.id, "Evento"), CONGREGATION_ID).first<{ type: string }>();
    if (existing?.type !== "discurso_especial") throw new UnauthorizedError("Você só pode editar eventos do tipo Discurso Especial.");
  }
  if (mode !== "delete" && payload.type !== "discurso_especial") {
    throw new UnauthorizedError("Você só pode cadastrar eventos do tipo Discurso Especial.");
  }
}

async function validateSpecialTalkWeek(db: D1Database, event: ReturnType<typeof readSpecialEventPayload>, id = "") {
  if (event.type !== "discurso_especial" && event.type !== "visita_superintendente") return;
  const day = new Date(`${event.startDate}T12:00:00Z`).getUTCDay();
  const weekStart = addDays(event.startDate, -((day + 6) % 7));
  const endDay = new Date(`${event.endDate}T12:00:00Z`).getUTCDay();
  const weekEnd = addDays(event.endDate, 6 - ((endDay + 6) % 7));
  const conflict = await db.prepare("SELECT id FROM special_events WHERE congregation_id = ? AND id != ? AND (type = 'discurso_especial' OR (? = 'discurso_especial' AND type = 'visita_superintendente')) AND start_date <= ? AND end_date >= ? LIMIT 1")
    .bind(CONGREGATION_ID, id, event.type, weekEnd, weekStart).first<{ id: string }>();
  if (conflict) throw new Error("Já existe um discurso especial ou uma visita do superintendente nesta semana. Edite o evento existente ou escolha outra data.");
}

async function createSpecialEvent(db: D1Database, payload: Record<string, unknown>) {
  const event = readSpecialEventPayload(payload);
  await validateSpecialTalkWeek(db, event);
  const now = new Date().toISOString();
  await db
    .prepare("INSERT INTO special_events (id, congregation_id, type, title, start_date, end_date, circuit_overseer_name, circuit_overseer_wife, midweek_service_talk_title, midweek_service_talk_song, weekend_public_talk_title, weekend_final_talk_title, weekend_final_talk_song, special_talk_speaker, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(
      `ev-${crypto.randomUUID()}`,
      CONGREGATION_ID,
      event.type,
      event.title,
      event.startDate,
      event.endDate,
      event.circuitOverseerName,
      event.circuitOverseerWife,
      event.midweekServiceTalkTitle,
      event.midweekServiceTalkSong,
      event.weekendPublicTalkTitle,
      event.weekendFinalTalkTitle,
      event.weekendFinalTalkSong,
      event.specialTalkSpeaker,
      event.notes,
      now,
      now,
    )
    .run();
  if (event.type === "visita_superintendente") {
    await applyCircuitVisitFieldAssignments(db, event.startDate, event.endDate, event.circuitOverseerName);
  }
}

async function updateSpecialEvent(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Evento");
  const event = readSpecialEventPayload(payload);
  await validateSpecialTalkWeek(db, event, id);
  await db
    .prepare("UPDATE special_events SET type = ?, title = ?, start_date = ?, end_date = ?, circuit_overseer_name = ?, circuit_overseer_wife = ?, midweek_service_talk_title = ?, midweek_service_talk_song = ?, weekend_public_talk_title = ?, weekend_final_talk_title = ?, weekend_final_talk_song = ?, special_talk_speaker = ?, notes = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(
      event.type,
      event.title,
      event.startDate,
      event.endDate,
      event.circuitOverseerName,
      event.circuitOverseerWife,
      event.midweekServiceTalkTitle,
      event.midweekServiceTalkSong,
      event.weekendPublicTalkTitle,
      event.weekendFinalTalkTitle,
      event.weekendFinalTalkSong,
      event.specialTalkSpeaker,
      event.notes,
      new Date().toISOString(),
      id,
      CONGREGATION_ID,
    )
    .run();
  if (event.type === "visita_superintendente") {
    await applyCircuitVisitFieldAssignments(db, event.startDate, event.endDate, event.circuitOverseerName);
  }
}

async function applyCircuitVisitFieldAssignments(
  db: D1Database,
  startDate: string,
  endDate: string,
  circuitOverseerName: string | null,
) {
  await db
    .prepare("UPDATE field_ministry_assignments SET conductor_member_id = NULL, guest_conductor_name = ?, notes = ?, updated_at = ? WHERE congregation_id = ? AND weekday = 'sab' AND activity_date BETWEEN ? AND ?")
    .bind(
      circuitOverseerName || "Superintendente de circuito",
      "Sábado da semana da visita: dirigente é o superintendente de circuito.",
      new Date().toISOString(),
      CONGREGATION_ID,
      startDate,
      endDate,
    )
    .run();
}

async function deleteSpecialEvent(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Evento");
  await db.prepare("DELETE FROM special_events WHERE id = ? AND congregation_id = ?").bind(id, CONGREGATION_ID).run();
}

async function syncJwPrograms(_db: D1Database) { throw new Error("Sincronização externa desativada na demonstração acadêmica."); }

async function syncWatchtowerStudies(_db: D1Database) { throw new Error("Sincronização externa desativada na demonstração acadêmica."); }

async function requirePublicMeetingWithoutAssembly(db: D1Database, id: string) {
  const event = await db.prepare(
    "SELECT e.type FROM public_meetings pm JOIN weeks w ON w.id = pm.week_id AND w.congregation_id = pm.congregation_id JOIN special_events e ON e.congregation_id = pm.congregation_id AND e.type IN ('assembleia', 'congresso') AND e.start_date <= date(w.week_start, '+6 days') AND e.end_date >= date(w.week_start, '+5 days') WHERE pm.id = ? AND pm.congregation_id = ? LIMIT 1",
  ).bind(id, CONGREGATION_ID).first<{ type: string }>();
  if (event) throw new Error("Evento especial — Assembleia/Congresso: sem reunião pública e sem designações de oradores.");
}

async function updatePublicMeeting(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Reunião pública");
  await requirePublicMeetingWithoutAssembly(db, id);
  const chairmanMemberId = optionalText(payload.chairmanMemberId ?? payload.chairman_member_id);
  const watchtowerReaderMemberId = optionalText(payload.watchtowerReaderMemberId ?? payload.watchtower_reader_member_id);
  const watchtowerStudyId = optionalText(payload.watchtowerStudyId ?? payload.watchtower_study_id);
  const publicTalkThemeId = optionalText(payload.publicTalkThemeId ?? payload.public_talk_theme_id);
  const publicTalkSpeaker = optionalText(payload.publicTalkSpeaker ?? payload.public_talk_speaker);
  const publicTalkSpeakerCongregation = optionalText(
    payload.publicTalkSpeakerCongregation ?? payload.public_talk_speaker_congregation,
  );
  const outgoingSpeaker = optionalText(payload.outgoingSpeaker ?? payload.outgoing_speaker);
  const outgoingTalkTheme = optionalText(payload.outgoingTalkTheme ?? payload.outgoing_talk_theme);
  const outgoingDate = optionalText(payload.outgoingDate ?? payload.outgoing_date);
  const outgoingTime = optionalText(payload.outgoingTime ?? payload.outgoing_time);
  const outgoingCongregation = optionalText(payload.outgoingCongregation ?? payload.outgoing_congregation);
  const outgoingAddress = optionalText(payload.outgoingAddress ?? payload.outgoing_address);
  const outgoingSong = optionalText(payload.outgoingSong ?? payload.outgoing_song);
  const notes = optionalText(payload.notes);
  const status = payload.status === "confirmada" ? "confirmada" : "rascunho";
  const andre = await findOrCreateMemberByName(db, "Participante 001", ["dirigente_sentinela"]);
  await requireActiveParticipants(db, [chairmanMemberId, watchtowerReaderMemberId]);
  await requireActiveParticipantNames(db, [publicTalkSpeaker, outgoingSpeaker]);
  await db
    .prepare("UPDATE public_meetings SET chairman_member_id = ?, watchtower_conductor_member_id = ?, watchtower_reader_member_id = ?, watchtower_study_id = ?, public_talk_theme_id = ?, public_talk_speaker = ?, public_talk_speaker_congregation = ?, outgoing_speaker = ?, outgoing_talk_theme = ?, outgoing_date = ?, outgoing_time = ?, outgoing_congregation = ?, outgoing_address = ?, outgoing_song = ?, notes = ?, status = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(
      chairmanMemberId,
      andre.active ? andre.id : null,
      watchtowerReaderMemberId,
      watchtowerStudyId,
      publicTalkThemeId,
      publicTalkSpeaker,
      publicTalkSpeakerCongregation,
      outgoingSpeaker,
      outgoingTalkTheme,
      outgoingDate,
      outgoingTime,
      outgoingCongregation,
      outgoingAddress,
      outgoingSong,
      notes,
      status,
      new Date().toISOString(),
      id,
      CONGREGATION_ID,
    )
    .run();
}

async function updateReceivedCongregationForMonth(db: D1Database, payload: Record<string, unknown>) {
  const monthKey = readText(payload.month_key, "Mês");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) {
    throw new Error("Mês inválido. Use o formato AAAA-MM.");
  }
  const congregation = readText(payload.congregation, "Congregação que estamos recebendo");
  await db.prepare(
    "UPDATE public_meetings SET public_talk_speaker_congregation = ?, updated_at = ? WHERE congregation_id = ? AND substr(meeting_date, 1, 7) = ? AND NOT EXISTS (SELECT 1 FROM weeks w JOIN special_events e ON e.congregation_id = w.congregation_id AND e.type IN ('assembleia', 'congresso') AND e.start_date <= date(w.week_start, '+6 days') AND e.end_date >= date(w.week_start, '+5 days') WHERE w.id = public_meetings.week_id AND w.congregation_id = public_meetings.congregation_id)",
  ).bind(congregation, new Date().toISOString(), CONGREGATION_ID, monthKey).run();
}

function publicMeetingMonthDefaultId(monthKey: string) {
  return `pmmd-${CONGREGATION_ID}-${monthKey}`;
}

async function updatePublicMeetingMonthDefaults(db: D1Database, payload: Record<string, unknown>) {
  const monthKey = readText(payload.monthKey ?? payload.month_key, "Mês");
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    throw new Error("Mês inválido. Use o formato AAAA-MM.");
  }
  const rawWeekday = optionalText(payload.defaultWeekday ?? payload.default_weekday);
  const defaultWeekday = rawWeekday === "domingo" ? "domingo" : "sabado";
  const defaultTime = optionalText(payload.defaultTime ?? payload.default_time);
  const destinationCongregation = optionalText(
    payload.destinationCongregation ?? payload.destination_congregation,
  );
  const destinationAddress = optionalText(
    payload.destinationAddress ?? payload.destination_address,
  );
  const now = new Date().toISOString();
  const id = publicMeetingMonthDefaultId(monthKey);
  // Upsert idempotente por (congregation_id, month_key).
  await db
    .prepare(
      "INSERT INTO public_meeting_month_defaults (id, congregation_id, month_key, default_weekday, default_time, destination_congregation, destination_address, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(congregation_id, month_key) DO UPDATE SET default_weekday = excluded.default_weekday, default_time = excluded.default_time, destination_congregation = excluded.destination_congregation, destination_address = excluded.destination_address, updated_at = excluded.updated_at",
    )
    .bind(
      id,
      CONGREGATION_ID,
      monthKey,
      defaultWeekday,
      defaultTime,
      destinationCongregation,
      destinationAddress,
      now,
      now,
    )
    .run();
}

async function resetPublicMeetingToMonthDefault(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Reunião pública");
  const meeting = await db
    .prepare("SELECT id, week_id, meeting_date FROM public_meetings WHERE id = ? AND congregation_id = ? LIMIT 1")
    .bind(id, CONGREGATION_ID)
    .first<{ id: string; week_id: string; meeting_date: string }>();
  if (!meeting) throw new Error("Reunião pública não encontrada.");

  const week = await db
    .prepare("SELECT id, week_start FROM weeks WHERE id = ? AND congregation_id = ? LIMIT 1")
    .bind(meeting.week_id, CONGREGATION_ID)
    .first<{ id: string; week_start: string }>();
  if (!week) throw new Error("Semana da reunião não encontrada.");

  const now = new Date().toISOString();

  // NULL volta a herdar, inclusive a data calculada a partir da mesma semana.
  // A data da reunião local pertence aos recebidos e não deve mudar no reset da saída.
  await db
    .prepare("UPDATE public_meetings SET outgoing_date = NULL, outgoing_time = NULL, outgoing_congregation = NULL, outgoing_address = NULL, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(now, id, CONGREGATION_ID)
    .run();
}

async function addSpeakerTalk(db: D1Database, payload: Record<string, unknown>) {
  const memberId = readText(payload.memberId ?? payload.member_id, "Orador");
  const themeId = readText(payload.themeId ?? payload.theme_id, "Tema");
  const now = new Date().toISOString();
  const [member, theme] = await Promise.all([
    db
      .prepare("SELECT id FROM members WHERE id = ? AND congregation_id = ? AND active = 1 LIMIT 1")
      .bind(memberId, CONGREGATION_ID)
      .first<Pick<MemberRow, "id">>(),
    db
      .prepare("SELECT id FROM public_talk_themes WHERE id = ? AND active = 1 LIMIT 1")
      .bind(themeId)
      .first<Pick<PublicTalkThemeRow, "id">>(),
  ]);
  if (!member) throw new Error("Orador não encontrado.");
  if (!theme) throw new Error("Tema não encontrado.");
  await ensureSpeakerTalksTable(db);
  await db
    .prepare("INSERT OR IGNORE INTO speaker_talks (id, congregation_id, member_id, theme_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(`speaker-talk-${memberId}-${themeId}`, CONGREGATION_ID, memberId, themeId, now, now)
    .run();
}

async function removeSpeakerTalk(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Tema do orador");
  await ensureSpeakerTalksTable(db);
  await db
    .prepare("DELETE FROM speaker_talks WHERE id = ? AND congregation_id = ?")
    .bind(id, CONGREGATION_ID)
    .run();
}

async function clearMechanicalMonth(db: D1Database, payload: Record<string, unknown>) {
  const monthKey = readText(payload.month_key, "Mês");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) throw new Error("Mês inválido.");
  await db.prepare("UPDATE mechanical_assignments SET audio_member_id = NULL, video_member_id = NULL, external_attendant_member_id = NULL, internal_attendant_member_id = NULL, roaming_microphone_member_id = NULL, status = 'rascunho', updated_at = ? WHERE congregation_id = ? AND assignment_date LIKE ?")
    .bind(new Date().toISOString(), CONGREGATION_ID, `${monthKey}-%`).run();
}

async function updateMechanicalMonth(db: D1Database, payload: Record<string, unknown>) {
  const monthKey = readText(payload.month_key, "Mês");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthKey)) throw new Error("Mês inválido.");
  if (payload.status !== "rascunho" && payload.status !== "confirmada") throw new Error("Status inválido.");
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  for (const rawEntry of entries) {
    const entry = (rawEntry && typeof rawEntry === "object" ? rawEntry : {}) as Record<string, unknown>;
    await requireActiveParticipants(db, [optionalText(entry.audio_member_id), optionalText(entry.video_member_id), optionalText(entry.external_attendant_member_id), optionalText(entry.internal_attendant_member_id), optionalText(entry.roaming_microphone_member_id)]);
  }
  const monthRows = await db.prepare("SELECT id FROM mechanical_assignments WHERE congregation_id = ? AND assignment_date LIKE ?")
    .bind(CONGREGATION_ID, `${monthKey}-%`).all<{ id: string }>();
  const expectedIds = new Set(monthRows.results.map((row) => row.id));
  if (entries.length === 0 || entries.length !== expectedIds.size) throw new Error("A escala do mês mudou. Atualize a página e tente novamente.");
  const now = new Date().toISOString();
  const operations = entries.map((rawEntry) => {
    const entry = (rawEntry && typeof rawEntry === "object" ? rawEntry : {}) as Record<string, unknown>;
    const id = readText(entry.id, "Designação mecânica");
    if (!expectedIds.delete(id)) throw new Error("Designação inválida para este mês.");
    return db.prepare("UPDATE mechanical_assignments SET audio_member_id = ?, video_member_id = ?, external_attendant_member_id = ?, internal_attendant_member_id = ?, roaming_microphone_member_id = ?, status = ?, updated_at = ? WHERE id = ? AND congregation_id = ? AND assignment_date LIKE ?")
      .bind(optionalText(entry.audio_member_id), optionalText(entry.video_member_id), optionalText(entry.external_attendant_member_id), optionalText(entry.internal_attendant_member_id), optionalText(entry.roaming_microphone_member_id), payload.status, now, id, CONGREGATION_ID, `${monthKey}-%`);
  });
  await db.batch(operations);
}

async function updateMechanicalAssignment(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Designação mecânica");
  const audioMemberId = optionalText(payload.audioMemberId ?? payload.audio_member_id);
  const videoMemberId = optionalText(payload.videoMemberId ?? payload.video_member_id);
  const externalAttendantMemberId = optionalText(payload.externalAttendantMemberId ?? payload.external_attendant_member_id);
  const internalAttendantMemberId = optionalText(payload.internalAttendantMemberId ?? payload.internal_attendant_member_id);
  const roamingMicrophoneMemberId = optionalText(payload.roamingMicrophoneMemberId ?? payload.roaming_microphone_member_id);
  const attendanceTotal = optionalNonNegativeInteger(payload.attendanceTotal ?? payload.attendance_total);
  const attendanceInPerson = optionalNonNegativeInteger(payload.attendanceInPerson ?? payload.attendance_in_person);
  const attendanceZoom = optionalNonNegativeInteger(payload.attendanceZoom ?? payload.attendance_zoom);
  const attendanceReportedAt = attendanceTotal !== null || attendanceInPerson !== null || attendanceZoom !== null
    ? new Date().toISOString()
    : null;
  const status = readSimpleScheduleStatus(payload.status);
  await requireActiveParticipants(db, [audioMemberId, videoMemberId, externalAttendantMemberId, internalAttendantMemberId, roamingMicrophoneMemberId]);
  await db
    .prepare("UPDATE mechanical_assignments SET audio_member_id = ?, video_member_id = ?, external_attendant_member_id = ?, internal_attendant_member_id = ?, roaming_microphone_member_id = ?, attendance_total = ?, attendance_in_person = ?, attendance_zoom = ?, attendance_reported_at = ?, status = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(
      audioMemberId,
      videoMemberId,
      externalAttendantMemberId,
      internalAttendantMemberId,
      roamingMicrophoneMemberId,
      attendanceTotal,
      attendanceInPerson,
      attendanceZoom,
      attendanceReportedAt,
      status,
      new Date().toISOString(),
      id,
      CONGREGATION_ID,
    )
    .run();
}

async function recordMechanicalAttendance(
  db: D1Database,
  payload: Record<string, unknown>,
  user: Awaited<ReturnType<typeof ensureCurrentUser>>,
) {
  const id = readText(payload.id, "Designação mecânica");
  const [assignment, member] = await Promise.all([
    db
      .prepare("SELECT id, external_attendant_member_id, internal_attendant_member_id FROM mechanical_assignments WHERE id = ? AND congregation_id = ? LIMIT 1")
      .bind(id, CONGREGATION_ID)
      .first<Pick<MechanicalAssignmentRow, "id" | "external_attendant_member_id" | "internal_attendant_member_id">>(),
    db
      .prepare("SELECT id, congregation_status, privileges FROM members WHERE id = ? AND congregation_id = ? LIMIT 1")
      .bind(user.id, CONGREGATION_ID)
      .first<Pick<MemberRow, "id" | "congregation_status" | "privileges">>(),
  ]);
  if (!assignment) throw new Error("Designação mecânica não encontrada.");
  const memberPrivileges = parsePrivileges(member?.privileges ?? "[]");
  const isElder = readCongregationStatus(member?.congregation_status) === "anciao";
  const canActAsAttendant =
    memberPrivileges.includes("indicador_externo") || memberPrivileges.includes("indicador_interno");
  const canReport =
    user.role === "admin" ||
    user.editableModules.includes("mecanicas") ||
    isElder ||
    canActAsAttendant ||
    assignment.external_attendant_member_id === user.id ||
    assignment.internal_attendant_member_id === user.id;
  if (!canReport) {
    throw new UnauthorizedError("Apenas anciãos, indicadores aptos ou administradores podem preencher a assistência.");
  }

  const attendanceTotal = optionalNonNegativeInteger(payload.attendanceTotal ?? payload.attendance_total);
  const attendanceInPerson = optionalNonNegativeInteger(payload.attendanceInPerson ?? payload.attendance_in_person);
  const attendanceZoom = optionalNonNegativeInteger(payload.attendanceZoom ?? payload.attendance_zoom);
  const now = new Date().toISOString();
  await db
    .prepare("UPDATE mechanical_assignments SET attendance_total = ?, attendance_in_person = ?, attendance_zoom = ?, attendance_reported_at = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(attendanceTotal, attendanceInPerson, attendanceZoom, now, now, id, CONGREGATION_ID)
    .run();
}

async function saveMeetingTimings(db: D1Database, payload: Record<string, unknown>, recorderMemberId: string) {
  const weekId = readText(payload.weekId ?? payload.week_id, "Semana");
  const week = await db
    .prepare("SELECT id FROM weeks WHERE id = ? AND congregation_id = ? LIMIT 1")
    .bind(weekId, CONGREGATION_ID)
    .first<Pick<WeekRow, "id">>();
  if (!week) throw new Error("Semana não encontrada para controle do tempo.");

  const rawEntries = Array.isArray(payload.entries) ? payload.entries : [];
  if (rawEntries.length === 0) return;
  const now = new Date().toISOString();
  const operations = rawEntries.slice(0, 40).map((rawEntry) => {
    const entry = (rawEntry && typeof rawEntry === "object" ? rawEntry : {}) as Record<string, unknown>;
    const partKey = readText(entry.partKey ?? entry.part_key, "Parte");
    const partTitle = readText(entry.partTitle ?? entry.part_title, "Título da parte");
    const assignmentId = optionalText(entry.assignmentId ?? entry.assignment_id);
    const plannedSeconds = optionalNonNegativeSeconds(entry.plannedSeconds ?? entry.planned_seconds, "Tempo previsto");
    const actualSeconds = optionalNonNegativeSeconds(entry.actualSeconds ?? entry.actual_seconds, "Tempo real");
    const startedAt = optionalIsoTimestamp(entry.startedAt ?? entry.started_at);
    const endedAt = optionalIsoTimestamp(entry.endedAt ?? entry.ended_at);
    const notes = optionalText(entry.notes);
    const reportedAt = optionalIsoTimestamp(entry.reportedAt ?? entry.reported_at);
    return db
      .prepare("INSERT INTO meeting_timings (id, congregation_id, week_id, assignment_id, part_key, part_title, planned_seconds, actual_seconds, started_at, ended_at, recorded_by_member_id, reported_at, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(congregation_id, week_id, part_key) DO UPDATE SET assignment_id = excluded.assignment_id, part_title = excluded.part_title, planned_seconds = excluded.planned_seconds, actual_seconds = excluded.actual_seconds, started_at = excluded.started_at, ended_at = excluded.ended_at, recorded_by_member_id = excluded.recorded_by_member_id, reported_at = excluded.reported_at, notes = excluded.notes, updated_at = excluded.updated_at")
      .bind(
        `mt-${crypto.randomUUID()}`,
        CONGREGATION_ID,
        weekId,
        assignmentId,
        partKey,
        partTitle,
        plannedSeconds,
        actualSeconds,
        startedAt,
        endedAt,
        recorderMemberId,
        reportedAt,
        notes,
        now,
        now,
      );
  });

  await runBatches(db, operations);
}

async function updateAccountAudit(
  db: D1Database,
  payload: Record<string, unknown>,
  user: Awaited<ReturnType<typeof ensureCurrentUser>>,
  member: Pick<MemberRow, "id" | "name"> | null,
) {
  const id = readText(payload.id, "Auditoria");
  const hasAuditorMemberId = Object.prototype.hasOwnProperty.call(payload, "auditorMemberId") || Object.prototype.hasOwnProperty.call(payload, "auditor_member_id");
  const hasCompletedDate = Object.prototype.hasOwnProperty.call(payload, "completedDate") || Object.prototype.hasOwnProperty.call(payload, "completed_date");
  const hasNotes = Object.prototype.hasOwnProperty.call(payload, "notes");
  const auditorMemberId = hasAuditorMemberId ? optionalText(payload.auditorMemberId ?? payload.auditor_member_id) : undefined;
  const completedDate = hasCompletedDate ? optionalDate(payload.completedDate ?? payload.completed_date, "Data da auditoria feita") : undefined;
  const notes = hasNotes ? optionalText(payload.notes) : undefined;

  const audit = await db
    .prepare("SELECT id, auditor_member_id, completed_date, notes FROM account_audits WHERE id = ? AND congregation_id = ? LIMIT 1")
    .bind(id, CONGREGATION_ID)
    .first<Pick<AccountAuditRow, "id" | "auditor_member_id" | "completed_date" | "notes">>();
  if (!audit) throw new Error("Auditoria das contas não encontrada.");

  if (hasAuditorMemberId) {
    if (!userCanManageAccounts(user, member?.name)) {
      throw new UnauthorizedError("Apenas Participante 006 ou administradores podem designar o auditor das contas.");
    }
  }

  const isAssignedAuditor = audit.auditor_member_id === user.id;
  if (hasCompletedDate || hasNotes) {
    if (!isAssignedAuditor) {
      throw new UnauthorizedError("Apenas o ancião designado pode concluir esta auditoria.");
    }
  }

  if (auditorMemberId) {
    const auditor = await db
      .prepare("SELECT id, name, active, congregation_status FROM members WHERE id = ? AND congregation_id = ? LIMIT 1")
      .bind(auditorMemberId, CONGREGATION_ID)
      .first<Pick<MemberRow, "id" | "name" | "active" | "congregation_status">>();
    if (!auditor || !auditor.active) throw new Error("Auditor designado não encontrado ou inativo.");
    if (readCongregationStatus(auditor.congregation_status) !== "anciao") {
      throw new Error("O auditor precisa estar cadastrado como ancião.");
    }
    const excluded = EXCLUDED_ACCOUNT_AUDITOR_NAMES.some(
      (name) => normalizeSearchText(name) === normalizeSearchText(auditor.name),
    );
    if (excluded) {
      throw new Error("Participante 001 não deve aparecer como auditor das contas.");
    }
  }

  await db
    .prepare("UPDATE account_audits SET auditor_member_id = ?, completed_date = ?, notes = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(
      hasAuditorMemberId ? auditorMemberId ?? null : audit.auditor_member_id,
      hasCompletedDate ? completedDate ?? null : audit.completed_date,
      hasNotes ? notes ?? null : audit.notes,
      new Date().toISOString(),
      id,
      CONGREGATION_ID,
    )
    .run();
}

async function updateFieldMinistryAssignment(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Designação do campo");
  const startTime = readTime(payload.startTime ?? payload.start_time, "Horário");
  const conductorMemberId = optionalText(payload.conductorMemberId ?? payload.conductor_member_id);
  const guestConductorName = optionalText(payload.guestConductorName ?? payload.guest_conductor_name);
  const location = optionalText(payload.location);
  const notes = optionalText(payload.notes);
  const status = readSimpleScheduleStatus(payload.status);
  await requireActiveParticipants(db, [conductorMemberId]);
  await db
    .prepare("UPDATE field_ministry_assignments SET start_time = ?, conductor_member_id = ?, guest_conductor_name = ?, location = ?, notes = ?, status = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(
      startTime,
      conductorMemberId,
      guestConductorName,
      location,
      notes,
      status,
      new Date().toISOString(),
      id,
      CONGREGATION_ID,
    )
    .run();
}

async function updateMemberWhatsApp(db: D1Database, payload: Record<string, unknown>) {
  const memberId = readText(payload.memberId, "Participante");
  const whatsappPhone = normalizeWhatsAppPhone(optionalText(payload.whatsappPhone));
  await db
    .prepare("UPDATE members SET whatsapp_phone = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(whatsappPhone, new Date().toISOString(), memberId, CONGREGATION_ID)
    .run();
}

async function addTimeAway(db: D1Database, payload: Record<string, unknown>) {
  const memberId = readText(payload.memberId, "Participante");
  const startDate = readDate(payload.startDate, "Início");
  const endDate = readDate(payload.endDate, "Fim");
  const reason = optionalText(payload.reason) ?? "Folga";
  if (endDate < startDate) throw new Error("A data final não pode ser antes da inicial.");
  const now = new Date().toISOString();
  await db
    .prepare("INSERT INTO time_away (id, congregation_id, member_id, start_date, end_date, reason, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'manual', ?, ?)")
    .bind(`ta-${crypto.randomUUID()}`, CONGREGATION_ID, memberId, startDate, endDate, reason, now, now)
    .run();
}

async function deleteTimeAway(db: D1Database, payload: Record<string, unknown>) {
  const id = readText(payload.id, "Folga");
  await db.prepare("DELETE FROM time_away WHERE id = ? AND congregation_id = ?").bind(id, CONGREGATION_ID).run();
}

async function updateAssignment(db: D1Database, payload: Record<string, unknown>) {
  const assignmentId = readText(payload.assignmentId, "Designação");
  const assignment = await db
    .prepare("SELECT * FROM assignments WHERE id = ? AND congregation_id = ?")
    .bind(assignmentId, CONGREGATION_ID)
    .first<AssignmentRow>();
  if (!assignment) throw new Error("Designação não encontrada.");
  const assigneeMemberId = optionalText(payload.assigneeMemberId);
  const assistantMemberId = assignmentUsesAssistant(assignment) ? optionalText(payload.assistantMemberId) : null;
  await requireActiveParticipants(db, [assigneeMemberId, assistantMemberId]);
  if (assistantMemberId) {
    const pair = await db.prepare("SELECT id, gender FROM members WHERE congregation_id = ? AND id IN (?, ?)")
      .bind(CONGREGATION_ID, assigneeMemberId, assistantMemberId).all<Pick<MemberRow, "id" | "gender">>();
    if (!sameGenderPair(pair.results.find((member) => member.id === assigneeMemberId), pair.results.find((member) => member.id === assistantMemberId))) {
      throw new Error("Escolha principal e ajudante diferentes, com o mesmo gênero informado em Participantes.");
    }
  }
  const status = readAssignmentStatus(payload.status);
  const force = Boolean(payload.force);

  if (!force) {
    const conflicts = await conflictMessagesForChange(db, assignmentId, assigneeMemberId, assistantMemberId);
    if (conflicts.length > 0) throw new ConflictError("A designação tem conflito.", conflicts);
  }

  await db
    .prepare("UPDATE assignments SET assignee_member_id = ?, assistant_member_id = ?, status = ?, updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(assigneeMemberId ?? null, assistantMemberId ?? null, status, new Date().toISOString(), assignmentId, CONGREGATION_ID)
    .run();
  await db
    .prepare("UPDATE weeks SET status = 'revisao', updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(new Date().toISOString(), assignment.week_id, CONGREGATION_ID)
    .run();
}

async function generateWeek(db: D1Database, payload: Record<string, unknown>) {
  const weekId = readText(payload.weekId, "Semana");
  const preserveConfirmed = payload.preserveConfirmed !== false;
  const state = await getState(db, {
    id: "system",
    displayName: "Sistema",
    email: null,
    role: "admin",
    canEdit: true,
    editableModules: [...EDITABLE_MODULES],
    authenticated: false,
  });
  const assignments = state.assignments.filter((assignment) => assignment.week_id === weekId);
  const currentWeek = state.weeks.find((week) => week.id === weekId);
  if (!currentWeek) throw new Error("Semana não encontrada.");

  const taken = new Set<string>();
  for (const assignment of assignments) {
    if (preserveConfirmed && assignment.status === "confirmada") {
      if (assignment.assignee_member_id) taken.add(assignment.assignee_member_id);
      if (assignment.assistant_member_id) taken.add(assignment.assistant_member_id);
    }
  }

  for (const assignment of assignments) {
    if (assignment.section === "top" || assignment.section === "bottom") continue;
    if (preserveConfirmed && assignment.status === "confirmada") continue;

    const assignee = chooseCandidate(state, assignment, currentWeek.meeting_date, taken, "assignee");
    const assistant =
      assignmentShouldAutoAssignAssistant(assignment)
        ? chooseCandidate(state, assignment, currentWeek.meeting_date, taken, "assistant", assignee?.id)
        : null;

    if (assignee) taken.add(assignee.id);
    if (assistant) taken.add(assistant.id);

    await db
      .prepare("UPDATE assignments SET assignee_member_id = ?, assistant_member_id = ?, status = ?, updated_at = ? WHERE id = ?")
      .bind(assignee?.id ?? null, assistant?.id ?? null, assignee ? "aguardando" : "rascunho", new Date().toISOString(), assignment.id)
      .run();
  }
  await db
    .prepare("UPDATE weeks SET status = 'revisao', updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(new Date().toISOString(), weekId, CONGREGATION_ID)
    .run();
}

async function publishWeek(db: D1Database, payload: Record<string, unknown>) {
  const weekId = readText(payload.weekId, "Semana");
  await db
    .prepare("UPDATE weeks SET status = 'publicada', updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(new Date().toISOString(), weekId, CONGREGATION_ID)
    .run();
}

async function saveWeekDraft(db: D1Database, payload: Record<string, unknown>) {
  const weekId = readText(payload.weekId, "Semana");
  await db
    .prepare("UPDATE weeks SET status = 'revisao', updated_at = ? WHERE id = ? AND congregation_id = ?")
    .bind(new Date().toISOString(), weekId, CONGREGATION_ID)
    .run();
}

async function createInvitation(_db: D1Database, _payload: Record<string, unknown>): Promise<{email:string;code:string;whatsappPhone:string|null;memberId:string|null;memberName:string|null}> { throw new Error("Convites desativados. Use as contas fictícias do README."); }

async function conflictMessagesForChange(
  db: D1Database,
  assignmentId: string,
  assigneeMemberId: string | null | undefined,
  assistantMemberId: string | null | undefined,
) {
  const assignment = await db
    .prepare("SELECT * FROM assignments WHERE id = ? AND congregation_id = ?")
    .bind(assignmentId, CONGREGATION_ID)
    .first<AssignmentRow>();
  if (!assignment) throw new Error("Designação não encontrada.");
  const week = await db.prepare("SELECT * FROM weeks WHERE id = ?").bind(assignment.week_id).first<WeekRow>();
  if (!week) throw new Error("Semana não encontrada.");
  const members = await db.prepare("SELECT * FROM members WHERE congregation_id = ?").bind(CONGREGATION_ID).all<MemberRow>();
  const timeAway = await db.prepare("SELECT * FROM time_away WHERE congregation_id = ?").bind(CONGREGATION_ID).all<TimeAwayRow>();
  const weekAssignments = await db.prepare("SELECT * FROM assignments WHERE week_id = ?").bind(assignment.week_id).all<AssignmentRow>();
  const safeMembers = members.results.map((member) => ({
    ...member,
    active: Boolean(member.active),
    privileges: parsePrivileges(member.privileges),
    congregation_status: readCongregationStatus(member.congregation_status),
    pioneer_roles: parsePioneerRoles(member.pioneer_roles),
    field_service_group_id: member.field_service_group_id ?? null,
    field_availability: parseFieldDays(member.field_availability),
  }));
  const messages: string[] = [];

  if (assigneeMemberId && assistantMemberId && assigneeMemberId === assistantMemberId) {
    messages.push("A mesma pessoa não pode ser designada como participante e ajudante na mesma parte.");
  }

  const participants = [
    { memberId: assigneeMemberId, slot: "assignee" as const },
    { memberId: assistantMemberId, slot: "assistant" as const },
  ].filter((item): item is { memberId: string; slot: AssignmentParticipant } => Boolean(item.memberId));

  for (const { memberId, slot } of participants) {
    const member = safeMembers.find((item) => item.id === memberId);
    if (!member) continue;
    if (!member.active) messages.push(`${member.name} está inativo.`);
    const requiredPrivileges = requiredPrivilegesForAssignment(assignment, slot);
    if (!hasAnyPrivilege(member, requiredPrivileges)) {
      messages.push(`${member.name} não está marcado para ${labelPrivileges(requiredPrivileges)}.`);
    }
    if (timeAway.results.some((away) => away.member_id === memberId && overlaps(away.start_date, away.end_date, week.meeting_date, week.meeting_date))) {
      messages.push(`${member.name} tem folga nessa data.`);
    }
    const alreadyAssigned = weekAssignments.results.some(
      (item) =>
        item.id !== assignmentId &&
        (item.assignee_member_id === memberId || item.assistant_member_id === memberId),
    );
    if (alreadyAssigned) messages.push(`${member.name} já tem outra designação nessa reunião.`);
  }

  return [...new Set(messages)];
}

function detectConflicts(
  weeks: WeekRow[],
  assignments: AssignmentRow[],
  members: SafeMemberRow[],
  timeAway: TimeAwayRow[],
) {
  const conflicts: Array<{
    assignmentId: string;
    weekId: string;
    memberId: string;
    memberName: string;
    level: "bloqueio" | "alerta";
    message: string;
  }> = [];
  const weekById = new Map(weeks.map((week) => [week.id, week]));
  const memberById = new Map(members.map((member) => [member.id, member]));

  for (const assignment of assignments) {
    const week = weekById.get(assignment.week_id);
    if (!week) continue;
    const participants = [
      { memberId: assignment.assignee_member_id, slot: "assignee" as const },
      { memberId: assignment.assistant_member_id, slot: "assistant" as const },
    ].filter((item): item is { memberId: string; slot: AssignmentParticipant } => Boolean(item.memberId));

    if (
      assignment.assignee_member_id &&
      assignment.assistant_member_id &&
      assignment.assignee_member_id === assignment.assistant_member_id
    ) {
      const member = memberById.get(assignment.assignee_member_id);
      conflicts.push({
        assignmentId: assignment.id,
        weekId: assignment.week_id,
        memberId: assignment.assignee_member_id,
        memberName: member?.name ?? assignment.assignee_member_id,
        level: "alerta",
        message: "A mesma pessoa aparece como participante e ajudante na parte.",
      });
    }

    for (const { memberId, slot } of participants) {
      const member = memberById.get(memberId);
      if (!member) continue;
      if (!member.active) {
        conflicts.push({
          assignmentId: assignment.id,
          weekId: assignment.week_id,
          memberId,
          memberName: member.name,
          level: "bloqueio",
          message: "Participante inativo escalado.",
        });
      }
      const requiredPrivileges = requiredPrivilegesForAssignment(assignment, slot);
      if (!hasAnyPrivilege(member, requiredPrivileges)) {
        conflicts.push({
          assignmentId: assignment.id,
          weekId: assignment.week_id,
          memberId,
          memberName: member.name,
          level: "alerta",
          message: `Privilégio ausente para ${labelPrivileges(requiredPrivileges)}.`,
        });
      }
      if (timeAway.some((away) => away.member_id === memberId && overlaps(away.start_date, away.end_date, week.meeting_date, week.meeting_date))) {
        conflicts.push({
          assignmentId: assignment.id,
          weekId: assignment.week_id,
          memberId,
          memberName: member.name,
          level: "bloqueio",
          message: "Folga/indisponibilidade na data da designação.",
        });
      }
    }
  }

  for (const week of weeks) {
    const usage = new Map<string, number>();
    for (const assignment of assignments.filter((item) => item.week_id === week.id)) {
      for (const memberId of [assignment.assignee_member_id, assignment.assistant_member_id].filter(Boolean) as string[]) {
        usage.set(memberId, (usage.get(memberId) ?? 0) + 1);
      }
    }
    for (const [memberId, count] of usage.entries()) {
      if (count <= 1) continue;
      const member = memberById.get(memberId);
      conflicts.push({
        assignmentId: "",
        weekId: week.id,
        memberId,
        memberName: member?.name ?? memberId,
        level: "alerta",
        message: `${count} designações na mesma reunião.`,
      });
    }
  }

  return conflicts;
}

function chooseCandidate(
  state: Awaited<ReturnType<typeof getState>>,
  assignment: AssignmentRow,
  date: string,
  taken: Set<string>,
  participant: AssignmentParticipant,
  avoidId?: string,
) {
  const requiredPrivileges = requiredPrivilegesForAssignment(assignment, participant);
  const candidates = state.members
    .filter((member) => member.active)
    .filter((member) => participant !== "assistant" || sameGenderPair(state.members.find((item) => item.id === avoidId), member))
    .filter((member) => member.id !== avoidId)
    .filter((member) => !taken.has(member.id))
    .filter((member) => hasAnyPrivilege(member, requiredPrivileges))
    .filter(
      (member) =>
        !state.timeAway.some(
          (away) =>
            away.member_id === member.id &&
            overlaps(away.start_date, away.end_date, date, date),
        ),
    )
    .map((member) => {
      const total = state.assignments.filter(
        (assignment) =>
          assignment.assignee_member_id === member.id ||
          assignment.assistant_member_id === member.id,
      ).length;
      const sameRole = state.assignments.filter(
        (assignment) =>
          requiredPrivilegesForAssignment(assignment, participant).some((privilege) =>
            requiredPrivileges.includes(privilege),
          ) &&
          (assignment.assignee_member_id === member.id ||
            assignment.assistant_member_id === member.id),
      ).length;
      const history = midweekParticipationHistory(state.assignments, state.weeks, member.id, date, assignment.id);
      return { member, lastDate: history.past[0]?.date ?? "", adjacent: history.adjacent.length > 0, score: total + sameRole * 2 };
    })
    .sort((a, b) => Number(a.adjacent) - Number(b.adjacent) || a.lastDate.localeCompare(b.lastDate) || a.score - b.score || a.member.name.localeCompare(b.member.name, "pt-BR"));

  return candidates[0]?.member ?? null;
}

function requiredPrivilegesForAssignment(
  assignment: Pick<AssignmentRow, "role_key" | "title">,
  participant: AssignmentParticipant,
) {
  if (participant === "assistant" && !assignmentUsesAssistant(assignment)) return [];
  if (assignment.role_key === "presidente") return ["presidente_meio_semana"];
  if (assignment.role_key === "oracao") return ["oracao"];
  if (assignment.role_key === "tesouros") return ["tesouros"];
  if (assignment.role_key === "joias") return ["joias"];
  if (assignment.role_key === "leitura") return ["leitura"];
  if (assignment.role_key === "estudo_biblico") {
    return participant === "assistant"
      ? ["leitor_estudo_biblico"]
      : ["dirigente_estudo_biblico"];
  }
  if (assignment.role_key === "vida_crista") {
    return normalizeSearchText(assignment.title).includes("necessidade")
      ? ["necessidades_locais"]
      : ["vida_crista"];
  }
  if (assignment.role_key === "ministerio") {
    const title = normalizeSearchText(assignment.title);
    if (title.includes("iniciando conversa")) return ["iniciando_conversas"];
    if (title.includes("cultivando")) return ["cultivando_interesse"];
    if (title.includes("fazendo discipulo")) return ["fazendo_discipulos"];
    if (title.includes("explicando")) return ["explicando_crencas"];
    if (title.includes("discurso")) return ["discurso"];
    if (title.includes("o que voce diria")) return ["o_que_voce_diria"];
    return ministryPrivileges;
  }
  return assignment.role_key in ROLE_LABELS ? [assignment.role_key] : [];
}

function assignmentUsesAssistant(assignment: Pick<AssignmentRow, "role_key" | "title">) {
  if (assignment.role_key === "estudo_biblico") return true;
  if (assignment.role_key !== "ministerio") return false;
  return !normalizeSearchText(assignment.title).includes("o que voce diria");
}

function assignmentShouldAutoAssignAssistant(assignment: Pick<AssignmentRow, "role_key" | "title">) {
  const title = normalizeSearchText(assignment.title);
  if (assignment.role_key === "ministerio" && title.includes("explicando") && title.includes("discurso")) {
    return false;
  }
  return assignmentUsesAssistant(assignment);
}

function hasAnyPrivilege(member: Pick<SafeMemberRow, "privileges">, requiredPrivileges: string[]) {
  return requiredPrivileges.length === 0 || requiredPrivileges.some((privilege) => member.privileges.includes(privilege));
}

function labelPrivileges(privileges: string[]) {
  return privileges.map((privilege) => ROLE_LABELS[privilege] ?? privilege).join(" ou ");
}

function buildEventReminders(weeks: WeekRow[], events: SpecialEventRow[]) {
  const reminders: EventReminder[] = [];
  for (const week of weeks) {
    const weekEnd = addDays(week.week_start, 6);
    for (const event of events) {
      const title = event.title || specialEventTypeLabel(event.type);
      if (overlaps(event.start_date, event.end_date, week.week_start, weekEnd)) {
        if (event.type === "assembleia" || event.type === "congresso") {
          reminders.push({
            eventId: event.id,
            weekId: week.id,
            type: "sem_reuniao",
            title,
            message: "Semana de evento especial: normalmente não há reunião de meio de semana programada.",
          });
        } else if (event.type === "visita_superintendente") {
          const overseer = event.circuit_overseer_name ? ` (${event.circuit_overseer_name})` : "";
          reminders.push({
            eventId: event.id,
            weekId: week.id,
            type: "visita_superintendente",
            title,
            message: `Semana da visita do superintendente${overseer}: substituir o Estudo Bíblico de Congregação pelo discurso do superintendente. No fim de semana, programar dois discursos.`,
          });
        } else if (event.type === "celebracao") {
          reminders.push({
            eventId: event.id,
            weekId: week.id,
            type: "celebracao",
            title,
            message: "Semana da Celebração: revisar necessidades de anúncios, indicadores e designações de apoio.",
          });
        } else {
          reminders.push({
            eventId: event.id,
            weekId: week.id,
            type: "informativo",
            title,
            message: event.notes || "Evento especial cadastrado para esta semana.",
          });
        }
      }

      if ((event.type === "assembleia" || event.type === "congresso") && daysBetween(week.week_start, event.start_date) >= 7 && daysBetween(week.week_start, event.start_date) <= 21) {
        reminders.push({
          eventId: event.id,
          weekId: week.id,
          type: "lembrete_previo",
          title,
          message: "Programar lembretes sobre o evento nas semanas anteriores.",
        });
      }

      if ((event.type === "assembleia" || event.type === "congresso") && daysBetween(event.end_date, week.week_start) >= 1 && daysBetween(event.end_date, week.week_start) <= 14) {
        reminders.push({
          eventId: event.id,
          weekId: week.id,
          type: "recapitulacao",
          title,
          message: "Programar recapitulação e lembretes posteriores ao evento.",
        });
      }
    }
  }
  return reminders;
}

function requireScheduler(user: Awaited<ReturnType<typeof ensureCurrentUser>>, module?: EditableModule) {
  // Sem módulo: ação de gestão (participantes, convites, permissões, manutenção) — só admin.
  if (!module) {
    if (user.role !== "admin") {
      throw new Error("Apenas o administrador pode realizar esta ação.");
    }
    return;
  }
  // Com módulo: admin sempre; os demais dependem de editable_modules.
  if (user.role === "admin") return;
  if (!user.editableModules.includes(module)) {
    throw new Error("Você não tem permissão para editar este módulo.");
  }
}

function userCanUseTimeControl(user: Awaited<ReturnType<typeof ensureCurrentUser>>, memberName: string | null | undefined) {
  if (user.role === "admin") return true;
  const normalizedMemberName = normalizeSearchText(memberName ?? user.displayName);
  return TIME_CONTROL_OPERATOR_NAMES.some((name) => normalizeSearchText(name) === normalizedMemberName);
}

function userCanManageAccounts(user: Awaited<ReturnType<typeof ensureCurrentUser>>, memberName: string | null | undefined) {
  if (user.role === "admin") return true;
  return normalizeSearchText(memberName ?? user.displayName) === normalizeSearchText(ACCOUNTS_MANAGER_NAME);
}

function userCanSeeAccountAudits(
  user: Awaited<ReturnType<typeof ensureCurrentUser>>,
  member: Pick<SafeMemberRow, "name" | "congregation_status"> | null,
) {
  return (
    user.role === "admin" ||
    member?.congregation_status === "anciao" ||
    normalizeSearchText(member?.name ?? user.displayName) === normalizeSearchText(ACCOUNTS_MANAGER_NAME)
  );
}

function requireTimeControl(user: Awaited<ReturnType<typeof ensureCurrentUser>>, memberName: string | null | undefined) {
  if (!userCanUseTimeControl(user, memberName)) {
    throw new UnauthorizedError("Apenas Participante 004, Participante 005 ou administradores podem controlar o tempo.");
  }
}

async function requireSpeakerTalkEditor(
  db: D1Database,
  user: Awaited<ReturnType<typeof ensureCurrentUser>>,
  payload: Record<string, unknown>,
  mode: "add" | "remove",
) {
  if (user.role === "admin") return;
  const currentMember = await db
    .prepare("SELECT id, name FROM members WHERE id = ? AND congregation_id = ? LIMIT 1")
    .bind(user.id, CONGREGATION_ID)
    .first<Pick<MemberRow, "id" | "name">>();
  const isManager = ["Participante 009", "Participante 009", "Participante 009"].some(
    (name) => normalizeSearchText(name) === normalizeSearchText(currentMember?.name ?? user.displayName),
  );
  if (isManager) return;
  let targetMemberId = "";
  if (mode === "add") {
    targetMemberId = readText(payload.memberId ?? payload.member_id, "Orador");
  } else {
    const talkId = readText(payload.id, "Tema do orador");
    const talk = await db
      .prepare("SELECT member_id FROM speaker_talks WHERE id = ? AND congregation_id = ? LIMIT 1")
      .bind(talkId, CONGREGATION_ID)
      .first<{ member_id: string }>();
    targetMemberId = talk?.member_id ?? "";
  }
  if (!currentMember || currentMember.id !== targetMemberId) {
    throw new UnauthorizedError("Você só pode editar seus próprios temas de discurso.");
  }
}

function requireAdmin(user: Awaited<ReturnType<typeof ensureCurrentUser>>) {
  if (user.role !== "admin") {
    throw new Error("Apenas o administrador pode realizar esta ação.");
  }
}

function readMemberGender(value: unknown): MemberGender {
  if (value === undefined || value === null || value === "") return null;
  if (value === "masculino" || value === "feminino") return value;
  throw new Error("Gênero inválido.");
}

function readText(value: unknown, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) throw new Error(`${label} é obrigatório.`);
  return text;
}

function optionalText(value: unknown) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function normalizeWhatsAppPhone(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;

  const normalized =
    value.trim().startsWith("+")
      ? digits
      : digits.startsWith("55") && digits.length >= 12
        ? digits
        : digits.length === 10 || digits.length === 11
          ? `55${digits}`
          : digits;

  if (normalized.length < 10 || normalized.length > 15) {
    throw new Error("WhatsApp precisa estar em formato internacional, como +5511999999999.");
  }

  return `+${normalized}`;
}

function readDate(value: unknown, label: string) {
  const text = readText(value, label);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`${label} precisa estar em formato de data.`);
  return text;
}

function optionalDate(value: unknown, label: string) {
  const text = optionalText(value);
  if (!text) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) throw new Error(`${label} precisa estar em formato de data.`);
  return text;
}

function readRole(value: unknown): AppRole {
  const role = typeof value === "string" ? value : PUBLISHER;
  return role === "admin" || role === "coordenador" || role === "publicador"
    ? role
    : PUBLISHER;
}

function readCongregationStatus(value: unknown): CongregationStatus {
  const status = typeof value === "string" ? value : "publicador";
  return validCongregationStatuses.has(status as CongregationStatus)
    ? (status as CongregationStatus)
    : "publicador";
}

function readAssignmentStatus(value: unknown): AssignmentStatus {
  const status = typeof value === "string" ? value : "rascunho";
  return status === "rascunho" ||
    status === "aguardando" ||
    status === "confirmada" ||
    status === "recusada"
    ? status
    : "rascunho";
}

function readSimpleScheduleStatus(value: unknown): SimpleScheduleStatus {
  return value === "confirmada" ? "confirmada" : "rascunho";
}

function readAttendanceStatus(value: unknown): MeetingAttendanceRow["status"] {
  return value === "ausente" || value === "zoom" ? value : "presente";
}

function readTime(value: unknown, label: string) {
  const text = readText(value, label);
  if (!/^\d{2}:\d{2}$/.test(text)) {
    throw new Error(`${label} precisa estar no formato HH:mm.`);
  }
  return text;
}

function optionalNonNegativeInteger(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(number) || number < 0) {
    throw new Error("A assistência precisa ser um número inteiro positivo.");
  }
  return number;
}

function optionalNonNegativeSeconds(value: unknown, label: string) {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isInteger(number) || number < 0) {
    throw new Error(`${label} precisa ser um número inteiro positivo.`);
  }
  return number;
}

function optionalIsoTimestamp(value: unknown) {
  const text = optionalText(value);
  if (!text) return null;
  const time = Date.parse(text);
  if (!Number.isFinite(time)) throw new Error("Horário do cronômetro inválido.");
  return new Date(time).toISOString();
}

function readStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function readDesignPrivileges(value: unknown) {
  return normalizePrivileges(readStringArray(value));
}

function readEditableModules(value: unknown, role: AppRole) {
  if (role === "admin") return [...EDITABLE_MODULES];
  return readStringArray(value).filter((item): item is EditableModule => validEditableModules.has(item as EditableModule));
}

function readPioneerRoles(value: unknown) {
  return readStringArray(value).filter((item): item is PioneerRole => validPioneerRoles.has(item as PioneerRole));
}

function readFieldDays(value: unknown) {
  return readStringArray(value).filter((item): item is FieldDay => validFieldDays.has(item as FieldDay));
}

function readFieldServiceGroupPayload(payload: Record<string, unknown>) {
  const name = readText(payload.name, "Nome do grupo");
  const overseerMemberId = optionalText(payload.overseerMemberId ?? payload.overseer_member_id);
  const assistantMemberId = optionalText(payload.assistantMemberId ?? payload.assistant_member_id);
  if (overseerMemberId && assistantMemberId && overseerMemberId === assistantMemberId) {
    throw new Error("O superintendente e o ajudante do grupo precisam ser pessoas diferentes.");
  }
  return { name, overseerMemberId, assistantMemberId };
}

function readSpecialEventPayload(payload: Record<string, unknown>) {
  const type = readSpecialEventType(payload.type);
  const fallbackTitle = specialEventTypeLabel(type);
  const title = type === "discurso_especial" ? readText(payload.title, "Tema do discurso especial") : optionalText(payload.title) ?? fallbackTitle;
  const startDate = readDate(payload.startDate ?? payload.start_date, "Início");
  if (type === "discurso_especial") {
    const parsedDate = new Date(`${startDate}T12:00:00Z`);
    if (!Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== startDate) {
      throw new Error("Informe uma data válida para o discurso especial.");
    }
  }
  const endDate = type === "discurso_especial" ? startDate : readDate(payload.endDate ?? payload.end_date, "Fim");
  if (endDate < startDate) throw new Error("A data final do evento não pode ser antes da inicial.");
  return {
    specialTalkSpeaker: type === "discurso_especial" ? readText(payload.specialTalkSpeaker ?? payload.special_talk_speaker, "Orador do discurso especial") : null,
    type,
    title,
    startDate,
    endDate,
    circuitOverseerName: optionalText(payload.circuitOverseerName ?? payload.circuit_overseer_name),
    circuitOverseerWife: optionalText(payload.circuitOverseerWife ?? payload.circuit_overseer_wife),
    midweekServiceTalkTitle: optionalText(payload.midweekServiceTalkTitle ?? payload.midweek_service_talk_title),
    midweekServiceTalkSong: optionalText(payload.midweekServiceTalkSong ?? payload.midweek_service_talk_song),
    weekendPublicTalkTitle: optionalText(payload.weekendPublicTalkTitle ?? payload.weekend_public_talk_title),
    weekendFinalTalkTitle: optionalText(payload.weekendFinalTalkTitle ?? payload.weekend_final_talk_title),
    weekendFinalTalkSong: optionalText(payload.weekendFinalTalkSong ?? payload.weekend_final_talk_song),
    notes: optionalText(payload.notes),
  };
}

function readSpecialEventType(value: unknown): SpecialEventType {
  const type = typeof value === "string" ? value : "outro";
  return validSpecialEventTypes.has(type as SpecialEventType) ? (type as SpecialEventType) : "outro";
}

function specialEventTypeLabel(type: SpecialEventType) {
  const labels: Record<SpecialEventType, string> = {
    discurso_especial: "Discurso Especial",
    visita_superintendente: "Visita do superintendente",
    assembleia: "Assembleia",
    congresso: "Congresso",
    celebracao: "Celebração",
    outro: "Evento especial",
  };
  return labels[type];
}

function parseStoredStringArray(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parsePrivileges(value: string) {
  return normalizePrivileges(parseStoredStringArray(value));
}

function parsePioneerRoles(value: string | null | undefined) {
  return parseStoredStringArray(value).filter((item): item is PioneerRole => validPioneerRoles.has(item as PioneerRole));
}

function parseFieldDays(value: string | null | undefined) {
  return parseStoredStringArray(value).filter((item): item is FieldDay => validFieldDays.has(item as FieldDay));
}

function parseEditableModules(value: string | null | undefined) {
  return parseStoredStringArray(value).filter((item): item is EditableModule => validEditableModules.has(item as EditableModule));
}

function normalizePrivileges(values: string[]) {
  const privileges = new Set<string>();
  for (const value of values) {
    if (value in ROLE_LABELS) {
      privileges.add(value);
      continue;
    }
    for (const mapped of legacyPrivilegeMap[value] ?? []) {
      privileges.add(mapped);
    }
  }
  return [...privileges];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function daysBetween(start: string, end: string) {
  const startTime = new Date(`${start}T12:00:00Z`).getTime();
  const endTime = new Date(`${end}T12:00:00Z`).getTime();
  return Math.round((endTime - startTime) / 86_400_000);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return startA <= endB && startB <= endA;
}

function isD1OverloadedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /D1_ERROR/i.test(message) && /(overloaded|queued for too long|too long|busy)/i.test(message);
}

function jsonError(error: unknown, status: number) {
  if (error instanceof ConflictError) {
    return Response.json(
      { error: error.message, conflicts: error.conflicts },
      { status },
    );
  }
  if (isD1OverloadedError(error)) {
    return Response.json(
      {
        error: "O banco de dados ficou ocupado por alguns segundos. O app vai tentar novamente; se persistir, aguarde um instante e atualize.",
        retryable: true,
      },
      { status },
    );
  }
  return Response.json(
    { error: error instanceof Error ? error.message : "Erro inesperado." },
    { status },
  );
}

class ConflictError extends Error {
  constructor(
    message: string,
    public conflicts: string[],
  ) {
    super(message);
  }
}
export async function initializeDemo() { await ensureAppReady(localDatabase); }
