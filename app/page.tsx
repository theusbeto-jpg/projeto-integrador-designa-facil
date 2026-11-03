import { FormEvent, useEffect, useMemo, useState } from "react";
import PrivilegesSection from "./PrivilegesSection";
import type { PrivilegeAssignments } from "./privilegeDefinitions";
import { formatSongDisplay } from "./songbook";
import { sameGenderPair, midweekParticipationHistory, type MemberGender } from "./assignmentGuidance";

type AppRole = "admin" | "coordenador" | "publicador";
type CongregationStatus = "estudante" | "publicador" | "publicador_batizado" | "servo_ministerial" | "anciao";
type PioneerRole = "pioneiro_auxiliar" | "pioneiro_regular";
type FieldDay = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
type WeekStatus = "rascunho" | "revisao" | "publicada";
type AssignmentStatus = "rascunho" | "aguardando" | "confirmada" | "recusada";
type SimpleScheduleStatus = "rascunho" | "confirmada";
type MechanicalMeetingKind = "meio_semana" | "fim_de_semana";
type FieldMinistryArrangement = "salao_reino" | "grupo_servico" | "todos_grupos";
type SpecialEventType = "visita_superintendente" | "assembleia" | "congresso" | "celebracao" | "discurso_especial" | "outro";
type FieldMinistryDayFilter = "all" | "sex" | "sab" | "dom" | "feriado";
type PublicMeetingSubtab = "assignments" | "received" | "sent";
type EditableModule =
  | "designacao_vm"
  | "reuniao_publica"
  | "mecanicas"
  | "campo"
  | "pastoreio";

type Member = {
  id: string;
  participation_status?: "ativo" | "inativo" | "mudou_congregacao";
  gender?: MemberGender;
  name: string;
  email: string | null;
  whatsapp_phone: string | null;
  congregation_status: CongregationStatus;
  pioneer_roles: PioneerRole[];
  field_service_group_id: string | null;
  field_availability: FieldDay[];
  role: AppRole;
  active: boolean;
  privileges: string[];
  editable_modules: EditableModule[];
};

type FieldServiceGroup = {
  id: string;
  name: string;
  overseer_member_id: string | null;
  assistant_member_id: string | null;
};

type MemberForm = {
  name: string;
  participationStatus: "ativo" | "inativo" | "mudou_congregacao";
  gender: MemberGender;
  email: string;
  whatsappPhone: string;
  role: AppRole;
  congregationStatus: CongregationStatus;
  pioneerRoles: PioneerRole[];
  fieldServiceGroupId: string;
  fieldAvailability: FieldDay[];
  privileges: string[];
  editableModules: EditableModule[];
};

type FieldGroupForm = {
  id: string;
  name: string;
  overseerMemberId: string;
  assistantMemberId: string;
};

type SpecialEventForm = {
  specialTalkSpeaker: string;
  id: string;
  type: SpecialEventType;
  title: string;
  startDate: string;
  endDate: string;
  circuitOverseerName: string;
  circuitOverseerWife: string;
  midweekServiceTalkTitle: string;
  midweekServiceTalkSong: string;
  weekendPublicTalkTitle: string;
  weekendFinalTalkTitle: string;
  weekendFinalTalkSong: string;
  notes: string;
};

type Week = {
  id: string;
  week_start: string;
  meeting_date: string;
  bible_reading: string;
  opening_song: string;
  closing_song: string;
  status: WeekStatus;
};

type Assignment = {
  id: string;
  week_id: string;
  section: string;
  section_tone: "teal" | "gold" | "red" | "meta";
  sequence: number;
  title: string;
  duration_min: number | null;
  role_key: string;
  assignee_member_id: string | null;
  assistant_member_id: string | null;
  status: AssignmentStatus;
  updated_at?: string;
};

type TimeAway = {
  id: string;
  member_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  source: string;
};

type Invitation = {
  id: string;
  member_id: string | null;
  email: string;
  whatsapp_phone: string | null;
  role: AppRole;
  status: "pendente" | "aceito" | "cancelado";
  access_code_hint: string | null;
  access_code_created_at: string | null;
  password_created_at: string | null;
};

type SpecialEvent = {
  special_talk_speaker: string | null;
  id: string;
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
};

type JwSync = {
  checked_at: string;
  source_url: string;
  publications: string[];
  imported_weeks: number;
  updated_weeks: number;
  message: string;
} | null;

type WatchtowerSync = {
  checked_at: string;
  source_url: string;
  publications: string[];
  imported_studies: number;
  message: string;
} | null;

type PublicMeeting = {
  no_public_meeting_event?: SpecialEvent;
  special_talk_title?: string;
  regular_public_talk?: { themeId: string | null; speaker: string | null; congregation: string | null };
  id: string;
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
  status: "rascunho" | "confirmada";
  updated_at?: string;
};

type PublicMeetingMonthDefault = {
  id: string;
  month_key: string;
  default_weekday: "sabado" | "domingo";
  default_time: string | null;
  destination_congregation: string | null;
  destination_address: string | null;
  updated_at?: string;
};

type PublicTalkHistory = {
  id: string;
  public_talk_theme_id: string;
  talk_date: string;
  source_label: string;
};

type SpeakerTalk = {
  id: string;
  member_id: string;
  theme_id: string;
};

type MechanicalAssignment = {
  id: string;
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
  updated_at?: string;
};

type MechanicalAssignmentDraft = {
  audio_member_id: string;
  video_member_id: string;
  external_attendant_member_id: string;
  internal_attendant_member_id: string;
  roaming_microphone_member_id: string;
  attendance_total: string;
  attendance_in_person: string;
  attendance_zoom: string;
  status: SimpleScheduleStatus;
};
type MechanicalMemberField = Exclude<keyof MechanicalAssignmentDraft, "status" | "attendance_total" | "attendance_in_person" | "attendance_zoom">;

type FieldMinistryAssignment = {
  id: string;
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
  updated_at?: string;
};

type FieldMinistryAssignmentDraft = {
  start_time: string;
  conductor_member_id: string;
  guest_conductor_name: string;
  location: string;
  notes: string;
  status: SimpleScheduleStatus;
};

type AccountAudit = {
  id: string;
  period_label: string;
  months_label: string;
  due_date: string;
  auditor_member_id: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
};

type AccountAuditDraft = {
  auditor_member_id: string;
  completed_date: string;
  notes: string;
};

type TimeControlDraft = {
  actualSeconds: number;
  startedAt: string | null;
  endedAt: string | null;
  runningStartedAt: number | null;
  notes: string;
};

type MeetingSessionDraft = {
  startedAt: string | null;
  endedAt: string | null;
  runningStartedAt: number | null;
};

type TimeControlPart = {
  partKey: string;
  assignmentId: string;
  roleKey: string;
  section: string;
  title: string;
  plannedSeconds: number | null;
  assignee: string;
  assistant: string;
};

type MeetingExtraSegment = {
  key: string;
  title: string;
  startedAt: string | null;
  endedAt: string | null;
  actualSeconds: number;
};

type PublicMeetingDraft = {
  chairman_member_id: string;
  watchtower_reader_member_id: string;
  watchtower_study_id: string;
  public_talk_theme_id: string;
  public_talk_theme_query: string;
  public_talk_speaker: string;
  public_talk_speaker_congregation: string;
  outgoing_speaker: string;
  outgoing_talk_theme: string;
  outgoing_date: string;
  outgoing_time: string;
  outgoing_congregation: string;
  outgoing_address: string;
  outgoing_song: string;
  notes: string;
  status: PublicMeeting["status"];
};

type PublicTalkTheme = {
  id: string;
  number: number;
  title: string;
  source: string;
  active: boolean;
};

type WatchtowerStudy = {
  id: string;
  issue_title: string;
  study_title: string;
  study_week_label: string;
  study_start_date: string | null;
  study_end_date: string | null;
  source_url: string;
};

type EventReminder = {
  eventId: string;
  weekId: string;
  type: "sem_reuniao" | "visita_superintendente" | "lembrete_previo" | "recapitulacao" | "celebracao" | "informativo";
  title: string;
  message: string;
};

type MemberVisit = {
  id: string;
  field_service_group_id: string;
  member_id: string;
  visit_date: string;
  notes: string | null;
  recorded_by_member_id: string | null;
};

type MeetingAttendance = {
  id: string;
  field_service_group_id: string;
  member_id: string;
  meeting_date: string;
  status: "presente" | "ausente" | "zoom";
  notes: string | null;
  recorded_by_member_id: string | null;
};

type MeetingTimingRecord = {
  id: string;
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
};

type Conflict = {
  assignmentId: string;
  weekId: string;
  memberId: string;
  memberName: string;
  level: "bloqueio" | "alerta";
  message: string;
};

type AppState = {
  privilegeAssignments: PrivilegeAssignments;
  user: {
    id: string;
    displayName: string;
    email: string | null;
    role: AppRole;
    canEdit: boolean;
    editableModules: EditableModule[];
    authenticated: boolean;
  };
  maintenancePending?: boolean;
  congregation: {
    name: string;
    city: string;
    meeting_title: string;
  };
  members: Member[];
  weeks: Week[];
  assignments: Assignment[];
  timeAway: TimeAway[];
  invitations: Invitation[];
  fieldServiceGroups: FieldServiceGroup[];
  specialEvents: SpecialEvent[];
  latestJwSync: JwSync;
  latestWatchtowerSync: WatchtowerSync;
  publicMeetings: PublicMeeting[];
  publicMeetingMonthDefaults: PublicMeetingMonthDefault[];
  publicTalkHistory: PublicTalkHistory[];
  speakerTalks: SpeakerTalk[];
  mechanicalAssignments: MechanicalAssignment[];
  fieldMinistryAssignments: FieldMinistryAssignment[];
  accountAudits: AccountAudit[];
  memberVisits: MemberVisit[];
  meetingAttendance: MeetingAttendance[];
  meetingTimingRecords: MeetingTimingRecord[];
  attendanceReportWhatsApp: string | null;
  timeControlReportRecipients: Array<{ name: string; whatsapp_phone: string | null }>;
  publicTalkThemes: PublicTalkTheme[];
  watchtowerStudies: WatchtowerStudy[];
  eventReminders: EventReminder[];
  roleLabels: Record<string, string>;
  conflicts: Conflict[];
  totals: {
    members: number;
    weeks: number;
    conflicts: number;
    confirmed: number;
  };
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type ActionResponse = AppState & {
  generatedAccessCode?: {
    email: string;
    code: string;
    whatsappPhone: string | null;
    memberId: string | null;
    memberName: string | null;
  };
};

type S89Data = {
  studentName: string;
  assistantName: string;
  meetingDate: string;
  partNumber: number;
  partTitle: string;
  location: string;
};

type RecommendationLevel = "info" | "warning" | "block";

type MemberChoiceOption = {
  lastMidweekDate?: string | null;
  adjacentMidweek?: boolean;
  member: Member;
  detail: string;
  notes: Array<{
    level: RecommendationLevel;
    text: string;
  }>;
  weeksSince: number;
  totalAssignments: number;
};

type MemberSearchSelectProps = {
  label: string;
  value: string;
  options: MemberChoiceOption[];
  disabled?: boolean;
  emptyLabel?: string;
  placeholder?: string;
  onChange: (memberId: string) => void;
};

function MemberSearchSelect({
  label,
  value,
  options,
  disabled = false,
  emptyLabel = "Sem designado",
  placeholder = "Pesquisar participante",
  onChange,
}: MemberSearchSelectProps) {
  const selectedOption = options.find((option) => option.member.id === value) ?? null;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(selectedOption?.member.name ?? "");
  }, [selectedOption?.member.id, selectedOption?.member.name, value]);

  const normalizedQuery = normalizeSearchText(query);
  const visibleOptions = (normalizedQuery
    ? options.filter((option) =>
        normalizeSearchText(
          [option.member.name, option.detail, ...option.notes.map((note) => note.text)].join(" "),
        ).includes(normalizedQuery),
      )
    : options
  );

  function choose(memberId: string) {
    onChange(memberId);
    const memberName = options.find((option) => option.member.id === memberId)?.member.name ?? "";
    setQuery(memberName);
    setOpen(false);
  }

  return (
    <div className="member-search-select">
      <span className="member-select-label">{label}</span>
      <input
        aria-expanded={open}
        aria-label={label}
        autoComplete="off"
        disabled={disabled}
        onBlur={() =>
          window.setTimeout(() => {
            setOpen(false);
            setQuery(selectedOption?.member.name ?? "");
          }, 120)
        }
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (!event.target.value.trim()) onChange("");
        }}
        onFocus={() => {
          setQuery("");
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            if (!query.trim()) choose("");
            else if (visibleOptions[0]) choose(visibleOptions[0].member.id);
          }
          if (event.key === "Escape") setOpen(false);
        }}
        placeholder={placeholder}
        role="combobox"
        value={query}
      />
      {open && !disabled ? (
        <div className="member-option-list" role="listbox">
          <button
            className={`member-option ${value ? "" : "selected"}`}
            onMouseDown={(event) => {
              event.preventDefault();
              choose("");
            }}
            type="button"
          >
            <strong>{emptyLabel}</strong>
          </button>
          {visibleOptions.length > 0 ? (
            visibleOptions.map((option) => (
              <button
                className={`member-option ${option.member.id === value ? "selected" : ""}`}
                key={option.member.id}
                onMouseDown={(event) => {
                  event.preventDefault();
                  choose(option.member.id);
                }}
                type="button"
              >
                <strong>{option.member.name}</strong>
                <span>{option.detail}</span>
                {option.notes.slice(0, 3).map((note) => (
                  <small className={`note-${note.level}`} key={`${option.member.id}-${note.level}-${note.text}`}>
                    {note.text}
                  </small>
                ))}
              </button>
            ))
          ) : (
            <div className="member-option empty">Nenhum participante encontrado.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function waitClient(durationMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

const APP_NAME = "Designa Fácil — Edição acadêmica";

const roleOptions: Array<{ value: AppRole; label: string }> = [
  { value: "admin", label: "Administrador" },
  { value: "coordenador", label: "Coordenador" },
  { value: "publicador", label: "Publicador" },
];

const congregationStatusOptions: Array<{ value: CongregationStatus; label: string }> = [
  { value: "estudante", label: "Estudante" },
  { value: "publicador", label: "Publicador" },
  { value: "publicador_batizado", label: "Publicador batizado" },
  { value: "servo_ministerial", label: "Servo ministerial" },
  { value: "anciao", label: "Ancião" },
];

const pioneerOptions: Array<{ value: PioneerRole; label: string }> = [
  { value: "pioneiro_auxiliar", label: "Pioneiro auxiliar" },
  { value: "pioneiro_regular", label: "Pioneiro regular" },
];

const fieldDayOptions: Array<{ value: FieldDay; label: string }> = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
  { value: "sab", label: "Sáb" },
  { value: "dom", label: "Dom" },
];

const mechanicalRoleFields: Array<{
  key: MechanicalMemberField;
  privilege: string;
  label: string;
}> = [
  { key: "audio_member_id", privilege: "audio", label: "Áudio" },
  { key: "video_member_id", privilege: "video", label: "Vídeo" },
  { key: "external_attendant_member_id", privilege: "indicador_externo", label: "Indicador externo" },
  { key: "internal_attendant_member_id", privilege: "indicador_interno", label: "Indicador interno" },
  { key: "roaming_microphone_member_id", privilege: "microfone_volante", label: "Microfone volante" },
];

const specialEventOptions: Array<{ value: SpecialEventType; label: string }> = [
  { value: "discurso_especial", label: "Discurso Especial" },
  { value: "visita_superintendente", label: "Visita do superintendente" },
  { value: "assembleia", label: "Assembleia" },
  { value: "congresso", label: "Congresso" },
  { value: "celebracao", label: "Celebração" },
  { value: "outro", label: "Outro" },
];

const defaultDesignPrivileges = ["iniciando_conversas"];
const ministryRotationPrivileges = ["iniciando_conversas", "cultivando_interesse", "fazendo_discipulos"];
const DESIGNACAO_NAV = "Designação Vida e Ministério";
const PUBLIC_MEETING_NAV = "Designação Reunião Pública";
const MECHANICAL_NAV = "Designações Mecânicas";
const FIELD_MINISTRY_NAV = "Ministério de Campo";
const PASTORAL_NAV = "Pastoreio";
const TIME_CONTROL_NAV = "Controle do tempo";
const TIME_RECORDS_NAV = "Tempos registrados";
const ATTENDANCE_NAV = "Assistência das reuniões";
const ACCOUNTS_NAV = "Auditoria das contas";
const TIME_CONTROL_MEETING_TOTAL_KEY = "meeting-total";
const TIME_CONTROL_EXTRA_PREFIX = "meeting-extra";

const navItems = [
  "Resumo",
  DESIGNACAO_NAV,
  TIME_CONTROL_NAV,
  TIME_RECORDS_NAV,
  ATTENDANCE_NAV,
  PUBLIC_MEETING_NAV,
  MECHANICAL_NAV,
  FIELD_MINISTRY_NAV,
  PASTORAL_NAV,
  ACCOUNTS_NAV,
  "Apostilas",
  "Eventos",
  "Participantes",
  "Privilégios",
  "Folgas",
  "Folha",
];
const publisherNavItems = [
  "Resumo",
  DESIGNACAO_NAV,
  TIME_CONTROL_NAV,
  TIME_RECORDS_NAV,
  ATTENDANCE_NAV,
  PUBLIC_MEETING_NAV,
  MECHANICAL_NAV,
  FIELD_MINISTRY_NAV,
  PASTORAL_NAV,
  ACCOUNTS_NAV,
  "Folha",
];

function navShortLabel(item: string) {
  if (item === "Resumo") return "RE";
  if (item === DESIGNACAO_NAV) return "VM";
  if (item === TIME_CONTROL_NAV) return "TP";
  if (item === TIME_RECORDS_NAV) return "TR";
  if (item === ATTENDANCE_NAV) return "AS";
  if (item === PUBLIC_MEETING_NAV) return "RP";
  if (item === MECHANICAL_NAV) return "AV";
  if (item === FIELD_MINISTRY_NAV) return "CP";
  if (item === PASTORAL_NAV) return "PA";
  if (item === ACCOUNTS_NAV) return "AU";
  return item.slice(0, 2).toUpperCase();
}

const editableModuleOptions: Array<{ value: EditableModule; label: string }> = [
  { value: "designacao_vm", label: "Vida e Ministério" },
  { value: "reuniao_publica", label: "Reunião Pública" },
  { value: "mecanicas", label: "Mecânicas" },
  { value: "campo", label: "Campo" },
  { value: "pastoreio", label: "Pastoreio" },
];

const NAV_TO_MODULE: Record<string, EditableModule> = {
  [DESIGNACAO_NAV]: "designacao_vm",
  [PUBLIC_MEETING_NAV]: "reuniao_publica",
  [MECHANICAL_NAV]: "mecanicas",
  [FIELD_MINISTRY_NAV]: "campo",
  [PASTORAL_NAV]: "pastoreio",
};

function createEmptyMemberForm(): MemberForm {
  return {
    name: "",
    participationStatus: "ativo",
    gender: null,
    email: "",
    whatsappPhone: "",
    role: "publicador",
    congregationStatus: "publicador",
    pioneerRoles: [],
    fieldServiceGroupId: "",
    fieldAvailability: [],
    privileges: [...defaultDesignPrivileges],
    editableModules: [],
  };
}

function createEmptyFieldGroupForm(): FieldGroupForm {
  return {
    id: "",
    name: "",
    overseerMemberId: "",
    assistantMemberId: "",
  };
}

function createEmptySpecialEventForm(): SpecialEventForm {
  return {
    specialTalkSpeaker: "",
    id: "",
    type: "assembleia",
    title: "",
    startDate: "",
    endDate: "",
    circuitOverseerName: "",
    circuitOverseerWife: "",
    midweekServiceTalkTitle: "",
    midweekServiceTalkSong: "",
    weekendPublicTalkTitle: "",
    weekendFinalTalkTitle: "",
    weekendFinalTalkSong: "",
    notes: "",
  };
}

function createEmptyPublicMeetingDraft(): PublicMeetingDraft {
  return {
    chairman_member_id: "",
    watchtower_reader_member_id: "",
    watchtower_study_id: "",
    public_talk_theme_id: "",
    public_talk_theme_query: "",
    public_talk_speaker: "",
    public_talk_speaker_congregation: "",
    outgoing_speaker: "",
    outgoing_talk_theme: "",
    outgoing_date: "",
    outgoing_time: "",
    outgoing_congregation: "",
    outgoing_address: "",
    outgoing_song: "",
    notes: "",
    status: "rascunho",
  };
}

function specialEventTypeLabel(type: SpecialEventType) {
  return specialEventOptions.find((option) => option.value === type)?.label ?? type;
}

function applySpecialTalk(meeting: PublicMeeting, events: SpecialEvent[], weeks: Week[]): PublicMeeting {
  const weekStart = weeks.find((week) => week.id === meeting.week_id)?.week_start;
  if (!weekStart) return meeting;
  const cancellation = events.find((event) =>
    (event.type === "assembleia" || event.type === "congresso") &&
    event.start_date <= addDays(weekStart, 6) && event.end_date >= addDays(weekStart, 5));
  if (cancellation) return { ...meeting,
    no_public_meeting_event: cancellation,
    meeting_date: cancellation.start_date < addDays(weekStart, 5) ? addDays(weekStart, 5) : cancellation.start_date,
    chairman_member_id: null, watchtower_conductor_member_id: null, watchtower_reader_member_id: null,
    watchtower_study_id: null, public_talk_theme_id: null, public_talk_speaker: null,
    public_talk_speaker_congregation: null, outgoing_speaker: null, outgoing_talk_theme: null,
    outgoing_date: null, outgoing_time: null, outgoing_congregation: null, outgoing_address: null, outgoing_song: null,
  };
  const special = events.find((event) => event.type === "discurso_especial" && event.start_date >= weekStart && event.start_date <= addDays(weekStart, 6));
  if (!special) return meeting;
  return { ...meeting,
    meeting_date: special.start_date,
    special_talk_title: special.title,
    regular_public_talk: { themeId: meeting.public_talk_theme_id, speaker: meeting.public_talk_speaker, congregation: meeting.public_talk_speaker_congregation },
    public_talk_theme_id: null,
    public_talk_speaker: special.special_talk_speaker,
  };
}

function createPublicMeetingDraft(meeting: PublicMeeting | null, themes: PublicTalkTheme[]): PublicMeetingDraft {
  if (!meeting) return createEmptyPublicMeetingDraft();
  if (meeting.regular_public_talk) meeting = { ...meeting,
    public_talk_theme_id: meeting.regular_public_talk.themeId,
    public_talk_speaker: meeting.regular_public_talk.speaker,
    public_talk_speaker_congregation: meeting.regular_public_talk.congregation,
  };
  const selectedTheme = themes.find((theme) => theme.id === meeting.public_talk_theme_id) ?? null;
  return {
    chairman_member_id: meeting.chairman_member_id ?? "",
    watchtower_reader_member_id: meeting.watchtower_reader_member_id ?? "",
    watchtower_study_id: meeting.watchtower_study_id ?? "",
    public_talk_theme_id: meeting.public_talk_theme_id ?? "",
    public_talk_theme_query: selectedTheme ? publicTalkThemeSearchLabel(selectedTheme) : "",
    public_talk_speaker: meeting.public_talk_speaker ?? "",
    public_talk_speaker_congregation: meeting.public_talk_speaker_congregation ?? "",
    outgoing_speaker: meeting.outgoing_speaker ?? "",
    outgoing_talk_theme: meeting.outgoing_talk_theme ?? "",
    outgoing_date: meeting.outgoing_date ?? "",
    outgoing_time: meeting.outgoing_time ?? "",
    outgoing_congregation: meeting.outgoing_congregation ?? "",
    outgoing_address: meeting.outgoing_address ?? "",
    outgoing_song: meeting.outgoing_song ?? "",
    notes: meeting.notes ?? "",
    status: meeting.status,
  };
}

function createMechanicalDraft(assignment: MechanicalAssignment): MechanicalAssignmentDraft {
  return {
    audio_member_id: assignment.audio_member_id ?? "",
    video_member_id: assignment.video_member_id ?? "",
    external_attendant_member_id: assignment.external_attendant_member_id ?? "",
    internal_attendant_member_id: assignment.internal_attendant_member_id ?? "",
    roaming_microphone_member_id: assignment.roaming_microphone_member_id ?? "",
    attendance_total: assignment.attendance_total?.toString() ?? "",
    attendance_in_person: assignment.attendance_in_person?.toString() ?? "",
    attendance_zoom: assignment.attendance_zoom?.toString() ?? "",
    status: assignment.status,
  };
}

function buildMechanicalMonthSummary(
  assignments: MechanicalAssignment[],
  drafts: Record<string, MechanicalAssignmentDraft>,
  members: Member[],
  monthKey: string,
) {
  const rows = new Map<string, { memberId: string; name: string; counts: Record<MechanicalMemberField, number>; total: number }>();
  for (const assignment of assignments) {
    if (!assignment.assignment_date.startsWith(`${monthKey}-`)) continue;
    const draft = drafts[assignment.id] ?? createMechanicalDraft(assignment);
    for (const field of mechanicalRoleFields) {
      const memberId = draft[field.key];
      if (!memberId) continue;
      let row = rows.get(memberId);
      if (!row) {
        row = {
          memberId,
          name: members.find((member) => member.id === memberId)?.name ?? "Participante não encontrado",
          counts: Object.fromEntries(mechanicalRoleFields.map((role) => [role.key, 0])) as Record<MechanicalMemberField, number>,
          total: 0,
        };
        rows.set(memberId, row);
      }
      row.counts[field.key] += 1;
      row.total += 1;
    }
  }
  return Array.from(rows.values()).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, "pt-BR"));
}

function createTimeControlDraft(record: MeetingTimingRecord | null | undefined): TimeControlDraft {
  return {
    actualSeconds: record?.actual_seconds ?? 0,
    startedAt: record?.started_at ?? null,
    endedAt: record?.ended_at ?? null,
    runningStartedAt: null,
    notes: record?.notes ?? "",
  };
}

function createMeetingSessionDraft(record: MeetingTimingRecord | null | undefined): MeetingSessionDraft {
  const isRunning = Boolean(record?.started_at && !record?.ended_at);
  return {
    startedAt: record?.started_at ?? null,
    endedAt: record?.ended_at ?? null,
    runningStartedAt: isRunning ? Date.now() : null,
  };
}

function timeControlElapsedSeconds(draft: TimeControlDraft, now: number) {
  const runningSeconds = draft.runningStartedAt ? Math.max(0, Math.floor((now - draft.runningStartedAt) / 1000)) : 0;
  return draft.actualSeconds + runningSeconds;
}

function meetingSessionElapsedSeconds(draft: MeetingSessionDraft, now: number) {
  if (!draft.startedAt) return 0;
  const endMs = draft.endedAt ? new Date(draft.endedAt).getTime() : now;
  return Math.max(0, Math.floor((endMs - new Date(draft.startedAt).getTime()) / 1000));
}

function formatDurationSeconds(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "Sem tempo";
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = String(safeSeconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

function formatReadableDurationSeconds(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined) return "Sem tempo";
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const rest = safeSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}min ${String(rest).padStart(2, "0")}s`;
  return formatDurationSeconds(safeSeconds);
}

function formatTimeOnly(value: string | null | undefined) {
  if (!value) return "--:--";
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function meetingExtraLabel(previous: TimeControlPart | null, next: TimeControlPart | null) {
  if (!previous && next) return "Presidência - Introdução, Cântico e Oração";
  if (previous && !next) return "Conclusão da reunião - Anúncios, Cântico e Oração";
  if (previous?.roleKey === "tesouros" && next?.roleKey === "joias") return "Transição para Jóias";
  if (previous?.roleKey === "joias" && next?.roleKey === "leitura") return "Transição para leitura da Bíblia";
  if (previous?.roleKey === "leitura" && next?.roleKey === "ministerio") {
    return `Conselho ${previous.title} e transição para ${next.title}`;
  }
  if (previous?.roleKey === "ministerio" && next?.roleKey === "ministerio") {
    return `Conselho ${previous.title} e transição para ${next.title}`;
  }
  if (previous?.roleKey === "ministerio" && next?.roleKey === "vida_crista") {
    return `Conselho ${previous.title} e introdução para Vida Cristã com Cântico`;
  }
  return next ? `Transição para ${next.title}` : "Transição para próxima parte";
}

function secondsBetweenIso(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return 0;
  return Math.max(0, Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 1000));
}

function assignmentUsesAssistant(assignment: Pick<Assignment, "role_key" | "title" | "assistant_member_id">) {
  if (assignment.role_key === "estudo_biblico") return true;
  if (assignment.role_key !== "ministerio") return Boolean(assignment.assistant_member_id);
  return !normalizeSearchText(assignment.title).includes("o que voce diria");
}

function secondsToTimeControlInput(seconds: number) {
  if (!seconds) return "";
  return formatDurationSeconds(seconds);
}

function timeControlInputToSeconds(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return null;
    const minutes = Number(parts[0]);
    const seconds = parts[1] === "" ? 0 : Number(parts[1]);
    if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || minutes < 0 || seconds < 0) return null;
    return Math.round(minutes * 60 + seconds);
  }
  const number = Number(trimmed.replace(",", "."));
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.round(number * 60);
}

function createFieldMinistryDraft(assignment: FieldMinistryAssignment): FieldMinistryAssignmentDraft {
  return {
    start_time: assignment.start_time,
    conductor_member_id: assignment.conductor_member_id ?? "",
    guest_conductor_name: assignment.guest_conductor_name ?? "",
    location: assignment.location ?? "",
    notes: assignment.notes ?? "",
    status: assignment.status,
  };
}

function publicTalkThemeSearchLabel(theme: PublicTalkTheme) {
  return `${theme.number}. ${theme.title}`;
}

function resolvePublicTalkThemeInput(value: string, themes: PublicTalkTheme[]) {
  const normalized = normalizeSearchText(value.trim());
  if (!normalized) return null;
  return (
    themes.find((theme) => normalizeSearchText(publicTalkThemeSearchLabel(theme)) === normalized) ??
    themes.find((theme) => normalizeSearchText(theme.title) === normalized) ??
    themes.find((theme) => String(theme.number) === normalized) ??
    null
  );
}

function filterPublicTalkThemeOptions(themes: PublicTalkTheme[], query: string) {
  const normalized = normalizeSearchText(query.trim());
  return [...themes]
    .filter((theme) => {
      if (!normalized) return true;
      return normalizeSearchText(`${String(theme.number).padStart(3, "0")} ${theme.number} ${theme.title}`).includes(normalized);
    })
    .sort((a, b) => a.number - b.number);
}

const lifeSongsByDate: Record<string,string> = {};

const fixedFieldWeeklyConductors: Partial<Record<FieldDay, string>> = {
  seg: "Participante 001",
  ter: "Participante 002",
  qua: "Participante 003",
  qui: "Participante 004",
};
const fixedFieldWeeklySlots: Partial<Record<FieldDay, Array<{ startTime: string; conductor: string; note?: string }>>> = {
  seg: [{ startTime: "08:45", conductor: "Participante 001" }],
  ter: [{ startTime: "08:45", conductor: "Participante 002" }],
  qua: [{ startTime: "08:45", conductor: "Participante 003" }],
  qui: [{ startTime: "08:45", conductor: "Participante 004" }],
  sex: [{ startTime: "08:45", conductor: "Participante 005", note: "Zoom" }],
};
const fieldCalendarWeekdays: FieldDay[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
const restrictedExternalAttendantNames = ["Participante 003", "Participante 006", "Participante 007"];
const restrictedWeekendFieldConductorNames = ["Participante 003"];
const excludedAccountAuditorNames = ["Participante 001"];
const FIELD_ALL_GROUPS_LOCATION = "Local fictício";
const FIELD_MINISTRY_MAX_MONTH = "2026-12";
const FIELD_MINISTRY_MAX_DATE = "2026-12-31";
const FIELD_MINISTRY_BASE_MONTH_OPTIONS = ["2026-08", "2026-09"];
const FRIDAY_MORNING_TIME = "08:45";
const FRIDAY_AFTERNOON_TIME = "18:00";
const FRIDAY_MORNING_CONDUCTOR_NAME = "Participante 005";
const TIME_CONTROL_OPERATOR_NAMES = ["Participante 004", "Participante 005"];
// Pessoas-chave para avisos internos (identificadas por nome, robusto na produção).
const BOARD_MANAGER_NAME = "Participante 008"; // cuida do quadro de anúncios
const ACCOUNTS_MANAGER_NAME = "Participante 006"; // cuida das contas (S-30 e auditorias)
// Janela (dias) para o aviso de impressão do quadro aparecer após gerar designações.
const BOARD_ALERT_WINDOW_DAYS = 5;
const OVERTIME_ALERT_WINDOW_DAYS = 7;
const ACCOUNT_AUDIT_WARNING_DAYS = 14;
// Avisos de controle de tempo.
const TIME_REPORT_OPERATOR_NAME = "Participante 005"; // quem opera o cronômetro e envia o relatório
const TIME_REPORT_RECIPIENT_NAMES = ["Participante 003", "Participante 002"]; // conselheiros que conferem o tempo
const fieldMinistryDayFilterOptions: Array<{ value: FieldMinistryDayFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "sex", label: "Sexta" },
  { value: "sab", label: "Sábado" },
  { value: "dom", label: "Domingo" },
  { value: "feriado", label: "Feriado" },
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
});

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function nextCareMeetingDateFromState(data: Pick<AppState, "mechanicalAssignments" | "weeks" | "publicMeetings">) {
  const today = toLocalIsoDate(new Date());
  const availableDates = [
    ...data.mechanicalAssignments.map((assignment) => assignment.assignment_date),
    ...data.weeks.map((week) => week.meeting_date),
    ...data.publicMeetings.map((meeting) => meeting.meeting_date),
  ]
    .filter((date) => date >= today)
    .sort((a, b) => a.localeCompare(b));

  return availableDates[0] ?? today;
}

function nextMeetingFocusFromState(data: Pick<AppState, "weeks" | "publicMeetings">) {
  const today = toLocalIsoDate(new Date());
  const candidates = [
    ...data.weeks.map((week) => ({
      date: week.meeting_date,
      nav: DESIGNACAO_NAV,
      weekId: week.id,
    })),
    ...data.publicMeetings.map((meeting) => ({
      date: meeting.meeting_date,
      nav: PUBLIC_MEETING_NAV,
      weekId: meeting.week_id,
    })),
  ].filter((candidate) => candidate.weekId);
  const ordered = candidates.sort((a, b) => a.date.localeCompare(b.date));
  const next = ordered.find((candidate) => candidate.date >= today);
  return next ?? ordered.at(-1) ?? { date: today, nav: DESIGNACAO_NAV, weekId: data.weeks[0]?.id ?? "" };
}

export default function Home() {
  const [rawState, setState] = useState<AppState | null>(null);
  const state = useMemo(() => rawState ? { ...rawState,
    publicMeetings: rawState.publicMeetings.map((meeting) => applySpecialTalk(meeting, rawState.specialEvents, rawState.weeks)),
  } : null, [rawState]);
  const [selectedWeekId, setSelectedWeekId] = useState<string>("");
  const [activeNav, setActiveNav] = useState("Resumo");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldImageBusy, setFieldImageBusy] = useState(false);
  const [sheetImageBusy, setSheetImageBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [memberForm, setMemberForm] = useState<MemberForm>(createEmptyMemberForm);
  const [assignmentGenderFilters, setAssignmentGenderFilters] = useState<Record<string, MemberGender>>({});
  const [editingMemberId, setEditingMemberId] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [fieldGroupForm, setFieldGroupForm] = useState<FieldGroupForm>(createEmptyFieldGroupForm);
  const [specialEventForm, setSpecialEventForm] = useState<SpecialEventForm>(createEmptySpecialEventForm);
  const [publicMeetingForm, setPublicMeetingForm] = useState<PublicMeetingDraft>(createEmptyPublicMeetingDraft);
  // Ferramenta "Consultar temas do orador" (lista temporária que o Milton monta).
  const [speakerThemeIds, setSpeakerThemeIds] = useState<string[]>([]);
  const [speakerThemeQuery, setSpeakerThemeQuery] = useState("");
  const [speakerThemeAssignments, setSpeakerThemeAssignments] = useState<Record<string, { meetingId: string; speaker: string }>>({});
  const [selectedOurSpeakerId, setSelectedOurSpeakerId] = useState("");
  const [ourSpeakerThemeQuery, setOurSpeakerThemeQuery] = useState("");
  const [outgoingMonth, setOutgoingMonth] = useState<string>("");
  const [outgoingWeekendDay, setOutgoingWeekendDay] = useState<"sabado" | "domingo">("sabado");
  const [outgoingDateChoice, setOutgoingDateChoice] = useState<{ meetingId: string; date: string } | null>(null);
  const [monthConfigOpen, setMonthConfigOpen] = useState(false);
  const [receivedMonthConfig, setReceivedMonthConfig] = useState<{ month: string; congregation: string } | null>(null);
  const [monthConfigForm, setMonthConfigForm] = useState<{
    default_weekday: "sabado" | "domingo";
    default_time: string;
    destination_congregation: string;
    destination_address: string;
  }>({ default_weekday: "sabado", default_time: "", destination_congregation: "", destination_address: "" });
  const [publicMeetingSubtab, setPublicMeetingSubtab] = useState<PublicMeetingSubtab>("assignments");
  const [mechanicalDrafts, setMechanicalDrafts] = useState<Record<string, MechanicalAssignmentDraft>>({});
  const [fieldMinistryDrafts, setFieldMinistryDrafts] = useState<Record<string, FieldMinistryAssignmentDraft>>({});
  const [accountAuditDrafts, setAccountAuditDrafts] = useState<Record<string, AccountAuditDraft>>({});
  const [timeControlDrafts, setTimeControlDrafts] = useState<Record<string, TimeControlDraft>>({});
  const [timeControlInputTexts, setTimeControlInputTexts] = useState<Record<string, string>>({});
  const [meetingSessionDrafts, setMeetingSessionDrafts] = useState<Record<string, MeetingSessionDraft>>({});
  const [timingNow, setTimingNow] = useState(() => Date.now());
  const [selectedAttendanceAssignmentId, setSelectedAttendanceAssignmentId] = useState("");
  const [selectedAttendanceMonth, setSelectedAttendanceMonth] = useState("");
  const [selectedMechanicalMonth, setSelectedMechanicalMonth] = useState("");
  const [selectedFieldMinistryMonth, setSelectedFieldMinistryMonth] = useState("");
  const [selectedFieldMinistryDate, setSelectedFieldMinistryDate] = useState("");
  const [fieldMinistryDayFilter, setFieldMinistryDayFilter] = useState<FieldMinistryDayFilter>("all");
  const [fieldMinistryGroupFilter, setFieldMinistryGroupFilter] = useState("");
  const [selectedCareGroupId, setSelectedCareGroupId] = useState("");
  const [careMeetingDate, setCareMeetingDate] = useState("");
  const [visitDrafts, setVisitDrafts] = useState<Record<string, string>>({});
  const [attendanceDrafts, setAttendanceDrafts] = useState<Record<string, MeetingAttendance["status"]>>({});
  const [selectedS89AssignmentId, setSelectedS89AssignmentId] = useState("");
  const [whatsAppForm, setWhatsAppForm] = useState("");
  const [awayForm, setAwayForm] = useState({
    memberId: "",
    startDate: "",
    endDate: "",
    reason: "Folga",
  });
  const [inviteForm, setInviteForm] = useState({
    memberId: "",
    email: "",
    whatsappPhone: "",
    role: "publicador" as AppRole,
  });
  const [latestAccessCode, setLatestAccessCode] = useState<ActionResponse["generatedAccessCode"] | null>(null);
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    secret: "",
    newPassword: "",
  });
  const [passwordSetupRequired, setPasswordSetupRequired] = useState(false);
  const [firstAccessMode, setFirstAccessMode] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  useEffect(() => {
    void loadState();
  }, []);



  useEffect(() => {
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");
    const standaloneNavigator = window.navigator as Navigator & { standalone?: boolean };
    const updateStandalone = () => setIsStandaloneApp(standaloneQuery.matches || standaloneNavigator.standalone === true);
    const captureInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const markInstalled = () => {
      setInstallPrompt(null);
      setIsStandaloneApp(true);
    };

    updateStandalone();
    window.addEventListener("beforeinstallprompt", captureInstallPrompt);
    window.addEventListener("appinstalled", markInstalled);
    standaloneQuery.addEventListener?.("change", updateStandalone);

    return () => {
      window.removeEventListener("beforeinstallprompt", captureInstallPrompt);
      window.removeEventListener("appinstalled", markInstalled);
      standaloneQuery.removeEventListener?.("change", updateStandalone);
    };
  }, []);

  useEffect(() => {
    const hasRunningPart = Object.values(timeControlDrafts).some((draft) => draft.runningStartedAt);
    const hasRunningMeeting = Object.values(meetingSessionDrafts).some((draft) => draft.runningStartedAt);
    if (!hasRunningPart && !hasRunningMeeting) return;
    const interval = window.setInterval(() => setTimingNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [meetingSessionDrafts, timeControlDrafts]);

  async function loadState() {
    setBusy(true);
    setNotice("");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 60000);
    try {
      let lastRetryableError = "";
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const response = await fetch("/api/state", { cache: "no-store", signal: controller.signal });
        const data = (await response.json()) as AppState | { error?: string; retryable?: boolean };
        if (response.status === 503 && "retryable" in data && data.retryable && attempt < 4) {
          lastRetryableError = data.error ?? "Banco de dados ocupado.";
          await waitClient(900 + attempt * 1200);
          continue;
        }
        if (!response.ok || !("weeks" in data)) {
          setNotice(("error" in data ? data.error : undefined) ?? (lastRetryableError || "Não foi possível carregar o aplicativo."));
          return;
        }
        const nextMeetingFocus = nextMeetingFocusFromState(data);
        setState(data);
        setSelectedWeekId((current) => current || nextMeetingFocus.weekId || data.weeks[0]?.id || "");
        setAwayForm((current) => ({
          ...current,
          memberId: current.memberId || data.members[0]?.id || "",
          startDate: current.startDate || nextMeetingFocus.date || data.weeks[0]?.meeting_date || "",
          endDate: current.endDate || nextMeetingFocus.date || data.weeks[0]?.meeting_date || "",
        }));
        setSelectedCareGroupId((current) => current || data.fieldServiceGroups[0]?.id || "");
        setCareMeetingDate((current) => current || nextCareMeetingDateFromState(data));
        return;
      }
      setNotice(lastRetryableError || "O banco está ocupado. Aguarde um instante e atualize.");
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "AbortError";
      setNotice(
        timedOut
          ? "O banco demorou para responder. Atualize a página em instantes."
          : "Não foi possível carregar o aplicativo. Vou precisar revisar a conexão de dados.",
      );
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }

  async function runAction(
    action: string,
    payload: Record<string, unknown>,
    success: string,
    options: { whatsappWindow?: Window | null } = {},
  ) {
    setBusy(true);
    setNotice("");
    setLatestAccessCode(null);
    try {
      const response = await fetch("/api/state", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const data = (await response.json()) as ActionResponse | { error?: string; conflicts?: string[]; retryable?: boolean };
      if (!response.ok) {
        const failure = data as {error?:string; conflicts?:string[]; retryable?:boolean};
        options.whatsappWindow?.close();
        const details = Array.isArray(failure.conflicts)
          ? ` ${failure.conflicts!.join(" ")}`
          : "";
        setNotice(
          failure.retryable
            ? `${failure.error ?? "O banco está ocupado."} Aguarde alguns segundos e tente a ação novamente.`
            : `${failure.error ?? "Ação não concluída."}${details}`,
        );
        return false;
      }
      setState(data as AppState);
      const generatedAccessCode = "generatedAccessCode" in data ? data.generatedAccessCode : null;
      if (generatedAccessCode) {
        setLatestAccessCode(generatedAccessCode);
        const openedWhatsApp = openAccessWhatsApp(generatedAccessCode, options.whatsappWindow);
        const recipient = accessRecipientLabel(generatedAccessCode);
        setNotice(
          openedWhatsApp
            ? `Código de acesso para ${recipient} gerado e WhatsApp aberto.`
            : generatedAccessCode.whatsappPhone
              ? `Código de acesso para ${recipient}: ${generatedAccessCode.code}. Se o WhatsApp não abriu, use o botão Abrir WhatsApp.`
              : `Código de acesso para ${recipient}: ${generatedAccessCode.code}. Cadastre o WhatsApp para abrir a conversa automaticamente.`,
        );
      } else {
        options.whatsappWindow?.close();
        setNotice(success);
      }
      return true;
    } catch {
      options.whatsappWindow?.close();
      setNotice("Não foi possível concluir a ação agora. Tente novamente em alguns instantes.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const selectedWeek = useMemo(
    () => state?.weeks.find((week) => week.id === selectedWeekId) ?? state?.weeks[0],
    [selectedWeekId, state?.weeks],
  );

  const weekAssignments = useMemo(
    () =>
      state?.assignments
        .filter((assignment) => assignment.week_id === selectedWeek?.id)
        .sort((a, b) => a.sequence - b.sequence) ?? [],
    [selectedWeek?.id, state?.assignments],
  );

  const printableAssignments = weekAssignments.filter(
    (assignment) => assignment.section !== "top" && assignment.section !== "bottom",
  );

  const s89Assignments = useMemo(
    () =>
      weekAssignments.filter(
        (assignment) =>
          assignment.section !== "top" &&
          assignment.section !== "bottom" &&
          assignment.assignee_member_id &&
          ["leitura", "ministerio"].includes(assignment.role_key),
      ),
    [weekAssignments],
  );

  const topAssignments = weekAssignments.filter((assignment) => assignment.section === "top");
  const bottomAssignments = weekAssignments.filter((assignment) => assignment.section === "bottom");

  const memberById = useMemo(() => {
    const map = new Map<string, Member>();
    state?.members.forEach((member) => map.set(member.id, member));
    return map;
  }, [state?.members]);

  const memberByEmail = useMemo(() => {
    const map = new Map<string, Member>();
    state?.members.forEach((member) => {
      if (member.email) map.set(member.email.toLowerCase(), member);
    });
    return map;
  }, [state?.members]);

  const weekById = useMemo(() => {
    const map = new Map<string, Week>();
    state?.weeks.forEach((week) => map.set(week.id, week));
    return map;
  }, [state?.weeks]);

  useEffect(() => {
    const assignment =
      s89Assignments.find((item) => item.id === selectedS89AssignmentId) ??
      s89Assignments[0];
    const member = assignment?.assignee_member_id
      ? memberById.get(assignment.assignee_member_id)
      : null;
    setWhatsAppForm(member?.whatsapp_phone ?? "");
  }, [memberById, s89Assignments, selectedS89AssignmentId]);

  const selectedWeekConflicts =
    state?.conflicts.filter((conflict) => conflict.weekId === selectedWeek?.id) ?? [];
  const selectedWeekReminders =
    state?.eventReminders.filter((reminder) => reminder.weekId === selectedWeek?.id) ?? [];
  const selectedWeekSpecialEvents =
    state?.specialEvents.filter((event) => {
      if (!selectedWeek) return false;
      const weekEnd = addDays(selectedWeek.week_start, 6);
      return event.start_date <= weekEnd && selectedWeek.week_start <= event.end_date;
    }) ?? [];

  const openAway = state?.timeAway.filter((away) => {
    if (!selectedWeek) return false;
    return away.start_date <= selectedWeek.meeting_date && selectedWeek.meeting_date <= away.end_date;
  }) ?? [];
  const selectedPublicMeeting = useMemo(
    () => state?.publicMeetings.find((meeting) => meeting.week_id === selectedWeek?.id) ?? null,
    [selectedWeek?.id, state?.publicMeetings],
  );

  useEffect(() => {
    const draft = createPublicMeetingDraft(selectedPublicMeeting, state?.publicTalkThemes ?? []);
    const forcedOutgoingDate = outgoingDateChoice && outgoingDateChoice.meetingId === selectedPublicMeeting?.id ? outgoingDateChoice.date : "";
    const monthDefault = monthDefaultFor(state?.publicMeetingMonthDefaults, outgoingMonth || selectedPublicMeeting?.outgoing_date?.slice(0, 7) || selectedPublicMeeting?.meeting_date.slice(0, 7) || "");
    const weekStart = state?.weeks.find((week) => week.id === selectedPublicMeeting?.week_id)?.week_start ?? null;
    const resolved = selectedPublicMeeting ? resolveOutgoing(selectedPublicMeeting, monthDefault, weekStart) : null;
    const outgoingDate = forcedOutgoingDate || resolved?.date || "";
    if (outgoingDate) {
      setOutgoingWeekendDay(new Date(`${outgoingDate}T12:00:00`).getDay() === 0 ? "domingo" : "sabado");
    }
    setPublicMeetingForm({
      ...draft,
      outgoing_date: outgoingDate,
      outgoing_time: resolved?.time ?? "",
      outgoing_congregation: resolved?.destinationCongregation ?? "",
      outgoing_address: resolved?.destinationAddress ?? "",
    });
  }, [
    selectedPublicMeeting?.id,
    selectedPublicMeeting?.updated_at,
    state?.publicTalkThemes,
    state?.publicMeetings,
    state?.publicMeetingMonthDefaults,
    state?.weeks,
    outgoingDateChoice?.meetingId,
    outgoingDateChoice?.date,
    outgoingMonth,
  ]);

  useEffect(() => {
    if (!state) return;
    setMechanicalDrafts(
      Object.fromEntries(
        state.mechanicalAssignments.map((assignment) => [
          assignment.id,
          createMechanicalDraft(assignment),
        ]),
      ),
    );
  }, [state]);

  useEffect(() => {
    if (!state) return;
    setFieldMinistryDrafts(
      Object.fromEntries(
        state.fieldMinistryAssignments.map((assignment) => [
          assignment.id,
          createFieldMinistryDraft(assignment),
        ]),
      ),
    );
  }, [state]);

  useEffect(() => {
    if (!state) return;
    setAccountAuditDrafts(
      Object.fromEntries(
        state.accountAudits.map((audit) => [
          audit.id,
          {
            auditor_member_id: audit.auditor_member_id ?? "",
            completed_date: audit.completed_date ?? "",
            notes: audit.notes ?? "",
          },
        ]),
      ),
    );
  }, [state]);

  const creatingPassword = passwordSetupRequired || firstAccessMode;

  if (!state || !selectedWeek) {
    return (
      <main className="loading-screen">
        <div className="loading-card access-card">
          <img alt="" className="app-mark" src="/demo-icon.svg" />
          <h1>{APP_NAME}</h1>
          <p>{notice || "Carregando cadastros, permissões e escalas..."}</p>
          <form className="login-form" onSubmit={submitLogin}>
            <label>
              <span>E-mail da conta fictícia</span>
              <input
                autoComplete="username"
                disabled={busy}
                inputMode="email"
                onChange={(event) => setLoginForm({ ...loginForm, identifier: event.target.value })}
                placeholder="admin@example.invalid"
                value={loginForm.identifier}
              />
            </label>
            <label>
              <span>{creatingPassword ? "Código de acesso" : "Senha"}</span>
              <input
                autoComplete={creatingPassword ? "one-time-code" : "current-password"}
                disabled={busy}
                onChange={(event) => setLoginForm({ ...loginForm, secret: event.target.value })}
                placeholder={creatingPassword ? "ABCD-1234" : "Sua senha"}
                type={creatingPassword ? "text" : "password"}
                value={loginForm.secret}
              />
            </label>
            {creatingPassword ? (
              <label>
                <span>Crie sua senha</span>
                <input
                  autoComplete="new-password"
                  disabled={busy}
                  minLength={6}
                  onChange={(event) => setLoginForm({ ...loginForm, newPassword: event.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  type="password"
                  value={loginForm.newPassword}
                />
              </label>
            ) : null}
            <button className="primary-button" disabled={busy} type="submit">
              {creatingPassword ? "Criar senha e entrar" : "Entrar"}
            </button>
          </form>
          <small>Use admin@example.invalid e a senha DemoAcademica!2026. As contas são fictícias.</small>

        </div>
      </main>
    );
  }

  const readyState = state;
  const readyWeek = selectedWeek;
  const isAdmin = readyState.user.role === "admin";
  const userModules = readyState.user.editableModules ?? [];
  const currentMember = memberById.get(readyState.user.id) ?? null;
  const publisherName = currentMember?.name ?? readyState.user.displayName;
  const publisherFirstName = publisherName.trim().split(/\s+/)[0] || publisherName;
  const isBoardManager = normalizeSearchText(publisherName) === normalizeSearchText(BOARD_MANAGER_NAME);
  const isAccountsManager = normalizeSearchText(publisherName) === normalizeSearchText(ACCOUNTS_MANAGER_NAME);
  const isPublicOutgoingManager =
    isAdmin ||
    ["Participante 009", "Participante 010", "Participante 011"].some(
      (name) => normalizeSearchText(name) === normalizeSearchText(publisherName),
    );
  const canSeeAccountsPanel = isAdmin || currentMember?.congregation_status === "anciao" || isAccountsManager;
  const canManageAccounts = isAdmin || isAccountsManager;
  const canUseTimeControl =
    isAdmin ||
    TIME_CONTROL_OPERATOR_NAMES.some((name) => normalizeSearchText(name) === normalizeSearchText(publisherName));
  const isDemoTimeOperator = normalizeSearchText(publisherName) === normalizeSearchText("Participante 005");
  // Edição por módulo: admin edita tudo; demais dependem de editableModules.
  const canEditModule = (nav: string) => {
    if (nav === TIME_CONTROL_NAV) return canUseTimeControl;
    if (nav === ACCOUNTS_NAV) return canManageAccounts;
    const moduleKey = NAV_TO_MODULE[nav];
    if (!moduleKey) return isAdmin; // abas de gestão: só admin
    return isAdmin || userModules.includes(moduleKey);
  };
  // Admin vê todas as abas; demais veem programação em leitura e só veem Pastoreio quando o módulo foi liberado.
  const visibleNavItems = isAdmin
    ? navItems
    : isDemoTimeOperator
      ? ["Resumo", TIME_CONTROL_NAV]
      : [...publisherNavItems, ...(isPublicOutgoingManager ? ["Eventos"] : [])].filter((item) => {
          if (item === PASTORAL_NAV) return userModules.includes("pastoreio");
          if (item === TIME_CONTROL_NAV) return canUseTimeControl;
          if (item === ACCOUNTS_NAV) return canSeeAccountsPanel;
          return true;
        });
  const currentNav = visibleNavItems.includes(activeNav) ? activeNav : "Resumo";
  // Compatibilidade: canEdit reflete a permissão do módulo da aba atual.
  const canEdit = canEditModule(currentNav);
  const eventForm = !isAdmin && isPublicOutgoingManager ? { ...specialEventForm, type: "discurso_especial" as const } : specialEventForm;
  const canEditSpecialEvent = isAdmin || (isPublicOutgoingManager && eventForm.type === "discurso_especial");
  const canEditOutgoingSpeakerData = isPublicOutgoingManager;
  const canEditOurSpeakerThemes = (member: Member | null) =>
    Boolean(member) && (canEditOutgoingSpeakerData || member?.id === currentMember?.id);
  const pageHeading =
    currentNav === PUBLIC_MEETING_NAV
      ? "Reunião do fim de semana"
      : currentNav === DESIGNACAO_NAV
        ? readyState.congregation.meeting_title
        : currentNav === MECHANICAL_NAV
          ? "Designações mecânicas"
          : currentNav === FIELD_MINISTRY_NAV
            ? "Ministério de campo"
            : currentNav === PASTORAL_NAV
              ? "Pastoreio"
              : currentNav === TIME_CONTROL_NAV
                ? "Controle do tempo"
                : currentNav === TIME_RECORDS_NAV
                  ? "Tempos registrados"
                  : currentNav === ATTENDANCE_NAV
                    ? "Assistência das reuniões"
                    : currentNav === ACCOUNTS_NAV
                      ? "Auditoria das contas"
        : currentNav === "Resumo"
          ? "Minhas designações"
          : currentNav === "Folha"
            ? "Folha de designações"
            : currentNav;
  const printableNumber = new Map(printableAssignments.map((assignment, index) => [assignment.id, index + 1]));
  const president = topAssignments.find((assignment) => assignment.role_key === "presidente");
  const openingPrayer = topAssignments.find((assignment) => assignment.role_key === "oracao");
  const finalPrayer = bottomAssignments.find((assignment) => assignment.role_key === "oracao");
  const treasures = printableAssignments.filter(
    (assignment) => assignment.section === "TESOUROS DA PALAVRA DE DEUS",
  );
  const ministry = printableAssignments.filter(
    (assignment) => assignment.section === "FAÇA SEU MELHOR NO MINISTÉRIO",
  );
  const life = printableAssignments.filter(
    (assignment) => assignment.section === "NOSSA VIDA CRISTÃ",
  );
  const ebc = life.find((assignment) => assignment.role_key === "estudo_biblico");
  const lifeRows = life.filter((assignment) => assignment.id !== ebc?.id);
  const circuitVisitEvent =
    selectedWeekSpecialEvents.find((event) => event.type === "visita_superintendente") ?? null;
  const lifeSong = lifeSongsByDate[readyWeek.meeting_date] || readyWeek.closing_song;
  const finalLifeSong = circuitVisitEvent?.midweek_service_talk_song || readyWeek.closing_song;
  const selectedS89Assignment =
    s89Assignments.find((assignment) => assignment.id === selectedS89AssignmentId) ??
    s89Assignments[0] ??
    null;
  const selectedS89Member = selectedS89Assignment?.assignee_member_id
    ? memberById.get(selectedS89Assignment.assignee_member_id) ?? null
    : null;
  const selectedS89Assistant = selectedS89Assignment?.assistant_member_id
    ? memberById.get(selectedS89Assignment.assistant_member_id) ?? null
    : null;
  const selectedS89Number = selectedS89Assignment
    ? printableNumber.get(selectedS89Assignment.id) ?? selectedS89Assignment.sequence
    : 0;
  const selectedS89Data =
    selectedS89Assignment && selectedS89Member
      ? buildS89Data(
          selectedS89Member,
          selectedS89Assistant,
          selectedWeek,
          selectedS89Assignment,
          selectedS89Number,
        )
      : null;
  const s89PreviewSrc = selectedS89Data ? svgToDataUrl(createS89Svg(selectedS89Data)) : "";
  const selectedPublicCircuitVisitEvent =
    selectedPublicMeeting
      ? readyState.specialEvents.find(
          (event) =>
            event.type === "visita_superintendente" &&
            event.start_date <= selectedPublicMeeting.meeting_date &&
            selectedPublicMeeting.meeting_date <= event.end_date,
        ) ?? circuitVisitEvent
      : circuitVisitEvent;
  const selectedWatchtowerStudy = publicMeetingForm.watchtower_study_id
    ? readyState.watchtowerStudies.find((study) => study.id === publicMeetingForm.watchtower_study_id) ?? null
    : null;
  const publicTalkThemeHistory = readyState.publicMeetings
    .filter((meeting) => meeting.public_talk_theme_id)
    .map((meeting) => ({
      id: meeting.id,
      public_talk_theme_id: meeting.public_talk_theme_id,
      date: meeting.meeting_date,
      speaker: meeting.public_talk_speaker ?? "",
      congregation: meeting.public_talk_speaker_congregation ?? "",
      sourceLabel: "",
    }))
    .concat(
      readyState.publicTalkHistory.map((history) => ({
        id: history.id,
        public_talk_theme_id: history.public_talk_theme_id,
        date: history.talk_date,
        speaker: "",
        congregation: "",
        sourceLabel: history.source_label,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const publicMeetingsForPrint = selectedPublicMeeting
    ? readyState.publicMeetings
        .filter((meeting) => sameMonth(meeting.meeting_date, selectedPublicMeeting.meeting_date))
        .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))
    : [];
  const publicMeetingMonthOptions = monthOptionsFromDates(readyState.publicMeetings.flatMap((meeting) => [meeting.meeting_date, addDays(meeting.meeting_date, 1), meeting.outgoing_date || meeting.meeting_date]));
  const selectedPublicMeetingMonth = selectedPublicMeeting?.meeting_date.slice(0, 7) ?? "";
  const outgoingDateOptions = readyState.publicMeetings.flatMap((meeting) => {
    const week = weekById.get(meeting.week_id);
    const saturday = week ? addDays(week.week_start, 5) : meeting.meeting_date;
    const sunday = week ? addDays(week.week_start, 6) : addDays(meeting.meeting_date, 1);
    return [
      { meeting, date: saturday, day: "sabado" as const, label: formatNumericDate(saturday) },
      { meeting, date: sunday, day: "domingo" as const, label: formatNumericDate(sunday) },
    ];
  });
  const outgoingDateOptionsForDay = outgoingOptionsForMonth(outgoingDateOptions, outgoingMonth || selectedPublicMeeting?.outgoing_date?.slice(0, 7) || selectedPublicMeetingMonth, outgoingWeekendDay);
  const draftPublicTalkTheme =
    resolvePublicTalkThemeInput(publicMeetingForm.public_talk_theme_query, readyState.publicTalkThemes) ??
    readyState.publicTalkThemes.find((theme) => theme.id === publicMeetingForm.public_talk_theme_id) ??
    null;
  const recentPublicTalkWarning =
    selectedPublicMeeting && !selectedPublicMeeting.special_talk_title && draftPublicTalkTheme
      ? findRecentPublicTalkUse(draftPublicTalkTheme.id, selectedPublicMeeting, readyState.publicMeetings, readyState.publicTalkHistory)
      : null;

  // Ferramenta "Consultar temas do orador": para cada tema informado, calcula a última vez
  // que foi apresentado (reuniões do app + histórico importado) e ordena o mais antigo/nunca no topo.
  const referenceDate = selectedPublicMeeting?.meeting_date ?? toLocalIsoDate(new Date());
  const speakerThemeAnalysis = speakerThemeIds
    .map((themeId) => {
      const theme = readyState.publicTalkThemes.find((item) => item.id === themeId) ?? null;
      const targetMeeting = readyState.publicMeetings.find((meeting) => meeting.id === speakerThemeAssignments[themeId]?.meetingId) ?? selectedPublicMeeting;
      const themeReferenceDate = targetMeeting?.meeting_date ?? referenceDate;
      const lastDate = findRecentPublicTalkUse(themeId,
        { id: targetMeeting?.id ?? "", meeting_date: themeReferenceDate },
        readyState.publicMeetings, readyState.publicTalkHistory)?.meeting_date ?? null;
      const refMs = Date.parse(`${themeReferenceDate}T12:00:00`);
      const lastMs = lastDate ? Date.parse(`${lastDate}T12:00:00`) : null;
      const meetingsAgo = lastMs != null ? Math.max(1, Math.round((refMs - lastMs) / (7 * 24 * 60 * 60 * 1000))) : null;
      return { themeId, theme, lastDate, meetingsAgo, referenceDate: themeReferenceDate };
    })
    .sort((a, b) => {
      // Nunca apresentado primeiro; depois o que faz mais tempo (meetingsAgo maior) no topo.
      if (a.meetingsAgo == null && b.meetingsAgo == null) return 0;
      if (a.meetingsAgo == null) return -1;
      if (b.meetingsAgo == null) return 1;
      return b.meetingsAgo - a.meetingsAgo;
    });
  const activePublicMeetingMonth =
    (publicMeetingSubtab === "sent" ? outgoingMonth || selectedPublicMeeting?.outgoing_date?.slice(0, 7) : "") ||
    selectedPublicMeeting?.meeting_date.slice(0, 7) ||
    (publicMeetingMonthOptions.length > 0 ? publicMeetingMonthOptions[0] : readyWeek.meeting_date.slice(0, 7));
  const activeMonthDefault = monthDefaultFor(readyState.publicMeetingMonthDefaults, activePublicMeetingMonth);
  const outgoingListDefault = activeMonthDefault ?? { default_weekday: outgoingWeekendDay } as PublicMeetingMonthDefault;
  const publicMeetingsOfActiveMonth = readyState.publicMeetings
    .filter((meeting) => (publicMeetingSubtab === "sent"
      ? resolveOutgoing(meeting, outgoingListDefault, weekById.get(meeting.week_id)?.week_start ?? null).date
      : meeting.meeting_date).slice(0, 7) === activePublicMeetingMonth)
    .slice()
    .sort((a, b) => (publicMeetingSubtab === "sent"
      ? resolveOutgoing(a, outgoingListDefault, weekById.get(a.week_id)?.week_start ?? null).date.localeCompare(resolveOutgoing(b, outgoingListDefault, weekById.get(b.week_id)?.week_start ?? null).date)
      : a.meeting_date.localeCompare(b.meeting_date)));
  const weekStartById = new Map<string, string>(readyState.weeks.map((week) => [week.id, week.week_start]));
  const ourSpeakerOptions = readyState.members
    .filter((member) => member.active && ["anciao", "servo_ministerial"].includes(member.congregation_status))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const authorizedOutgoingSpeakerOptions = ourSpeakerOptions.filter((member) => member.privileges.includes("discurso_fora"));
  const selectedOurSpeaker = ourSpeakerOptions.find((member) => member.id === selectedOurSpeakerId) ?? null;
  const selectedOurSpeakerTalks = selectedOurSpeaker
    ? (readyState.speakerTalks ?? [])
        .filter((talk) => talk.member_id === selectedOurSpeaker.id)
        .map((talk) => ({
          talk,
          theme: readyState.publicTalkThemes.find((theme) => theme.id === talk.theme_id) ?? null,
        }))
        .sort((a, b) => (a.theme?.number ?? 999) - (b.theme?.number ?? 999))
    : [];
  const selectedOurSpeakerTalkByThemeId = new Map(selectedOurSpeakerTalks.map(({ talk }) => [talk.theme_id, talk.id]));
  const filteredOurSpeakerThemeOptions = filterPublicTalkThemeOptions(readyState.publicTalkThemes, ourSpeakerThemeQuery);
  const filteredSpeakerThemeOptions = filterPublicTalkThemeOptions(readyState.publicTalkThemes, speakerThemeQuery);
  const todayIso = toLocalIsoDate(new Date());
  const timeControlRecordsForWeek = readyState.meetingTimingRecords.filter((record) => record.week_id === readyWeek.id);
  const timeControlRecordByPartKey = new Map(timeControlRecordsForWeek.map((record) => [record.part_key, record]));
  const timeControlParts: TimeControlPart[] = printableAssignments.map((assignment) => ({
    partKey: `assignment-${assignment.id}`,
    assignmentId: assignment.id,
    roleKey: assignment.role_key,
    section: assignment.section,
    title: assignmentDisplayTitle(assignment),
    plannedSeconds: assignment.duration_min === null ? null : assignment.duration_min * 60,
    assignee: memberName(assignment.assignee_member_id),
    assistant: assignmentUsesAssistant(assignment) ? memberName(assignment.assistant_member_id) : "",
  }));
  const meetingSessionRecord = timeControlRecordByPartKey.get(TIME_CONTROL_MEETING_TOTAL_KEY);
  const meetingSessionDraft = meetingSessionDrafts[readyWeek.id] ?? createMeetingSessionDraft(meetingSessionRecord);
  const meetingSessionSeconds = meetingSessionElapsedSeconds(meetingSessionDraft, timingNow);
  const meetingSessionStarted = Boolean(meetingSessionDraft.startedAt);
  const meetingSessionEnded = Boolean(meetingSessionDraft.endedAt);
  const meetingSessionRunning = Boolean(meetingSessionDraft.runningStartedAt);
  const timedPartsCount = timeControlParts.filter((part) => timeControlElapsedSeconds(timeControlDraftForPart(part.partKey), timingNow) > 0).length;
  const totalRecordedSeconds = timeControlParts.reduce(
    (sum, part) => sum + timeControlElapsedSeconds(timeControlDraftForPart(part.partKey), timingNow),
    0,
  );
  const totalMeetingExtraSeconds = meetingSessionSeconds > 0 ? Math.max(0, meetingSessionSeconds - totalRecordedSeconds) : 0;
  const meetingExtraSegments = buildMeetingExtraSegments();
  const recordedMeetingTotalSeconds =
    meetingSessionRecord?.actual_seconds ?? secondsBetweenIso(meetingSessionRecord?.started_at, meetingSessionRecord?.ended_at);
  const recordedPartKeys = new Set(timeControlParts.map((part) => part.partKey));
  const timeControlPartRecordsForWeek = timeControlParts
    .map((part, index) => ({ part, record: timeControlRecordByPartKey.get(part.partKey) ?? null, index }));
  const timeControlExtraRecordsForWeek = timeControlRecordsForWeek
    .filter((record) => record.part_key.startsWith(TIME_CONTROL_EXTRA_PREFIX))
    .sort((a, b) => (a.started_at ?? "").localeCompare(b.started_at ?? ""));
  const unmatchedTimeControlRecordsForWeek = timeControlRecordsForWeek
    .filter(
      (record) =>
        record.part_key !== TIME_CONTROL_MEETING_TOTAL_KEY &&
        !record.part_key.startsWith(TIME_CONTROL_EXTRA_PREFIX) &&
        !recordedPartKeys.has(record.part_key),
    )
    .sort((a, b) => (a.started_at ?? "").localeCompare(b.started_at ?? ""));
  const recordedPartsSeconds = timeControlRecordsForWeek
    .filter((record) => record.part_key !== TIME_CONTROL_MEETING_TOTAL_KEY && !record.part_key.startsWith(TIME_CONTROL_EXTRA_PREFIX))
    .reduce((sum, record) => sum + (record.actual_seconds ?? secondsBetweenIso(record.started_at, record.ended_at)), 0);
  const recordedExtrasSeconds = timeControlExtraRecordsForWeek.reduce(
    (sum, record) => sum + (record.actual_seconds ?? secondsBetweenIso(record.started_at, record.ended_at)),
    0,
  );
  const fieldMinistryAssignmentsInRange = readyState.fieldMinistryAssignments.filter(isFieldMinistryAllowedAssignment);
  const nextMeetingFocus = nextMeetingFocusFromState(state);
  const nextMeetingWeek = weekById.get(nextMeetingFocus.weekId) ?? selectedWeek;
  const nextMeetingCircuitVisit = circuitVisitForDate(nextMeetingFocus.date);
  const nextMeetingPublicMeeting =
    readyState.publicMeetings.find((meeting) => meeting.meeting_date === nextMeetingFocus.date) ?? null;
  const nextMeetingWatchtowerStudy =
    nextMeetingPublicMeeting?.watchtower_study_id
      ? readyState.watchtowerStudies.find((study) => study.id === nextMeetingPublicMeeting.watchtower_study_id) ?? null
      : null;
  const nextMeetingMidweekAssignments =
    nextMeetingFocus.nav === DESIGNACAO_NAV && nextMeetingWeek
      ? readyState.assignments
          .filter((assignment) => assignment.week_id === nextMeetingWeek.id)
          .sort((a, b) => a.sequence - b.sequence)
      : [];
  const nextMeetingMechanicalAssignments = readyState.mechanicalAssignments
    .filter((assignment) => assignment.assignment_date === nextMeetingFocus.date)
    .sort((a, b) => a.meeting_kind.localeCompare(b.meeting_kind));
  const nextMeetingUserAlerts = [
    ...nextMeetingMidweekAssignments
      .filter((assignment) => memberWasInAssignment(assignment, readyState.user.id))
      .map((assignment) => `Vida e Ministério: ${nextMeetingAssignmentTitle(assignment)}`),
    ...(nextMeetingPublicMeeting ? publicMeetingRolesForUser(nextMeetingPublicMeeting, publisherName).map((role) => `Reunião Pública: ${role}`) : []),
    ...nextMeetingMechanicalAssignments
      .flatMap((assignment) => mechanicalRolesForUser(assignment, readyState.user.id).map((role) => `Mecânicas: ${role}`)),
  ];
  const personalAlerts = (() => {
    const alerts: Array<{ id: string; tone: "info" | "warning"; title: string; message: string; nav?: string }> = [];
    if (nextMeetingFocus.date === todayIso && nextMeetingUserAlerts.length > 0) {
      alerts.push({
        id: "today-assignments",
        tone: "warning",
        title: `Você tem ${nextMeetingUserAlerts.length} designação${nextMeetingUserAlerts.length === 1 ? "" : "ões"} hoje`,
        message: nextMeetingUserAlerts.join(" | "),
      });
    }

    // #2 — Aviso de que vai dirigir o campo: apenas UM dia antes.
    const tomorrowIso = addDays(todayIso, 1);
    fieldMinistryAssignmentsInRange
      .filter(
        (assignment) =>
          assignment.activity_date === tomorrowIso && assignment.conductor_member_id === readyState.user.id,
      )
      .forEach((assignment) => {
        alerts.push({
          id: `field-tomorrow-${assignment.id}`,
          tone: "info",
          title: "Amanhã você dirige o campo",
          message: `Saída de campo em ${formatNumericDate(assignment.activity_date)} às ${displayTime(assignment.start_time)}${assignment.location ? ` — ${assignment.location}` : ""}.`,
        });
      });

    if (isBoardManager) {
      const cutoffIso = new Date(Date.now() - BOARD_ALERT_WINDOW_DAYS * 86_400_000).toISOString();
      // Vida e Ministério: agrupa por semana com designação recente.
      const midweekWeeks = new Map<string, string>();
      readyState.assignments.forEach((assignment) => {
        if ((assignment.updated_at ?? "") >= cutoffIso) {
          const week = readyState.weeks.find((item) => item.id === assignment.week_id);
          if (week) midweekWeeks.set(week.id, week.meeting_date);
        }
      });
      midweekWeeks.forEach((meetingDate, weekId) => {
        alerts.push({
          id: `board-midweek-${weekId}`,
          tone: "warning",
          title: "Folha da Vida e Ministério pronta",
          message: `A folha da reunião Vida e Ministério de ${formatNumericDate(meetingDate)} está pronta para impressão. Imprima e coloque no quadro.`,
          nav: "Folha",
        });
      });
      // Reunião Pública.
      const publicRecent = readyState.publicMeetings.some((meeting) => (meeting.updated_at ?? "") >= cutoffIso);
      if (publicRecent) {
        alerts.push({
          id: "board-public",
          tone: "warning",
          title: "Reunião Pública atualizada",
          message: "A programação da Reunião Pública foi atualizada. Imprima e coloque no quadro.",
          nav: PUBLIC_MEETING_NAV,
        });
      }
      // Ministério de Campo.
      const fieldRecent = readyState.fieldMinistryAssignments.some((assignment) => (assignment.updated_at ?? "") >= cutoffIso);
      if (fieldRecent) {
        alerts.push({
          id: "board-field",
          tone: "warning",
          title: "Ministério de Campo atualizado",
          message: "A programação do Ministério de Campo foi atualizada. Imprima e coloque no quadro.",
          nav: FIELD_MINISTRY_NAV,
        });
      }
      // Mecânicas.
      const mechanicalRecent = readyState.mechanicalAssignments.some((assignment) => (assignment.updated_at ?? "") >= cutoffIso);
      if (mechanicalRecent) {
        alerts.push({
          id: "board-mechanical",
          tone: "warning",
          title: "Designações mecânicas atualizadas",
          message: "As designações mecânicas foram atualizadas. Imprima e coloque no quadro.",
          nav: MECHANICAL_NAV,
        });
      }
    }

    if (isAccountsManager) {
      const today = new Date(`${todayIso}T12:00:00`);
      const dayOfMonth = today.getDate();
      const monthPrefix = todayIso.slice(0, 7);
      const monthMeetings = readyState.weeks
        .map((week) => week.meeting_date)
        .filter((date) => date.slice(0, 7) === monthPrefix)
        .sort();
      const secondMeetingDate = monthMeetings[1] ?? null;
      const inSecondWeekWindow = dayOfMonth >= 8 && dayOfMonth <= 14;
      const beforeSecondMeeting = secondMeetingDate ? todayIso <= secondMeetingDate : inSecondWeekWindow;
      if (inSecondWeekWindow && beforeSecondMeeting) {
        alerts.push({
          id: "s30-reminder",
          tone: "warning",
          title: "Lembrete: S-30",
          message: "Finalize o S-30 para ser anunciado à congregação, antes da reunião de meio de semana desta semana.",
        });
      }

      readyState.accountAudits
        .filter((audit) => !audit.completed_date && (audit.due_date.slice(0, 7) === monthPrefix || audit.due_date < todayIso))
        .slice(0, 3)
        .forEach((audit) => {
          alerts.push({
            id: `audit-manager-${audit.id}`,
            tone: audit.due_date < todayIso ? "warning" : "info",
            title: `Auditoria das contas: ${audit.period_label}${audit.due_date < todayIso ? " (ATRASADA)" : ""}`,
            message: `Está fechando ${audit.months_label}. Prepare os documentos e confirme com o coordenador quem será o ancião designado até ${formatNumericDate(audit.due_date)}.`,
            nav: ACCOUNTS_NAV,
          });
        });
    }

    readyState.accountAudits
      .filter((audit) => audit.auditor_member_id === readyState.user.id && !audit.completed_date)
      .forEach((audit) => {
        alerts.push({
          id: `audit-assigned-${audit.id}`,
          tone: "warning",
          title: `Você foi designado para ${audit.period_label}`,
          message: `Auditoria de ${audit.months_label}. Prazo: ${formatNumericDate(audit.due_date)}. Quando concluir, registre a data em Auditoria das contas.`,
          nav: ACCOUNTS_NAV,
        });
      });

    // #4 — Auditoria ATRASADA visível a todos os anciãos (exceto o Participante 006, que já tem o aviso de gestor).
    const isElder = currentMember?.congregation_status === "anciao";
    if (isElder && !isAccountsManager) {
      readyState.accountAudits
        .filter((audit) => !audit.completed_date && audit.due_date < todayIso && audit.auditor_member_id !== readyState.user.id)
        .forEach((audit) => {
          alerts.push({
            id: `audit-late-elder-${audit.id}`,
            tone: "warning",
            title: `Auditoria atrasada: ${audit.period_label}`,
            message: `A auditoria de ${audit.months_label} está atrasada. Por favor, verificar com ${ACCOUNTS_MANAGER_NAME}.`,
            nav: ACCOUNTS_NAV,
          });
        });
    }

    // #7 — Tempo registrado na demonstração: avisa os conselheiros (participantes fictícios).
    const isTimeReportRecipient = TIME_REPORT_RECIPIENT_NAMES.some(
      (name) => normalizeSearchText(name) === normalizeSearchText(publisherName),
    );
    if (isTimeReportRecipient) {
      const enzoMember = readyState.members.find(
        (member) => normalizeSearchText(member.name) === normalizeSearchText(TIME_REPORT_OPERATOR_NAME),
      );
      const timeCutoffIso = new Date(Date.now() - BOARD_ALERT_WINDOW_DAYS * 86_400_000).toISOString();
      const reportedWeeks = new Map<string, string>();
      readyState.meetingTimingRecords.forEach((record) => {
        const week = readyState.weeks.find((item) => item.id === record.week_id);
        if (
          record.reported_at &&
          record.reported_at >= timeCutoffIso &&
          enzoMember &&
          record.recorded_by_member_id === enzoMember.id &&
          week &&
          week.meeting_date <= todayIso
        ) {
          reportedWeeks.set(record.week_id, week.meeting_date);
        }
      });
      reportedWeeks.forEach((meetingDate, weekId) => {
        alerts.push({
          id: `time-generated-${weekId}`,
          tone: "info",
          title: "Tempo da reunião gerado",
          message: `Tempo da reunião de ${formatNumericDate(meetingDate)} gerado. Verifique, por favor.`,
          nav: TIME_CONTROL_NAV,
        });
      });
    }

    // Tempo excedido: apenas a última reunião registrada, por sete dias.
    const overtimeCutoffDate = addDays(todayIso, -OVERTIME_ALERT_WINDOW_DAYS);
    const timingWeekDates = readyState.meetingTimingRecords
      .filter((record) => record.actual_seconds != null && record.actual_seconds > 0)
      .map((record) => readyState.weeks.find((week) => week.id === record.week_id)?.meeting_date ?? "")
      .filter((date) => date > overtimeCutoffDate && date <= todayIso);
    const latestTimingDate = timingWeekDates.sort().at(-1) ?? "";
    const latestTimingWeekIds = new Set(
      readyState.weeks.filter((week) => week.meeting_date === latestTimingDate).map((week) => week.id),
    );
    readyState.meetingTimingRecords.forEach((record) => {
      if (
        !latestTimingWeekIds.has(record.week_id) ||
        record.planned_seconds == null ||
        record.actual_seconds == null ||
        record.actual_seconds <= record.planned_seconds
      ) {
        return;
      }
      const assignment = record.assignment_id
        ? readyState.assignments.find((item) => item.id === record.assignment_id)
        : readyState.assignments.find((item) => `assignment-${item.id}` === record.part_key) ??
          readyState.assignments.find(
            (item) =>
              item.week_id === record.week_id &&
              normalizeSearchText(assignmentDisplayTitle(item)) === normalizeSearchText(record.part_title),
          );
      const isOwnPart = assignment
        ? memberWasInAssignment(assignment, readyState.user.id)
        : false;
      if (!isOwnPart) return;
      const week = readyState.weeks.find((item) => item.id === record.week_id);
      const overBy = Math.round((record.actual_seconds - record.planned_seconds) / 60);
      const overLabel = overBy >= 1 ? `${overBy} min` : `${record.actual_seconds - record.planned_seconds}s`;
      alerts.push({
        id: `time-over-${record.id}${isOwnPart ? "-self" : "-counselor"}`,
        tone: "warning",
        title: isOwnPart ? "Você excedeu o tempo" : "Parte excedeu o tempo",
        message: isOwnPart
          ? `Atenção: você excedeu a designação "${record.part_title}" na reunião de ${week ? formatNumericDate(week.meeting_date) : ""} em ${overLabel}.`
          : `A parte "${record.part_title}" excedeu o tempo em ${overLabel} na reunião de ${week ? formatNumericDate(week.meeting_date) : ""}.`,
        nav: isTimeReportRecipient ? TIME_CONTROL_NAV : undefined,
      });
    });

    return alerts;
  })();
  const nextMidweekAssignments = readyState.assignments
    .map((assignment) => ({ assignment, week: weekById.get(assignment.week_id) ?? null }))
    .filter(({ assignment, week }) => Boolean(week) && week!.meeting_date >= todayIso && memberWasInAssignment(assignment, readyState.user.id))
    .sort((a, b) => `${a.week!.meeting_date}-${a.assignment.sequence}`.localeCompare(`${b.week!.meeting_date}-${b.assignment.sequence}`))
    .slice(0, 6);
  const nextPublicMeetingAssignments = readyState.publicMeetings
    .filter((meeting) => publicMeetingSummaryDate(meeting, publisherName) >= todayIso && publicMeetingRolesForUser(meeting, publisherName).length > 0)
    .sort((a, b) => publicMeetingSummaryDate(a, publisherName).localeCompare(publicMeetingSummaryDate(b, publisherName)))
    .slice(0, 6);
  const nextMechanicalAssignments = readyState.mechanicalAssignments
    .filter((assignment) => assignment.assignment_date >= todayIso && mechanicalRolesForUser(assignment, readyState.user.id).length > 0)
    .sort((a, b) => a.assignment_date.localeCompare(b.assignment_date))
    .slice(0, 6);
  const nextAttendanceAssignment =
    readyState.mechanicalAssignments
      .filter((assignment) => assignment.assignment_date >= todayIso)
      .sort((a, b) => `${a.assignment_date}-${a.meeting_kind}`.localeCompare(`${b.assignment_date}-${b.meeting_kind}`))[0] ?? null;
  const nextAttendanceDraft = nextAttendanceAssignment
    ? mechanicalDrafts[nextAttendanceAssignment.id] ?? createMechanicalDraft(nextAttendanceAssignment)
    : null;
  const canReportNextAttendance = nextAttendanceAssignment ? canReportAttendanceForAssignment(nextAttendanceAssignment) : false;
  const attendanceAssignments = readyState.mechanicalAssignments
    .slice()
    .sort((a, b) => `${b.assignment_date}-${b.meeting_kind}`.localeCompare(`${a.assignment_date}-${a.meeting_kind}`));
  const attendanceRecords = attendanceAssignments.filter(
    (assignment) =>
      assignment.attendance_reported_at ||
      assignment.attendance_total !== null ||
      assignment.attendance_in_person !== null ||
      assignment.attendance_zoom !== null,
  );
  const attendanceMonthOptions = monthOptionsFromDates(attendanceRecords.map((assignment) => assignment.assignment_date));
  const activeAttendanceMonth = chooseMonthKey(
    selectedAttendanceMonth,
    attendanceMonthOptions,
    attendanceRecords[0]?.assignment_date.slice(0, 7) ?? todayIso.slice(0, 7),
  );
  const attendanceRecordsForMonth = attendanceRecords
    .filter((assignment) => assignment.assignment_date.startsWith(activeAttendanceMonth))
    .slice()
    .sort((a, b) => `${a.assignment_date}-${a.meeting_kind}`.localeCompare(`${b.assignment_date}-${b.meeting_kind}`));
  const attendanceRecordTotal = (assignment: MechanicalAssignment) =>
    assignment.attendance_total ?? (assignment.attendance_in_person ?? 0) + (assignment.attendance_zoom ?? 0);
  const attendanceAverage = (records: MechanicalAssignment[]) => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((sum, assignment) => sum + attendanceRecordTotal(assignment), 0) / records.length);
  };
  const attendanceAverages = {
    geral: attendanceAverage(attendanceRecordsForMonth),
    meioSemana: attendanceAverage(attendanceRecordsForMonth.filter((assignment) => assignment.meeting_kind === "meio_semana")),
    fimSemana: attendanceAverage(attendanceRecordsForMonth.filter((assignment) => assignment.meeting_kind === "fim_de_semana")),
  };
  const selectedAttendanceAssignment =
    attendanceAssignments.find((assignment) => assignment.id === selectedAttendanceAssignmentId) ??
    nextAttendanceAssignment ??
    attendanceAssignments[0] ??
    null;
  const selectedAttendanceDraft = selectedAttendanceAssignment
    ? mechanicalDrafts[selectedAttendanceAssignment.id] ?? createMechanicalDraft(selectedAttendanceAssignment)
    : null;
  const canReportSelectedAttendance = selectedAttendanceAssignment ? canReportAttendanceForAssignment(selectedAttendanceAssignment) : false;
  const nextFieldMinistryAssignments = fieldMinistryAssignmentsInRange
    .filter((assignment) => assignment.activity_date >= todayIso && assignment.conductor_member_id === readyState.user.id)
    .sort((a, b) => `${a.activity_date}-${a.start_time}`.localeCompare(`${b.activity_date}-${b.start_time}`))
    .slice(0, 6);
  const nextPersonalAssignmentCount =
    nextMidweekAssignments.length +
    nextPublicMeetingAssignments.length +
    nextMechanicalAssignments.length +
    nextFieldMinistryAssignments.length;
  const mechanicalMonthOptions = monthOptionsFromDates(readyState.mechanicalAssignments.map((assignment) => assignment.assignment_date));
  const fieldMinistryMonthOptions = monthOptionsFromDates([
    ...FIELD_MINISTRY_BASE_MONTH_OPTIONS,
    ...fieldMinistryAssignmentsInRange.map((assignment) => assignment.activity_date),
  ]);
  const activeMechanicalMonth = chooseMonthKey(selectedMechanicalMonth, mechanicalMonthOptions, readyWeek.meeting_date.slice(0, 7));
  const fieldMinistryPreferredMonth =
    readyWeek.meeting_date.slice(0, 7) > FIELD_MINISTRY_MAX_MONTH
      ? FIELD_MINISTRY_MAX_MONTH
      : readyWeek.meeting_date.slice(0, 7);
  const activeFieldMinistryMonth = chooseMonthKey(selectedFieldMinistryMonth, fieldMinistryMonthOptions, fieldMinistryPreferredMonth);
  const mechanicalAssignmentsForDisplay = readyState.mechanicalAssignments
    .filter((assignment) => assignment.assignment_date.startsWith(activeMechanicalMonth))
    .sort((a, b) => `${a.assignment_date}-${a.meeting_kind}`.localeCompare(`${b.assignment_date}-${b.meeting_kind}`));
  const mechanicalMonthSummary = buildMechanicalMonthSummary(mechanicalAssignmentsForDisplay, mechanicalDrafts, readyState.members, activeMechanicalMonth);
  const fieldMinistryCalendarDays = buildFieldCalendarDays(activeFieldMinistryMonth);
  const fieldMinistryMonthAllAssignments = fieldMinistryAssignmentsInRange
    .filter((assignment) => assignment.activity_date.startsWith(activeFieldMinistryMonth))
    .sort((a, b) => `${a.activity_date}-${a.arrangement}-${a.field_service_group_id ?? ""}`.localeCompare(`${b.activity_date}-${b.arrangement}-${b.field_service_group_id ?? ""}`));
  const fieldMinistryMonthAssignments = fieldMinistryMonthAllAssignments.filter(isEditableFieldMinistryAssignment);
  const fieldMinistryHolidayAssignments = fieldMinistryMonthAssignments.filter((assignment) =>
    isSaoPauloHoliday(assignment.activity_date),
  );
  const fieldMinistryAssignmentsForDisplay = fieldMinistryMonthAssignments
    .filter((assignment) => {
      if (fieldMinistryDayFilter === "all") return true;
      if (fieldMinistryDayFilter === "feriado") return isSaoPauloHoliday(assignment.activity_date);
      return assignment.weekday === fieldMinistryDayFilter;
    })
    .filter((assignment) => {
      if (fieldMinistryDayFilter !== "dom" || !fieldMinistryGroupFilter) return true;
      return assignment.arrangement === "todos_grupos" || assignment.field_service_group_id === fieldMinistryGroupFilter;
    });
  const fieldMinistryAssignmentsByDate = Array.from(
    fieldMinistryAssignmentsForDisplay.reduce((groups, assignment) => {
      const current = groups.get(assignment.activity_date) ?? [];
      current.push(assignment);
      groups.set(assignment.activity_date, current);
      return groups;
    }, new Map<string, FieldMinistryAssignment[]>()),
  );
  const fieldMinistryVisibleDates = new Set(fieldMinistryAssignmentsByDate.map(([date]) => date));
  const firstSundayAllGroupsAssignment = fieldMinistryMonthAssignments.find(isFirstSundayAllGroupsAssignment) ?? null;
  const fieldMinistryFilterMessage =
    fieldMinistryDayFilter === "feriado" && fieldMinistryHolidayAssignments.length === 0
      ? `Não há feriado de São Paulo/SP em ${monthTitle(activeFieldMinistryMonth)}.`
      : fieldMinistryDayFilter === "dom" && firstSundayAllGroupsAssignment
        ? `Primeiro domingo: saída com todos os grupos em ${formatNumericDate(firstSundayAllGroupsAssignment.activity_date)}; nessa saída ficam disponíveis apenas anciãos.`
        : "";
  const activeFieldMinistryDate =
    selectedFieldMinistryDate && selectedFieldMinistryDate.startsWith(activeFieldMinistryMonth)
      ? selectedFieldMinistryDate
      : fieldMinistryAssignmentsForDisplay[0]?.activity_date ??
        fieldMinistryMonthAssignments[0]?.activity_date ??
        `${activeFieldMinistryMonth}-01`;
  const selectedFieldMinistryAssignments = fieldMinistryAssignmentsForDisplay.filter(
    (assignment) => assignment.activity_date === activeFieldMinistryDate,
  );
  const selectedFieldMinistryAllAssignments = fieldMinistryMonthAllAssignments.filter(
    (assignment) => assignment.activity_date === activeFieldMinistryDate,
  );
  const selectedFieldMinistryFixedSlots = fixedFieldSlotsForDate(activeFieldMinistryDate);
  const mechanicalPrintMonth = activeMechanicalMonth;
  const fieldMinistryPrintMonth = activeFieldMinistryMonth;
  const mechanicalAssignmentsForPrint = readyState.mechanicalAssignments
    .filter((assignment) => assignment.assignment_date.startsWith(mechanicalPrintMonth))
    .sort((a, b) => `${a.assignment_date}-${a.meeting_kind}`.localeCompare(`${b.assignment_date}-${b.meeting_kind}`));
  const fieldMinistryAssignmentsForPrint = fieldMinistryAssignmentsInRange
    .filter((assignment) => assignment.activity_date.startsWith(fieldMinistryPrintMonth))
    .filter(isEditableFieldMinistryAssignment)
    .sort((a, b) => `${a.activity_date}-${a.arrangement}-${a.field_service_group_id ?? ""}`.localeCompare(`${b.activity_date}-${b.arrangement}-${b.field_service_group_id ?? ""}`));
  const fieldMinistryMonthSummary = {
    total: fieldMinistryAssignmentsForDisplay.length,
    pending: fieldMinistryAssignmentsForDisplay.filter((assignment) => !assignment.conductor_member_id && !assignment.guest_conductor_name).length,
    confirmed: fieldMinistryAssignmentsForDisplay.filter((assignment) => assignment.status === "confirmada").length,
    fridays: fieldMinistryAssignmentsForDisplay.filter((assignment) => assignment.weekday === "sex").length,
    saturdays: fieldMinistryAssignmentsForDisplay.filter((assignment) => assignment.weekday === "sab").length,
    sundays: fieldMinistryAssignmentsForDisplay.filter(
      (assignment) => assignment.weekday === "dom" || isSaoPauloHoliday(assignment.activity_date),
    ).length,
    publicCrossings: fieldMinistryAssignmentsForDisplay.filter((assignment) => {
      const member = assignment.conductor_member_id ? memberById.get(assignment.conductor_member_id) : null;
      return member ? publicMeetingConflictsForFieldAssignment(member, assignment).length > 0 : false;
    }).length,
  };
  const pendingFieldMinistryAssignments = fieldMinistryAssignmentsForDisplay.filter(
    (assignment) => !assignment.conductor_member_id && !assignment.guest_conductor_name,
  );
  const fieldMinistryPendingMessage =
    pendingFieldMinistryAssignments.length > 0
      ? pendingFieldMinistryAssignments
          .slice(0, 8)
          .map((assignment) => `${formatShortNumericDate(assignment.activity_date)} - Sem designação (${fieldArrangementLabel(assignment.arrangement)}${assignment.field_service_group_id ? `, ${groupName(assignment.field_service_group_id)}` : ""})`)
          .join(" | ")
      : "";
  const activeCareGroupId = selectedCareGroupId || readyState.fieldServiceGroups[0]?.id || "";
  const careGroupMembers = readyState.members
    .filter((member) => member.active && member.field_service_group_id === activeCareGroupId)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  const careAttendanceCounts = careGroupMembers.reduce(
    (counts, member) => {
      const savedStatus = attendanceForMember(member.id)?.status;
      const status = attendanceDrafts[member.id] ?? savedStatus;
      if (status === "presente") counts.inPerson += 1;
      if (status === "zoom") counts.zoom += 1;
      if (status === "ausente") counts.absent += 1;
      if (status) counts.recorded += 1;
      return counts;
    },
    { inPerson: 0, zoom: 0, absent: 0, recorded: 0 },
  );

  function memberName(id: string | null) {
    return id ? memberById.get(id)?.name ?? "Não encontrado" : "";
  }

  function assignmentDisplayTitle(assignment: Assignment) {
    if (assignment.role_key === "estudo_biblico" && circuitVisitEvent) {
      return circuitVisitEvent.midweek_service_talk_title || "Discurso de serviço do superintendente de circuito";
    }
    return assignment.title;
  }

  function nextMeetingAssignmentTitle(assignment: Assignment) {
    if (assignment.role_key === "estudo_biblico" && nextMeetingCircuitVisit) {
      return nextMeetingCircuitVisit.midweek_service_talk_title || "Discurso de serviço do superintendente de circuito";
    }
    return assignment.title;
  }

  function ebcAssigneeName(assignment: Assignment | undefined) {
    if (circuitVisitEvent?.circuit_overseer_name) return circuitVisitEvent.circuit_overseer_name;
    return memberName(assignment?.assignee_member_id ?? null);
  }

  function roleLabel(role: AppRole) {
    return roleOptions.find((item) => item.value === role)?.label ?? role;
  }

  function congregationStatusLabel(status: CongregationStatus) {
    return congregationStatusOptions.find((item) => item.value === status)?.label ?? status;
  }

  function pioneerRoleLabel(role: PioneerRole) {
    return pioneerOptions.find((item) => item.value === role)?.label ?? role;
  }

  function groupName(id: string | null) {
    return id ? readyState.fieldServiceGroups.find((group) => group.id === id)?.name ?? "Grupo não encontrado" : "Sem grupo";
  }

  function inviteAssociatedMember(invite: Invitation) {
    if (invite.member_id) return memberById.get(invite.member_id) ?? null;
    return memberByEmail.get(invite.email.toLowerCase()) ?? null;
  }

  function accessRecipientLabel(access: NonNullable<ActionResponse["generatedAccessCode"]>) {
    return access.memberName ? `${access.memberName} (${access.email})` : access.email;
  }

  function fieldDaysLabel(days: FieldDay[]) {
    if (days.length === 0) return "Sem dias de campo definidos";
    return fieldDayOptions
      .filter((day) => days.includes(day.value))
      .map((day) => day.label)
      .join(", ");
  }

  function lastVisitForMember(memberId: string, groupId = activeCareGroupId) {
    return (
      readyState.memberVisits
        .filter((visit) => visit.member_id === memberId && visit.field_service_group_id === groupId)
        .sort((a, b) => b.visit_date.localeCompare(a.visit_date))[0] ?? null
    );
  }

  function attendanceForMember(memberId: string, groupId = activeCareGroupId, meetingDate = careMeetingDate) {
    return (
      readyState.meetingAttendance.find(
        (attendance) =>
          attendance.member_id === memberId &&
          attendance.field_service_group_id === groupId &&
          attendance.meeting_date === meetingDate,
      ) ?? null
    );
  }

  function recentAbsenceCount(memberId: string, groupId = activeCareGroupId) {
    const rangeStart = addDays(todayIso, -60);
    return readyState.meetingAttendance.filter(
      (attendance) =>
        attendance.member_id === memberId &&
        attendance.field_service_group_id === groupId &&
        attendance.meeting_date >= rangeStart &&
        attendance.status === "ausente",
    ).length;
  }

  async function saveMemberVisit(member: Member) {
    const visitDate = visitDrafts[member.id] || todayIso;
    await runAction(
      "recordMemberVisit",
      { groupId: activeCareGroupId, memberId: member.id, visitDate },
      "Visita registrada.",
    );
  }

  async function saveMemberAttendance(member: Member) {
    await runAction(
      "recordMeetingAttendance",
      {
        groupId: activeCareGroupId,
        memberId: member.id,
        meetingDate: careMeetingDate,
        status: attendanceDrafts[member.id] || attendanceForMember(member.id)?.status || "presente",
      },
      "Presença registrada.",
    );
  }

  // Salva a presença de TODOS os membros do grupo de uma vez (em vez de um por um).
  async function saveAllAttendance() {
    if (!activeCareGroupId || !careMeetingDate) return;
    const entries = careGroupMembers.map((member) => ({
      memberId: member.id,
      status: attendanceDrafts[member.id] || attendanceForMember(member.id)?.status || "presente",
    }));
    await runAction(
      "recordMeetingAttendanceBatch",
      { groupId: activeCareGroupId, meetingDate: careMeetingDate, entries },
      "Presenças salvas.",
    );
  }

  function requiredPrivilegesForAssignment(assignment: Assignment, participant: "assignee" | "assistant") {
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
      return [
        "iniciando_conversas",
        "cultivando_interesse",
        "fazendo_discipulos",
        "explicando_crencas",
        "discurso",
        "o_que_voce_diria",
      ];
    }
    return assignment.role_key in readyState.roleLabels ? [assignment.role_key] : [];
  }

  function eligibleMembers(assignment: Assignment, currentId: string | null | undefined, participant: "assignee" | "assistant") {
    const requiredPrivileges = requiredPrivilegesForAssignment(assignment, participant);
    const principal = readyState.members.find((item) => item.id === assignment.assignee_member_id);
    const gender = assignmentGenderFilters[assignment.id] ?? principal?.gender;
    return readyState.members
      .filter((member) => member.active)
      .filter((member) => participant !== "assignee" || !gender || member.gender === gender)
      .filter((member) => participant !== "assistant" || sameGenderPair(readyState.members.find((item) => item.id === assignment.assignee_member_id), member))
      .filter((member) =>
        member.id === currentId ||
        requiredPrivileges.length === 0 ||
        requiredPrivileges.some((privilege) => member.privileges.includes(privilege)),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  function labelPrivilegesForUi(privileges: string[]) {
    return privileges.map((privilege) => readyState.roleLabels[privilege] ?? privilege).join(" ou ");
  }

  function historyPrivilegesForAssignment(assignment: Assignment, participant: "assignee" | "assistant") {
    return requiredPrivilegesForAssignment(assignment, participant);
  }

  function historyLabelForAssignment(assignment: Assignment, privileges: string[]) {
    return labelPrivilegesForUi(privileges);
  }

  function hasAnyPrivilege(member: Member, requiredPrivileges: string[]) {
    return requiredPrivileges.length === 0 || requiredPrivileges.some((privilege) => member.privileges.includes(privilege));
  }

  function assignmentSlotLabel(assignment: Assignment, participant: "assignee" | "assistant") {
    if (assignment.role_key === "ministerio") {
      const isOptionalBeliefsAssistant = normalizeSearchText(assignment.title).includes("explicando");
      if (participant === "assistant") return isOptionalBeliefsAssistant ? "Ajudante opcional" : "Ajudante";
      return "Principal";
    }
    if (assignment.role_key === "estudo_biblico") return participant === "assignee" ? "Dirigente" : "Leitor";
    return participant === "assistant" ? "Ajudante" : "Designado";
  }

  function assignmentWeekDate(assignment: Assignment) {
    return weekById.get(assignment.week_id)?.meeting_date ?? "";
  }

  function memberWasInAssignment(assignment: Assignment, memberId: string) {
    return assignment.assignee_member_id === memberId || (assignmentUsesAssistant(assignment) && assignment.assistant_member_id === memberId);
  }

  function matchingAssignmentPrivileges(assignment: Assignment, memberId: string) {
    const privileges: string[] = [];
    if (assignment.assignee_member_id === memberId) {
      privileges.push(...requiredPrivilegesForAssignment(assignment, "assignee"));
    }
    if (assignmentUsesAssistant(assignment) && assignment.assistant_member_id === memberId) {
      privileges.push(...requiredPrivilegesForAssignment(assignment, "assistant"));
    }
    return privileges;
  }

  function intersectsPrivileges(left: string[], right: string[]) {
    return left.length === 0 || right.length === 0 || left.some((item) => right.includes(item));
  }

  function samePersonName(left: string | null | undefined, right: string) {
    return Boolean(left) && normalizeSearchText(left ?? "") === normalizeSearchText(right);
  }

  function weeksBetweenDates(previousDate: string, currentDate: string) {
    const previousTime = Date.parse(`${previousDate}T12:00:00`);
    const currentTime = Date.parse(`${currentDate}T12:00:00`);
    if (!Number.isFinite(previousTime) || !Number.isFinite(currentTime)) return 0;
    return Math.max(0, Math.round((currentTime - previousTime) / (7 * 24 * 60 * 60 * 1000)));
  }

  function daysBetweenIsoDates(startDate: string, endDate: string) {
    const startTime = Date.parse(`${startDate}T12:00:00`);
    const endTime = Date.parse(`${endDate}T12:00:00`);
    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) return 0;
    return Math.round((endTime - startTime) / 86_400_000);
  }

  function formatWeeksAgo(weeks: number) {
    if (weeks <= 0) return "nesta semana";
    return weeks === 1 ? "há 1 semana" : `há ${weeks} semanas`;
  }

  function lastRelevantAssignmentDate(member: Member, requiredPrivileges: string[], date: string, currentAssignmentId = "", publicOnly = false) {
    const dates: string[] = [];
    if (!publicOnly) readyState.assignments.forEach((assignment) => {
      const assignmentDate = assignmentWeekDate(assignment);
      if (!assignmentDate || assignment.id === currentAssignmentId || assignmentDate >= date) return;
      if (!memberWasInAssignment(assignment, member.id)) return;
      if (intersectsPrivileges(matchingAssignmentPrivileges(assignment, member.id), requiredPrivileges)) {
        dates.push(assignmentDate);
      }
    });

    readyState.publicMeetings.forEach((meeting) => {
      if (samePersonName(meeting.outgoing_speaker, member.name) && (requiredPrivileges.includes("discurso_fora") || requiredPrivileges.includes("discurso")) && (meeting.outgoing_date ?? meeting.meeting_date) < date) dates.push(meeting.outgoing_date ?? meeting.meeting_date);
      if (meeting.meeting_date >= date) return;
      if (requiredPrivileges.includes("presidente_reuniao_publica") && meeting.chairman_member_id === member.id) {
        dates.push(meeting.meeting_date);
      }
      if (requiredPrivileges.includes("leitor_sentinela") && meeting.watchtower_reader_member_id === member.id) {
        dates.push(meeting.meeting_date);
      }
      if (requiredPrivileges.includes("discurso")) {
        if (samePersonName(meeting.public_talk_speaker, member.name)) dates.push(meeting.meeting_date);
      }
    });

    if (!publicOnly) readyState.mechanicalAssignments.forEach((assignment) => {
      if (assignment.assignment_date >= date) return;
      const roleMatches = mechanicalRoleFields.some((field) => {
        if (!requiredPrivileges.includes(field.privilege)) return false;
        return assignment[field.key] === member.id;
      });
      if (roleMatches) dates.push(assignment.assignment_date);
    });

    if (!publicOnly) readyState.fieldMinistryAssignments.forEach((assignment) => {
      if (assignment.activity_date >= date) return;
      if (requiredPrivileges.includes("dirigente_campo") && assignment.conductor_member_id === member.id) {
        dates.push(assignment.activity_date);
      }
    });

    return dates.sort((a, b) => b.localeCompare(a))[0] ?? null;
  }

  function totalAssignmentsForMember(member: Member, publicOnly = false) {
    const midweekTotal = readyState.assignments.filter((assignment) => memberWasInAssignment(assignment, member.id)).length;
    const publicTotal = readyState.publicMeetings.filter(
      (meeting) =>
        meeting.chairman_member_id === member.id ||
        meeting.watchtower_reader_member_id === member.id ||
        samePersonName(meeting.public_talk_speaker, member.name) ||
        samePersonName(meeting.outgoing_speaker, member.name),
    ).length;
    const mechanicalTotal = readyState.mechanicalAssignments.filter((assignment) =>
      [
        assignment.audio_member_id,
        assignment.video_member_id,
        assignment.external_attendant_member_id,
        assignment.internal_attendant_member_id,
        assignment.roaming_microphone_member_id,
      ].includes(member.id),
    ).length;
    const fieldTotal = readyState.fieldMinistryAssignments.filter((assignment) => assignment.conductor_member_id === member.id).length;
    return publicOnly ? publicTotal : midweekTotal + publicTotal + mechanicalTotal + fieldTotal;
  }

  function memberHasAnyAssignmentInWeek(member: Member, week: Week, publicOnly = false) {
    const hasMidweek = readyState.assignments.some(
      (assignment) => assignment.week_id === week.id && memberWasInAssignment(assignment, member.id),
    );
    const publicMeeting = readyState.publicMeetings.find((meeting) => meeting.week_id === week.id);
    const hasPublic =
      Boolean(publicMeeting?.chairman_member_id === member.id) ||
      Boolean(publicMeeting?.watchtower_reader_member_id === member.id) ||
      samePersonName(publicMeeting?.public_talk_speaker, member.name) ||
      samePersonName(publicMeeting?.outgoing_speaker, member.name);
    return (publicOnly ? false : hasMidweek) || hasPublic;
  }

  function consecutiveAssignmentWeeks(member: Member, date: string, publicOnly = false) {
    let count = 0;
    const previousWeeks = readyState.weeks
      .filter((week) => publicOnly ? addDays(week.week_start, 6) < addDays(date, -((new Date(`${date}T12:00:00`).getDay() + 6) % 7)) : week.meeting_date < date)
      .sort((a, b) => b.meeting_date.localeCompare(a.meeting_date));
    for (const week of previousWeeks) {
      if (!memberHasAnyAssignmentInWeek(member, week, publicOnly)) break;
      count += 1;
    }
    return count;
  }

  function currentWeekMidweekNotes(member: Member, date: string, currentAssignmentId = "", level: RecommendationLevel = "block") {
    return readyState.assignments
      .filter(
        (assignment) =>
          assignment.id !== currentAssignmentId &&
          assignmentWeekDate(assignment) === date &&
          memberWasInAssignment(assignment, member.id),
      )
      .map((assignment) => ({
        level,
        text: `Já está em ${assignmentDisplayTitle(assignment)} nesta reunião.`,
      }));
  }

  function currentWeekPublicNotes(member: Member, publicRole: "chairman" | "reader" | "outgoing" | "midweek", date: string) {
    if (!selectedPublicMeeting) return [];
    const notes: MemberChoiceOption["notes"] = [];
    const publicMeetingDate = selectedPublicMeeting.meeting_date;
    const outgoingDate = publicMeetingForm.outgoing_date || publicMeetingDate;
    if (publicMeetingDate === date && publicRole !== "chairman" && publicMeetingForm.chairman_member_id === member.id) {
      notes.push({ level: "warning", text: "Será presidente no fim de semana." });
    }
    if (publicMeetingDate === date && publicRole !== "reader" && publicMeetingForm.watchtower_reader_member_id === member.id) {
      notes.push({ level: "warning", text: "Será leitor de A Sentinela no fim de semana." });
    }
    if (outgoingDate === date && publicRole !== "outgoing" && samePersonName(publicMeetingForm.outgoing_speaker, member.name)) {
      const dateLabel = outgoingDate ? ` em ${formatNumericDate(outgoingDate)}` : "";
      notes.push({ level: "warning", text: `Tem discurso fora${dateLabel}.` });
    }
    return notes;
  }

  function timeAwayNote(member: Member, date: string) {
    const away = readyState.timeAway.find((item) => item.member_id === member.id && item.start_date <= date && date <= item.end_date);
    return away ? { level: "block" as const, text: `Folga: ${away.reason}.` } : null;
  }

  function ministryPairNote(member: Member, pairMemberId: string | null | undefined, assignment: Assignment, date: string) {
    if (assignment.role_key !== "ministerio" || !pairMemberId || pairMemberId === member.id) return null;
    const pairHistory = readyState.assignments
      .filter((item) => item.id !== assignment.id && item.role_key === "ministerio")
      .map((item) => ({ assignment: item, date: assignmentWeekDate(item) }))
      .filter(({ assignment: item, date: itemDate }) => {
        if (!itemDate || itemDate >= date) return false;
        const sameOrder = item.assignee_member_id === pairMemberId && item.assistant_member_id === member.id;
        const inverseOrder = item.assignee_member_id === member.id && item.assistant_member_id === pairMemberId;
        return sameOrder || inverseOrder;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
    if (pairHistory.length === 0) return null;
    return {
      level: "warning" as const,
      text: `Dupla repetida: já saíram juntas em ${formatNumericDate(pairHistory[0].date)}.`,
    };
  }

  function memberChoiceOption({
    member,
    date,
    requiredPrivileges,
    historyPrivileges = requiredPrivileges,
    roleName,
    currentAssignment,
    participant,
    publicRole = "midweek",
    pairMemberId,
  }: {
    member: Member;
    date: string;
    requiredPrivileges: string[];
    historyPrivileges?: string[];
    roleName: string;
    currentAssignment?: Assignment;
    participant?: "assignee" | "assistant";
    publicRole?: "chairman" | "reader" | "outgoing" | "midweek";
    pairMemberId?: string | null;
  }): MemberChoiceOption {
    const notes: MemberChoiceOption["notes"] = [];
    const publicOnly = publicRole !== "midweek";
    const midweekHistory = currentAssignment
      ? midweekParticipationHistory(state?.assignments ?? [], state?.weeks ?? [], member.id, date, currentAssignment.id)
      : null;
    const lastDate = midweekHistory
      ? midweekHistory.past.find(({ assignment }) => intersectsPrivileges(matchingAssignmentPrivileges(assignment, member.id), historyPrivileges))?.date ?? null
      : lastRelevantAssignmentDate(member, historyPrivileges, date, currentAssignment?.id ?? "", publicOnly);
    const weeksSince = lastDate ? weeksBetweenDates(lastDate, date) : 999;
    const detail = lastDate
      ? `Última: ${formatNumericDate(lastDate)} (${formatWeeksAgo(weeksSince)} sem ${roleName})`
      : `Nunca fez ${roleName}`;
    const away = timeAwayNote(member, date);
    if (away) notes.push(away);
    if (!hasAnyPrivilege(member, requiredPrivileges)) {
      notes.push({ level: "warning", text: `Sem privilégio marcado para ${labelPrivilegesForUi(requiredPrivileges)}.` });
    }
    if (currentAssignment) {
      if (!member.gender && assignmentUsesAssistant(currentAssignment)) {
        notes.push({ level: "warning", text: "Gênero não informado em Participantes. Preencha o cadastro para escolher um ajudante do mesmo gênero." });
      }
      const lastParticipation = midweekHistory?.past[0];
      notes.push({ level: "info", text: lastParticipation
        ? `Última em Vida e Ministério: ${formatNumericDate(lastParticipation.date)} — ${assignmentDisplayTitle(lastParticipation.assignment)} (${lastParticipation.assistant ? "ajudante/leitor" : "principal"}).`
        : "Sem participação anterior em Vida e Ministério, incluindo como ajudante." });
      for (const item of midweekHistory?.adjacent ?? []) {
        notes.push({ level: "warning", text: `Reuniões seguidas: ${item.date < date ? "participou na reunião anterior" : "já está na próxima reunião"}, em ${formatNumericDate(item.date)}, ${item.assistant ? "como ajudante/leitor" : "como principal"} em ${assignmentDisplayTitle(item.assignment)}. Considere outra pessoa.` });
      }
      notes.push(...currentWeekMidweekNotes(member, date, currentAssignment.id));
      const pairNote = ministryPairNote(
        member,
        pairMemberId ?? (participant === "assignee" ? currentAssignment.assistant_member_id : currentAssignment.assignee_member_id),
        currentAssignment,
        date,
      );
      if (pairNote) notes.push(pairNote);
      if (
        currentAssignment.role_key === "ministerio" &&
        historyPrivileges.some((privilege) => ministryRotationPrivileges.includes(privilege)) &&
        lastDate &&
        weeksSince <= 3
      ) {
        notes.push({
          level: "warning",
          text: `Designação recente em Faça Seu Melhor no Ministério ${formatWeeksAgo(weeksSince)}.`,
        });
      }
    } else if (!publicOnly) {
      notes.push(...currentWeekMidweekNotes(member, date, "", publicRole === "midweek" ? "block" : "warning"));
    }
    notes.push(...currentWeekPublicNotes(member, publicRole, date));

    const consecutiveCount = currentAssignment ? 0 : consecutiveAssignmentWeeks(member, date, publicOnly);
    if (consecutiveCount >= 3) {
      notes.push({ level: "warning", text: `${consecutiveCount} semanas seguidas com designações${publicOnly ? " de reunião pública" : ""}; considerar folga.` });
    }

    return {
      member,
      detail,
      notes: notes.filter(
        (note, index, list) => list.findIndex((item) => item.text === note.text && item.level === note.level) === index,
      ),
      weeksSince,
      adjacentMidweek: Boolean(midweekHistory?.adjacent.length),
      lastMidweekDate: midweekHistory ? midweekHistory.past[0]?.date ?? null : undefined,
      totalAssignments: midweekHistory ? midweekHistory.past.length : totalAssignmentsForMember(member, publicOnly),
    };
  }

  function compareMemberChoiceOptions(left: MemberChoiceOption, right: MemberChoiceOption) {
    const leftBlocks = left.notes.filter((note) => note.level === "block").length;
    const rightBlocks = right.notes.filter((note) => note.level === "block").length;
    if (leftBlocks !== rightBlocks) return leftBlocks - rightBlocks;
    if (Boolean(left.adjacentMidweek) !== Boolean(right.adjacentMidweek)) return left.adjacentMidweek ? 1 : -1;
    if (left.lastMidweekDate !== undefined && right.lastMidweekDate !== undefined) {
      const recency = (left.lastMidweekDate ?? "").localeCompare(right.lastMidweekDate ?? "");
      if (recency) return recency;
    }
    return (
      right.weeksSince - left.weeksSince ||
      left.totalAssignments - right.totalAssignments ||
      left.member.name.localeCompare(right.member.name, "pt-BR")
    );
  }

  function rankedAssignmentMemberOptions(assignment: Assignment, currentId: string | null | undefined, participant: "assignee" | "assistant") {
    const requiredPrivileges = requiredPrivilegesForAssignment(assignment, participant);
    const historyPrivileges = historyPrivilegesForAssignment(assignment, participant);
    const roleName = historyLabelForAssignment(assignment, historyPrivileges);
    return eligibleMembers(assignment, currentId, participant)
      .map((member) =>
        memberChoiceOption({
          member,
          date: readyWeek.meeting_date,
          requiredPrivileges,
          historyPrivileges,
          roleName,
          currentAssignment: assignment,
          participant,
        }),
      )
      .sort(compareMemberChoiceOptions);
  }

  function rankedPrivilegeMemberOptions(
    requiredPrivileges: string[],
    currentId: string | null | undefined,
    date: string,
    publicRole: "chairman" | "reader" | "outgoing",
  ) {
    const roleName = labelPrivilegesForUi(requiredPrivileges);
    return readyState.members
      .filter((member) => member.active)
      .filter((member) => member.id === currentId || hasAnyPrivilege(member, requiredPrivileges))
      .map((member) =>
        memberChoiceOption({
          member,
          date,
          requiredPrivileges,
          roleName,
          publicRole,
        }),
      )
      .sort(compareMemberChoiceOptions);
  }

  function outgoingSpeakerOptions(currentId: string | null | undefined, date: string) {
    return readyState.members
      .filter((member) => member.active)
      .filter((member) => member.id === currentId || member.privileges.includes("discurso_fora"))
      .map((member) =>
        memberChoiceOption({
          member,
          date,
          requiredPrivileges: ["discurso_fora"],
          roleName: "discurso público fora",
          publicRole: "outgoing",
        }),
      )
      .sort(compareMemberChoiceOptions);
  }

  function simpleMemberOptions(currentId: string | null | undefined = "") {
    return readyState.members
      .filter((member) => member.active)
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      .map((member) => ({
        member,
        detail: `${congregationStatusLabel(member.congregation_status)} - ${groupName(member.field_service_group_id)}`,
        notes: [] as MemberChoiceOption["notes"],
        weeksSince: 0,
        totalAssignments: totalAssignmentsForMember(member),
      }));
  }

  function accountAuditorOptions(currentId: string | null | undefined = "") {
    return readyState.members
      .filter((member) => member.active)
      .filter((member) => member.id === currentId || member.congregation_status === "anciao")
      .filter(
        (member) =>
          member.id === currentId ||
          !excludedAccountAuditorNames.some((name) => normalizeSearchText(name) === normalizeSearchText(member.name)),
      )
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
      .map((member) => ({
        member,
        detail: `${congregationStatusLabel(member.congregation_status)} - ${groupName(member.field_service_group_id)}`,
        notes: [] as MemberChoiceOption["notes"],
        weeksSince: 0,
        totalAssignments: totalAssignmentsForMember(member),
      }));
  }

  function accountAuditStatus(audit: AccountAudit) {
    if (audit.completed_date) {
      return {
        label: "Feita",
        tone: "complete" as const,
        detail: `Concluída em ${formatNumericDate(audit.completed_date)}.`,
      };
    }
    const daysToDue = daysBetweenIsoDates(todayIso, audit.due_date);
    if (daysToDue < 0) {
      const overdueDays = Math.abs(daysToDue);
      return {
        label: "Pendente - Em atraso",
        tone: "danger" as const,
        detail: `Prazo passou há ${overdueDays} dia${overdueDays === 1 ? "" : "s"}.`,
      };
    }
    if (daysToDue <= ACCOUNT_AUDIT_WARNING_DAYS) {
      return {
        label: "Pendente - Vencendo",
        tone: "warning" as const,
        detail: `Vence em ${daysToDue} dia${daysToDue === 1 ? "" : "s"}.`,
      };
    }
    return {
      label: "Pendente - Em dia",
      tone: "info" as const,
      detail: `Prazo em ${formatNumericDate(audit.due_date)}.`,
    };
  }

  function updateAccountAuditDraft(id: string, patch: Partial<AccountAuditDraft>) {
    setAccountAuditDrafts((current) => ({
      ...current,
      [id]: {
        auditor_member_id: current[id]?.auditor_member_id ?? "",
        completed_date: current[id]?.completed_date ?? "",
        notes: current[id]?.notes ?? "",
        ...patch,
      },
    }));
  }

  async function saveAccountAuditAssignment(audit: AccountAudit) {
    const draft = accountAuditDrafts[audit.id] ?? {
      auditor_member_id: audit.auditor_member_id ?? "",
      completed_date: audit.completed_date ?? "",
      notes: audit.notes ?? "",
    };
    await runAction(
      "updateAccountAudit",
      {
        id: audit.id,
        auditor_member_id: draft.auditor_member_id || null,
      },
      "Auditor da conta atualizado.",
    );
  }

  async function completeAccountAudit(audit: AccountAudit) {
    const draft = accountAuditDrafts[audit.id] ?? {
      auditor_member_id: audit.auditor_member_id ?? "",
      completed_date: audit.completed_date ?? todayIso,
      notes: audit.notes ?? "",
    };
    await runAction(
      "updateAccountAudit",
      {
        id: audit.id,
        completed_date: draft.completed_date || todayIso,
        notes: draft.notes,
      },
      "Auditoria concluída.",
    );
  }

  function memberIdByExactName(name: string) {
    const normalized = normalizeSearchText(name);
    if (!normalized) return "";
    return readyState.members.find((member) => normalizeSearchText(member.name) === normalized)?.id ?? "";
  }

  function publicTalkThemeTitle(themeId: string | null) {
    const theme = themeId ? readyState.publicTalkThemes.find((item) => item.id === themeId) : null;
    return theme ? theme.title : "";
  }

  function publicTalkThemeNumber(themeId: string | null) {
    const theme = themeId ? readyState.publicTalkThemes.find((item) => item.id === themeId) : null;
    return theme?.number ?? Number.MAX_SAFE_INTEGER;
  }

  function circuitVisitForDate(date: string) {
    return readyState.specialEvents.find(
      (event) => event.type === "visita_superintendente" && event.start_date <= date && date <= event.end_date,
    ) ?? null;
  }

  function publicMeetingRolesForUser(meeting: PublicMeeting, userName: string) {
    const roles: string[] = [];
    if (meeting.chairman_member_id === readyState.user.id) roles.push("Presidente");
    if (meeting.watchtower_reader_member_id === readyState.user.id) roles.push("Leitor de A Sentinela");
    if (samePersonName(meeting.public_talk_speaker, userName)) roles.push("Orador recebido");
    if (samePersonName(meeting.outgoing_speaker, userName)) {
      roles.push(
        meeting.outgoing_congregation
          ? `Discurso fora - ${meeting.outgoing_congregation}`
          : "Discurso fora",
      );
    }
    return roles;
  }

  function publicMeetingSummaryDate(meeting: PublicMeeting, userName: string) {
    return samePersonName(meeting.outgoing_speaker, userName)
      ? meeting.outgoing_date || meeting.meeting_date
      : meeting.meeting_date;
  }

  function publicMeetingSummaryTitle(meeting: PublicMeeting, userName: string) {
    if (samePersonName(meeting.outgoing_speaker, userName)) {
      return meeting.outgoing_talk_theme || "Tema do discurso fora a confirmar";
    }
    return (meeting.special_talk_title || publicTalkThemeTitle(meeting.public_talk_theme_id)) || "Tema a confirmar";
  }

  function mechanicalRolesForUser(assignment: MechanicalAssignment, memberId: string) {
    const roles: string[] = [];
    if (assignment.audio_member_id === memberId) roles.push("Áudio");
    if (assignment.video_member_id === memberId) roles.push("Vídeo");
    if (assignment.external_attendant_member_id === memberId) roles.push("Indicador externo");
    if (assignment.internal_attendant_member_id === memberId) roles.push("Indicador interno");
    if (assignment.roaming_microphone_member_id === memberId) roles.push("Microfone volante");
    return roles;
  }

  function meetingKindLabel(kind: MechanicalMeetingKind) {
    return kind === "meio_semana" ? "Meio de semana" : "Fim de semana";
  }

  function fieldArrangementLabel(arrangement: FieldMinistryArrangement) {
    if (arrangement === "todos_grupos") return "Todos os grupos";
    if (arrangement === "grupo_servico") return "Grupo de serviço";
    return "Salão do Reino";
  }

  function fieldWeekdayLabel(day: FieldDay) {
    return fieldDayOptions.find((option) => option.value === day)?.label ?? day;
  }

  function weekForDate(date: string) {
    return readyState.weeks.find((week) => week.week_start <= date && date <= addDays(week.week_start, 6)) ?? null;
  }

  function openMidweekSheet(weekId: string) {
    setSelectedWeekId(weekId);
    setActiveNav("Folha");
  }

  function openPublicMeetingDetail(meeting: PublicMeeting) {
    setSelectedWeekId(meeting.week_id);
    setActiveNav(PUBLIC_MEETING_NAV);
  }

  function openMechanicalDetail(assignment: MechanicalAssignment) {
    const week = weekForDate(assignment.assignment_date);
    if (week) setSelectedWeekId(week.id);
    setSelectedMechanicalMonth(assignment.assignment_date.slice(0, 7));
    setActiveNav(MECHANICAL_NAV);
  }

  function openFieldMinistryDetail(assignment: FieldMinistryAssignment) {
    const week = weekForDate(assignment.activity_date);
    if (week) setSelectedWeekId(week.id);
    setSelectedFieldMinistryMonth(assignment.activity_date.slice(0, 7));
    setSelectedFieldMinistryDate(assignment.activity_date);
    setActiveNav(FIELD_MINISTRY_NAV);
  }

  function weekPickerLabel(week: Week) {
    if (currentNav === PUBLIC_MEETING_NAV) {
      const meeting = readyState.publicMeetings.find((item) => item.week_id === week.id);
      const meetingDate = meeting?.meeting_date ?? addDays(week.week_start, 5);
      const theme = meeting ? (meeting.no_public_meeting_event ? `Evento especial — ${specialEventTypeLabel(meeting.no_public_meeting_event.type)}` : meeting.special_talk_title || publicTalkThemeTitle(meeting.public_talk_theme_id)) : "";
      return `${formatShortDate(meetingDate)} - ${theme || week.bible_reading}`;
    }
    return `${formatShortDate(week.meeting_date)} - ${week.bible_reading}`;
  }

  function editableModuleLabel(module: EditableModule) {
    return editableModuleOptions.find((option) => option.value === module)?.label ?? module;
  }

  function editableModulesLabel(member: Member) {
    if (member.role === "admin") return "Edita: todos os módulos";
    if (member.editable_modules.length === 0) return "Edita: nenhum módulo";
    return `Edita: ${member.editable_modules.map(editableModuleLabel).join(", ")}`;
  }

  function updateMechanicalDraft(id: string, patch: Partial<MechanicalAssignmentDraft>) {
    setMechanicalDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? createMechanicalDraft(readyState.mechanicalAssignments.find((item) => item.id === id)!)),
        ...patch,
      },
    }));
  }

  function updateFieldMinistryDraft(id: string, patch: Partial<FieldMinistryAssignmentDraft>) {
    setFieldMinistryDrafts((current) => ({
      ...current,
      [id]: {
        ...(current[id] ?? createFieldMinistryDraft(readyState.fieldMinistryAssignments.find((item) => item.id === id)!)),
        ...patch,
      },
    }));
  }

  function timeControlDraftForPart(partKey: string) {
    return timeControlDrafts[partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(partKey));
  }

  function buildMeetingExtraSegments(
    partDraftsOverride: Record<string, TimeControlDraft> = timeControlDrafts,
    sessionDraftOverride: MeetingSessionDraft = meetingSessionDraft,
    nowMs = timingNow,
  ): MeetingExtraSegment[] {
    if (!sessionDraftOverride.startedAt) return [];
    const partDraft = (part: TimeControlPart) =>
      partDraftsOverride[part.partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(part.partKey));
    const partsWithDrafts = timeControlParts.map((part) => ({ part, draft: partDraft(part) }));
    const segments: MeetingExtraSegment[] = [];
    const firstStarted = partsWithDrafts.find(({ draft }) => draft.startedAt);
    if (firstStarted) {
      const actualSeconds = secondsBetweenIso(sessionDraftOverride.startedAt, firstStarted.draft.startedAt);
      if (actualSeconds > 0) {
        segments.push({
          key: `${TIME_CONTROL_EXTRA_PREFIX}-intro`,
          title: meetingExtraLabel(null, firstStarted.part),
          startedAt: sessionDraftOverride.startedAt,
          endedAt: firstStarted.draft.startedAt,
          actualSeconds,
        });
      }
    }

    for (let index = 0; index < partsWithDrafts.length - 1; index += 1) {
      const current = partsWithDrafts[index];
      const next = partsWithDrafts[index + 1];
      if (!current.draft.endedAt || !next.draft.startedAt) continue;
      const actualSeconds = secondsBetweenIso(current.draft.endedAt, next.draft.startedAt);
      if (actualSeconds <= 0) continue;
      segments.push({
        key: `${TIME_CONTROL_EXTRA_PREFIX}-${index}`,
        title: meetingExtraLabel(current.part, next.part),
        startedAt: current.draft.endedAt,
        endedAt: next.draft.startedAt,
        actualSeconds,
      });
    }

    const lastEnded = partsWithDrafts
      .slice()
      .reverse()
      .find(({ draft }) => draft.endedAt);
    const sessionEnd = sessionDraftOverride.endedAt ?? (sessionDraftOverride.runningStartedAt ? new Date(nowMs).toISOString() : null);
    if (lastEnded && sessionEnd) {
      const actualSeconds = secondsBetweenIso(lastEnded.draft.endedAt, sessionEnd);
      if (actualSeconds > 0) {
        segments.push({
          key: `${TIME_CONTROL_EXTRA_PREFIX}-conclusion`,
          title: meetingExtraLabel(lastEnded.part, null),
          startedAt: lastEnded.draft.endedAt,
          endedAt: sessionEnd,
          actualSeconds,
        });
      }
    }
    return segments;
  }

  function updateTimeControlDraft(partKey: string, patch: Partial<TimeControlDraft>) {
    setTimeControlDrafts((current) => ({
      ...current,
      [partKey]: {
        ...(current[partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(partKey))),
        ...patch,
      },
    }));
  }

  async function resetMeetingSession() {
    if (!isAdmin || busy) return;
    if (!window.confirm("Zerar o tempo da reunião selecionada? Isso apagará o início, o fim e todos os tempos e anotações das partes dessa reunião. Será possível iniciar novamente.")) return;
    const weekId = readyWeek.id;
    const partKeys = new Set([
      ...timeControlParts.map((part) => part.partKey),
      ...timeControlRecordsForWeek.map((record) => record.part_key),
    ]);
    const saved = await runAction("resetMeetingTimings", { weekId }, "Tempo da reunião zerado. Você pode iniciar novamente.");
    if (!saved) return;
    setMeetingSessionDrafts((current) => ({ ...current, [weekId]: createMeetingSessionDraft(null) }));
    setTimeControlDrafts((current) => {
      const next = { ...current };
      partKeys.forEach((key) => { delete next[key]; });
      return next;
    });
    setTimeControlInputTexts((current) => {
      const next = { ...current };
      partKeys.forEach((key) => { delete next[key]; });
      return next;
    });
    setTimingNow(Date.now());
  }

  function startMeetingSession() {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    setTimingNow(nowMs);
    setMeetingSessionDrafts((current) => ({
      ...current,
      [readyWeek.id]: {
        startedAt: current[readyWeek.id]?.startedAt ?? meetingSessionDraft.startedAt ?? nowIso,
        endedAt: null,
        runningStartedAt: nowMs,
      },
    }));
  }

  async function endMeetingSession(sendReport = false) {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    setTimingNow(nowMs);
    const nextPartDrafts: Record<string, TimeControlDraft> = { ...timeControlDrafts };
    timeControlParts.forEach((part) => {
      const draft = nextPartDrafts[part.partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(part.partKey));
      if (!draft.runningStartedAt) return;
      nextPartDrafts[part.partKey] = {
        ...draft,
        actualSeconds: timeControlElapsedSeconds(draft, nowMs),
        runningStartedAt: null,
        endedAt: nowIso,
      };
    });
    const nextSessionDraft: MeetingSessionDraft = {
      startedAt: meetingSessionDraft.startedAt ?? nowIso,
      endedAt: nowIso,
      runningStartedAt: null,
    };
    setTimeControlDrafts(nextPartDrafts);
    setMeetingSessionDrafts((current) => ({ ...current, [readyWeek.id]: nextSessionDraft }));
    if (sendReport) {
      await sendTimeControlReport(nextPartDrafts, nextSessionDraft);
      return;
    }
    const saved = await saveTimeControl(nextPartDrafts, nextSessionDraft);
    if (saved) setNotice("Reunião encerrada e tempos salvos. Você já pode enviar por WhatsApp.");
  }

  function startTimeControl(partKey: string) {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    setTimingNow(nowMs);
    setTimeControlDrafts((current) => {
      const next: Record<string, TimeControlDraft> = { ...current };
      for (const [key, draft] of Object.entries(next)) {
        if (draft.runningStartedAt && key !== partKey) {
          next[key] = {
            ...draft,
            actualSeconds: timeControlElapsedSeconds(draft, nowMs),
            runningStartedAt: null,
            endedAt: nowIso,
          };
        }
      }
      const draft = next[partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(partKey));
      next[partKey] = {
        ...draft,
        startedAt: draft.startedAt ?? nowIso,
        endedAt: null,
        runningStartedAt: nowMs,
      };
      return next;
    });
  }

  function stopTimeControl(partKey: string) {
    const nowMs = Date.now();
    const nowIso = new Date(nowMs).toISOString();
    setTimingNow(nowMs);
    const draft = timeControlDrafts[partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(partKey));
    if (!draft.runningStartedAt) return;
    const nextDrafts = {
      ...timeControlDrafts,
      [partKey]: {
        ...draft,
        actualSeconds: timeControlElapsedSeconds(draft, nowMs),
        runningStartedAt: null,
        endedAt: nowIso,
      },
    };
    setTimeControlDrafts(nextDrafts);
    void saveTimeControl(nextDrafts, meetingSessionDraft);
  }

  function resetTimeControl(partKey: string) {
    setTimeControlInputTexts((current) => {
      const next = { ...current };
      delete next[partKey];
      return next;
    });
    setTimeControlDrafts((current) => ({
      ...current,
      [partKey]: {
        actualSeconds: 0,
        startedAt: null,
        endedAt: null,
        runningStartedAt: null,
        notes: "",
      },
    }));
  }

  function buildTimeControlEntries(
    reported: boolean,
    partDraftsOverride: Record<string, TimeControlDraft> = timeControlDrafts,
    sessionDraftOverride: MeetingSessionDraft = meetingSessionDraft,
  ) {
    const nowMs = Date.now();
    const reportedAt = reported ? new Date(nowMs).toISOString() : null;
    const partEntries = timeControlParts
      .map((part) => {
        const draft = partDraftsOverride[part.partKey] ?? createTimeControlDraft(timeControlRecordByPartKey.get(part.partKey));
        const actualSeconds = timeControlElapsedSeconds(draft, nowMs);
        return {
          assignmentId: part.assignmentId,
          partKey: part.partKey,
          partTitle: part.title,
          plannedSeconds: part.plannedSeconds,
          actualSeconds: actualSeconds > 0 ? actualSeconds : null,
          startedAt: draft.startedAt,
          endedAt: draft.endedAt,
          notes: draft.notes,
          reportedAt,
        };
      })
      .filter((entry) => entry.actualSeconds !== null || entry.notes.trim() !== "");
    const sessionSeconds = meetingSessionElapsedSeconds(sessionDraftOverride, nowMs);
    const sessionEntries =
      sessionDraftOverride.startedAt && sessionSeconds > 0
        ? [
            {
              assignmentId: null,
              partKey: TIME_CONTROL_MEETING_TOTAL_KEY,
              partTitle: "Tempo total da reunião",
              plannedSeconds: null,
              actualSeconds: sessionSeconds,
              startedAt: sessionDraftOverride.startedAt,
              endedAt: sessionDraftOverride.endedAt,
              notes: "",
              reportedAt,
            },
            ...buildMeetingExtraSegments(partDraftsOverride, sessionDraftOverride, nowMs).map((segment) => ({
              assignmentId: null,
              partKey: segment.key,
              partTitle: segment.title,
              plannedSeconds: null,
              actualSeconds: segment.actualSeconds,
              startedAt: segment.startedAt,
              endedAt: segment.endedAt,
              notes: "",
              reportedAt,
            })),
          ]
        : [];
    return [...partEntries, ...sessionEntries];
  }

  async function saveTimeControl(
    partDraftsOverride: Record<string, TimeControlDraft> = timeControlDrafts,
    sessionDraftOverride: MeetingSessionDraft = meetingSessionDraft,
  ) {
    const entries = buildTimeControlEntries(false, partDraftsOverride, sessionDraftOverride);
    if (entries.length === 0) {
      setNotice("Marque ao menos um tempo antes de salvar.");
      return false;
    }
    return runAction("saveMeetingTimings", { weekId: readyWeek.id, entries }, "Tempos da reunião salvos.");
  }

  async function sendTimeControlReport(
    partDraftsOverride: Record<string, TimeControlDraft> = timeControlDrafts,
    sessionDraftOverride: MeetingSessionDraft = meetingSessionDraft,
  ) {
    const entries = buildTimeControlEntries(true, partDraftsOverride, sessionDraftOverride);
    if (entries.length === 0) {
      setNotice("Marque ao menos um tempo antes de enviar.");
      return;
    }
    const saved = await runAction("saveMeetingTimings", { weekId: readyWeek.id, entries }, "Tempos da reunião salvos.");
    if (!saved) return;

    const sessionSeconds = meetingSessionElapsedSeconds(sessionDraftOverride, Date.now());
    const totalForReport = sessionSeconds > 0 ? sessionSeconds : totalRecordedSeconds;
    const entriesByPartKey = new Map(entries.map((entry) => [entry.partKey, entry]));
    const lines = timeControlParts.map((part) => {
      const actualSeconds = entriesByPartKey.get(part.partKey)?.actualSeconds ?? 0;
      const assigned = [part.assignee, part.assistant ? `Ajudante: ${part.assistant}` : ""].filter(Boolean).join(" | ") || "Sem designado";
      const plannedSeconds = part.plannedSeconds ?? 0;
      const overtime = plannedSeconds > 0 && actualSeconds > plannedSeconds;
      const overBy = overtime ? ` | ATENÇÃO: passou ${formatDurationSeconds(actualSeconds - plannedSeconds)}` : "";
      return `*${part.title}*\nPrevisto: ${formatDurationSeconds(part.plannedSeconds)} | Real: ${formatDurationSeconds(actualSeconds)}${overBy}\n${assigned}`;
    });
    const extraLines = buildMeetingExtraSegments(partDraftsOverride, sessionDraftOverride).map(
      (segment) => `*${segment.title}*\nReal: ${formatReadableDurationSeconds(segment.actualSeconds)}`,
    );
    const message = [
      `Boa noite! Segue o controle de tempo da Reunião Vida e Ministério de ${formatNumericDate(readyWeek.meeting_date)}.`,
      sessionDraftOverride.startedAt
        ? `Início: ${formatTimeOnly(sessionDraftOverride.startedAt)} | Fim: ${formatTimeOnly(sessionDraftOverride.endedAt)} | Tempo total: ${formatReadableDurationSeconds(totalForReport)}.`
        : "",
      ...lines,
      ...(extraLines.length > 0 ? ["Tempos entre partes:", ...extraLines] : []),
      `Total da reunião: ${formatReadableDurationSeconds(totalForReport)}.`,
    ].join("\n\n");
    const recipients = readyState.timeControlReportRecipients
      .map((recipient) => ({ ...recipient, phone: normalizePhoneForWhatsApp(recipient.whatsapp_phone) }))
      .filter((recipient) => recipient.phone);

    if (recipients.length === 0) {
      setNotice(`Tempos salvos, mas o WhatsApp de Participante 002 e Participante 003 não está cadastrado. Mensagem: ${message}`);
      return;
    }

    const openedCount = recipients.reduce((count, recipient) => {
      const opened = window.open(`https://example.invalid/compartilhamento-desativado/${recipient.phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
      return count + (opened ? 1 : 0);
    }, 0);
    setNotice(
      openedCount > 0
        ? `Tempos salvos e WhatsApp aberto para ${recipients.map((recipient) => recipient.name).join(" e ")}.`
        : "Tempos salvos. Libere pop-ups para abrir o WhatsApp.",
    );
  }

  function mechanicalMemberOptions(
    privilege: string,
    currentId: string | null | undefined,
    date: string,
    label: string,
    assignment: MechanicalAssignment,
    draft: MechanicalAssignmentDraft,
    fieldKey: MechanicalMemberField,
  ) {
    return readyState.members
      .filter((member) => member.active)
      .filter((member) => member.id === currentId || member.privileges.includes(privilege))
      .map((member) => {
        const option = mechanicalChoiceOption(member, assignment, privilege);
        const alreadyInDraft = mechanicalRoleFields.some((field) => field.key !== fieldKey && draft[field.key] === member.id);
        if (alreadyInDraft) {
          option.notes.push({ level: "block", text: "Já está em outra designação mecânica nesta reunião." });
        }
        option.notes.push(...sameDayMechanicalConflictNotes(member, date, assignment.id));
        const previousMechanicalDate = previousMechanicalDateForMember(member.id, assignment);
        if (previousMechanicalDate) {
          option.notes.push({
            level: "warning",
            text: `Fez mecânica na reunião anterior em ${formatNumericDate(previousMechanicalDate)}.`,
          });
        }
        if (isRestrictedMechanicalMember(member)) {
          const monthlyCount = mechanicalMonthCountForMember(member.id, date.slice(0, 7), assignment.id);
          if (monthlyCount >= 2) {
            option.notes.push({ level: "warning", text: `${member.name} já aparece ${monthlyCount} vezes neste mês.` });
          }
          if (fieldKey === "external_attendant_member_id") {
            option.notes.push({ level: "warning", text: "Evitar colocar no indicador externo." });
          }
        }
        option.notes = option.notes.filter(
          (note, index, list) => list.findIndex((item) => item.text === note.text && item.level === note.level) === index,
        );
        return option;
      })
      .sort(compareMemberChoiceOptions);
  }

  function sameDayMechanicalConflictNotes(member: Member, date: string, currentMechanicalId: string) {
    const notes: MemberChoiceOption["notes"] = [];
    readyState.assignments
      .filter((assignment) => assignmentWeekDate(assignment) === date && memberWasInAssignment(assignment, member.id))
      .forEach((assignment) => notes.push({ level: "block", text: `Já tem ${assignmentDisplayTitle(assignment)} neste dia.` }));
    readyState.publicMeetings.forEach((meeting) => {
      const roles = publicMeetingRolesForMember(member, meeting, date);
      if (roles.length > 0) {
        notes.push({ level: "block", text: `Já tem reunião pública neste dia: ${roles.join(", ")}.` });
      }
    });
    readyState.fieldMinistryAssignments
      .filter(
        (assignment) =>
          assignment.id !== currentMechanicalId &&
          assignment.activity_date === date &&
          assignment.conductor_member_id === member.id,
      )
      .forEach((assignment) =>
        notes.push({ level: "block", text: `Já dirige campo neste dia em ${fieldArrangementLabel(assignment.arrangement)}.` }),
      );
    return notes;
  }

  function mechanicalChoiceOption(member: Member, assignment: MechanicalAssignment, privilege: string): MemberChoiceOption {
    const history = (state?.mechanicalAssignments ?? []).filter((item) =>
      item.id !== assignment.id && item.assignment_date < assignment.assignment_date &&
      mechanicalRoleFields.some((field) => item[field.key] === member.id),
    );
    const lastDate = history.map((item) => item.assignment_date).sort().at(-1);
    const weeksSince = lastDate ? weeksBetweenDates(lastDate, assignment.assignment_date) : 999;
    const notes: MemberChoiceOption["notes"] = [];
    const away = timeAwayNote(member, assignment.assignment_date);
    if (away) notes.push(away);
    if (!hasAnyPrivilege(member, [privilege])) {
      notes.push({ level: "warning", text: `Sem privilégio marcado para ${labelPrivilegesForUi([privilege])}.` });
    }
    return {
      member,
      detail: lastDate
        ? `Última mecânica: ${formatNumericDate(lastDate)} (${formatWeeksAgo(weeksSince)}) | ${history.length} designações mecânicas`
        : "Nunca fez designação mecânica",
      notes,
      weeksSince,
      totalAssignments: history.length,
    };
  }

  function previousMechanicalDateForMember(memberId: string, currentAssignment: MechanicalAssignment) {
    const previous = readyState.mechanicalAssignments
      .filter((assignment) => assignment.id !== currentAssignment.id && assignment.assignment_date < currentAssignment.assignment_date)
      .sort((a, b) => `${b.assignment_date}-${b.meeting_kind}`.localeCompare(`${a.assignment_date}-${a.meeting_kind}`))[0];
    if (!previous) return null;
    return mechanicalRoleFields.some((field) => previous[field.key] === memberId) ? previous.assignment_date : null;
  }

  function mechanicalMonthCountForMember(memberId: string, monthKey: string, currentAssignmentId = "") {
    return readyState.mechanicalAssignments.filter(
      (assignment) =>
        assignment.id !== currentAssignmentId &&
        assignment.assignment_date.startsWith(monthKey) &&
        mechanicalRoleFields.some((field) => assignment[field.key] === memberId),
    ).length;
  }

  function isRestrictedMechanicalMember(member: Member) {
    const normalized = normalizeSearchText(member.name);
    return restrictedExternalAttendantNames.some((name) => normalizeSearchText(name) === normalized);
  }

  function generateMechanicalSuggestions() {
    const nextDrafts = { ...mechanicalDrafts };
    mechanicalAssignmentsForDisplay.forEach((assignment) => {
      let draft = nextDrafts[assignment.id] ?? createMechanicalDraft(assignment);
      mechanicalRoleFields.forEach((field) => {
        if (draft[field.key]) return;
        const options = mechanicalMemberOptions(
          field.privilege,
          draft[field.key],
          assignment.assignment_date,
          field.label,
          assignment,
          draft,
          field.key,
        );
        const chosen =
          options.find((option) => option.notes.every((note) => note.level === "info")) ??
          options.find((option) => option.notes.every((note) => note.level !== "block")) ??
          options[0];
        if (chosen) {
          draft = { ...draft, [field.key]: chosen.member.id };
        }
      });
      nextDrafts[assignment.id] = draft;
    });
    setMechanicalDrafts(nextDrafts);
    setNotice("Sugestões de A/V preparadas. Revise os avisos antes de salvar.");
  }

  function isWeekendOrHolidayFieldAssignment(assignment: FieldMinistryAssignment) {
    return assignment.weekday === "sab" || assignment.arrangement === "todos_grupos" || isSaoPauloHoliday(assignment.activity_date);
  }

  function fieldWeekendBlocksMember(member: Member, assignment: FieldMinistryAssignment) {
    const blockedByWeekendRule =
      assignment.weekday === "sab" ||
      assignment.weekday === "dom" ||
      assignment.arrangement === "todos_grupos";
    return (
      blockedByWeekendRule &&
      restrictedWeekendFieldConductorNames.some((name) => normalizeSearchText(name) === normalizeSearchText(member.name))
    );
  }

  function isFirstSundayAllGroupsAssignment(assignment: FieldMinistryAssignment) {
    return assignment.weekday === "dom" && assignment.arrangement === "todos_grupos" && Number(assignment.activity_date.slice(8, 10)) <= 7;
  }

  function fieldRotationName(assignment: FieldMinistryAssignment) {
    if (isSaoPauloHoliday(assignment.activity_date)) return "Dirigente em feriado";
    if (isFridayMorningAssignment(assignment)) return "Dirigente de sexta de manhã";
    if (isFridayAfternoonAssignment(assignment)) return "Dirigente às sextas";
    if (isFirstSundayAllGroupsAssignment(assignment)) return "Primeiro domingo do mês";
    if (assignment.arrangement === "grupo_servico") return `Dirigente do ${groupName(assignment.field_service_group_id)}`;
    if (assignment.weekday === "sab") return "Dirigente aos sábados";
    if (assignment.arrangement === "todos_grupos") return "Saída com todos os grupos";
    return "Dirigente de Campo";
  }

  function isFridayMorningAssignment(assignment: FieldMinistryAssignment) {
    return assignment.weekday === "sex" && assignment.start_time.slice(0, 5) === FRIDAY_MORNING_TIME;
  }

  function isFridayAfternoonAssignment(assignment: FieldMinistryAssignment) {
    return assignment.weekday === "sex" && assignment.start_time.slice(0, 5) === FRIDAY_AFTERNOON_TIME;
  }

  function fieldAssignmentsShareRotation(left: FieldMinistryAssignment, right: FieldMinistryAssignment) {
    if (isSaoPauloHoliday(right.activity_date)) return isSaoPauloHoliday(left.activity_date);
    if (isFirstSundayAllGroupsAssignment(right)) return isFirstSundayAllGroupsAssignment(left);
    if (isFridayMorningAssignment(right)) return isFridayMorningAssignment(left);
    if (isFridayAfternoonAssignment(right)) return isFridayAfternoonAssignment(left);
    if (right.arrangement === "grupo_servico") {
      return left.arrangement === "grupo_servico" && left.field_service_group_id === right.field_service_group_id;
    }
    if (right.weekday === "sab") return left.weekday === "sab";
    if (right.arrangement === "todos_grupos") return left.arrangement === "todos_grupos";
    return left.weekday === right.weekday;
  }

  function lastFieldConductorDate(member: Member, assignment: FieldMinistryAssignment) {
    return (
      readyState.fieldMinistryAssignments
        .filter(
          (item) =>
            item.id !== assignment.id &&
            item.activity_date < assignment.activity_date &&
            item.conductor_member_id === member.id &&
            fieldAssignmentsShareRotation(item, assignment),
        )
        .sort((a, b) => b.activity_date.localeCompare(a.activity_date))[0]?.activity_date ?? null
    );
  }

  function totalFieldConductorAssignmentsForMember(member: Member, assignment: FieldMinistryAssignment, currentAssignmentId = "") {
    return readyState.fieldMinistryAssignments.filter(
      (item) =>
        item.id !== currentAssignmentId &&
        item.conductor_member_id === member.id &&
        fieldAssignmentsShareRotation(item, assignment),
    ).length;
  }

  function publicMeetingRolesForMember(member: Member, meeting: PublicMeeting, fieldDate: string) {
    const roles: string[] = [];
    if (meeting.meeting_date === fieldDate) {
      if (meeting.chairman_member_id === member.id) roles.push("presidente da reunião pública");
      if (meeting.watchtower_conductor_member_id === member.id) roles.push("dirigente de A Sentinela");
      if (meeting.watchtower_reader_member_id === member.id) roles.push("leitor de A Sentinela");
      if (samePersonName(meeting.public_talk_speaker, member.name)) roles.push("orador recebido");
    }
    if ((meeting.outgoing_date ?? meeting.meeting_date) === fieldDate && samePersonName(meeting.outgoing_speaker, member.name)) {
      roles.push("discurso fora");
    }
    return roles;
  }

  function publicMeetingConflictsForFieldAssignment(member: Member, assignment: FieldMinistryAssignment) {
    return readyState.publicMeetings
      .map((meeting) => ({
        meeting,
        roles: publicMeetingRolesForMember(member, meeting, assignment.activity_date),
      }))
      .filter(({ roles }) => roles.length > 0);
  }

  function fieldSameDayConductorNote(member: Member, assignment: FieldMinistryAssignment) {
    const sameDay = readyState.fieldMinistryAssignments.find(
      (item) => item.id !== assignment.id && item.activity_date === assignment.activity_date && item.conductor_member_id === member.id,
    );
    if (!sameDay) return null;
    return {
      level: "block" as const,
      text: `Já dirige campo neste dia em ${fieldArrangementLabel(sameDay.arrangement)}.`,
    };
  }

  function fieldConductorChoiceOption(member: Member, assignment: FieldMinistryAssignment) {
    const notes: MemberChoiceOption["notes"] = [];
    const lastDate = lastFieldConductorDate(member, assignment);
    const weeksSince = lastDate ? weeksBetweenDates(lastDate, assignment.activity_date) : 999;
    const away = timeAwayNote(member, assignment.activity_date);
    const sameDay = fieldSameDayConductorNote(member, assignment);
    if (away) notes.push(away);
    if (sameDay) notes.push(sameDay);
    if (!hasAnyPrivilege(member, ["dirigente_campo"])) {
      notes.push({ level: "warning", text: "Sem privilégio marcado para Dirigente de Campo." });
    }
    publicMeetingConflictsForFieldAssignment(member, assignment).forEach(({ roles }) => {
      notes.push({
        level: "warning",
        text: `Cruzamento com conferência pública em ${formatNumericDate(assignment.activity_date)}: ${roles.join(", ")}.`,
      });
    });

    const totalAssignments = totalFieldConductorAssignmentsForMember(member, assignment, assignment.id);
    return {
      member,
      detail: lastDate
        ? `Último campo (${fieldRotationName(assignment).toLowerCase()}): ${formatNumericDate(lastDate)} (${formatWeeksAgo(weeksSince)}) | ${totalAssignments} vez${totalAssignments === 1 ? "" : "es"} nessa rotação`
        : `Nunca dirigiu ${fieldRotationName(assignment)}`,
      notes,
      weeksSince,
      totalAssignments,
    };
  }

  function groupOverseerId(groupId: string | null) {
    return groupId ? readyState.fieldServiceGroups.find((group) => group.id === groupId)?.overseer_member_id ?? null : null;
  }

  function fieldConductorOptions(assignment: FieldMinistryAssignment, currentId: string | null | undefined) {
    // Sexta de manhã (8:45): dirigente fixo Participante 005.
    if (isFridayMorningAssignment(assignment)) {
      const morning = readyState.members.filter(
        (member) =>
          member.id === currentId ||
          (member.active && normalizeSearchText(member.name) === normalizeSearchText(FRIDAY_MORNING_CONDUCTOR_NAME)),
      );
      return morning.map((member) => fieldConductorChoiceOption(member, assignment));
    }
    const eldersOnly = isFirstSundayAllGroupsAssignment(assignment) || isSaoPauloHoliday(assignment.activity_date);
    const allCandidates = readyState.members
      .filter((member) => member.active)
      .filter((member) => member.id === currentId || member.privileges.includes("dirigente_campo"))
      .filter((member) => member.id === currentId || !fieldWeekendBlocksMember(member, assignment))
      .filter((member) => !eldersOnly || member.congregation_status === "anciao");
    const servantOrElderCandidates = allCandidates.filter(
      (member) =>
        member.id === currentId ||
        member.congregation_status === "servo_ministerial" ||
        member.congregation_status === "anciao",
    );
    const baseCandidates = assignment.weekday === "sab" || assignment.weekday === "dom" || isSaoPauloHoliday(assignment.activity_date)
      ? servantOrElderCandidates
      : allCandidates;
    const candidates = baseCandidates
      .filter((member) => {
        if (member.id === currentId) return true;
        if (isSaoPauloHoliday(assignment.activity_date) || isFirstSundayAllGroupsAssignment(assignment)) return true;
        if (assignment.field_service_group_id && member.field_service_group_id !== assignment.field_service_group_id) return false;
        return member.field_availability.includes(assignment.weekday);
      });
    const preferredOverseerId = groupOverseerId(assignment.field_service_group_id);

    return candidates
      .map((member) => {
        const option = fieldConductorChoiceOption(member, assignment);
        if (
          !isSaoPauloHoliday(assignment.activity_date) &&
          !isFirstSundayAllGroupsAssignment(assignment) &&
          member.id !== currentId &&
          !member.field_availability.includes(assignment.weekday)
        ) {
          option.notes.push({
            level: "warning",
            text: `${fieldWeekdayLabel(assignment.weekday)} não está marcado nos dias disponíveis.`,
          });
        }
        if (
          assignment.field_service_group_id &&
          member.field_service_group_id &&
          member.field_service_group_id !== assignment.field_service_group_id
        ) {
          option.notes.push({
            level: "warning",
            text: `Fora do ${groupName(assignment.field_service_group_id)}.`,
          });
        }
        if (preferredOverseerId === member.id && option.weeksSince < 999) {
          option.notes.push({ level: "info", text: "Superintendente do grupo; prioridade se todos já dirigiram." });
        }
        if (eldersOnly) {
          option.notes.push({ level: "info", text: "Primeiro domingo e feriados: somente anciãos para a saída com todos os grupos." });
        }
        if (fieldWeekendBlocksMember(member, assignment)) {
          option.notes.push({ level: "block", text: "Não dirigir campo aos sábados/domingos porque já dirige durante a semana." });
        }
        option.notes = option.notes.filter(
          (note, index, list) => list.findIndex((item) => item.text === note.text && item.level === note.level) === index,
        );
        return option;
      })
      .sort((left, right) => {
        const leftBlocks = left.notes.filter((note) => note.level === "block").length;
        const rightBlocks = right.notes.filter((note) => note.level === "block").length;
        if (leftBlocks !== rightBlocks) return leftBlocks - rightBlocks;
        const leftSameGroup =
          !assignment.field_service_group_id ||
          left.member.field_service_group_id === assignment.field_service_group_id
            ? 0
            : 1;
        const rightSameGroup =
          !assignment.field_service_group_id ||
          right.member.field_service_group_id === assignment.field_service_group_id
            ? 0
            : 1;
        if (leftSameGroup !== rightSameGroup) return leftSameGroup - rightSameGroup;
        if (preferredOverseerId && left.weeksSince < 999 && right.weeksSince < 999) {
          const leftOverseer = left.member.id === preferredOverseerId ? 0 : 1;
          const rightOverseer = right.member.id === preferredOverseerId ? 0 : 1;
          if (leftOverseer !== rightOverseer) return leftOverseer - rightOverseer;
        }
        return leftSameGroup - rightSameGroup || compareMemberChoiceOptions(left, right);
      });
  }

  function updatePublicMeetingDraft(patch: Partial<PublicMeetingDraft>) {
    setPublicMeetingForm((current) => ({ ...current, ...patch }));
  }

  function addSpeakerTheme() {
    const theme = resolvePublicTalkThemeInput(speakerThemeQuery, readyState.publicTalkThemes);
    if (!theme) {
      setNotice("Escolha um tema da lista para adicionar.");
      return;
    }
    setSpeakerThemeIds((current) => (current.includes(theme.id) ? current : [...current, theme.id]));
    setSpeakerThemeQuery("");
  }

  function updateSpeakerThemeAssignment(themeId: string, patch: Partial<{ meetingId: string; speaker: string }>) {
    setSpeakerThemeAssignments((current) => ({
      ...current,
      [themeId]: { ...(current[themeId] ?? { meetingId: "", speaker: "" }), ...patch },
    }));
  }

  function removeSpeakerTheme(themeId: string) {
    setSpeakerThemeIds((current) => current.filter((id) => id !== themeId));
  }

  function toggleSpeakerTheme(themeId: string) {
    setSpeakerThemeIds((current) => (current.includes(themeId) ? current.filter((id) => id !== themeId) : [...current, themeId]));
  }

  async function addOurSpeakerTalk() {
    if (!selectedOurSpeaker) {
      setNotice("Escolha um orador nosso antes de adicionar temas.");
      return;
    }
    const theme = resolvePublicTalkThemeInput(ourSpeakerThemeQuery, readyState.publicTalkThemes);
    if (!theme) {
      setNotice("Escolha um tema da lista para adicionar ao orador.");
      return;
    }
    await runAction(
      "addSpeakerTalk",
      { memberId: selectedOurSpeaker.id, themeId: theme.id },
      "Tema adicionado ao orador.",
    );
    setOurSpeakerThemeQuery("");
  }

  async function removeOurSpeakerTalk(talkId: string) {
    await runAction("removeSpeakerTalk", { id: talkId }, "Tema removido do orador.");
  }

  async function toggleOurSpeakerTalkTheme(themeId: string, checked: boolean) {
    if (!selectedOurSpeaker) {
      setNotice("Escolha um orador nosso antes de marcar temas.");
      return;
    }
    const existingTalkId = selectedOurSpeakerTalkByThemeId.get(themeId);
    if (checked && !existingTalkId) {
      await runAction("addSpeakerTalk", { memberId: selectedOurSpeaker.id, themeId }, "Tema adicionado ao orador.");
    }
    if (!checked && existingTalkId) {
      await removeOurSpeakerTalk(existingTalkId);
    }
  }

  function speakerPrivilegeLabel(member: Member) {
    if (member.congregation_status === "anciao") return "Ancião";
    if (member.congregation_status === "servo_ministerial") return "Servo Ministerial";
    return "Publicador";
  }

  function speakerPrivilegeSection(member: Member) {
    if (member.congregation_status === "anciao") return "ANCIÃOS";
    if (member.congregation_status === "servo_ministerial") return "SERVOS MINISTERIAIS";
    return "PUBLICADORES";
  }

  function shareOurSpeakerTalksWhatsApp() {
    if (!selectedOurSpeaker) {
      setNotice("Escolha um orador nosso para compartilhar.");
      return;
    }
    const talks = selectedOurSpeakerTalks.filter((item) => item.theme);
    if (talks.length === 0) {
      setNotice("Este orador ainda não tem temas cadastrados para compartilhar.");
      return;
    }
    const themeLines = talks
      .map(({ theme }) => `Nº ${String(theme?.number ?? 0).padStart(3, "0")} — ${theme?.title ?? ""}`)
      .join("\n");
    const message = [
      "*Discursos disponíveis*",
      "Temas:",
      `*Orador:* ${selectedOurSpeaker.name}`,
      `*Privilégio:* ${speakerPrivilegeLabel(selectedOurSpeaker)}`,
      "",
      "*Temas:*",
      speakerPrivilegeSection(selectedOurSpeaker),
      "",
      selectedOurSpeaker.name,
      "",
      themeLines,
    ].join("\n");
    const opened = window.open(`https://example.invalid/compartilhamento-desativado/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setNotice(opened ? "WhatsApp aberto com os temas do orador." : "Libere pop-ups para abrir o WhatsApp.");
  }

  function shareAuthorizedSpeakerTalksWhatsApp() {
    const sections = [
      { title: "ANCIÃOS", members: authorizedOutgoingSpeakerOptions.filter((member) => member.congregation_status === "anciao") },
      {
        title: "SERVOS MINISTERIAIS",
        members: authorizedOutgoingSpeakerOptions.filter((member) => member.congregation_status === "servo_ministerial"),
      },
    ]
      .map((section) => {
        const memberBlocks = section.members
          .map((member) => {
            const talks = (readyState.speakerTalks ?? [])
              .filter((talk) => talk.member_id === member.id)
              .map((talk) => readyState.publicTalkThemes.find((theme) => theme.id === talk.theme_id) ?? null)
              .filter((theme): theme is PublicTalkTheme => Boolean(theme))
              .sort((a, b) => a.number - b.number);
            if (talks.length === 0) return "";
            return [
              member.name,
              "",
              talks.map((theme) => `Nº ${String(theme.number).padStart(3, "0")} — ${theme.title}`).join("\n"),
            ].join("\n");
          })
          .filter(Boolean);
        return memberBlocks.length > 0 ? [section.title, "", memberBlocks.join("\n\n")].join("\n") : "";
      })
      .filter(Boolean);

    if (sections.length === 0) {
      setNotice("Nenhum orador com Discurso fora ativo tem temas cadastrados.");
      return;
    }

    const message = ["*Discursos disponíveis*", "Temas:", "", "*Temas:*", sections.join("\n\n")].join("\n");
    const opened = window.open(`https://example.invalid/compartilhamento-desativado/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setNotice(opened ? "WhatsApp aberto com os temas autorizados." : "Libere pop-ups para abrir o WhatsApp.");
  }

  async function assignSpeakerTheme(themeId: string) {
    const draft = speakerThemeAssignments[themeId];
    const meetingId = draft?.meetingId;
    const meeting = readyState.publicMeetings.find((item) => item.id === meetingId);
    if (!meeting) {
      setNotice("Escolha a data da reuniao para designar o tema.");
      return;
    }
    if (eventsForPublicMeeting(meeting, readyState.specialEvents, readyState.weeks).some((event) => event.type === "discurso_especial" || event.type === "visita_superintendente" || event.type === "assembleia" || event.type === "congresso")) {
      setNotice("Esta reunião tem um discurso definido em Eventos. Escolha outra data para este tema.");
      return;
    }
    await runAction(
      "updatePublicMeeting",
      { ...meeting, public_talk_theme_id: themeId, public_talk_speaker: draft.speaker.trim() || meeting.public_talk_speaker },
      "Tema e orador salvos para a reunião pública.",
    );
  }

  async function savePublicMeeting() {
    if (!selectedPublicMeeting || selectedPublicMeeting.no_public_meeting_event) return;
    const receivedTheme = resolvePublicTalkThemeInput(publicMeetingForm.public_talk_theme_query, readyState.publicTalkThemes);
    if (publicMeetingForm.public_talk_theme_query.trim() && !receivedTheme) {
      setNotice("Escolha um tema do discurso público na lista de pesquisa antes de salvar.");
      return;
    }
    const outgoingTheme = resolvePublicTalkThemeInput(publicMeetingForm.outgoing_talk_theme, readyState.publicTalkThemes);
    await runAction(
      "updatePublicMeeting",
      {
        ...selectedPublicMeeting,
        chairman_member_id: publicMeetingForm.chairman_member_id || null,
        watchtower_reader_member_id: selectedPublicCircuitVisitEvent ? null : publicMeetingForm.watchtower_reader_member_id || null,
        watchtower_study_id: publicMeetingForm.watchtower_study_id || null,
        public_talk_theme_id: receivedTheme?.id ?? null,
        public_talk_speaker: publicMeetingForm.public_talk_speaker,
        public_talk_speaker_congregation: publicMeetingForm.public_talk_speaker_congregation,
        outgoing_speaker: publicMeetingForm.outgoing_speaker,
        outgoing_talk_theme: outgoingTheme?.title ?? publicMeetingForm.outgoing_talk_theme,
        ...outgoingOverridesForDraft(selectedPublicMeeting, publicMeetingForm, monthDefaultFor(readyState.publicMeetingMonthDefaults, selectedPublicMeeting.meeting_date.slice(0, 7)), weekStartById.get(selectedPublicMeeting.week_id) ?? null),
        outgoing_song: publicMeetingForm.outgoing_song,
        notes: publicMeetingForm.notes,
        status: publicMeetingForm.status,
      },
      "Designação da reunião pública atualizada.",
    );
  }

  async function saveMonthDefaults(monthKey: string) {
    if (!monthKey) {
      setNotice("Selecione um mês para configurar.");
      return;
    }
    setOutgoingDateChoice(null);
    await runAction(
      "updatePublicMeetingMonthDefaults",
      {
        month_key: monthKey,
        default_weekday: monthConfigForm.default_weekday,
        default_time: monthConfigForm.default_time || null,
        destination_congregation: monthConfigForm.destination_congregation || null,
        destination_address: monthConfigForm.destination_address || null,
      },
      "Configuração do mês salva.",
    );
    setMonthConfigOpen(false);
  }

  async function resetMeetingToMonthDefault(meetingId: string) {
    if (!meetingId) return;
    setOutgoingDateChoice(null);
    await runAction(
      "resetPublicMeetingToMonthDefault",
      { id: meetingId },
      "Reunião voltou ao padrão do mês.",
    );
  }

  async function saveMechanicalMonth(publish = false) {
    await runAction(
      "updateMechanicalMonth",
      {
        month_key: activeMechanicalMonth,
        status: publish ? "confirmada" : "rascunho",
        entries: mechanicalAssignmentsForDisplay.map((assignment) => {
          const draft = mechanicalDrafts[assignment.id] ?? createMechanicalDraft(assignment);
          return {
            id: assignment.id,
            ...Object.fromEntries(mechanicalRoleFields.map((field) => [field.key, draft[field.key] || null])),
          };
        }),
      },
      publish ? "Mecânicas do mês publicadas." : "Mecânicas do mês salvas em rascunho.",
    );
  }

  async function clearMechanicalMonth() {
    if (!window.confirm(`Limpar todas as designações mecânicas de ${monthTitle(activeMechanicalMonth)}? Os nomes serão removidos e o mês ficará em rascunho. As datas e os registros de assistência serão mantidos.`)) return;
    await runAction("clearMechanicalMonth", { month_key: activeMechanicalMonth }, "Designações mecânicas do mês limpas. A escala ficou em rascunho.");
  }

  function canReportAttendanceForAssignment(assignment: MechanicalAssignment) {
    const canActAsAttendant =
      currentMember?.privileges.includes("indicador_externo") ||
      currentMember?.privileges.includes("indicador_interno");
    return (
      canEditModule(MECHANICAL_NAV) ||
      currentMember?.congregation_status === "anciao" ||
      canActAsAttendant ||
      assignment.external_attendant_member_id === readyState.user.id ||
      assignment.internal_attendant_member_id === readyState.user.id
    );
  }

  function validatedAttendanceDraft(assignment: MechanicalAssignment) {
    const draft = mechanicalDrafts[assignment.id] ?? createMechanicalDraft(assignment);
    const total = Number(draft.attendance_total);
    const inPerson = Number(draft.attendance_in_person);
    const zoom = Number(draft.attendance_zoom);
    if (![total, inPerson, zoom].every((value) => Number.isInteger(value) && value >= 0)) {
      setNotice("Preencha total, presencial e zoom com números válidos.");
      return null;
    }
    if (inPerson + zoom !== total) {
      setNotice("Confira a assistência: presencial + zoom precisa bater com o total.");
      return null;
    }
    return { draft, total, inPerson, zoom };
  }

  async function saveAttendanceRecord(assignment: MechanicalAssignment, success = "Assistência salva.") {
    const attendance = validatedAttendanceDraft(assignment);
    if (!attendance) return false;

    return runAction(
      "recordMechanicalAttendance",
      {
        id: assignment.id,
        attendance_total: attendance.draft.attendance_total,
        attendance_in_person: attendance.draft.attendance_in_person,
        attendance_zoom: attendance.draft.attendance_zoom,
      },
      success,
    );
  }

  async function sendAttendanceReport(assignment: MechanicalAssignment) {
    const attendance = validatedAttendanceDraft(assignment);
    if (!attendance) return;

    const saved = await saveAttendanceRecord(assignment, "Assistência registrada.");
    if (!saved) return;
    const andre = readyState.members.find((member) => normalizeSearchText(member.name) === normalizeSearchText("Participante 001"));
    const phone = normalizePhoneForWhatsApp(readyState.attendanceReportWhatsApp || andre?.whatsapp_phone || null);
    const message = `Boa noite participante fictício, a assistência da reunião de ${formatNumericDate(assignment.assignment_date)} foi de ${attendance.total} no total, sendo ${attendance.inPerson} presencialmente e ${attendance.zoom} de forma online por meio do zoom. O Relatório já foi preenchido e está no quadro de anúncios.`;
    if (!phone) {
      setNotice(`Relatório salvo, mas o WhatsApp do Participante 001 não está cadastrado. Mensagem: ${message}`);
      return;
    }
    const opened = window.open(`https://example.invalid/compartilhamento-desativado/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setNotice(opened ? "Relatório salvo e WhatsApp aberto para envio ao participante fictício." : "Relatório salvo. Libere pop-ups para abrir o WhatsApp.");
  }

  async function saveFieldMinistryAssignment(assignment: FieldMinistryAssignment) {
    const draft = fieldMinistryDrafts[assignment.id] ?? createFieldMinistryDraft(assignment);
    await runAction(
      "updateFieldMinistryAssignment",
      {
        id: assignment.id,
        start_time: draft.start_time,
        conductor_member_id: draft.conductor_member_id || null,
        guest_conductor_name: draft.guest_conductor_name || null,
        location: draft.location,
        notes: draft.notes,
        status: draft.status,
      },
      "Designação do ministério de campo atualizada.",
    );
  }

  async function generateFieldMinistryMonth() {
    await runAction(
      "generateFieldMinistryMonth",
      { month: activeFieldMinistryMonth },
      `Ministério de campo de ${monthTitle(activeFieldMinistryMonth)} preparado.`,
    );
  }

  async function syncWatchtowerStudies() {
    await runAction("syncWatchtowerStudies", {}, "A Sentinela verificada e estudos disponíveis atualizados.");
  }

  async function importPublicMeetingHistory() {
    await runAction("importPublicMeetingHistory", {}, "Histórico da conferência pública importado.");
  }

  function printPublicMeetingSheet() {
    if (publicMeetingsForPrint.length === 0) {
      setNotice("Nenhuma reunião pública encontrada para imprimir neste mês.");
      return;
    }
    const html = createPublicMeetingSvgPrintHtml({
      meetings: publicMeetingsForPrint,
      memberName,
      themeTitle: publicTalkThemeTitle,
      circuitVisitForDate,
    });
    openPrintDocument(html, "O navegador bloqueou a janela de impressão. Libere pop-ups e tente de novo.");
  }

  function publicMeetingImageSvgs() {
    return chunkItems(publicMeetingsForPrint, 5).map((pageMeetings) =>
      createPublicMeetingPageSvg({
        meetings: pageMeetings,
        memberName,
        themeTitle: publicTalkThemeTitle,
        circuitVisitForDate,
      }),
    );
  }

  async function downloadPublicMeetingImage(format: "png" | "jpg") {
    if (publicMeetingsForPrint.length === 0) {
      setNotice("Nenhuma reunião pública encontrada para gerar imagem neste mês.");
      return;
    }
    setSheetImageBusy(true);
    try {
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const blobs = await createSvgImageBlobs(publicMeetingImageSvgs(), mimeType);
      const monthKey = publicMeetingsForPrint[0]?.meeting_date.slice(0, 7) ?? readyWeek.meeting_date.slice(0, 7);
      blobs.forEach((blob, index) => downloadBlob(blob, publicMeetingFileName(monthKey, format, blobs.length > 1 ? index + 1 : 0)));
      setNotice(`Imagem ${format.toUpperCase()} da reunião pública baixada em alta resolução.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível gerar a imagem da reunião pública.");
    } finally {
      setSheetImageBusy(false);
    }
  }

  async function sharePublicMeetingImage() {
    if (publicMeetingsForPrint.length === 0) {
      setNotice("Nenhuma reunião pública encontrada para compartilhar neste mês.");
      return;
    }
    setSheetImageBusy(true);
    try {
      const blobs = await createSvgImageBlobs(publicMeetingImageSvgs(), "image/png");
      const monthKey = publicMeetingsForPrint[0]?.meeting_date.slice(0, 7) ?? readyWeek.meeting_date.slice(0, 7);
      if (navigator.share && typeof File !== "undefined") {
        const files = blobs.map((blob, index) => new File([blob], publicMeetingFileName(monthKey, "png", blobs.length > 1 ? index + 1 : 0), { type: "image/png" }));
        const shareData = {
          title: `Reunião Pública - ${monthTitle(monthKey)}`,
          text: `Programação da reunião pública - ${monthTitle(monthKey)}`,
          files,
        };

        if (!("canShare" in navigator) || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setNotice("Imagem da reunião pública enviada para o compartilhamento do aparelho. Escolha o WhatsApp.");
          return;
        }
      }

      blobs.forEach((blob, index) => downloadBlob(blob, publicMeetingFileName(monthKey, "png", blobs.length > 1 ? index + 1 : 0)));
      setNotice("Este navegador não compartilha arquivo direto. Baixei o PNG em alta resolução para você enviar no WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("Compartilhamento cancelado.");
      } else {
        setNotice(error instanceof Error ? error.message : "Não foi possível compartilhar a imagem da reunião pública.");
      }
    } finally {
      setSheetImageBusy(false);
    }
  }

  function selectedOutgoingMeeting() {
    if (!selectedPublicMeeting?.outgoing_speaker) {
      setNotice("Escolha e salve um orador enviado antes de gerar a folha.");
      return null;
    }
    return selectedPublicMeeting;
  }

  // Aplica a heranca da configuracao mensal (override -> padrao do mes -> vazio).
  function resolvedForMeeting(meeting: PublicMeeting): ResolvedOutgoing {
    return resolveOutgoing(meeting, outgoingListDefault, weekStartById.get(meeting.week_id) ?? null);
  }

  function printOutgoingSpeakerSheet() {
    const meeting = selectedOutgoingMeeting();
    if (!meeting) return;
    openPrintDocument(
      createA4SvgPrintHtml("Designação de Conferência Pública", [createOutgoingSpeakerSvg(meeting, resolvedForMeeting(meeting))]),
      "Não foi possível abrir a impressão da Conferência Pública. Libere pop-ups e tente de novo.",
    );
  }

  // Imprime todas as designacoes do mes em grade 2x2 por pagina A4.
  function printOutgoingMonthSheets() {
    const meetings = publicMeetingsOfActiveMonth.filter((meeting) => meeting.outgoing_speaker);
    if (meetings.length === 0) {
      setNotice("Nenhuma reunião com orador enviado neste mês para imprimir.");
      return;
    }
    const sheets = meetings.map((meeting) => buildOutgoingSheetData(meeting, resolvedForMeeting(meeting)));
    openPrintDocument(
      createOutgoingSpeakerMonthPrintHtml(sheets),
      "Não foi possível abrir a impressão do mês. Libere pop-ups e tente de novo.",
    );
  }

  async function downloadOutgoingSpeakerImage(format: "png" | "jpg") {
    const meeting = selectedOutgoingMeeting();
    if (!meeting) return;
    setSheetImageBusy(true);
    try {
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const blob = await createSvgImageBlob(createOutgoingSpeakerSvg(meeting, resolvedForMeeting(meeting)), mimeType);
      downloadBlob(blob, outgoingSpeakerFileName(meeting, format));
      setNotice(`Folha do discurso fora baixada em ${format.toUpperCase()}.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível gerar a folha do discurso fora.");
    } finally {
      setSheetImageBusy(false);
    }
  }

  async function shareOutgoingSpeakerImage() {
    const meeting = selectedOutgoingMeeting();
    if (!meeting) return;
    setSheetImageBusy(true);
    try {
      const blob = await createSvgImageBlob(createOutgoingSpeakerSvg(meeting, resolvedForMeeting(meeting)), "image/png");
      if (navigator.share && typeof File !== "undefined") {
        const file = new File([blob], outgoingSpeakerFileName(meeting, "png"), { type: "image/png" });
        const shareData = {
          title: `Discurso fora - ${meeting.outgoing_speaker}`,
          text: `Designação de discurso fora - ${meeting.outgoing_speaker}`,
          files: [file],
        };
        if (!("canShare" in navigator) || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setNotice("Folha enviada para o compartilhamento do aparelho. Escolha o WhatsApp.");
          return;
        }
      }
      downloadBlob(blob, outgoingSpeakerFileName(meeting, "png"));
      setNotice("Este navegador não compartilha arquivo direto. Baixei o PNG para enviar no WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") setNotice("Compartilhamento cancelado.");
      else setNotice(error instanceof Error ? error.message : "Não foi possível compartilhar a folha do discurso fora.");
    } finally {
      setSheetImageBusy(false);
    }
  }

  function printMechanicalSchedule() {
    if (mechanicalAssignmentsForPrint.length === 0) {
      setNotice("Nenhuma designação mecânica encontrada para imprimir neste mês.");
      return;
    }
    const html = createMechanicalSvgPrintHtml({
      assignments: mechanicalAssignmentsForPrint,
      memberName,
      monthKey: mechanicalPrintMonth,
    });
    openPrintDocument(html, "Não foi possível abrir a impressão de A/V. Libere pop-ups e tente de novo.");
  }

  async function downloadMechanicalImage(format: "png" | "jpg") {
    if (mechanicalAssignmentsForPrint.length === 0) {
      setNotice("Nenhuma designação mecânica encontrada para gerar imagem neste mês.");
      return;
    }
    setSheetImageBusy(true);
    try {
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const blob = await createSvgImageBlob(
        createMechanicalImageSvg({ assignments: mechanicalAssignmentsForPrint, memberName, monthKey: mechanicalPrintMonth }),
        mimeType,
      );
      downloadBlob(blob, mechanicalFileName(mechanicalPrintMonth, format));
      setNotice(`Imagem ${format.toUpperCase()} de A/V baixada em alta resolução.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível gerar a imagem de A/V.");
    } finally {
      setSheetImageBusy(false);
    }
  }

  async function shareMechanicalImage() {
    if (mechanicalAssignmentsForPrint.length === 0) {
      setNotice("Nenhuma designação mecânica encontrada para compartilhar neste mês.");
      return;
    }
    setSheetImageBusy(true);
    try {
      const blob = await createSvgImageBlob(
        createMechanicalImageSvg({ assignments: mechanicalAssignmentsForPrint, memberName, monthKey: mechanicalPrintMonth }),
        "image/png",
      );
      if (navigator.share && typeof File !== "undefined") {
        const file = new File([blob], mechanicalFileName(mechanicalPrintMonth, "png"), { type: "image/png" });
        const shareData = {
          title: `A/V - ${monthTitle(mechanicalPrintMonth)}`,
          text: `Programação de A/V - ${monthTitle(mechanicalPrintMonth)}`,
          files: [file],
        };

        if (!("canShare" in navigator) || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setNotice("Imagem de A/V enviada para o compartilhamento do aparelho. Escolha o WhatsApp.");
          return;
        }
      }

      downloadBlob(blob, mechanicalFileName(mechanicalPrintMonth, "png"));
      setNotice("Este navegador não compartilha arquivo direto. Baixei o PNG em alta resolução para você enviar no WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("Compartilhamento cancelado.");
      } else {
        setNotice(error instanceof Error ? error.message : "Não foi possível compartilhar a imagem de A/V.");
      }
    } finally {
      setSheetImageBusy(false);
    }
  }

  function createCurrentFieldMinistryPrintHtml() {
    if (fieldMinistryAssignmentsForPrint.length === 0) {
      setNotice("Nenhuma designação de campo encontrada para imprimir neste mês.");
      return null;
    }
    return createFieldMinistrySvgPrintHtml({
      assignments: fieldMinistryAssignmentsForPrint,
      memberName,
      groupName,
      monthKey: fieldMinistryPrintMonth,
    });
  }

  function printFieldMinistrySchedule() {
    const html = createCurrentFieldMinistryPrintHtml();
    if (!html) return;
    openPrintDocument(html, "Não foi possível abrir a impressão do campo. Libere pop-ups e tente de novo.");
  }

  async function downloadFieldMinistryImage(format: "png" | "jpg") {
    if (fieldMinistryAssignmentsForPrint.length === 0) {
      setNotice("Nenhuma designação de campo encontrada para gerar imagem neste mês.");
      return;
    }
    setFieldImageBusy(true);
    try {
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const blob = await createFieldMinistryImageBlob({
        assignments: fieldMinistryAssignmentsForPrint,
        memberName,
        groupName,
        monthKey: fieldMinistryPrintMonth,
        mimeType,
      });
      downloadBlob(blob, fieldMinistryFileName(fieldMinistryPrintMonth, format));
      setNotice(`Imagem ${format.toUpperCase()} do campo baixada em alta resolução.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Não foi possível gerar a imagem do campo.");
    } finally {
      setFieldImageBusy(false);
    }
  }

  async function shareFieldMinistryImage() {
    if (fieldMinistryAssignmentsForPrint.length === 0) {
      setNotice("Nenhuma designação de campo encontrada para compartilhar neste mês.");
      return;
    }
    setFieldImageBusy(true);
    try {
      const blob = await createFieldMinistryImageBlob({
        assignments: fieldMinistryAssignmentsForPrint,
        memberName,
        groupName,
        monthKey: fieldMinistryPrintMonth,
        mimeType: "image/png",
      });
      if (navigator.share && typeof File !== "undefined") {
        const file = new File([blob], fieldMinistryFileName(fieldMinistryPrintMonth, "png"), { type: "image/png" });
        const shareData = {
          title: `Campo - ${monthTitle(fieldMinistryPrintMonth)}`,
          text: `Programação do campo - ${monthTitle(fieldMinistryPrintMonth)}`,
          files: [file],
        };

        if (!("canShare" in navigator) || navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setNotice("Imagem do campo enviada para o compartilhamento do aparelho. Escolha o WhatsApp.");
          return;
        }
      }

      downloadBlob(blob, fieldMinistryFileName(fieldMinistryPrintMonth, "png"));
      setNotice("Este navegador não compartilha arquivo direto. Baixei o PNG em alta resolução para você enviar no WhatsApp.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("Compartilhamento cancelado.");
      } else {
        setNotice(error instanceof Error ? error.message : "Não foi possível compartilhar a imagem do campo.");
      }
    } finally {
      setFieldImageBusy(false);
    }
  }

  function openPrintDocument(html: string, blockedMessage: string) {
    const printWindow = window.open("", "_blank", "width=980,height=900");
    if (!printWindow) {
      setNotice(blockedMessage);
      return;
    }
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.setTimeout(() => printWindow.print(), 250);
  }

  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = editingMemberId ? "updateMember" : "createMember";
    await runAction(
      action,
      { ...memberForm, memberId: editingMemberId },
      editingMemberId ? "Participante atualizado." : "Participante cadastrado.",
    );
    resetMemberForm();
  }

  function editMember(member: Member) {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name,
      participationStatus: member.participation_status === "mudou_congregacao" ? "mudou_congregacao" : member.active ? "ativo" : "inativo",
      gender: member.gender ?? null,
      email: member.email ?? "",
      whatsappPhone: member.whatsapp_phone ?? "",
      role: member.role,
      congregationStatus: member.congregation_status,
      pioneerRoles: member.pioneer_roles,
      fieldServiceGroupId: member.field_service_group_id ?? "",
      fieldAvailability: member.field_availability,
      privileges: member.privileges,
      editableModules: member.editable_modules ?? [],
    });
    // Leva a tela até o formulário de edição (evita ter que rolar para cima).
    if (typeof document !== "undefined") {
      window.setTimeout(() => {
        document.getElementById("member-form-anchor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  function resetMemberForm() {
    setEditingMemberId("");
    setMemberForm(createEmptyMemberForm());
  }

  async function deleteMember(member: Member) {
    const confirmed = window.confirm(
      `Excluir ${member.name}? Isso remove o cadastro, as folgas e tira essa pessoa das designações e grupos onde ela aparece.`,
    );
    if (!confirmed) return;
    await runAction("deleteMember", { memberId: member.id }, "Participante excluído.");
    if (editingMemberId === member.id) resetMemberForm();
  }

  async function submitFieldGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(
      fieldGroupForm.id ? "updateFieldServiceGroup" : "createFieldServiceGroup",
      fieldGroupForm,
      fieldGroupForm.id ? "Grupo de campo atualizado." : "Grupo de campo cadastrado.",
    );
    resetFieldGroupForm();
  }

  function editFieldGroup(group: FieldServiceGroup) {
    setFieldGroupForm({
      id: group.id,
      name: group.name,
      overseerMemberId: group.overseer_member_id ?? "",
      assistantMemberId: group.assistant_member_id ?? "",
    });
  }

  function resetFieldGroupForm() {
    setFieldGroupForm(createEmptyFieldGroupForm());
  }

  async function syncJwPrograms() {
    await runAction("syncJwPrograms", {}, "Apostilas verificadas e semanas disponíveis atualizadas.");
  }

  async function submitSpecialEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await runAction(
      specialEventForm.id ? "updateSpecialEvent" : "createSpecialEvent",
      eventForm,
      specialEventForm.id ? "Evento atualizado." : "Evento cadastrado.",
    );
    if (saved) resetSpecialEventForm();
  }

  function editSpecialEvent(event: SpecialEvent) {
    setSpecialEventForm({
      specialTalkSpeaker: event.special_talk_speaker ?? "",
      id: event.id,
      type: event.type,
      title: event.title,
      startDate: event.start_date,
      endDate: event.end_date,
      circuitOverseerName: event.circuit_overseer_name ?? "",
      circuitOverseerWife: event.circuit_overseer_wife ?? "",
      midweekServiceTalkTitle: event.midweek_service_talk_title ?? "",
      midweekServiceTalkSong: event.midweek_service_talk_song ?? "",
      weekendPublicTalkTitle: event.weekend_public_talk_title ?? "",
      weekendFinalTalkTitle: event.weekend_final_talk_title ?? "",
      weekendFinalTalkSong: event.weekend_final_talk_song ?? "",
      notes: event.notes ?? "",
    });
  }

  function resetSpecialEventForm() {
    setSpecialEventForm(createEmptySpecialEventForm());
  }

  async function deleteSpecialEvent(event: SpecialEvent) {
    const confirmed = window.confirm(`Excluir o evento "${event.title}"?`);
    if (!confirmed) return;
    await runAction("deleteSpecialEvent", { id: event.id }, "Evento excluído.");
    if (specialEventForm.id === event.id) resetSpecialEventForm();
  }

  async function saveSelectedWhatsApp() {
    if (!selectedS89Member) return;
    await runAction(
      "updateMemberWhatsApp",
      { memberId: selectedS89Member.id, whatsappPhone: whatsAppForm },
      "WhatsApp atualizado para o participante.",
    );
  }

  async function downloadS89Png() {
    if (!selectedS89Data) return null;
    const blob = await createS89PngBlob(selectedS89Data);
    downloadBlob(blob, s89FileName(selectedS89Data, "png"));
    return blob;
  }

  async function downloadS89Pdf() {
    if (!selectedS89Data) return;
    const canvas = await createS89Canvas(selectedS89Data);
    const pdfBlob = createPdfFromJpeg(canvas);
    downloadBlob(pdfBlob, s89FileName(selectedS89Data, "pdf"));
  }

  async function sendS89WhatsApp() {
    if (!selectedS89Data || !selectedS89Member) return;
    if (supportsS89FileShare()) {
      const result = await shareS89Image(selectedS89Data);
      if (result.status === "shared") {
        setNotice("Imagem da S-89 enviada para o compartilhamento. Escolha o WhatsApp na tela do aparelho.");
        return;
      }
      if (result.status === "cancelled") {
        setNotice("Compartilhamento cancelado.");
        return;
      }
    }

    const message = buildWhatsAppMessage(selectedS89Data);
    const phone = normalizePhoneForWhatsApp(whatsAppForm || selectedS89Member.whatsapp_phone);
    const whatsappWindow = phone
      ? window.open(
          `https://example.invalid/compartilhamento-desativado/${phone}?text=${encodeURIComponent(message)}`,
          "_blank",
          "noopener,noreferrer",
        )
      : null;
    const blob = await createS89PngBlob(selectedS89Data);
    downloadBlob(blob, s89FileName(selectedS89Data, "png"));
    if (!phone) {
      setNotice("Imagem baixada. Cadastre o WhatsApp do participante para abrir a conversa automaticamente.");
      return;
    }
    setNotice(
      whatsappWindow
        ? "Este navegador não anexou a imagem direto. O PNG foi baixado e a conversa foi aberta para anexo manual."
        : "PNG baixado. Se o WhatsApp não abriu, libere pop-ups e tente de novo.",
    );
  }

  async function shareS89() {
    if (!selectedS89Data) return;
    const result = await shareS89Image(selectedS89Data);
    if (result.status === "shared") {
      setNotice("Imagem da S-89 enviada para o compartilhamento do aparelho.");
    } else if (result.status === "cancelled") {
      setNotice("Compartilhamento cancelado.");
    } else {
      setNotice("Este navegador não consegue compartilhar arquivo PNG diretamente. Use Baixar PNG.");
    }
  }

  function printSheet() {
    setActiveNav("Folha");
    window.setTimeout(() => window.print(), 80);
  }

  function openAccessWhatsApp(access: NonNullable<ActionResponse["generatedAccessCode"]>, preparedWindow?: Window | null) {
    const phone = normalizePhoneForWhatsApp(access.whatsappPhone);
    if (!phone) {
      preparedWindow?.close();
      return false;
    }
    const url = `https://example.invalid/compartilhamento-desativado/${phone}?text=${encodeURIComponent(buildAccessMessage(access))}`;
    if (preparedWindow && !preparedWindow.closed) {
      preparedWindow.location.href = url;
      return true;
    }
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    return Boolean(opened);
  }

  function buildAccessMessage(access: NonNullable<ActionResponse["generatedAccessCode"]>) {
    const appUrl = `${window.location.origin}/`;
    const greetingName = access.memberName ? ` ${access.memberName.split(/\s+/)[0]}` : "";
    return `Olá${greetingName}! Segue seu acesso ao Designa Fácil — Edição acadêmica.\n\nLink: ${appUrl}\nE-mail: ${access.email}\nCódigo de primeiro acesso: ${access.code}\n\nAo entrar pela primeira vez, crie sua senha. Depois você poderá acessar com e-mail ou WhatsApp cadastrado e senha.`;
  }

  async function installApp() {
    if (isStandaloneApp) {
      setNotice("O Designa Fácil — Edição acadêmica já está aberto em modo aplicativo.");
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice.catch(() => null);
      setInstallPrompt(null);
      setNotice(
        choice?.outcome === "accepted"
          ? "Instalação iniciada."
          : "Instalação cancelada. Você pode tentar novamente pelo menu do navegador.",
      );
      return;
    }

    setNotice(
      "No iPhone, toque em Compartilhar e depois em Adicionar à Tela de Início. No Android, toque no menu do navegador e escolha Instalar app.",
    );
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(creatingPassword ? loginForm : { ...loginForm, newPassword: "" }),
      });
      const data = (await response.json()) as { error?: string; needsPasswordSetup?: boolean; memberName?: string | null };
      if (!response.ok) {
        setNotice(data.error ?? "Não foi possível entrar. Confira o e-mail e o código.");
        return;
      }
      if (data.needsPasswordSetup) {
        setPasswordSetupRequired(true);
        setFirstAccessMode(true);
        setLoginForm((current) => ({ ...current, newPassword: "" }));
        setNotice(data.memberName ? `Olá ${data.memberName}. Crie sua senha para concluir o primeiro acesso.` : "Crie sua senha para concluir o primeiro acesso.");
        return;
      }
      setPasswordSetupRequired(false);
      setFirstAccessMode(false);
      setLoginForm({ identifier: "", secret: "", newPassword: "" });
      await loadState();
      setNotice("Login realizado.");
    } catch {
      setNotice("Não foi possível entrar agora. Tente novamente em instantes.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setState(null);
      setSelectedWeekId("");
      setNotice("Sessão encerrada. Entre novamente com e-mail ou WhatsApp e senha.");
      setBusy(false);
    }
  }

  async function submitAway(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction("addTimeAway", awayForm, "Folga registrada.");
  }

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const associatedMember =
      (inviteForm.memberId ? memberById.get(inviteForm.memberId) : null) ??
      memberByEmail.get(inviteForm.email.trim().toLowerCase()) ??
      null;
    const whatsappPhone = inviteForm.whatsappPhone || associatedMember?.whatsapp_phone || "";
    const whatsappWindow = whatsappPhone ? window.open("about:blank", "_blank") : null;
    await runAction(
      "createInvitation",
      {
        ...inviteForm,
        memberId: inviteForm.memberId || associatedMember?.id || "",
        whatsappPhone,
      },
      "Código de acesso preparado.",
      { whatsappWindow },
    );
    setInviteForm({ memberId: "", email: "", whatsappPhone: "", role: "publicador" });
  }

  async function generateInviteCode(email: string, role: AppRole, whatsappPhone: string | null, memberId: string | null) {
    const whatsappWindow = whatsappPhone ? window.open("about:blank", "_blank") : null;
    await runAction(
      "createInvitation",
      { email, role, whatsappPhone: whatsappPhone ?? "", memberId: memberId ?? "" },
      "Novo código preparado.",
      { whatsappWindow },
    );
  }

  function selectInviteMember(memberId: string) {
    const member = memberById.get(memberId) ?? null;
    setInviteForm((current) => ({
      ...current,
      memberId,
      email: member?.email ?? current.email,
      whatsappPhone: member?.whatsapp_phone ?? current.whatsappPhone,
      role: member?.role ?? current.role,
    }));
  }

  async function updateAssignment(assignment: Assignment, patch: Partial<Assignment>) {
    const assigneeMemberId = Object.prototype.hasOwnProperty.call(patch, "assignee_member_id")
      ? patch.assignee_member_id ?? ""
      : assignment.assignee_member_id ?? "";
    let assistantMemberId = Object.prototype.hasOwnProperty.call(patch, "assistant_member_id")
      ? patch.assistant_member_id ?? ""
      : assignment.assistant_member_id ?? "";
    if (Object.prototype.hasOwnProperty.call(patch, "assignee_member_id") && !sameGenderPair(state?.members.find((member) => member.id === assigneeMemberId), state?.members.find((member) => member.id === assistantMemberId))) {
      assistantMemberId = "";
    }
    return await runAction(
      "updateAssignment",
      {
        assignmentId: assignment.id,
        assigneeMemberId,
        assistantMemberId,
        status: patch.status ?? assignment.status,
        force: true,
      },
      "Designação atualizada.",
    );
  }

  function togglePrivilege(privilege: string) {
    setMemberForm((current) => {
      const exists = current.privileges.includes(privilege);
      return {
        ...current,
        privileges: exists
          ? current.privileges.filter((item) => item !== privilege)
          : [...current.privileges, privilege],
      };
    });
  }

  function togglePioneerRole(role: PioneerRole) {
    setMemberForm((current) => {
      const exists = current.pioneerRoles.includes(role);
      return {
        ...current,
        pioneerRoles: exists
          ? current.pioneerRoles.filter((item) => item !== role)
          : [...current.pioneerRoles, role],
      };
    });
  }

  function toggleFieldDay(day: FieldDay) {
    setMemberForm((current) => {
      const exists = current.fieldAvailability.includes(day);
      return {
        ...current,
        fieldAvailability: exists
          ? current.fieldAvailability.filter((item) => item !== day)
          : [...current.fieldAvailability, day],
      };
    });
  }

  function toggleEditableModule(module: EditableModule) {
    setMemberForm((current) => {
      const exists = current.editableModules.includes(module);
      return {
        ...current,
        editableModules: exists
          ? current.editableModules.filter((item) => item !== module)
          : [...current.editableModules, module],
      };
    });
  }

  return (
    <main className="app-shell">
      <button
        aria-controls="primary-navigation"
        aria-expanded={mobileNavOpen}
        aria-label={mobileNavOpen ? "Fechar menu" : "Abrir menu"}
        className="mobile-nav-toggle"
        onClick={() => setMobileNavOpen((open) => !open)}
        type="button"
      >
        <span aria-hidden="true">☰</span>
      </button>
      <aside className={`side-nav ${mobileNavOpen ? "mobile-open" : ""}`} aria-label="Navegação principal">
        <div className="brand-lockup">
          <img alt="" className="app-mark" src="/demo-icon.svg" />
          <div>
            <strong>{APP_NAME}</strong>
            <span>Dados fictícios</span>
          </div>
        </div>
        <nav id="primary-navigation">
          {visibleNavItems.map((item) => (
            <button
              aria-current={currentNav === item ? "page" : undefined}
              className={currentNav === item ? "active" : ""}
              key={item}
              onClick={() => {
                setActiveNav(item);
                setMobileNavOpen(false);
              }}
              type="button"
              title={item}
            >
              <span className="nav-item-short" aria-hidden="true">{navShortLabel(item)}</span>
              <span className="nav-item-label">{item}</span>
            </button>
          ))}
        </nav>
        <div className="user-card">
          <span>{roleLabel(readyState.user.role)}</span>
          <strong>{readyState.user.displayName}</strong>
          <small>{readyState.user.email ?? "Sessão ativa"}</small>
          <button className="secondary-button compact-button" disabled={busy} onClick={signOut} type="button">
            Sair
          </button>
        </div>
      </aside>

      <section className="workbench">
        <header className="top-strip">
          <div>
            <span className="eyebrow">{readyState.congregation.name} - {readyState.congregation.city}</span>
            <h1>{pageHeading}</h1>
          </div>
          <div className="alerts-bell-wrap">
            <button
              type="button"
              className="alerts-bell"
              aria-label={`Avisos (${personalAlerts.length})`}
              onClick={() => setAlertsOpen((open) => !open)}
            >
              <span aria-hidden="true">🔔</span>
              {personalAlerts.length > 0 ? <span className="alerts-badge">{personalAlerts.length}</span> : null}
            </button>
            {alertsOpen ? (
              <div className="alerts-dropdown" role="menu">
                <div className="alerts-dropdown-head">Avisos</div>
                {personalAlerts.length > 0 ? (
                  personalAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      type="button"
                      className={`alerts-dropdown-item ${alert.tone} ${alert.nav ? "clickable" : ""}`}
                      onClick={() => {
                        if (alert.nav) {
                          setActiveNav(alert.nav);
                          setAlertsOpen(false);
                        }
                      }}
                    >
                      <strong>{alert.title}</strong>
                      <span>{alert.message}</span>
                    </button>
                  ))
                ) : (
                  <div className="alerts-empty">Nenhum aviso no momento.</div>
                )}
              </div>
            ) : null}
          </div>
          {[DESIGNACAO_NAV, PUBLIC_MEETING_NAV, MECHANICAL_NAV, "Folha"].includes(currentNav) ? (
          <div className="week-picker">
            {currentNav === PUBLIC_MEETING_NAV ? (
              <label>
                <span>Mês</span>
                <select
                  value={selectedPublicMeetingMonth}
                  onChange={(event) => {
                    const meeting = readyState.publicMeetings
                      .filter((item) => item.meeting_date.startsWith(event.target.value))
                      .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))[0];
                    if (meeting) {
                      setOutgoingDateChoice(null);
                      setSelectedWeekId(meeting.week_id);
                    }
                  }}
                >
                  {publicMeetingMonthOptions.map((monthKey) => (
                    <option key={monthKey} value={monthKey}>{monthTitle(monthKey)}</option>
                  ))}
                </select>
              </label>
            ) : (
            <label>
              <span>Semana</span>
              <select
                value={readyWeek.id}
                onChange={(event) => {
                  setSelectedWeekId(event.target.value);
                  setAwayForm((current) => ({
                    ...current,
                    startDate: readyState.weeks.find((week) => week.id === event.target.value)?.meeting_date ?? current.startDate,
                    endDate: readyState.weeks.find((week) => week.id === event.target.value)?.meeting_date ?? current.endDate,
                  }));
                }}
              >
                {readyState.weeks.map((week) => (
                  <option key={week.id} value={week.id}>
                    {weekPickerLabel(week)}
                  </option>
                ))}
              </select>
            </label>
            )}
            {canEdit && currentNav === DESIGNACAO_NAV ? (
              <button
                className="primary-button"
                disabled={busy}
                onClick={() =>
                  runAction(
                    "generateWeek",
                    { weekId: readyWeek.id, preserveConfirmed: false },
                    "Designações geradas respeitando folgas e permissões.",
                  )
                }
                type="button"
              >
                Gerar designações
              </button>
            ) : null}
          </div>
          ) : null}
        </header>

        {notice ? (
          <div className="notice">
            <span>{notice}</span>
            {latestAccessCode?.whatsappPhone ? (
              <button className="secondary-button" onClick={() => openAccessWhatsApp(latestAccessCode)} type="button">
                Abrir WhatsApp
              </button>
            ) : null}
          </div>
        ) : null}

        {currentNav === "Resumo" ? (
          <section className="tab-panel" aria-label="Resumo">
            <article className="panel personal-summary">
              <div className="personal-hero">
                <span className="eyebrow">Minhas próximas designações</span>
                <h2>Olá {publisherFirstName}, seja bem-vindo ao Designa Fácil — Edição acadêmica</h2>
                <p>
                  Você está associado à congregação {readyState.congregation.name}. Seguem suas próximas designações.
                </p>
              </div>

              <div className="summary-priority-grid" aria-label="Painel rápido">
                <div className={`summary-priority-card ${nextMeetingFocus.date === todayIso ? "today" : "meeting"}`}>
                  <span>{nextMeetingFocus.date === todayIso ? "Hoje" : "Próxima"}</span>
                  <strong>{formatLongDate(nextMeetingFocus.date)}</strong>
                  <small>{nextMeetingFocus.nav === DESIGNACAO_NAV ? "Vida e Ministério" : "Reunião Pública"}</small>
                </div>
                <div className="summary-priority-card assignments">
                  <span>Designações</span>
                  <strong>{nextPersonalAssignmentCount}</strong>
                  <small>futuras para você</small>
                </div>
                <div className="summary-priority-card attendance">
                  <span>Assistência</span>
                  <strong>{nextAttendanceAssignment ? formatNumericDate(nextAttendanceAssignment.assignment_date) : "Sem data"}</strong>
                  <small>{nextAttendanceAssignment ? meetingKindLabel(nextAttendanceAssignment.meeting_kind) : "Nenhum formulário próximo"}</small>
                </div>
                <div className={`summary-priority-card alerts ${personalAlerts.length > 0 ? "has-alerts" : ""}`}>
                  <span>Avisos</span>
                  <strong>{personalAlerts.length}</strong>
                  <small>{personalAlerts.length === 1 ? "pendência ativa" : "pendências ativas"}</small>
                </div>
              </div>

              {personalAlerts.length > 0 ? (
                <div className="personal-alerts-panel" aria-label="Avisos">
                  {personalAlerts.map((alert) => (
                    <div className={`personal-alert-item ${alert.tone}`} key={alert.id}>
                      <strong>{alert.title}</strong>
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              <section
                className={`next-meeting-card ${nextMeetingFocus.nav === DESIGNACAO_NAV ? "midweek-summary" : "public-summary"}`}
                aria-label="Próxima reunião e designados"
              >
                <div className="next-meeting-head">
                  <div>
                    <span className="eyebrow">{nextMeetingFocus.date === todayIso ? "Reunião de hoje" : "Próxima reunião"}</span>
                    <h3>{formatLongDate(nextMeetingFocus.date)}</h3>
                    <p>
                      {nextMeetingFocus.nav === DESIGNACAO_NAV
                        ? `${nextMeetingWeek.bible_reading} | Cânticos: ${formatSong(nextMeetingWeek.opening_song)} e ${formatSong(nextMeetingCircuitVisit?.midweek_service_talk_song || nextMeetingWeek.closing_song)}`
                        : `Reunião Pública: ${nextMeetingCircuitVisit?.weekend_public_talk_title || (nextMeetingPublicMeeting?.special_talk_title || publicTalkThemeTitle(nextMeetingPublicMeeting?.public_talk_theme_id ?? null)) || "Tema a confirmar"}`}
                    </p>
                  </div>
                  <button
                    className="secondary-button compact-button"
                    onClick={() => {
                      if (nextMeetingFocus.nav === DESIGNACAO_NAV) openMidweekSheet(nextMeetingWeek.id);
                      else if (nextMeetingPublicMeeting) openPublicMeetingDetail(nextMeetingPublicMeeting);
                    }}
                    type="button"
                  >
                    {nextMeetingFocus.nav === DESIGNACAO_NAV ? "Ver folha" : "Abrir reunião"}
                  </button>
                </div>

                {nextMeetingUserAlerts.length > 0 ? (
                  <div className="personal-alert">
                    <strong>Você tem designação nesta reunião.</strong>
                    <span>{nextMeetingUserAlerts.join(" | ")}</span>
                  </div>
                ) : (
                  <div className="personal-alert quiet">
                    <strong>Nenhuma designação sua nesta reunião.</strong>
                    <span>A programação completa fica disponível para consulta.</span>
                  </div>
                )}

                <div className="next-meeting-grid">
                  <div className="next-meeting-list">
                    <h4>{nextMeetingFocus.nav === DESIGNACAO_NAV ? "Folha da reunião" : "Fim de semana"}</h4>
                    {nextMeetingFocus.nav === DESIGNACAO_NAV ? (
                      nextMeetingMidweekAssignments.map((assignment) => (
                        <div className={`next-meeting-line tone-${assignment.section_tone}`} key={assignment.id}>
                          <span>
                            {assignment.section === "top" || assignment.section === "bottom"
                              ? assignment.title
                              : `${assignment.sequence}. ${nextMeetingAssignmentTitle(assignment)}`}
                          </span>
                          <strong>
                            {memberName(assignment.assignee_member_id) || "Sem designado"}
                            {assignmentUsesAssistant(assignment) && assignment.assistant_member_id ? ` / ${memberName(assignment.assistant_member_id)}` : ""}
                          </strong>
                        </div>
                      ))
                    ) : nextMeetingPublicMeeting ? (
                      <>
                        <div className="next-meeting-line">
                          <span>Presidente</span>
                          <strong>{memberName(nextMeetingPublicMeeting.chairman_member_id) || "Sem designado"}</strong>
                        </div>
                        <div className="next-meeting-line">
                          <span>{nextMeetingPublicMeeting.special_talk_title ? "Discurso Especial" : "Discurso público"}</span>
                          <strong>
                            {nextMeetingCircuitVisit?.weekend_public_talk_title ||
                              (nextMeetingPublicMeeting.special_talk_title || publicTalkThemeTitle(nextMeetingPublicMeeting.public_talk_theme_id)) ||
                              "Tema a confirmar"}
                          </strong>
                        </div>
                        <div className="next-meeting-line">
                          <span>Orador</span>
                          <strong>
                            {nextMeetingCircuitVisit?.circuit_overseer_name || nextMeetingPublicMeeting.public_talk_speaker || "A confirmar"}
                            {!nextMeetingCircuitVisit?.circuit_overseer_name && nextMeetingPublicMeeting.public_talk_speaker_congregation
                              ? ` (${nextMeetingPublicMeeting.public_talk_speaker_congregation})`
                              : ""}
                          </strong>
                        </div>
                        <div className="next-meeting-line">
                          <span>Estudo de A Sentinela</span>
                          <strong>{nextMeetingWatchtowerStudy?.study_title || "A confirmar"}</strong>
                        </div>
                        <div className="next-meeting-line">
                          <span>Leitor</span>
                          <strong>{nextMeetingCircuitVisit ? "Sem leitura" : memberName(nextMeetingPublicMeeting.watchtower_reader_member_id) || "Sem designado"}</strong>
                        </div>
                        {nextMeetingCircuitVisit ? (
                          <div className="next-meeting-line">
                            <span>Discurso final da visita</span>
                            <strong>
                              {nextMeetingCircuitVisit.weekend_final_talk_title || "A definir"}
                              {nextMeetingCircuitVisit.weekend_final_talk_song
                                ? ` | Cântico ${formatSong(nextMeetingCircuitVisit.weekend_final_talk_song)}`
                                : ""}
                            </strong>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="empty-copy">Nenhuma reunião pública registrada para esta data.</p>
                    )}
                  </div>

                  <div className="next-meeting-list">
                    <h4>Designações mecânicas</h4>
                    {nextMeetingMechanicalAssignments.length > 0 ? (
                      nextMeetingMechanicalAssignments.flatMap((assignment) =>
                        mechanicalRoleFields.map((field) => (
                          <div className="next-meeting-line" key={`${assignment.id}-${field.key}`}>
                            <span>{field.label} - {meetingKindLabel(assignment.meeting_kind)}</span>
                            <strong>{memberName(assignment[field.key]) || "Sem designado"}</strong>
                          </div>
                        )),
                      )
                    ) : (
                      <p className="empty-copy">Nenhuma mecânica registrada para essa reunião.</p>
                    )}
                  </div>
                </div>
              </section>

              {nextAttendanceAssignment && nextAttendanceDraft ? (
                <section className="summary-attendance-card" aria-label="Formulário de Assistência às reuniões">
                  <div className="summary-attendance-heading">
                    <span className="eyebrow">Formulário de Assistência às reuniões</span>
                    <h3>
                      Reunião de {formatNumericDate(nextAttendanceAssignment.assignment_date)} - {meetingKindLabel(nextAttendanceAssignment.meeting_kind)}
                    </h3>
                    <p>Preencha presencial, Zoom e total para deixar o relatório pronto.</p>
                  </div>
                  <div className="attendance-report-grid compact-attendance-grid">
                    <label>
                      <span>Presencial</span>
                      <input
                        disabled={!canReportNextAttendance || busy}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={nextAttendanceDraft.attendance_in_person}
                        onChange={(event) =>
                          updateMechanicalDraft(nextAttendanceAssignment.id, { attendance_in_person: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Zoom</span>
                      <input
                        disabled={!canReportNextAttendance || busy}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={nextAttendanceDraft.attendance_zoom}
                        onChange={(event) =>
                          updateMechanicalDraft(nextAttendanceAssignment.id, { attendance_zoom: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Total</span>
                      <input
                        disabled={!canReportNextAttendance || busy}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={nextAttendanceDraft.attendance_total}
                        onChange={(event) =>
                          updateMechanicalDraft(nextAttendanceAssignment.id, { attendance_total: event.target.value })
                        }
                      />
                    </label>
                  </div>
                  <div className="action-row">
                    <button
                      className="secondary-button"
                      disabled={!canReportNextAttendance || busy}
                      onClick={() => saveAttendanceRecord(nextAttendanceAssignment)}
                      type="button"
                    >
                      Salvar assistência
                    </button>
                    <button
                      className="primary-button"
                      disabled={!canReportNextAttendance || busy}
                      onClick={() => sendAttendanceReport(nextAttendanceAssignment)}
                      type="button"
                    >
                      Enviar relatório
                    </button>
                    {nextAttendanceAssignment.attendance_reported_at ? (
                      <span className="muted">Salvo em {formatDateTime(nextAttendanceAssignment.attendance_reported_at)}</span>
                    ) : null}
                    {!canReportNextAttendance ? (
                      <span className="muted">Disponível para anciãos, indicadores aptos e administradores.</span>
                    ) : null}
                  </div>
                </section>
              ) : null}

              <h3 className="personal-future-title">Suas designações futuras</h3>
              <div className="personal-assignment-grid">
                <section className="personal-assignment-section">
                  <h3>Reunião Vida e Ministério</h3>
                  {nextMidweekAssignments.length > 0 ? (
                    nextMidweekAssignments.map(({ assignment, week }) => (
                      <button className="personal-assignment-item" key={assignment.id} onClick={() => openMidweekSheet(week!.id)} type="button">
                        <strong>{formatLongDate(week!.meeting_date)}</strong>
                        <span>{assignmentDisplayTitle(assignment)}</span>
                        <small>
                          {assignmentSlotLabel(
                            assignment,
                            assignment.assignee_member_id === readyState.user.id ? "assignee" : "assistant",
                          )}{" "}
                          - {assignment.section === "top" || assignment.section === "bottom" ? "Cabeçalho" : assignment.section}
                        </small>
                      </button>
                    ))
                  ) : (
                    <p className="empty-copy">Nenhuma próxima designação registrada.</p>
                  )}
                </section>

                <section className="personal-assignment-section">
                  <h3>Reunião Pública</h3>
                  {nextPublicMeetingAssignments.length > 0 ? (
                    nextPublicMeetingAssignments.map((meeting) => (
                      <button className="personal-assignment-item" key={meeting.id} onClick={() => openPublicMeetingDetail(meeting)} type="button">
                        <strong>{formatLongDate(publicMeetingSummaryDate(meeting, publisherName))}</strong>
                        <span>{publicMeetingSummaryTitle(meeting, publisherName)}</span>
                        <small>{publicMeetingRolesForUser(meeting, publisherName).join(" - ") || "Designação registrada"}</small>
                      </button>
                    ))
                  ) : (
                    <p className="empty-copy">Nenhuma próxima designação registrada.</p>
                  )}
                </section>

                <section className="personal-assignment-section">
                  <h3>Áudio, Vídeo e Indicadores</h3>
                  {nextMechanicalAssignments.length > 0 ? (
                    nextMechanicalAssignments.map((assignment) => (
                      <button className="personal-assignment-item" key={assignment.id} onClick={() => openMechanicalDetail(assignment)} type="button">
                        <strong>{formatLongDate(assignment.assignment_date)}</strong>
                        <span>{mechanicalRolesForUser(assignment, readyState.user.id).join(" - ")}</span>
                        <small>{meetingKindLabel(assignment.meeting_kind)}</small>
                      </button>
                    ))
                  ) : (
                    <p className="empty-copy">Nenhuma próxima designação registrada.</p>
                  )}
                </section>

                <section className="personal-assignment-section">
                  <h3>Ministério de Campo</h3>
                  {nextFieldMinistryAssignments.length > 0 ? (
                    nextFieldMinistryAssignments.map((assignment) => (
                      <button className="personal-assignment-item" key={assignment.id} onClick={() => openFieldMinistryDetail(assignment)} type="button">
                        <strong>{formatLongDate(assignment.activity_date)} - {assignment.start_time}</strong>
                        <span>Dirigente de campo</span>
                        <small>
                          {fieldArrangementLabel(assignment.arrangement)}
                          {assignment.field_service_group_id ? ` - ${groupName(assignment.field_service_group_id)}` : ""}
                        </small>
                      </button>
                    ))
                  ) : (
                    <p className="empty-copy">Nenhuma próxima designação registrada.</p>
                  )}
                </section>
              </div>
            </article>

          </section>
        ) : null}

        {currentNav === DESIGNACAO_NAV ? (
          <section className="tab-panel" aria-label="Designação Vida e Ministério">
          <article className="panel schedule-panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Designação Vida e Ministério</span>
                <h2>{formatLongDate(readyWeek.meeting_date)} | {readyWeek.bible_reading}</h2>
              </div>
              <div className="panel-head-actions">
                {!canEdit ? (
                  <button className="secondary-button compact-button" onClick={() => openMidweekSheet(readyWeek.id)} type="button">
                    Ver folha completa
                  </button>
                ) : null}
                <span className={`week-status ${readyWeek.status}`}>{readyWeek.status}</span>
              </div>
            </div>

            {selectedWeekConflicts.length > 0 ? (
              <div className="conflict-list">
                {selectedWeekConflicts.map((conflict, index) => (
                  <p key={`${conflict.memberId}-${conflict.message}-${index}`}>
                    <strong>{conflict.memberName}</strong> - {conflict.message}
                  </p>
                ))}
              </div>
            ) : (
              <div className="ok-banner">Nenhum conflito para esta semana.</div>
            )}

            {selectedWeekReminders.length > 0 ? (
              <div className="event-reminder-list">
                {selectedWeekReminders.map((reminder) => (
                  <div className={`event-reminder ${reminder.type}`} key={`${reminder.eventId}-${reminder.type}`}>
                    <strong>Evento especial: {reminder.title}</strong>
                    <span>{reminder.message}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="assignment-editor">
              {weekAssignments.map((assignment) => (
                <div
                  className={`assignment-line tone-${assignment.section_tone}`}
                  key={assignment.id}
                >
                  <div className="assignment-title">
                    <span>{assignment.section === "top" || assignment.section === "bottom" ? "Cabeçalho" : assignment.section}</span>
                    <strong>
                      {assignmentDisplayTitle(assignment)}
                      {assignment.duration_min ? ` (${assignment.duration_min} min)` : ""}
                    </strong>
                  <label>
                    <span>Gênero da dupla / participante</span>
                    <select
                      aria-label={`Gênero para ${assignment.title}`}
                      disabled={!canEdit || busy}
                      value={assignmentGenderFilters[assignment.id] ?? readyState.members.find((member) => member.id === assignment.assignee_member_id)?.gender ?? ""}
                      onChange={async (event) => {
                        const gender = (event.target.value || null) as MemberGender;
                        if (assignment.assignee_member_id || assignment.assistant_member_id) {
                          const saved = await updateAssignment(assignment, { assignee_member_id: null, assistant_member_id: null, status: "rascunho" });
                          if (!saved) return;
                        }
                        setAssignmentGenderFilters((current) => ({ ...current, [assignment.id]: gender }));
                      }}
                    >
                      <option value="">Todos os gêneros</option>
                      <option value="feminino">Feminino</option>
                      <option value="masculino">Masculino</option>
                    </select>
                    <small>Trocar o gênero limpa os nomes desta designação.</small>
                  </label>
                  </div>
                  <MemberSearchSelect
                    disabled={!canEdit || busy}
                    label={assignmentSlotLabel(assignment, "assignee")}
                    onChange={(memberId) =>
                      updateAssignment(assignment, {
                        assignee_member_id: memberId || null,
                        status: "aguardando",
                      })
                    }
                    options={rankedAssignmentMemberOptions(assignment, assignment.assignee_member_id, "assignee")}
                    value={assignment.assignee_member_id ?? ""}
                  />
                  {assignmentUsesAssistant(assignment) ? (
                    <MemberSearchSelect
                      disabled={!canEdit || busy || !readyState.members.find((member) => member.id === assignment.assignee_member_id)?.gender}
                      emptyLabel={!assignment.assignee_member_id ? "Escolha a pessoa principal primeiro" : !readyState.members.find((member) => member.id === assignment.assignee_member_id)?.gender ? "Informe o gênero em Participantes" : assignment.role_key === "estudo_biblico" ? "Sem leitor" : "Sem ajudante"}
                      label={assignmentSlotLabel(assignment, "assistant")}
                      onChange={(memberId) =>
                        updateAssignment(assignment, {
                          assistant_member_id: memberId || null,
                          status: "aguardando",
                        })
                      }
                      options={rankedAssignmentMemberOptions(assignment, assignment.assistant_member_id, "assistant")}
                      placeholder={assignment.role_key === "estudo_biblico" ? "Pesquisar leitor" : "Pesquisar ajudante"}
                      value={assignment.assistant_member_id ?? ""}
                    />
                  ) : null}
                  <select
                    aria-label={`Status de ${assignment.title}`}
                    disabled={!canEdit || busy}
                    value={assignment.status}
                    onChange={(event) =>
                      updateAssignment(assignment, {
                        status: event.target.value as AssignmentStatus,
                      })
                    }
                  >
                    <option value="rascunho">Rascunho</option>
                    <option value="aguardando">Aguardando</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="recusada">Recusada</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="action-row">
              <button
                className="secondary-button"
                disabled={!canEdit || busy}
                onClick={() =>
                  runAction("saveWeekDraft", { weekId: readyWeek.id }, "Semana salva para revisão.")
                }
                type="button"
              >
                Salvar semana
              </button>
              <button
                className="secondary-button"
                disabled={!canEdit || busy}
                onClick={() =>
                  runAction("publishWeek", { weekId: readyWeek.id }, "Semana marcada como publicada.")
                }
                type="button"
              >
                Publicar semana
              </button>
              <button className="secondary-button" onClick={printSheet} type="button">
                Imprimir folha
              </button>
            </div>

            <section className="s89-panel" aria-label="Teste de envio S-89">
              <div className="panel-head compact">
                <div>
                  <span className="eyebrow">Protótipo WhatsApp</span>
                  <h2>Folha de designação S-89</h2>
                </div>
              </div>

              {selectedS89Data ? (
                <>
                  <label className="s89-picker">
                    <span>Designação</span>
                    <select
                      value={selectedS89Assignment?.id ?? ""}
                      onChange={(event) => setSelectedS89AssignmentId(event.target.value)}
                    >
                      {s89Assignments.map((assignment) => (
                        <option key={assignment.id} value={assignment.id}>
                          {printableNumber.get(assignment.id) ?? assignment.sequence}. {assignment.title} - {memberName(assignment.assignee_member_id)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="s89-preview-frame">
                    <img alt="Prévia da folha individual S-89" src={s89PreviewSrc} />
                  </div>

                  <div className="s89-phone-row">
                    <label>
                      <span>WhatsApp do participante</span>
                      <input
                        disabled={!canEdit || busy}
                        inputMode="tel"
                        placeholder="+5511999999999"
                        value={whatsAppForm}
                        onChange={(event) => setWhatsAppForm(event.target.value)}
                      />
                    </label>
                    <button className="secondary-button" disabled={!canEdit || busy || !selectedS89Member} onClick={saveSelectedWhatsApp} type="button">
                      Salvar WhatsApp
                    </button>
                  </div>

                  <div className="action-row s89-actions">
                    <button className="secondary-button" onClick={downloadS89Pdf} type="button">
                      Baixar PDF
                    </button>
                    <button className="secondary-button" onClick={downloadS89Png} type="button">
                      Baixar PNG
                    </button>
                    <button className="secondary-button" onClick={shareS89} type="button">
                      Compartilhar S-89
                    </button>
                    <button className="primary-button" disabled={!selectedS89Member} onClick={sendS89WhatsApp} type="button">
                      Enviar imagem
                    </button>
                  </div>

                  <p className="s89-note">
                    No celular, escolha o WhatsApp no compartilhamento. Se o navegador limitar anexos, o PNG será baixado.
                  </p>
                </>
              ) : (
                <p className="empty-copy">Escolha uma semana com designações preenchidas para gerar uma S-89.</p>
              )}
            </section>
          </article>
          </section>
        ) : null}

        {currentNav === ATTENDANCE_NAV ? (
          <section className="tab-panel" aria-label="Assistência das reuniões">
            <article className="panel utility-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Assistência das reuniões</span>
                  <h2>Histórico de assistência</h2>
                  <p className="week-subtitle">Consulte uma reunião específica ou acompanhe as médias por mês.</p>
                </div>
              </div>

              <div className="attendance-controls">
                <label className="filter-label">
                  <span>Reunião</span>
                  <select
                    value={selectedAttendanceAssignment?.id ?? ""}
                    onChange={(event) => setSelectedAttendanceAssignmentId(event.target.value)}
                  >
                    {attendanceAssignments.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {formatNumericDate(assignment.assignment_date)} - {meetingKindLabel(assignment.meeting_kind)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="filter-label">
                  <span>Mês do histórico</span>
                  <select value={activeAttendanceMonth} onChange={(event) => setSelectedAttendanceMonth(event.target.value)}>
                    {(attendanceMonthOptions.length > 0 ? attendanceMonthOptions : [activeAttendanceMonth]).map((monthKey) => (
                      <option key={monthKey} value={monthKey}>
                        {monthTitle(monthKey)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="summary-grid attendance-summary-grid">
                <article className="panel metric-card">
                  <span>Média total</span>
                  <strong>{attendanceAverages.geral}</strong>
                </article>
                <article className="panel metric-card">
                  <span>Média meio de semana</span>
                  <strong>{attendanceAverages.meioSemana}</strong>
                </article>
                <article className="panel metric-card">
                  <span>Média fim de semana</span>
                  <strong>{attendanceAverages.fimSemana}</strong>
                </article>
              </div>

              <section className="attendance-history-card" aria-label="Histórico de assistências registradas">
                <div className="section-heading-row">
                  <h3>Assistências registradas</h3>
                  <span>{monthTitle(activeAttendanceMonth)}</span>
                </div>
                {attendanceRecordsForMonth.length > 0 ? (
                  <div className="attendance-history-table">
                    <div className="attendance-history-head">
                      <span>Data</span>
                      <span>Reunião</span>
                      <span>Presencial</span>
                      <span>Zoom</span>
                      <span>Total</span>
                    </div>
                    {attendanceRecordsForMonth.map((assignment) => (
                      <div className="attendance-history-row" key={`attendance-row-${assignment.id}`}>
                        <strong>{formatNumericDate(assignment.assignment_date)}</strong>
                        <span>{meetingKindLabel(assignment.meeting_kind)}</span>
                        <span>{assignment.attendance_in_person ?? 0}</span>
                        <span>{assignment.attendance_zoom ?? 0}</span>
                        <strong>{attendanceRecordTotal(assignment)}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-copy">Nenhuma assistência salva para esse mês.</p>
                )}
              </section>

              {selectedAttendanceAssignment && selectedAttendanceDraft ? (
                <>
                  <div className="attendance-report-grid compact-attendance-grid">
                    <label>
                      <span>Presencial</span>
                      <input
                        disabled={!canReportSelectedAttendance || busy}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={selectedAttendanceDraft.attendance_in_person}
                        onChange={(event) =>
                          updateMechanicalDraft(selectedAttendanceAssignment.id, { attendance_in_person: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Zoom</span>
                      <input
                        disabled={!canReportSelectedAttendance || busy}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={selectedAttendanceDraft.attendance_zoom}
                        onChange={(event) =>
                          updateMechanicalDraft(selectedAttendanceAssignment.id, { attendance_zoom: event.target.value })
                        }
                      />
                    </label>
                    <label>
                      <span>Total</span>
                      <input
                        disabled={!canReportSelectedAttendance || busy}
                        inputMode="numeric"
                        min="0"
                        type="number"
                        value={selectedAttendanceDraft.attendance_total}
                        onChange={(event) =>
                          updateMechanicalDraft(selectedAttendanceAssignment.id, { attendance_total: event.target.value })
                        }
                      />
                    </label>
                  </div>

                  <div className="action-row">
                    <button
                      className="secondary-button"
                      disabled={!canReportSelectedAttendance || busy}
                      onClick={() => saveAttendanceRecord(selectedAttendanceAssignment)}
                      type="button"
                    >
                      Salvar assistência
                    </button>
                    {selectedAttendanceAssignment.attendance_reported_at ? (
                      <span className="muted">Salvo em {formatDateTime(selectedAttendanceAssignment.attendance_reported_at)}</span>
                    ) : (
                      <span className="muted">Ainda não há assistência salva para essa reunião.</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="empty-copy">Nenhuma reunião mecânica encontrada para consultar assistência.</p>
              )}
            </article>
          </section>
        ) : null}

        {currentNav === TIME_RECORDS_NAV ? (
          <section className="tab-panel" aria-label="Tempos registrados">
            <article className="panel utility-panel time-records-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Tempos registrados</span>
                  <h2>{formatLongDate(readyWeek.meeting_date)} | {readyWeek.bible_reading}</h2>
                  <p className="week-subtitle">Consulta dos tempos salvos para a reunião selecionada.</p>
                </div>
                <div className="time-control-summary">
                  <div>
                    <strong>{formatReadableDurationSeconds(recordedMeetingTotalSeconds)}</strong>
                    <span>tempo total</span>
                  </div>
                  <div>
                    <strong>{formatReadableDurationSeconds(recordedPartsSeconds)}</strong>
                    <span>partes</span>
                  </div>
                  <div>
                    <strong>{formatReadableDurationSeconds(recordedExtrasSeconds)}</strong>
                    <span>extras</span>
                  </div>
                </div>
              </div>

              <label className="filter-label">
                <span>Selecionar reunião</span>
                <select value={readyWeek.id} onChange={(event) => setSelectedWeekId(event.target.value)}>
                  {readyState.weeks
                    .slice()
                    .sort((a, b) => b.meeting_date.localeCompare(a.meeting_date))
                    .map((week) => (
                      <option key={week.id} value={week.id}>
                        {formatNumericDate(week.meeting_date)} - {week.bible_reading}
                      </option>
                    ))}
                </select>
              </label>

              {timeControlParts.length > 0 ? (
                <div className="time-records-list">
                  {meetingSessionRecord ? (
                    <div className="time-record-row total">
                      <div>
                        <span>Tempo total da reunião</span>
                        <strong>{meetingSessionRecord.part_title}</strong>
                        <small>
                          {formatTimeOnly(meetingSessionRecord.started_at)} até {formatTimeOnly(meetingSessionRecord.ended_at)}
                        </small>
                      </div>
                      <strong>{formatReadableDurationSeconds(recordedMeetingTotalSeconds)}</strong>
                    </div>
                  ) : null}

                  {timeControlPartRecordsForWeek.map(({ part, record, index }) => {
                    const actualSeconds = record?.actual_seconds ?? secondsBetweenIso(record?.started_at, record?.ended_at);
                    const plannedSeconds = part.plannedSeconds ?? 0;
                    const overtimeSeconds = plannedSeconds > 0 ? Math.max(0, actualSeconds - plannedSeconds) : 0;
                    return (
                      <div className={`time-record-row tone-${index % 3}`} key={part.partKey}>
                        <div>
                          <span>{part.section}</span>
                          <strong>{part.title}</strong>
                          <small>
                            {part.assignee || "Sem designado"}
                            {part.assistant ? ` | Ajudante: ${part.assistant}` : ""}
                          </small>
                          {record?.notes ? <small>{record.notes}</small> : null}
                        </div>
                        <div className="time-record-metrics">
                          <span>Previsto <strong>{formatReadableDurationSeconds(part.plannedSeconds)}</strong></span>
                          <span>Realizado <strong>{actualSeconds > 0 ? formatReadableDurationSeconds(actualSeconds) : "Sem registro"}</strong></span>
                          <span className={overtimeSeconds > 0 ? "overtime" : ""}>
                            Excesso <strong>{overtimeSeconds > 0 ? formatReadableDurationSeconds(overtimeSeconds) : "Sem excesso"}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {unmatchedTimeControlRecordsForWeek.map((record) => (
                    <div className="time-record-row" key={record.id}>
                      <div>
                        <span>Registro salvo</span>
                        <strong>{record.part_title}</strong>
                        <small>
                          {formatTimeOnly(record.started_at)} até {formatTimeOnly(record.ended_at)}
                        </small>
                        {record.notes ? <small>{record.notes}</small> : null}
                      </div>
                      <strong>{formatReadableDurationSeconds(record.actual_seconds ?? secondsBetweenIso(record.started_at, record.ended_at))}</strong>
                    </div>
                  ))}

                  {timeControlExtraRecordsForWeek.length > 0 ? (
                    <div className="time-records-group-title">
                      <span className="eyebrow">Tempos extras</span>
                      <h3>Transições, introduções e conclusão</h3>
                    </div>
                  ) : null}
                  {timeControlExtraRecordsForWeek.map((record) => (
                    <div className="time-record-row extra" key={record.id}>
                      <div>
                        <span>Tempo extra</span>
                        <strong>{record.part_title}</strong>
                        <small>
                          {formatTimeOnly(record.started_at)} até {formatTimeOnly(record.ended_at)}
                        </small>
                      </div>
                      <strong>{formatReadableDurationSeconds(record.actual_seconds ?? secondsBetweenIso(record.started_at, record.ended_at))}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-copy">Nenhum tempo registrado para essa reunião.</p>
              )}
            </article>
          </section>
        ) : null}

        {currentNav === TIME_CONTROL_NAV ? (
          <section className="tab-panel" aria-label="Controle do tempo">
            <article className="panel utility-panel time-control-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Controle do tempo</span>
                  <h2>{formatLongDate(readyWeek.meeting_date)} | {readyWeek.bible_reading}</h2>
                  <p className="week-subtitle">Cronômetro das partes da Reunião Vida e Ministério.</p>
                </div>
                {!isDemoTimeOperator ? (
                  <div className="time-control-summary">
                    <div>
                      <strong>{timedPartsCount}</strong>
                      <span>partes marcadas</span>
                    </div>
                    <div>
                      <strong>{formatReadableDurationSeconds(totalRecordedSeconds)}</strong>
                      <span>total registrado</span>
                    </div>
                    <div>
                      <strong>{formatReadableDurationSeconds(meetingSessionSeconds)}</strong>
                      <span>tempo da reunião</span>
                    </div>
                    <div>
                      <strong>{formatReadableDurationSeconds(totalMeetingExtraSeconds)}</strong>
                      <span>transições e introduções</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <label className="filter-label">
                <span>Reunião</span>
                <select value={readyWeek.id} onChange={(event) => setSelectedWeekId(event.target.value)}>
                  {readyState.weeks
                    .slice()
                    .sort((a, b) => b.meeting_date.localeCompare(a.meeting_date))
                    .map((week) => (
                      <option key={week.id} value={week.id}>
                        {formatNumericDate(week.meeting_date)} - {week.bible_reading}
                      </option>
                    ))}
                </select>
              </label>

              <div className="meeting-session-card">
                <div>
                  <span className="eyebrow">Tempo total da reunião</span>
                  <h3>{meetingSessionRunning ? "Reunião em andamento" : meetingSessionEnded ? "Reunião encerrada" : "Pronto para iniciar"}</h3>
                </div>
                <div className="meeting-session-metrics">
                  <div>
                    <span>Início</span>
                    <strong>{formatTimeOnly(meetingSessionDraft.startedAt)}</strong>
                  </div>
                  <div>
                    <span>Fim</span>
                    <strong>{formatTimeOnly(meetingSessionDraft.endedAt)}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{formatReadableDurationSeconds(meetingSessionSeconds)}</strong>
                  </div>
                </div>
                <div className="time-control-actions">
                  <button
                    className="primary-button compact-button"
                    disabled={
                      !canUseTimeControl ||
                      busy ||
                      (meetingSessionStarted && timeControlParts.length === 0) ||
                      (isDemoTimeOperator && meetingSessionEnded)
                    }
                    onClick={() => {
                      if (!meetingSessionStarted) {
                        startMeetingSession();
                        return;
                      }
                      if (meetingSessionEnded) {
                        if (isDemoTimeOperator) return;
                        void sendTimeControlReport();
                        return;
                      }
                      void endMeetingSession(!isDemoTimeOperator);
                    }}
                    type="button"
                  >
                    {isDemoTimeOperator
                      ? !meetingSessionStarted
                        ? "Iniciar reunião"
                        : meetingSessionEnded
                          ? "Reunião encerrada"
                          : "Encerrar reunião"
                      : !meetingSessionStarted
                        ? "Iniciar reunião"
                        : meetingSessionEnded
                          ? "Enviar tempos por WhatsApp"
                          : "Encerrar reunião, salvar e enviar WhatsApp"}
                  </button>
                </div>
              </div>

              {isAdmin ? (
                <button
                  className="secondary-button compact-button"
                  disabled={busy}
                  onClick={() => void resetMeetingSession()}
                  type="button"
                >
                  Zerar tempo da reunião
                </button>
              ) : null}

              {!isDemoTimeOperator ? (
                <div className="source-box">
                  <strong>Envio do relatório</strong>
                  <span>
                    Ao encerrar a reunião, o app salva os tempos e abre o WhatsApp para Participante 002 e Participante 003 com o relatório da reunião.
                  </span>
                </div>
              ) : null}

              {canUseTimeControl ? null : (
                <div className="theme-warning" role="status">
                  Esta função está liberada para Participante 004, Participante 005 e administradores.
                </div>
              )}

              <div className="time-control-list">
                {timeControlParts.length > 0 ? (
                  timeControlParts.map((part, index) => {
                    const draft = timeControlDraftForPart(part.partKey);
                    const elapsedSeconds = timeControlElapsedSeconds(draft, timingNow);
                    const running = Boolean(draft.runningStartedAt);
                    const plannedSeconds = part.plannedSeconds ?? 0;
                    const overtime = plannedSeconds > 0 && elapsedSeconds > plannedSeconds;
                    return (
                      <div className={`time-control-card tone-${index % 3}${overtime ? " overtime" : ""}`} key={part.partKey}>
                        <div className="time-control-card-head">
                          <div>
                            <span>{part.section}</span>
                            <strong>{part.title}</strong>
                            <small>
                              {part.assignee || "Sem designado"}
                              {part.assistant ? ` | Ajudante: ${part.assistant}` : ""}
                            </small>
                          </div>
                          <div className="time-control-clock">
                            <strong>{formatDurationSeconds(elapsedSeconds)}</strong>
                            <span>Previsto: {formatDurationSeconds(part.plannedSeconds)}</span>
                            {overtime ? <span className="time-control-over">Passou {formatDurationSeconds(elapsedSeconds - plannedSeconds)}</span> : null}
                          </div>
                        </div>

                        <div className="time-control-actions">
                          <button
                            className="primary-button compact-button"
                            disabled={!canUseTimeControl || busy || running}
                            onClick={() => startTimeControl(part.partKey)}
                            type="button"
                          >
                            Iniciar
                          </button>
                          <button
                            className="secondary-button compact-button"
                            disabled={!canUseTimeControl || busy || !running}
                            onClick={() => stopTimeControl(part.partKey)}
                            type="button"
                          >
                            Encerrar
                          </button>
                          <button
                            className="text-button"
                            disabled={!canUseTimeControl || busy || elapsedSeconds === 0}
                            onClick={() => resetTimeControl(part.partKey)}
                            type="button"
                          >
                            Zerar
                          </button>
                        </div>

                        {!isDemoTimeOperator ? (
                          <div className="time-control-grid">
                            <label>
                              <span>Tempo real (mm:ss ou min)</span>
                              <input
                                disabled={!canUseTimeControl || busy || running}
                                inputMode="text"
                                placeholder="10:02"
                                type="text"
                                value={timeControlInputTexts[part.partKey] ?? secondsToTimeControlInput(elapsedSeconds)}
                                onBlur={() =>
                                  setTimeControlInputTexts((current) => {
                                    const next = { ...current };
                                    delete next[part.partKey];
                                    return next;
                                  })
                                }
                                onChange={(event) => {
                                  const nextText = event.target.value;
                                  const parsedSeconds = timeControlInputToSeconds(nextText);
                                  setTimeControlInputTexts((current) => ({ ...current, [part.partKey]: nextText }));
                                  if (parsedSeconds === null) return;
                                  updateTimeControlDraft(part.partKey, {
                                    actualSeconds: parsedSeconds,
                                    runningStartedAt: null,
                                    endedAt: new Date().toISOString(),
                                  });
                                }}
                                onFocus={() =>
                                  setTimeControlInputTexts((current) => ({
                                    ...current,
                                    [part.partKey]: secondsToTimeControlInput(elapsedSeconds),
                                  }))
                                }
                              />
                            </label>
                            <label>
                              <span>Observação</span>
                              <input
                                disabled={!canUseTimeControl || busy}
                                placeholder="Ex.: passou 1 min"
                                value={draft.notes}
                                onChange={(event) => updateTimeControlDraft(part.partKey, { notes: event.target.value })}
                              />
                            </label>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-copy">Nenhuma parte encontrada para a semana selecionada.</p>
                )}
              </div>

              {!isDemoTimeOperator ? (
                <div className="action-row time-control-submit">
                  <button
                    className="primary-button"
                    disabled={!canUseTimeControl || busy || timeControlParts.length === 0 || (!meetingSessionStarted && !meetingSessionEnded)}
                    onClick={() => (meetingSessionEnded ? sendTimeControlReport() : endMeetingSession(true))}
                    type="button"
                  >
                    {meetingSessionEnded ? "Enviar tempos por WhatsApp" : "Encerrar reunião, salvar e enviar WhatsApp"}
                  </button>
                  <span className="muted">
                    Destino: {readyState.timeControlReportRecipients.map((recipient) => recipient.name).join(" e ") || "Participante 002 e Participante 003"}
                  </span>
                </div>
              ) : null}

              {!isDemoTimeOperator && meetingExtraSegments.length > 0 ? (
                <div className="time-extra-list">
                  <div className="section-heading-row">
                    <div>
                      <span className="eyebrow">Tempos extras</span>
                      <h3>Intervalos calculados automaticamente</h3>
                    </div>
                  </div>
                  {meetingExtraSegments.map((segment) => (
                    <div className="time-extra-row" key={segment.key}>
                      <div>
                        <strong>{segment.title}</strong>
                        <span>
                          {formatTimeOnly(segment.startedAt)} até {formatTimeOnly(segment.endedAt)}
                        </span>
                      </div>
                      <strong>{formatReadableDurationSeconds(segment.actualSeconds)}</strong>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          </section>
        ) : null}

        {currentNav === PUBLIC_MEETING_NAV ? (
          <section className="tab-panel" aria-label="Designação Reunião Pública">
            <article className="panel public-meeting-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Reunião do fim de semana</span>
                  <h2>{monthTitle(selectedPublicMeetingMonth || readyWeek.meeting_date.slice(0, 7))}</h2>
                  <p className="week-subtitle">
                    {selectedPublicMeeting?.no_public_meeting_event
                      ? `Evento especial — ${specialEventTypeLabel(selectedPublicMeeting.no_public_meeting_event.type)}`
                      : `${selectedPublicMeeting?.special_talk_title ? "Discurso Especial" : "Discurso Público"}: ${selectedPublicMeeting?.special_talk_title || draftPublicTalkTheme?.title || "tema ainda não selecionado"}`}
                  </p>
                </div>
                {selectedPublicMeeting && !selectedPublicMeeting.no_public_meeting_event ? (
                  <span className={`week-status ${selectedPublicMeeting.status}`}>{selectedPublicMeeting.status}</span>
                ) : null}
              </div>

              <div className="subtab-row" role="tablist" aria-label="Seções da reunião pública">
                <button
                  className={publicMeetingSubtab === "assignments" ? "active" : ""}
                  onClick={() => setPublicMeetingSubtab("assignments")}
                  type="button"
                >
                  Designações do fim de semana
                </button>
                <button
                  className={publicMeetingSubtab === "received" ? "active" : ""}
                  onClick={() => setPublicMeetingSubtab("received")}
                  type="button"
                >
                  Temas e oradores recebidos
                </button>
                <button
                  className={publicMeetingSubtab === "sent" ? "active" : ""}
                  onClick={() => setPublicMeetingSubtab("sent")}
                  type="button"
                >
                  Temas e oradores enviados
                </button>
              </div>

              {selectedPublicMeeting?.no_public_meeting_event ? (
                <>
                  <div className="theme-warning info special-event-alert" role="status">
                    <strong>{formatNumericDate(selectedPublicMeeting.meeting_date)} — Evento especial — {specialEventTypeLabel(selectedPublicMeeting.no_public_meeting_event.type)}</strong>
                    <span>{selectedPublicMeeting.no_public_meeting_event.title}</span>
                    <span>Sem reunião pública e sem designações. Não enviamos nem recebemos oradores.</span>
                  </div>
                  <section className="public-month-cards" aria-label="Reuniões e eventos do mês">
                    {publicMeetingsOfActiveMonth.map((meeting) => (
                      <button className={`public-month-card ${meeting.id === selectedPublicMeeting.id ? "active" : ""}`} key={meeting.id} type="button"
                        onClick={() => { setOutgoingDateChoice(null); setSelectedWeekId(meeting.week_id); }}>
                        <strong>{formatNumericDate(publicMeetingSubtab === "sent" ? resolvedForMeeting(meeting).date : meeting.meeting_date)}</strong>
                        <span>{meeting.no_public_meeting_event ? `Evento especial — ${specialEventTypeLabel(meeting.no_public_meeting_event.type)}` : "Reunião pública"}</span>
                        {meeting.no_public_meeting_event ? <span>Sem designações</span> : null}
                      </button>
                    ))}
                  </section>
                  <button className="secondary-button" onClick={printPublicMeetingSheet} type="button">Imprimir programação do mês</button>
                </>
              ) : selectedPublicMeeting ? (
                <>
                  <datalist id="public-talk-theme-options">
                    {readyState.publicTalkThemes.map((theme) => (
                      <option key={theme.id} value={publicTalkThemeSearchLabel(theme)} />
                    ))}
                  </datalist>

                  {eventsForPublicMeeting(selectedPublicMeeting, readyState.specialEvents, readyState.weeks).filter((event) => event.type !== "discurso_especial").map((event) => (
                    <div className="theme-warning info" role="status" key={event.id}>
                      Evento especial: {specialEventTypeLabel(event.type)} — {event.title || specialEventTypeLabel(event.type)} ({formatNumericDate(event.start_date)})
                    </div>
                  ))}

                  {selectedPublicMeeting.special_talk_title ? (
                    <div className="theme-warning info special-event-alert" role="status">
                      <strong>Evento especial — Discurso Especial: {selectedPublicMeeting.special_talk_title}</strong>
                      <span>{formatNumericDate(selectedPublicMeeting.meeting_date)} — Orador: {selectedPublicMeeting.public_talk_speaker}</span>
                      <span>Substitui o discurso público desta semana. Para alterar tema, data ou orador, edite o evento em Eventos.</span>
                    </div>
                  ) : null}

                  {publicMeetingSubtab === "received" ? (
                    <section className="public-outgoing-panel" aria-label="Configuração do mês de oradores recebidos">
                      <div className="panel-head compact">
                        <div>
                          <span className="eyebrow">Configuração do mês</span>
                          <h3>{monthTitle(activePublicMeetingMonth)}</h3>
                        </div>
                        {canEdit ? (
                          <button className="secondary-button" type="button" disabled={busy}
                            onClick={() => setReceivedMonthConfig(receivedMonthConfig?.month === activePublicMeetingMonth ? null : {
                              month: activePublicMeetingMonth,
                              congregation: publicMeetingsOfActiveMonth.every((meeting) => meeting.public_talk_speaker_congregation === selectedPublicMeeting.public_talk_speaker_congregation)
                                ? selectedPublicMeeting.public_talk_speaker_congregation ?? "" : "",
                            })}>
                            {receivedMonthConfig?.month === activePublicMeetingMonth ? "Fechar" : "Editar configuração do mês"}
                          </button>
                        ) : null}
                      </div>
                      {canEdit && receivedMonthConfig?.month === activePublicMeetingMonth ? (
                        <div className="public-meeting-grid">
                          <label className="wide-field">
                            <span>Congregação que estamos recebendo</span>
                            <input disabled={busy} value={receivedMonthConfig.congregation}
                              onChange={(event) => setReceivedMonthConfig({ ...receivedMonthConfig, congregation: event.target.value })}
                              placeholder="Nome da congregação de origem" />
                          </label>
                          <p className="empty-copy">Ao salvar, esta congregação será preenchida em todas as reuniões deste mês, substituindo os valores atuais. Depois, você pode ajustar cada reunião individualmente.</p>
                          <div className="action-row">
                            <button className="primary-button" type="button" disabled={busy || !receivedMonthConfig.congregation.trim()}
                              onClick={async () => {
                                const saved = await runAction("updateReceivedCongregationForMonth", {
                                  month_key: receivedMonthConfig.month,
                                  congregation: receivedMonthConfig.congregation.trim(),
                                }, "Congregação dos oradores recebidos atualizada para o mês.");
                                if (saved) setReceivedMonthConfig(null);
                              }}>
                              Salvar configuração do mês
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {publicMeetingSubtab === "assignments" ? (
                    <>
                      <section className="public-month-cards" aria-label="Designações públicas do mês">
                        {publicMeetingsForPrint.map((meeting) => {
                          if (meeting.no_public_meeting_event) return (
                            <button className="public-month-card" key={meeting.id} type="button" onClick={() => setSelectedWeekId(meeting.week_id)}>
                              <strong>{formatNumericDate(meeting.meeting_date)}</strong>
                              <span>Evento especial — {specialEventTypeLabel(meeting.no_public_meeting_event.type)}</span>
                              <span>Sem designações</span>
                            </button>
                          );
                          const meetingCircuitVisit =
                            readyState.specialEvents.find(
                              (event) =>
                                event.type === "visita_superintendente" &&
                                event.start_date <= meeting.meeting_date &&
                                meeting.meeting_date <= event.end_date,
                            ) ?? null;
                          const meetingTheme =
                            meetingCircuitVisit?.weekend_public_talk_title ||
                            (meeting.special_talk_title || publicTalkThemeTitle(meeting.public_talk_theme_id)) ||
                            "Tema a definir";
                          return (
                            <button
                              className={`public-month-card ${meeting.id === selectedPublicMeeting.id ? "active" : ""}`}
                              key={meeting.id}
                              onClick={() => setSelectedWeekId(meeting.week_id)}
                              type="button"
                            >
                              <strong>{formatNumericDate(meeting.meeting_date)}</strong>
                              {eventsForPublicMeeting(meeting, readyState.specialEvents, readyState.weeks).map((event) => <span className="special-event-badge" key={event.id}>Evento especial: {specialEventTypeLabel(event.type)}</span>)}
                              <span>Presidente: {memberName(meeting.chairman_member_id) || "Designar"}</span>
                              <span>Orador: {meetingCircuitVisit?.circuit_overseer_name || meeting.public_talk_speaker || "A definir"}</span>
                              <span>Congregação: {meetingCircuitVisit ? "Visita do superintendente" : meeting.public_talk_speaker_congregation || "A definir"}</span>
                              <span>Tema: {meetingTheme}</span>
                              <span>Dirigente de A Sentinela: {memberName(meeting.watchtower_conductor_member_id) || "Participante 001"}</span>
                              <span>
                                Leitor de A Sentinela:{" "}
                                {meetingCircuitVisit ? "Sem leitura na visita" : memberName(meeting.watchtower_reader_member_id) || "Designar"}
                              </span>
                            </button>
                          );
                        })}
                      </section>

                      <div className="public-meeting-grid">
                    <label>
                      <span>Presidente da reunião</span>
                      <MemberSearchSelect
                        disabled={!canEdit || busy}
                        label="Presidente"
                        onChange={(memberId) => updatePublicMeetingDraft({ chairman_member_id: memberId })}
                        options={rankedPrivilegeMemberOptions(
                          ["presidente_reuniao_publica"],
                          publicMeetingForm.chairman_member_id,
                          selectedPublicMeeting.meeting_date,
                          "chairman",
                        )}
                        value={publicMeetingForm.chairman_member_id}
                      />
                    </label>

                    <label>
                      <span>Dirigente de A Sentinela</span>
                      <div className="locked-value">{memberName(selectedPublicMeeting.watchtower_conductor_member_id) || "Participante 001"}</div>
                    </label>

                    <label>
                      <span>Leitor de A Sentinela</span>
                      {selectedPublicCircuitVisitEvent ? (
                        <div className="locked-value">Sem leitura na visita</div>
                      ) : (
                        <MemberSearchSelect
                          disabled={!canEdit || busy}
                          emptyLabel="Sem leitor"
                          label="Leitor"
                          onChange={(memberId) => updatePublicMeetingDraft({ watchtower_reader_member_id: memberId })}
                          options={rankedPrivilegeMemberOptions(
                            ["leitor_sentinela"],
                            publicMeetingForm.watchtower_reader_member_id,
                            selectedPublicMeeting.meeting_date,
                            "reader",
                          )}
                          placeholder="Pesquisar leitor"
                          value={publicMeetingForm.watchtower_reader_member_id}
                        />
                      )}
                    </label>

                    <label>
                      <span>Estudo de A Sentinela</span>
                      <select
                        disabled={!canEdit || busy}
                        value={publicMeetingForm.watchtower_study_id}
                        onChange={(event) => updatePublicMeetingDraft({ watchtower_study_id: event.target.value })}
                      >
                        <option value="">Selecionar estudo</option>
                        {readyState.watchtowerStudies.map((study) => (
                          <option key={study.id} value={study.id}>
                            {study.study_week_label} - {study.study_title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <span>{selectedPublicMeeting.special_talk_title ? "Discurso Especial" : "Discurso Público"}</span>
                      <input
                        autoComplete="off"
                        disabled={!canEdit || busy || !!selectedPublicMeeting.special_talk_title}
                        list="public-talk-theme-options"
                        value={selectedPublicMeeting.special_talk_title || publicMeetingForm.public_talk_theme_query}
                        onChange={(event) => updatePublicMeetingDraft({ public_talk_theme_query: event.target.value })}
                        placeholder="Pesquisar tema S-34"
                      />
                    </label>

                    <label>
                      <span>Orador</span>
                      <input
                        disabled={!canEdit || busy || !!selectedPublicMeeting.special_talk_title}
                        value={selectedPublicMeeting.special_talk_title ? selectedPublicMeeting.public_talk_speaker ?? "" : publicMeetingForm.public_talk_speaker}
                        onChange={(event) => updatePublicMeetingDraft({ public_talk_speaker: event.target.value })}
                        placeholder="Nome do orador"
                      />
                    </label>

                    <label>
                      <span>Congregação do orador</span>
                      <input
                        disabled={!canEdit || busy}
                        value={publicMeetingForm.public_talk_speaker_congregation}
                        onChange={(event) => updatePublicMeetingDraft({ public_talk_speaker_congregation: event.target.value })}
                        placeholder="Congregação de origem"
                      />
                    </label>

                    <label>
                      <span>Status</span>
                      <select
                        disabled={!canEdit || busy}
                        value={publicMeetingForm.status}
                        onChange={(event) => updatePublicMeetingDraft({ status: event.target.value as PublicMeeting["status"] })}
                      >
                        <option value="rascunho">Rascunho</option>
                        <option value="confirmada">Confirmada</option>
                      </select>
                    </label>

                    <label className="wide-field">
                      <span>Observações</span>
                      <input
                        disabled={!canEdit || busy}
                        value={publicMeetingForm.notes}
                        onChange={(event) => updatePublicMeetingDraft({ notes: event.target.value })}
                        placeholder="Anotações da reunião pública"
                      />
                    </label>
                  </div>

                    </>
                  ) : null}

                  {publicMeetingSubtab === "received" && draftPublicTalkTheme && !selectedPublicMeeting.special_talk_title ? (
                    <div className={`theme-warning ${publicThemeAgeClass(recentPublicTalkWarning?.meeting_date ?? null, selectedPublicMeeting.meeting_date)}`} role="status">
                      {recentPublicTalkWarning
                        ? `Última vez: ${formatNumericDate(recentPublicTalkWarning.meeting_date)}${recentPublicTalkWarning.public_talk_speaker ? ` por ${recentPublicTalkWarning.public_talk_speaker}` : ""}. ${publicThemeAgeLabel(recentPublicTalkWarning.meeting_date, selectedPublicMeeting.meeting_date)}.`
                        : "Nunca proferido aqui."}
                    </div>
                  ) : null}

                  {publicMeetingSubtab === "sent" ? (
                    <>
                    <section className="public-outgoing-panel" aria-label="Configuracao do mes">
                      <div className="panel-head compact">
                        <div>
                          <span className="eyebrow">Configuracao do mes</span>
                          <h3>{monthTitle(activePublicMeetingMonth)}</h3>
                        </div>
                        {canEditOutgoingSpeakerData ? (
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => {
                              setMonthConfigForm({
                                default_weekday: activeMonthDefault?.default_weekday ?? "sabado",
                                default_time: activeMonthDefault?.default_time ?? "",
                                destination_congregation: activeMonthDefault?.destination_congregation ?? "",
                                destination_address: activeMonthDefault?.destination_address ?? "",
                              });
                              setMonthConfigOpen((open) => !open);
                            }}
                          >
                            {monthConfigOpen ? "Fechar" : "Editar configuracao do mes"}
                          </button>
                        ) : null}
                      </div>
                      {monthConfigOpen ? (
                        <div className="public-meeting-grid outgoing-grid">
                          <label>
                            <span>Dia padrao</span>
                            <select
                              disabled={busy}
                              value={monthConfigForm.default_weekday}
                              onChange={(event) =>
                                setMonthConfigForm((form) => ({ ...form, default_weekday: event.target.value as "sabado" | "domingo" }))
                              }
                            >
                              <option value="sabado">Sabado</option>
                              <option value="domingo">Domingo</option>
                            </select>
                          </label>
                          <label>
                            <span>Horario padrao</span>
                            <input
                              disabled={busy}
                              type="time"
                              value={monthConfigForm.default_time}
                              onChange={(event) => setMonthConfigForm((form) => ({ ...form, default_time: event.target.value }))}
                            />
                          </label>
                          <label>
                            <span>Congregacao de destino</span>
                            <input
                              disabled={busy}
                              value={monthConfigForm.destination_congregation}
                              onChange={(event) => setMonthConfigForm((form) => ({ ...form, destination_congregation: event.target.value }))}
                              placeholder="Congregacao de destino"
                            />
                          </label>
                          <label className="wide-field">
                            <span>Endereco</span>
                            <input
                              disabled={busy}
                              value={monthConfigForm.destination_address}
                              onChange={(event) => setMonthConfigForm((form) => ({ ...form, destination_address: event.target.value }))}
                              placeholder="Endereco do salao de destino"
                            />
                          </label>
                          <div className="action-row">
                            <button
                              className="primary-button"
                              disabled={busy}
                              type="button"
                              onClick={() => void saveMonthDefaults(activePublicMeetingMonth)}
                            >
                              Salvar configuracao do mes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="empty-copy">
                          {activeMonthDefault
                            ? `${activeMonthDefault.default_weekday === "domingo" ? "Domingo" : "Sabado"} ` +
                              `${activeMonthDefault.default_time || "sem horario"} - ` +
                              `${activeMonthDefault.destination_congregation || "sem congregacao"}`
                            : "Nenhuma configuracao mensal definida. As reunioes usam os dados individuais."}
                        </p>
                      )}
                    </section>

                    <section className="public-month-cards" aria-label="Oradores enviados do mes">
                      {publicMeetingsOfActiveMonth.map((meeting) => {
                        const resolved = resolveOutgoing(meeting, outgoingListDefault, weekStartById.get(meeting.week_id) ?? null);
                        const effectiveDate = resolved.date;
                        if (meeting.no_public_meeting_event) return (
                          <button className="public-month-card" key={meeting.id} type="button" onClick={() => { setOutgoingDateChoice(null); setSelectedWeekId(meeting.week_id); }}>
                            <strong>{formatNumericDate(effectiveDate)}</strong>
                            <span>Evento especial — {specialEventTypeLabel(meeting.no_public_meeting_event.type)}</span>
                            <span>Sem designações</span>
                          </button>
                        );
                        return (
                          <button
                            className={`public-month-card ${meeting.id === selectedPublicMeeting?.id ? "active" : ""}`}
                            key={meeting.id}
                            onClick={() => {
                              setOutgoingMonth(activePublicMeetingMonth);
                              setOutgoingDateChoice({ meetingId: meeting.id, date: effectiveDate });
                              setSelectedWeekId(meeting.week_id);
                            }}
                            type="button"
                          >
                            <strong>
                              {formatNumericDate(effectiveDate)}
                              {resolved.isException ? <em className="exception-badge">Excecao</em> : null}
                            </strong>
                            <span>Orador: {meeting.outgoing_speaker || "A definir"}</span>
                            <span>Tema: {meeting.outgoing_talk_theme || "A definir"}</span>
                            <span>Congregacao: {resolved.destinationCongregation || "A definir"}</span>
                            <span>Horario: {resolved.time || "A definir"}</span>
                            <span>Endereco: {resolved.destinationAddress || "A definir"}</span>
                          </button>
                        );
                      })}
                    </section>

                    <section className="speaker-themes-panel" aria-label="Temas dos nossos oradores">
                    <div className="panel-head compact">
                      <div>
                        <span className="eyebrow">Temas dos nossos oradores</span>
                        <h3>Lista por orador</h3>
                      </div>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={shareAuthorizedSpeakerTalksWhatsApp}
                        disabled={authorizedOutgoingSpeakerOptions.length === 0}
                      >
                        Enviar temas
                      </button>
                    </div>
                    <div className="speaker-card-list" aria-label="Oradores cadastrados">
                      {ourSpeakerOptions.map((member) => (
                        <button
                          className={`speaker-card ${member.id === selectedOurSpeakerId ? "active" : ""}`}
                          key={member.id}
                          onClick={() => setSelectedOurSpeakerId(member.id)}
                          type="button"
                        >
                          <strong>{member.name}</strong>
                          <span>{speakerPrivilegeLabel(member)}</span>
                          {member.privileges.includes("discurso_fora") ? <em>Autorizado</em> : null}
                        </button>
                      ))}
                    </div>
                    <div className="speaker-themes-add">
                      <select
                        value={selectedOurSpeakerId}
                        onChange={(event) => setSelectedOurSpeakerId(event.target.value)}
                        disabled={busy}
                      >
                        <option value="">Escolher orador...</option>
                        {ourSpeakerOptions.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} - {speakerPrivilegeLabel(member)}
                          </option>
                        ))}
                      </select>
                      <input
                        placeholder="Filtrar tema por número ou palavra"
                        value={ourSpeakerThemeQuery}
                        onChange={(event) => setOurSpeakerThemeQuery(event.target.value)}
                        disabled={busy || !selectedOurSpeaker}
                      />
                    </div>
                    {selectedOurSpeaker ? (
                      <>
                        <div className="theme-checkbox-list" aria-label="Marcar temas do orador">
                          {filteredOurSpeakerThemeOptions.map((theme) => (
                            <label key={theme.id}>
                              <input
                                checked={selectedOurSpeakerTalkByThemeId.has(theme.id)}
                                disabled={!canEditOurSpeakerThemes(selectedOurSpeaker) || busy}
                                onChange={(event) => void toggleOurSpeakerTalkTheme(theme.id, event.target.checked)}
                                type="checkbox"
                              />
                              <span>Nº {String(theme.number).padStart(3, "0")} — {theme.title}</span>
                            </label>
                          ))}
                        </div>
                        {selectedOurSpeakerTalks.length === 0 ? (
                          <p className="empty-copy">Nenhum tema cadastrado para este orador.</p>
                        ) : null}
                      </>
                    ) : null}
                    </section>

                    <section className="public-outgoing-panel" aria-label="Designação de discurso fora">
                      <div className="panel-head compact">
                        <div>
                          <span className="eyebrow">Saída de oradores</span>
                          <h3>Dados para a folha</h3>
                        </div>
                      </div>
                      <div className="public-meeting-grid outgoing-grid">
                        <label>
                          <span>Mês</span>
                          <select
                            value={activePublicMeetingMonth}
                            onChange={(event) => {
                              const month = event.target.value;
                              setOutgoingMonth(month);
                              const defaults = monthDefaultFor(readyState.publicMeetingMonthDefaults, month);
                              const day = defaults?.default_weekday ?? outgoingWeekendDay;
                              const option = outgoingDateOptions.find((item) => item.day === day && item.date.startsWith(month));
                              if (option) {
                                setOutgoingDateChoice({ meetingId: option.meeting.id, date: option.date });
                                setSelectedWeekId(option.meeting.week_id);
                              }
                            }}
                          >
                            {publicMeetingMonthOptions.map((monthKey) => (
                              <option key={monthKey} value={monthKey}>
                                {monthTitle(monthKey)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Congregação</span>
                          <input
                            disabled={!canEditOutgoingSpeakerData || busy}
                            value={publicMeetingForm.outgoing_congregation}
                            onChange={(event) => updatePublicMeetingDraft({ outgoing_congregation: event.target.value })}
                            placeholder="Congregação de destino"
                          />
                        </label>
                        <label className="wide-field">
                          <span>Endereço</span>
                          <input
                            disabled={!canEditOutgoingSpeakerData || busy}
                            value={publicMeetingForm.outgoing_address}
                            onChange={(event) => updatePublicMeetingDraft({ outgoing_address: event.target.value })}
                            placeholder="Endereço do salão"
                          />
                        </label>
                        <label>
                          <span>Hora</span>
                          <input
                            disabled={!canEditOutgoingSpeakerData || busy}
                            type="time"
                            value={publicMeetingForm.outgoing_time}
                            onChange={(event) => updatePublicMeetingDraft({ outgoing_time: event.target.value })}
                          />
                        </label>
                        <label>
                          <span>Dia</span>
                          <select
                            disabled={!canEditOutgoingSpeakerData || busy}
                            value={outgoingWeekendDay}
                            onChange={(event) => {
                              const day = event.target.value as "sabado" | "domingo";
                              const weekStart = weekStartById.get(selectedPublicMeeting?.week_id ?? "");
                              setOutgoingWeekendDay(day);
                              setOutgoingMonth(activePublicMeetingMonth);
                              if (weekStart) {
                                const date = defaultDateForWeek(weekStart, day);
                                const option = outgoingDateOptions.find((item) => item.day === day && item.date.startsWith(activePublicMeetingMonth) && item.date === date)
                                  ?? outgoingDateOptions.find((item) => item.day === day && item.date.startsWith(activePublicMeetingMonth));
                                if (option) {
                                  setOutgoingDateChoice({ meetingId: option.meeting.id, date: option.date });
                                  updatePublicMeetingDraft({ outgoing_date: option.date });
                                  setSelectedWeekId(option.meeting.week_id);
                                }
                              }
                            }}
                          >
                            <option value="sabado">Sábado</option>
                            <option value="domingo">Domingo</option>
                          </select>
                        </label>
                        <label>
                          <span>Data</span>
                          <select
                            value={selectedPublicMeeting ? `${selectedPublicMeeting.id}|${publicMeetingForm.outgoing_date || selectedPublicMeeting.meeting_date}` : ""}
                            disabled={!canEditOutgoingSpeakerData || busy}
                            onChange={(event) => {
                              const [meetingId, date] = event.target.value.split("|");
                              const meeting = readyState.publicMeetings.find((item) => item.id === meetingId);
                              if (meeting) {
                                setOutgoingDateChoice({ meetingId, date });
                                updatePublicMeetingDraft({ outgoing_date: date });
                                setSelectedWeekId(meeting.week_id);
                              }
                            }}
                          >
                            {outgoingDateOptionsForDay.map((option) => (
                              <option key={`${option.meeting.id}-${option.date}`} value={`${option.meeting.id}|${option.date}`} disabled={!!option.meeting.no_public_meeting_event}>
                                {option.label}{option.meeting.no_public_meeting_event ? " — Evento especial — Sem designações" : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Orador enviado</span>
                          <MemberSearchSelect
                            disabled={!canEditOutgoingSpeakerData || busy}
                            emptyLabel="Sem orador"
                            label="Orador"
                            onChange={(memberId) => updatePublicMeetingDraft({ outgoing_speaker: memberName(memberId) })}
                            options={outgoingSpeakerOptions(
                              memberIdByExactName(publicMeetingForm.outgoing_speaker),
                              publicMeetingForm.outgoing_date || selectedPublicMeeting?.meeting_date || "",
                            )}
                            placeholder="Pesquisar orador"
                            value={memberIdByExactName(publicMeetingForm.outgoing_speaker)}
                          />
                        </label>
                        <label>
                          <span>Esboço</span>
                          <input
                            autoComplete="off"
                            disabled={!canEditOutgoingSpeakerData || busy}
                            list="public-talk-theme-options"
                            value={publicMeetingForm.outgoing_talk_theme}
                            onChange={(event) => updatePublicMeetingDraft({ outgoing_talk_theme: event.target.value })}
                            placeholder="Pesquisar tema S-34"
                          />
                        </label>
                        <label>
                          <span>Cântico</span>
                          <input
                            disabled={!canEditOutgoingSpeakerData || busy}
                            value={publicMeetingForm.outgoing_song}
                            onChange={(event) => updatePublicMeetingDraft({ outgoing_song: event.target.value })}
                            placeholder="Número ou título"
                          />
                        </label>
                      </div>
                      <div className="action-row">
                        {selectedPublicMeeting &&
                        resolveOutgoing(selectedPublicMeeting, activeMonthDefault, weekStartById.get(selectedPublicMeeting.week_id) ?? null).isException ? (
                          <button
                            className="secondary-button"
                            disabled={!canEditOutgoingSpeakerData || busy}
                            type="button"
                            onClick={() => void resetMeetingToMonthDefault(selectedPublicMeeting.id)}
                          >
                            Voltar ao padrao do mes
                          </button>
                        ) : null}
                        <button className="primary-button" disabled={!canEditOutgoingSpeakerData || busy} onClick={savePublicMeeting} type="button">
                          Salvar discurso fora
                        </button>
                        <button className="primary-button" onClick={printOutgoingSpeakerSheet} type="button">
                          Imprimir folha
                        </button>
                        <button className="secondary-button" onClick={printOutgoingMonthSheets} type="button">
                          Imprimir designações do mês
                        </button>
                        <button className="secondary-button" disabled={sheetImageBusy} onClick={() => downloadOutgoingSpeakerImage("png")} type="button">
                          Baixar PNG
                        </button>
                        <button className="secondary-button" disabled={sheetImageBusy} onClick={() => downloadOutgoingSpeakerImage("jpg")} type="button">
                          Baixar JPG
                        </button>
                        <button className="secondary-button" disabled={sheetImageBusy} onClick={shareOutgoingSpeakerImage} type="button">
                          Compartilhar WhatsApp
                        </button>
                      </div>
                    </section>
                    </>
                  ) : null}

                  {publicMeetingSubtab === "received" ? (
                  <section className="speaker-themes-panel" aria-label="Consultar temas do orador">
                    <div className="panel-head compact">
                      <div>
                        <span className="eyebrow">Consultar temas do orador</span>
                        <h3>Qual tema escolher</h3>
                      </div>
                    </div>
                    <p className="speaker-themes-help">
                      Adicione os temas que o orador ofereceu. A lista mostra primeiro os que nunca passaram ou fazem mais tempo.
                    </p>
                    <div className="speaker-themes-add">
                      <input
                        placeholder="Buscar tema por número ou palavra"
                        value={speakerThemeQuery}
                        onChange={(event) => setSpeakerThemeQuery(event.target.value)}
                      />
                      {speakerThemeIds.length > 0 ? (
                        <button className="ghost-button" type="button" onClick={() => { setSpeakerThemeIds([]); setSpeakerThemeAssignments({}); }}>
                          Limpar
                        </button>
                      ) : null}
                    </div>

                    <div className="theme-checkbox-list" aria-label="Marcar temas para consulta">
                      {filteredSpeakerThemeOptions.map((theme) => (
                        <label key={theme.id}>
                          <input
                            checked={speakerThemeIds.includes(theme.id)}
                            onChange={() => toggleSpeakerTheme(theme.id)}
                            type="checkbox"
                          />
                          <span>Nº {String(theme.number).padStart(3, "0")} — {theme.title}</span>
                        </label>
                      ))}
                    </div>

                    {speakerThemeAnalysis.length > 0 ? (
                      <div className="speaker-themes-list">
                        {speakerThemeAnalysis.map((item) => (
                          <div className={`speaker-theme-row ${publicThemeAgeClass(item.lastDate, item.referenceDate)}`} key={item.themeId}>
                            <div className="speaker-theme-info">
                              <strong>
                                {publicThemeAgeClass(item.lastDate, item.referenceDate) === "recent" ? <span className="theme-alert-mark">!</span> : null}
                                {item.theme ? `${item.theme.number}. ${item.theme.title}` : "Tema"}
                              </strong>
                              <small>
                                {item.meetingsAgo == null
                                  ? "Nunca apresentado aqui"
                                  : `Última vez: ${formatNumericDate(item.lastDate ?? "")} — ${publicThemeAgeLabel(item.lastDate, item.referenceDate)}`}
                              </small>
                            </div>
                            <div className="speaker-theme-actions">
                              <input
                                aria-label={`Nome do orador para o tema ${item.theme?.number ?? ""}`}
                                placeholder="Nome do orador"
                                disabled={!canEdit || busy}
                                value={speakerThemeAssignments[item.themeId]?.speaker ?? ""}
                                onChange={(event) => updateSpeakerThemeAssignment(item.themeId, { speaker: event.target.value })}
                              />
                              <select
                                aria-label={`Data para o tema ${item.theme?.number ?? ""}`}
                                disabled={!canEdit || busy}
                                value={speakerThemeAssignments[item.themeId]?.meetingId ?? ""}
                                onChange={(event) => updateSpeakerThemeAssignment(item.themeId, { meetingId: event.target.value })}
                              >
                                <option value="">Escolher data...</option>
                                {publicMeetingsForPrint.map((meeting) => (
                                  <option key={meeting.id} value={meeting.id} disabled={eventsForPublicMeeting(meeting, readyState.specialEvents, readyState.weeks).some((event) => event.type === "discurso_especial" || event.type === "visita_superintendente" || event.type === "assembleia" || event.type === "congresso")}>
                                    {formatNumericDate(meeting.meeting_date)}{eventsForPublicMeeting(meeting, readyState.specialEvents, readyState.weeks).some((event) => event.type === "discurso_especial" || event.type === "visita_superintendente" || event.type === "assembleia" || event.type === "congresso") ? " — Evento especial" : ""}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="primary-button compact-button"
                                type="button"
                                disabled={!canEdit || busy || !speakerThemeAssignments[item.themeId]?.meetingId}
                                onClick={() => assignSpeakerTheme(item.themeId)}
                              >
                                Designar
                              </button>
                              <button className="ghost-button" type="button" onClick={() => removeSpeakerTheme(item.themeId)}>
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </section>
                  ) : null}

                  {publicMeetingSubtab === "assignments" ? (
                    <>
                  {selectedPublicCircuitVisitEvent ? (
                    <div className="theme-warning info" role="status">
                      Semana da visita: o discurso público vem do evento
                      {selectedPublicCircuitVisitEvent.weekend_public_talk_title
                        ? ` "${selectedPublicCircuitVisitEvent.weekend_public_talk_title}"`
                        : ""}; A Sentinela fica sem leitor e depois entra o discurso final
                      {selectedPublicCircuitVisitEvent.weekend_final_talk_title
                        ? ` "${selectedPublicCircuitVisitEvent.weekend_final_talk_title}"`
                        : " da visita"}
                      {selectedPublicCircuitVisitEvent.weekend_final_talk_song
                        ? `, com ${formatSong(selectedPublicCircuitVisitEvent.weekend_final_talk_song)}`
                        : ""}.
                    </div>
                  ) : null}

                  <div className="source-box">
                    <strong>{selectedWatchtowerStudy?.study_title ?? "Estudo de A Sentinela"}</strong>
                    <span>
                      {selectedWatchtowerStudy
                        ? `${selectedWatchtowerStudy.study_week_label} | ${selectedWatchtowerStudy.issue_title}`
                        : "Atualize A Sentinela para carregar os estudos disponíveis."}
                    </span>
                  </div>

                  {readyState.latestWatchtowerSync ? (
                    <div className="sync-status compact-sync">
                      <strong>{readyState.latestWatchtowerSync.message}</strong>
                      <span>Última verificação: {formatDateTime(readyState.latestWatchtowerSync.checked_at)}</span>
                    </div>
                  ) : null}

                  <div className="action-row">
                    <button className="primary-button" disabled={!canEdit || busy} onClick={savePublicMeeting} type="button">
                      Salvar reunião pública
                    </button>
                    <button
                      className="secondary-button"
                      disabled={busy}
                      onClick={() => setPublicMeetingForm(createPublicMeetingDraft(selectedPublicMeeting, readyState.publicTalkThemes))}
                      type="button"
                    >
                      Desfazer alterações
                    </button>
                    <button className="primary-button" onClick={printPublicMeetingSheet} type="button">
                      Imprimir reunião pública
                    </button>
                    <button className="secondary-button" disabled={sheetImageBusy} onClick={() => downloadPublicMeetingImage("png")} type="button">
                      Baixar PNG
                    </button>
                    <button className="secondary-button" disabled={sheetImageBusy} onClick={() => downloadPublicMeetingImage("jpg")} type="button">
                      Baixar JPG
                    </button>
                    <button className="secondary-button" disabled={sheetImageBusy} onClick={sharePublicMeetingImage} type="button">
                      Compartilhar imagem
                    </button>
                    <button className="secondary-button" disabled={!canEdit || busy} onClick={syncWatchtowerStudies} type="button">
                      Atualizar A Sentinela
                    </button>
                    <button className="secondary-button" disabled={!canEdit || busy} onClick={importPublicMeetingHistory} type="button">
                      Importar histórico público
                    </button>
                  </div>
                    </>
                  ) : null}

                  {publicMeetingSubtab === "received" ? (
                  <section className="theme-history" aria-label="Histórico de discursos públicos">
                    <div className="panel-head compact">
                      <div>
                        <span className="eyebrow">Histórico</span>
                        <h2>Temas proferidos</h2>
                      </div>
                    </div>
                    {publicTalkThemeHistory.length > 0 ? (
                      <div className="history-list">
                        {publicTalkThemeHistory.map((meeting) => {
                          const theme = readyState.publicTalkThemes.find((item) => item.id === meeting.public_talk_theme_id);
                          return (
                            <div key={meeting.id}>
                              <strong>{theme ? `${theme.number}. ${theme.title}` : "Tema não encontrado"}</strong>
                              <span>
                                {formatShortDate(meeting.date)}
                                {meeting.speaker ? ` - ${meeting.speaker}` : ""}
                                {meeting.congregation ? ` (${meeting.congregation})` : ""}
                                {meeting.sourceLabel ? ` - ${meeting.sourceLabel}` : ""}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="empty-copy">Nenhum tema público registrado ainda.</p>
                    )}
                  </section>
                  ) : null}
                </>
              ) : (
                <p className="empty-copy">Atualize as apostilas para criar a semana da reunião pública.</p>
              )}
            </article>
          </section>
        ) : null}

        {currentNav === MECHANICAL_NAV ? (
          <section className="tab-panel" aria-label="Designações Mecânicas">
            <article className="panel utility-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Áudio, vídeo e apoio</span>
                  <h2>Designações mecânicas</h2>
                </div>
                <div className="action-row schedule-actions">
                  <label className="month-control">
                    <span>Mês</span>
                    <select
                      value={activeMechanicalMonth}
                      onChange={(event) => setSelectedMechanicalMonth(event.target.value)}
                    >
                      {(mechanicalMonthOptions.length > 0 ? mechanicalMonthOptions : [activeMechanicalMonth]).map((monthKey) => (
                        <option key={monthKey} value={monthKey}>
                          {monthTitle(monthKey)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button" onClick={printMechanicalSchedule} type="button">
                    Imprimir mês A/V
                  </button>
                  <button className="secondary-button" disabled={sheetImageBusy} onClick={() => downloadMechanicalImage("png")} type="button">
                    Baixar PNG
                  </button>
                  <button className="secondary-button" disabled={sheetImageBusy} onClick={() => downloadMechanicalImage("jpg")} type="button">
                    Baixar JPG
                  </button>
                  <button className="secondary-button" disabled={sheetImageBusy} onClick={shareMechanicalImage} type="button">
                    Compartilhar imagem
                  </button>
                  <button className="secondary-button" disabled={!canEdit || busy} onClick={generateMechanicalSuggestions} type="button">
                    Gerar sugestões A/V
                  </button>
                  <button className="secondary-button" disabled={!canEdit || busy || mechanicalAssignmentsForDisplay.length === 0} onClick={() => saveMechanicalMonth()} type="button">
                    Salvar rascunho
                  </button>
                  <button className="primary-button" disabled={!canEdit || busy || mechanicalAssignmentsForDisplay.length === 0} onClick={() => saveMechanicalMonth(true)} type="button">
                    Publicar mês
                  </button>
                  <button className="secondary-button" disabled={!canEdit || busy || mechanicalAssignmentsForDisplay.length === 0} onClick={clearMechanicalMonth} type="button">
                    Limpar designações do mês
                  </button>
                </div>
              </div>

              <div className="source-box">
                <strong>Escala mensal</strong>
                <span>
                  Salvar mantém todas as mecânicas do mês em rascunho. Publicar mês disponibiliza a escala mensal aos participantes.
                </span>
              </div>

              <div className="mechanical-list">
                {mechanicalAssignmentsForDisplay.length > 0 ? (
                  mechanicalAssignmentsForDisplay.map((assignment) => {
                    const draft = mechanicalDrafts[assignment.id] ?? createMechanicalDraft(assignment);
                    return (
                      <div className="schedule-card mechanical-card" key={assignment.id}>
                        <div className="schedule-card-head">
                          <div>
                            <span>{meetingKindLabel(assignment.meeting_kind)}</span>
                            <strong>{formatLongDate(assignment.assignment_date)}</strong>
                          </div>
                          <span className="status-pill">
                            {assignment.status === "confirmada" ? "Publicada" : "Rascunho"}
                          </span>
                        </div>
                        <div className="mechanical-grid">
                          {mechanicalRoleFields.map((field) => (
                            <MemberSearchSelect
                              disabled={!canEdit || busy}
                              emptyLabel={`Sem ${field.label.toLowerCase()}`}
                              key={`${assignment.id}-${field.key}`}
                              label={field.label}
                              onChange={(memberId) =>
                                updateMechanicalDraft(assignment.id, { [field.key]: memberId } as Partial<MechanicalAssignmentDraft>)
                              }
                              options={mechanicalMemberOptions(
                                field.privilege,
                                draft[field.key],
                                assignment.assignment_date,
                                field.label,
                                assignment,
                                draft,
                                field.key,
                              )}
                              placeholder={`Pesquisar ${field.label.toLowerCase()}`}
                              value={draft[field.key]}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-copy">Nenhuma designação mecânica cadastrada para este mês.</p>
                )}
              </div>
            </article>
            <article className="panel utility-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">{monthTitle(activeMechanicalMonth)}</span>
                  <h2>Designações por pessoa no mês</h2>
                </div>
              </div>
              <p className="empty-copy">Quantidade por função e total de designações mecânicas. O resumo acompanha as alterações da escala acima.</p>
              {mechanicalMonthSummary.length > 0 ? (
                <div className="mechanical-summary-scroll" role="region" aria-label="Resumo mensal de designações mecânicas" tabIndex={0}>
                  <table className="mechanical-summary-table">
                    <thead>
                      <tr>
                        <th scope="col">Pessoa</th>
                        {mechanicalRoleFields.map((field) => <th scope="col" key={field.key}>{field.label}</th>)}
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mechanicalMonthSummary.map((row) => (
                        <tr key={row.memberId}>
                          <th scope="row">{row.name}</th>
                          {mechanicalRoleFields.map((field) => <td key={field.key}>{row.counts[field.key]}</td>)}
                          <td><strong>{row.total}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th scope="row">Total do mês</th>
                        {mechanicalRoleFields.map((field) => <td key={field.key}>{mechanicalMonthSummary.reduce((sum, row) => sum + row.counts[field.key], 0)}</td>)}
                        <td>{mechanicalMonthSummary.reduce((sum, row) => sum + row.total, 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : <p className="empty-copy">Nenhuma pessoa designada neste mês.</p>}
            </article>
          </section>
        ) : null}

        {currentNav === FIELD_MINISTRY_NAV ? (
          <section className="tab-panel" aria-label="Ministério de Campo">
            <article className="panel utility-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Serviço de campo</span>
                  <h2>Designações do ministério de campo</h2>
                </div>
                <div className="action-row schedule-actions">
                  <label className="month-control">
                    <span>Mês</span>
                    <select
                      value={activeFieldMinistryMonth}
                      onChange={(event) => {
                        setSelectedFieldMinistryMonth(event.target.value);
                        setSelectedFieldMinistryDate("");
                      }}
                    >
                      {(fieldMinistryMonthOptions.length > 0 ? fieldMinistryMonthOptions : [activeFieldMinistryMonth]).map((monthKey) => (
                        <option key={monthKey} value={monthKey}>
                          {monthTitle(monthKey)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button" onClick={printFieldMinistrySchedule} type="button">
                    Imprimir mês
                  </button>
                  <button className="secondary-button" disabled={fieldImageBusy} onClick={() => downloadFieldMinistryImage("png")} type="button">
                    Baixar PNG
                  </button>
                  <button className="secondary-button" disabled={fieldImageBusy} onClick={() => downloadFieldMinistryImage("jpg")} type="button">
                    Baixar JPG
                  </button>
                  <button className="secondary-button" disabled={fieldImageBusy} onClick={shareFieldMinistryImage} type="button">
                    Compartilhar imagem
                  </button>
                  <button className="secondary-button" disabled={!canEdit || busy} onClick={generateFieldMinistryMonth} type="button">
                    Gerar mês
                  </button>
                </div>
              </div>

              <div className="source-box">
                <strong>Regra mensal</strong>
                <span>
                  Segunda a quinta são fixas. Para designar, aparecem as sextas, sábados, domingos e feriados de São Paulo/SP.
                </span>
              </div>

              <div className="field-filter-bar" aria-label="Filtros do ministério de campo">
                <label>
                  <span>Dia</span>
                  <select
                    value={fieldMinistryDayFilter}
                    onChange={(event) => {
                      setFieldMinistryDayFilter(event.target.value as FieldMinistryDayFilter);
                      if (event.target.value !== "dom") setFieldMinistryGroupFilter("");
                    }}
                  >
                    {fieldMinistryDayFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {fieldMinistryDayFilter === "dom" ? (
                  <label>
                    <span>Grupo</span>
                    <select value={fieldMinistryGroupFilter} onChange={(event) => setFieldMinistryGroupFilter(event.target.value)}>
                      <option value="">Todos os grupos</option>
                      {readyState.fieldServiceGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
              </div>

              {fieldMinistryFilterMessage ? (
                <div className="theme-warning info" role="status">
                  {fieldMinistryFilterMessage}
                </div>
              ) : null}
              {fieldMinistryPendingMessage ? (
                <div className="theme-warning" role="status">
                  {fieldMinistryPendingMessage}
                </div>
              ) : null}

              <div className="field-calendar-shell">
                <div className="field-calendar-panel">
                  <div className="field-calendar-title">
                    <strong>{monthTitle(activeFieldMinistryMonth)}</strong>
                    <span>Toque em uma data para editar as saídas do dia.</span>
                  </div>
                  <div className="field-calendar-grid" aria-label={`Calendário do campo de ${monthTitle(activeFieldMinistryMonth)}`}>
                    {fieldCalendarWeekdays.map((weekday) => (
                      <div className="field-calendar-weekday" key={weekday}>
                        {fieldWeekdayLabel(weekday).toLowerCase()}.
                      </div>
                    ))}
                    {fieldMinistryCalendarDays.map((day) => {
                      const dayAssignments = fieldMinistryMonthAllAssignments.filter(
                        (assignment) => assignment.activity_date === day.date,
                      );
                      const fixedSlots = fixedFieldSlotsForDate(day.date);
                      const hasEditable = dayAssignments.some(isEditableFieldMinistryAssignment);
                      const isSelected = day.date === activeFieldMinistryDate;
                      const isFiltered = fieldMinistryVisibleDates.has(day.date);
                      const isHoliday = isSaoPauloHoliday(day.date);
                      return (
                        <button
                          aria-pressed={isSelected}
                          className={[
                            "field-calendar-day",
                            day.inMonth ? "is-current-month" : "is-out-month",
                            isSelected ? "is-selected" : "",
                            hasEditable ? "has-editable" : "",
                            isHoliday ? "is-holiday" : "",
                            !isHoliday && day.weekday === "sab" ? "is-saturday" : "",
                            !isHoliday && day.weekday === "dom" ? "is-sunday" : "",
                            !isHoliday && day.weekday === "sex" ? "is-friday" : "",
                            isFiltered || !hasEditable ? "" : "is-filtered-out",
                          ].join(" ")}
                          disabled={!day.inMonth}
                          key={day.date}
                          onClick={() => {
                            const nextFilter: FieldMinistryDayFilter = isHoliday
                              ? "feriado"
                              : day.weekday === "sex" || day.weekday === "sab" || day.weekday === "dom"
                                ? day.weekday
                                : "all";
                            setSelectedFieldMinistryDate(day.date);
                            setFieldMinistryDayFilter(nextFilter);
                            if (day.weekday !== "dom") setFieldMinistryGroupFilter("");
                          }}
                          type="button"
                        >
                          <span className="field-calendar-number">{day.dayNumber}</span>
                          {(() => {
                            const lines = [
                              ...fixedSlots.map((slot) => ({
                                key: `f-${slot.startTime}-${slot.conductor}`,
                                text: `${displayTime(slot.startTime)} ${shortName(slot.conductor)}`,
                              })),
                              ...dayAssignments
                                .map((assignment) => ({
                                  key: assignment.id,
                                  conductor: fieldConductorPrintName(assignment, memberName),
                                  time: assignment.start_time,
                                }))
                                .filter((line) => line.conductor.trim() !== "")
                                .map((line) => ({
                                  key: line.key,
                                  text: `${displayTime(line.time)} ${shortName(line.conductor)}`,
                                })),
                            ];
                            if (lines.length === 0) return null;
                            const shown = lines.slice(0, 3);
                            const extra = lines.length - shown.length;
                            return (
                              <span className="field-calendar-lines">
                                {shown.map((line) => (
                                  <small className="field-calendar-line" key={line.key}>
                                    {line.text}
                                  </small>
                                ))}
                                {extra > 0 ? <small className="field-calendar-more">+{extra}</small> : null}
                              </span>
                            );
                          })()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <section className="field-date-group field-selected-day" aria-label={`Campo em ${formatLongDate(activeFieldMinistryDate)}`}>
                  <div className="field-date-head">
                    <div>
                      <span>
                        {fieldWeekdayLabel(fieldDayForDate(activeFieldMinistryDate))}
                        {isSaoPauloHoliday(activeFieldMinistryDate) ? " - Feriado" : ""}
                      </span>
                      <strong>{formatLongDate(activeFieldMinistryDate)}</strong>
                    </div>
                    <small>{selectedFieldMinistryAssignments.length} saída{selectedFieldMinistryAssignments.length === 1 ? "" : "s"} editável{selectedFieldMinistryAssignments.length === 1 ? "" : "is"}</small>
                  </div>

                  {selectedFieldMinistryFixedSlots.length > 0 ? (
                    <div className="fixed-field-list" aria-label="Saídas fixas desta data">
                      {selectedFieldMinistryFixedSlots.map((slot) => (
                        <div key={`${activeFieldMinistryDate}-${slot.startTime}-${slot.conductor}`}>
                          <strong>{displayTime(slot.startTime)}</strong>
                          <span>{slot.conductor}</span>
                          <small>{slot.note ?? "Saída fixa"}</small>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {selectedFieldMinistryAssignments.length > 0 ? (
                    selectedFieldMinistryAssignments.map((assignment) => {
                      const draft = fieldMinistryDrafts[assignment.id] ?? createFieldMinistryDraft(assignment);
                      const conductorOptions = fieldConductorOptions(assignment, draft.conductor_member_id);
                      const selectedConductorOption = conductorOptions.find((option) => option.member.id === draft.conductor_member_id) ?? null;
                      return (
                        <div className="schedule-card field-card" key={assignment.id}>
                          <div className="schedule-card-head">
                            <div>
                              <span>
                                {fieldWeekdayLabel(assignment.weekday)} - {fieldArrangementLabel(assignment.arrangement)}
                              </span>
                              <strong>{formatLongDate(assignment.activity_date)}</strong>
                              <small>
                                {assignment.field_service_group_id ? groupName(assignment.field_service_group_id) : "Todos conforme arranjo"}
                              </small>
                            </div>
                            <select
                              aria-label={`Status do campo de ${formatLongDate(assignment.activity_date)}`}
                              disabled={!canEdit || busy}
                              value={draft.status}
                              onChange={(event) =>
                                updateFieldMinistryDraft(assignment.id, {
                                  status: event.target.value as SimpleScheduleStatus,
                                })
                              }
                            >
                              <option value="rascunho">Rascunho</option>
                              <option value="confirmada">Confirmada</option>
                            </select>
                          </div>

                          <div className="field-ministry-grid">
                            <label>
                              <span>Horário</span>
                              <input
                                disabled={!canEdit || busy}
                                type="time"
                                value={draft.start_time}
                                onChange={(event) => updateFieldMinistryDraft(assignment.id, { start_time: event.target.value })}
                              />
                            </label>
                            <MemberSearchSelect
                              disabled={!canEdit || busy}
                              emptyLabel="Sem dirigente"
                              label="Dirigente"
                              onChange={(memberId) => updateFieldMinistryDraft(assignment.id, { conductor_member_id: memberId })}
                              options={conductorOptions}
                              placeholder="Pesquisar dirigente"
                              value={draft.conductor_member_id}
                            />
                            <label>
                              <span>Dirigente visitante</span>
                              <input
                                disabled={!canEdit || busy}
                                value={draft.guest_conductor_name}
                                onChange={(event) => updateFieldMinistryDraft(assignment.id, { guest_conductor_name: event.target.value })}
                                placeholder="Ex.: Superintendente de circuito"
                              />
                            </label>
                            <label>
                              <span>Local de saída</span>
                              <input
                                disabled={!canEdit || busy}
                                value={draft.location}
                                onChange={(event) => updateFieldMinistryDraft(assignment.id, { location: event.target.value })}
                                placeholder="Salão do Reino"
                              />
                            </label>
                            <label className="wide-field">
                              <span>Observações</span>
                              <input
                                disabled={!canEdit || busy}
                                value={draft.notes}
                                onChange={(event) => updateFieldMinistryDraft(assignment.id, { notes: event.target.value })}
                                placeholder="Anotações da saída"
                              />
                            </label>
                          </div>

                          {draft.guest_conductor_name ? (
                            <div className="field-card-insights">
                              <strong>Dirigente visitante: {draft.guest_conductor_name}</strong>
                              <span className="note-info">Use este campo para a semana da visita sem cadastrar o superintendente como participante.</span>
                            </div>
                          ) : selectedConductorOption ? (
                            <div className="field-card-insights">
                              <strong>{selectedConductorOption.detail}</strong>
                              {selectedConductorOption.notes.length > 0 ? (
                                selectedConductorOption.notes.slice(0, 4).map((note) => (
                                  <span className={`note-${note.level}`} key={`${assignment.id}-${note.level}-${note.text}`}>
                                    {note.text}
                                  </span>
                                ))
                              ) : (
                                <span className="note-info">Sem alertas para essa escolha.</span>
                              )}
                            </div>
                          ) : (
                            <div className="field-card-insights muted-insight">
                              Escolha um dirigente para ver histórico de campo e cruzamentos com reunião pública.
                            </div>
                          )}

                          <div className="action-row">
                            <button
                              className="primary-button"
                              disabled={!canEdit || busy}
                              onClick={() => saveFieldMinistryAssignment(assignment)}
                              type="button"
                            >
                              Salvar campo
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : selectedFieldMinistryAllAssignments.length > 0 ? (
                    <p className="empty-copy">Nenhuma saída editável para esta data com os filtros atuais.</p>
                  ) : (
                    <p className="empty-copy">Esta data tem apenas saída fixa ou não precisa de designação pelo arranjo atual.</p>
                  )}
                </section>
              </div>

              <div className="field-summary-bottom" aria-label="Resumo mensal do campo">
                <div className="field-month-dashboard">
                  <div>
                    <strong>{fieldMinistryMonthSummary.total}</strong>
                    <span>datas para revisar</span>
                  </div>
                  <div>
                    <strong>{fieldMinistryMonthSummary.pending}</strong>
                    <span>sem dirigente</span>
                  </div>
                  <div>
                    <strong>{fieldMinistryMonthSummary.confirmed}</strong>
                    <span>confirmadas</span>
                  </div>
                  <div>
                    <strong>{fieldMinistryMonthSummary.publicCrossings}</strong>
                    <span>cruzam com reunião pública</span>
                  </div>
                </div>

                <div className="field-month-breakdown">
                  <span>Sextas: {fieldMinistryMonthSummary.fridays}</span>
                  <span>Sábados: {fieldMinistryMonthSummary.saturdays}</span>
                  <span>Domingos e feriados: {fieldMinistryMonthSummary.sundays}</span>
                </div>
              </div>
            </article>

          </section>
        ) : null}

        {currentNav === "Apostilas" ? (
          <section className="tab-panel" aria-label="Apostilas">
            <article className="panel utility-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">JW.org</span>
                  <h2>Apostilas disponíveis</h2>
                </div>
                <a className="text-link" href="https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/" rel="noreferrer" target="_blank">
                  Abrir fonte
                </a>
              </div>
              <div className="source-box">
                <strong>Atualização da programação</strong>
                <span>
                  O app verifica a página pública das apostilas, identifica semanas disponíveis a partir da data atual e cria semanas novas sem apagar designados já definidos.
                </span>
              </div>
              {readyState.latestJwSync ? (
                <div className="sync-status">
                  <strong>{readyState.latestJwSync.message}</strong>
                  <span>Última verificação: {formatDateTime(readyState.latestJwSync.checked_at)}</span>
                  <small>{readyState.latestJwSync.publications.join(", ") || "Nenhuma publicação registrada."}</small>
                </div>
              ) : (
                <p className="empty-copy">Nenhuma verificação registrada ainda.</p>
              )}
              <div className="action-row">
                <button className="primary-button" disabled={!canEdit || busy} onClick={syncJwPrograms} type="button">
                  Atualizar apostilas
                </button>
              </div>
            </article>
          </section>
        ) : null}

        {currentNav === "Eventos" ? (
          <section className="two-column bottom-zone" aria-label="Eventos especiais">
            <article className="panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Congregação</span>
                  <h2>Eventos especiais</h2>
                </div>
                <span className="muted">{readyState.specialEvents.length} cadastrados</span>
              </div>

              <form className="event-form" onSubmit={submitSpecialEvent}>
                <label>
                  <span>Tipo</span>
                  <select
                    disabled={!canEditSpecialEvent || busy}
                    value={eventForm.type}
                    onChange={(event) => setSpecialEventForm({ ...eventForm, type: event.target.value as SpecialEventType })}
                  >
                    {specialEventOptions.filter((option) => isAdmin || option.value === "discurso_especial").map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{eventForm.type === "discurso_especial" ? "Tema do discurso especial" : "Título"}</span>
                  <input
                    disabled={!canEditSpecialEvent || busy}
                    required={eventForm.type === "discurso_especial"}
                    placeholder={specialEventTypeLabel(eventForm.type)}
                    value={eventForm.title}
                    onChange={(event) => setSpecialEventForm({ ...eventForm, title: event.target.value })}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    <span>{eventForm.type === "discurso_especial" ? "Data" : "Início"}</span>
                    <input
                      disabled={!canEditSpecialEvent || busy}
                      type="date"
                      required
                      value={eventForm.startDate}
                      onChange={(event) => setSpecialEventForm({ ...eventForm, startDate: event.target.value })}
                    />
                  </label>
                  {eventForm.type !== "discurso_especial" ? <label>
                    <span>Fim</span>
                    <input
                      disabled={!canEditSpecialEvent || busy}
                      type="date"
                      value={eventForm.endDate}
                      onChange={(event) => setSpecialEventForm({ ...eventForm, endDate: event.target.value })}
                    />
                  </label> : null}
                </div>
                {eventForm.type === "discurso_especial" ? (
                  <label>
                    <span>Nome do orador</span>
                    <input required disabled={!canEditSpecialEvent || busy} value={eventForm.specialTalkSpeaker}
                      onChange={(event) => setSpecialEventForm({ ...eventForm, specialTalkSpeaker: event.target.value })} />
                  </label>
                ) : null}
                {eventForm.type === "visita_superintendente" ? <div className="form-grid">
                  <label>
                    <span>Superintendente</span>
                    <input
                      disabled={!canEditSpecialEvent || busy || eventForm.type !== "visita_superintendente"}
                      value={eventForm.circuitOverseerName}
                      onChange={(event) => setSpecialEventForm({ ...eventForm, circuitOverseerName: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Esposa</span>
                    <input
                      disabled={!canEditSpecialEvent || busy || eventForm.type !== "visita_superintendente"}
                      value={eventForm.circuitOverseerWife}
                      onChange={(event) => setSpecialEventForm({ ...eventForm, circuitOverseerWife: event.target.value })}
                    />
                  </label>
                </div> : null}
                {eventForm.type === "visita_superintendente" ? (
                  <>
                    <label>
                      <span>Discurso de serviço no meio da semana</span>
                      <input
                        disabled={!canEditSpecialEvent || busy}
                        placeholder="Título do discurso de serviço"
                        value={eventForm.midweekServiceTalkTitle}
                        onChange={(event) => setSpecialEventForm({ ...eventForm, midweekServiceTalkTitle: event.target.value })}
                      />
                    </label>
                    <div className="form-grid">
                      <label>
                        <span>Cântico final do discurso da visita</span>
                        <input
                          disabled={!canEditSpecialEvent || busy}
                          placeholder="Ex.: Cântico 103 - Os anciãos são um presente de Jeová"
                          value={eventForm.midweekServiceTalkSong}
                          onChange={(event) => setSpecialEventForm({ ...eventForm, midweekServiceTalkSong: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>Discurso público da visita</span>
                        <input
                          disabled={!canEditSpecialEvent || busy}
                          placeholder="Título do discurso público"
                          value={eventForm.weekendPublicTalkTitle}
                          onChange={(event) => setSpecialEventForm({ ...eventForm, weekendPublicTalkTitle: event.target.value })}
                        />
                      </label>
                    </div>
                    <div className="form-grid">
                      <label>
                        <span>Discurso final da visita</span>
                        <input
                          disabled={!canEditSpecialEvent || busy}
                          placeholder="Título do discurso final"
                          value={eventForm.weekendFinalTalkTitle}
                          onChange={(event) => setSpecialEventForm({ ...eventForm, weekendFinalTalkTitle: event.target.value })}
                        />
                      </label>
                      <label>
                        <span>Cântico do discurso final da visita</span>
                        <input
                          disabled={!canEditSpecialEvent || busy}
                          placeholder="Ex.: Cântico 103 - Os anciãos são um presente de Jeová"
                          value={eventForm.weekendFinalTalkSong}
                          onChange={(event) => setSpecialEventForm({ ...eventForm, weekendFinalTalkSong: event.target.value })}
                        />
                      </label>
                    </div>
                  </>
                ) : null}
                <label>
                  <span>Observações</span>
                  <input
                    disabled={!canEditSpecialEvent || busy}
                    value={eventForm.notes}
                    onChange={(event) => setSpecialEventForm({ ...eventForm, notes: event.target.value })}
                  />
                </label>
                <div className="action-row">
                  <button className="primary-button" disabled={!canEditSpecialEvent || busy} type="submit">
                    {eventForm.id ? "Salvar evento" : "Cadastrar evento"}
                  </button>
                  {eventForm.id ? (
                    <button className="secondary-button" disabled={busy} onClick={resetSpecialEventForm} type="button">
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </form>
            </article>

            <aside className="panel">
              <div className="panel-head compact">
                <div>
                  <span className="eyebrow">Agenda</span>
                  <h2>Próximos eventos</h2>
                </div>
              </div>
              <div className="event-list">
                {readyState.specialEvents.length > 0 ? (
                  readyState.specialEvents.map((event) => (
                    <div key={event.id}>
                      <strong>{event.title}</strong>
                      <span>{specialEventTypeLabel(event.type)} - {formatShortDate(event.start_date)}{event.end_date !== event.start_date ? ` a ${formatShortDate(event.end_date)}` : ""}</span>
                      {event.special_talk_speaker ? <small>Orador: {event.special_talk_speaker}</small> : null}
                      {event.circuit_overseer_name ? <small>Superintendente: {event.circuit_overseer_name}</small> : null}
                      {event.circuit_overseer_wife ? <small>Esposa: {event.circuit_overseer_wife}</small> : null}
                      {event.midweek_service_talk_title ? <small>Meio de semana: {event.midweek_service_talk_title}</small> : null}
                      {event.midweek_service_talk_song ? <small>Cântico final da visita: {formatSong(event.midweek_service_talk_song)}</small> : null}
                      {event.weekend_public_talk_title ? <small>Discurso público da visita: {event.weekend_public_talk_title}</small> : null}
                      {event.weekend_final_talk_title ? <small>Discurso final da visita: {event.weekend_final_talk_title}</small> : null}
                      {event.weekend_final_talk_song ? <small>Cântico do discurso final: {formatSong(event.weekend_final_talk_song)}</small> : null}
                      {event.notes ? <small>{event.notes}</small> : null}
                      <div className="event-actions">
                        <button className="secondary-button" disabled={busy || (!isAdmin && !(isPublicOutgoingManager && event.type === "discurso_especial"))} onClick={() => editSpecialEvent(event)} type="button">
                          Editar
                        </button>
                        <button className="danger-button" disabled={busy || (!isAdmin && !(isPublicOutgoingManager && event.type === "discurso_especial"))} onClick={() => deleteSpecialEvent(event)} type="button">
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-copy">Nenhum evento cadastrado.</p>
                )}
              </div>
            </aside>
          </section>
        ) : null}

        {currentNav === "Folgas" ? (
          <section className="tab-panel" aria-label="Folgas">
          <article className="panel utility-panel">
            <div className="panel-head compact">
              <div>
                <span className="eyebrow">Folgas da semana</span>
                <h2>Bloqueios ativos</h2>
              </div>
            </div>
            <div className="away-stack">
              {openAway.length > 0 ? (
                openAway.map((away) => (
                  <div className="away-pill" key={away.id}>
                    <strong>{memberName(away.member_id)}</strong>
                    <span>{away.reason}</span>
                  </div>
                ))
              ) : (
                <p className="empty-copy">Ninguém está de folga nesta data.</p>
              )}
            </div>

            <form className="mini-form" onSubmit={submitAway}>
              <label>
                <span>Participante</span>
                <MemberSearchSelect
                  disabled={!canEdit || busy}
                  emptyLabel="Selecionar participante"
                  label="Participante"
                  onChange={(memberId) => setAwayForm({ ...awayForm, memberId })}
                  options={simpleMemberOptions(awayForm.memberId)}
                  value={awayForm.memberId}
                />
              </label>
              <div className="form-grid">
                <label>
                  <span>Início</span>
                  <input
                    disabled={!canEdit || busy}
                    type="date"
                    value={awayForm.startDate}
                    onChange={(event) => setAwayForm({ ...awayForm, startDate: event.target.value })}
                  />
                </label>
                <label>
                  <span>Fim</span>
                  <input
                    disabled={!canEdit || busy}
                    type="date"
                    value={awayForm.endDate}
                    onChange={(event) => setAwayForm({ ...awayForm, endDate: event.target.value })}
                  />
                </label>
              </div>
              <label>
                <span>Motivo</span>
                <input
                  disabled={!canEdit || busy}
                  value={awayForm.reason}
                  onChange={(event) => setAwayForm({ ...awayForm, reason: event.target.value })}
                />
              </label>
              <button className="primary-button" disabled={!canEdit || busy} type="submit">
                Registrar folga
              </button>
            </form>
          </article>
          </section>
        ) : null}

        {currentNav === PASTORAL_NAV ? (
          <section className="tab-panel" aria-label="Pastoreio">
            {/* PARTE 1 — PRESENÇA (em lote) */}
            <article className="panel group-care-panel shepherding-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Pastoreio · Presença</span>
                  <h2>Presença da reunião</h2>
                </div>
                <span className="muted">Reunião de {formatNumericDate(careMeetingDate)}</span>
              </div>

              <div className="care-controls">
                <label>
                  <span>Grupo</span>
                  <select
                    disabled={!canEdit || busy}
                    value={activeCareGroupId}
                    onChange={(event) => setSelectedCareGroupId(event.target.value)}
                  >
                    {readyState.fieldServiceGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Data da reunião</span>
                  <input
                    disabled={!canEdit || busy}
                    type="date"
                    value={careMeetingDate}
                    onChange={(event) => setCareMeetingDate(event.target.value)}
                  />
                </label>
                <div className="care-date-note">
                  <strong>Reunião</strong>
                  <span>{formatLongDate(careMeetingDate)}</span>
                </div>
              </div>

              <div className="attendance-report-grid compact-attendance-grid care-attendance-summary" aria-label="Resumo das presenças do grupo">
                <label>
                  <span>Presencial</span>
                  <input disabled readOnly value={careAttendanceCounts.inPerson} />
                </label>
                <label>
                  <span>Zoom</span>
                  <input disabled readOnly value={careAttendanceCounts.zoom} />
                </label>
                <label>
                  <span>Ausentes</span>
                  <input disabled readOnly value={careAttendanceCounts.absent} />
                </label>
                <label>
                  <span>Total assistindo</span>
                  <input disabled readOnly value={careAttendanceCounts.inPerson + careAttendanceCounts.zoom} />
                </label>
                <small>
                  Marcados: {careAttendanceCounts.recorded} de {careGroupMembers.length}
                </small>
              </div>

              <div className="attendance-list">
                {careGroupMembers.length > 0 ? (
                  careGroupMembers.map((member) => {
                    const attendance = attendanceForMember(member.id);
                    const current = attendanceDrafts[member.id] ?? attendance?.status ?? "presente";
                    return (
                      <div className="attendance-row" key={member.id}>
                        <strong>{member.name}</strong>
                        <div className="attendance-choices" role="group" aria-label={`Presença de ${member.name}`}>
                          {(["presente", "zoom", "ausente"] as const).map((option) => (
                            <button
                              key={option}
                              type="button"
                              disabled={!canEdit || busy}
                              className={`attendance-choice ${current === option ? `is-${option}` : ""}`}
                              onClick={() =>
                                setAttendanceDrafts((prev) => ({ ...prev, [member.id]: option }))
                              }
                            >
                              {option === "presente" ? "Presente" : option === "zoom" ? "Zoom" : "Ausente"}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-copy">Escolha um grupo com publicadores cadastrados.</p>
                )}
              </div>

              {careGroupMembers.length > 0 ? (
                <div className="attendance-save-bar">
                  <button
                    className="primary-button"
                    disabled={!canEdit || busy || !activeCareGroupId || !careMeetingDate}
                    onClick={() => saveAllAttendance()}
                    type="button"
                  >
                    Salvar presença de todos
                  </button>
                </div>
              ) : null}
            </article>

            {/* PARTE 2 — VISITAS (separada) */}
            <article className="panel shepherding-visits-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Pastoreio · Visitas</span>
                  <h2>Últimas visitas</h2>
                </div>
              </div>

              <div className="group-care-list">
                {careGroupMembers.length > 0 ? (
                  careGroupMembers.map((member) => {
                    const lastVisit = lastVisitForMember(member.id);
                    const visitWeeks = lastVisit ? weeksBetweenDates(lastVisit.visit_date, todayIso) : 999;
                    const needsAttention = visitWeeks >= 12;
                    return (
                      <div className={`group-care-row ${needsAttention ? "needs-attention" : ""}`} key={member.id}>
                        <div>
                          <strong>{member.name}</strong>
                          <small>
                            {lastVisit
                              ? `Última visita: ${formatNumericDate(lastVisit.visit_date)} (${formatWeeksAgo(visitWeeks)})`
                              : "Sem visita registrada"}
                          </small>
                        </div>
                        <label>
                          <span>Data da visita</span>
                          <input
                            disabled={!canEdit || busy}
                            type="date"
                            value={visitDrafts[member.id] ?? lastVisit?.visit_date ?? todayIso}
                            onChange={(event) => setVisitDrafts((current) => ({ ...current, [member.id]: event.target.value }))}
                          />
                        </label>
                        <button className="secondary-button" disabled={!canEdit || busy || !activeCareGroupId} onClick={() => saveMemberVisit(member)} type="button">
                          {lastVisit ? "Atualizar visita" : "Registrar visita"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-copy">Escolha um grupo com publicadores cadastrados.</p>
                )}
              </div>
            </article>
          </section>
        ) : null}

        {currentNav === ACCOUNTS_NAV ? (
          <section className="tab-panel" aria-label="Auditoria das contas">
            <article className="panel account-audit-panel">
              <div className="panel-head">
                <div>
                  <span className="eyebrow">Contas</span>
                  <h2>Auditorias trimestrais</h2>
                </div>
                <span className="muted">
                  {canManageAccounts ? "Participante 006/admin designam auditor" : "Consulta dos anciãos"}
                </span>
              </div>

              <div className="source-box">
                <strong>Regra de prazo</strong>
                <span>
                  Cada auditoria vence 1 mês e 20 dias após o fechamento: fevereiro → 20/04; maio → 20/07; agosto → 20/10; novembro → 20/01 do ano seguinte. Participante 006 designa o auditor; o ancião designado registra a conclusão.
                </span>
              </div>

              <div className="account-audit-list">
                {readyState.accountAudits.length > 0 ? (
                  readyState.accountAudits.map((audit) => {
                    const draft = accountAuditDrafts[audit.id] ?? {
                      auditor_member_id: audit.auditor_member_id ?? "",
                      completed_date: audit.completed_date ?? "",
                      notes: audit.notes ?? "",
                    };
                    const status = accountAuditStatus(audit);
                    const auditorOptions = accountAuditorOptions(draft.auditor_member_id);
                    const isAssignedAuditAuditor = audit.auditor_member_id === readyState.user.id;
                    return (
                      <div className={`account-audit-card ${status.tone}`} key={audit.id}>
                        <div className="account-audit-card-head">
                          <div>
                            <span>{audit.period_label}</span>
                            <strong>{audit.months_label}</strong>
                          </div>
                          <mark>{status.label}</mark>
                        </div>
                        <div className="account-audit-details">
                          <span>Prazo: {formatNumericDate(audit.due_date)}</span>
                          <span>Auditor: {memberName(audit.auditor_member_id) || "Não designado"}</span>
                          <span>{status.detail}</span>
                        </div>
                        {audit.notes ? <small className="account-audit-note">{audit.notes}</small> : null}

                        {canManageAccounts ? (
                          <div className="account-audit-form">
                            <MemberSearchSelect
                              disabled={busy}
                              emptyLabel="Sem auditor"
                              label="Auditor"
                              onChange={(memberId) => updateAccountAuditDraft(audit.id, { auditor_member_id: memberId })}
                              options={auditorOptions}
                              placeholder="Pesquisar ancião"
                              value={draft.auditor_member_id}
                            />
                            <button className="primary-button" disabled={busy} onClick={() => saveAccountAuditAssignment(audit)} type="button">
                              Salvar auditor
                            </button>
                          </div>
                        ) : null}

                        {isAssignedAuditAuditor && !audit.completed_date ? (
                          <div className="account-audit-form">
                            <label>
                              <span>Data feita</span>
                              <input
                                disabled={busy}
                                type="date"
                                value={draft.completed_date || todayIso}
                                onChange={(event) => updateAccountAuditDraft(audit.id, { completed_date: event.target.value })}
                              />
                            </label>
                            <label className="wide-field">
                              <span>Observações</span>
                              <input
                                disabled={busy}
                                placeholder="Anotações da auditoria"
                                value={draft.notes}
                                onChange={(event) => updateAccountAuditDraft(audit.id, { notes: event.target.value })}
                              />
                            </label>
                            <button className="primary-button" disabled={busy} onClick={() => completeAccountAudit(audit)} type="button">
                              Salvar auditoria concluída
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="empty-copy">As auditorias ficam disponíveis para anciãos e administradores.</p>
                )}
              </div>
            </article>
          </section>
        ) : null}

        {currentNav === "Privilégios" && isAdmin ? (
          <PrivilegesSection
            members={readyState.members}
            assignments={readyState.privilegeAssignments ?? {}}
            busy={busy}
            onSave={(groupKey, values, updatedAt) => runAction("savePrivilegeGroup", { groupKey, values, updatedAt }, "Privilégios salvos.")}
          />
        ) : null}

        {currentNav === "Participantes" ? (
        <section className="two-column bottom-zone" aria-label="Participantes e convites" id="member-form-anchor">
          <article className="panel">
            <div className="panel-head">
              <div>
                <span className="eyebrow">Cadastro e permissões</span>
                <h2>Participantes</h2>
              </div>
              <span className="muted">{readyState.members.length} cadastrados</span>
            </div>

            <form className="member-form" onSubmit={submitMember}>
              <label>
                <span>Nome</span>
                <input
                  disabled={!canEdit || busy}
                  value={memberForm.name}
                  onChange={(event) => setMemberForm({ ...memberForm, name: event.target.value })}
                />
              </label>
              <label>
                <span>E-mail para convite</span>
                <input
                  disabled={!canEdit || busy}
                  type="email"
                  value={memberForm.email}
                  onChange={(event) => setMemberForm({ ...memberForm, email: event.target.value })}
                />
              </label>
              <label>
                <span>WhatsApp</span>
                <input
                  disabled={!canEdit || busy}
                  inputMode="tel"
                  placeholder="+5511999999999"
                  value={memberForm.whatsappPhone}
                  onChange={(event) => setMemberForm({ ...memberForm, whatsappPhone: event.target.value })}
                />
              </label>
              <label>
                <span>Acesso no app</span>
                <select
                  disabled={!canEdit || busy}
                  value={memberForm.role}
                  onChange={(event) => setMemberForm({ ...memberForm, role: event.target.value as AppRole })}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="form-fieldset module-permission-fieldset">
                <legend>Módulos que pode editar</legend>
                <div className="field-grid compact module-permission-grid">
                  {editableModuleOptions.map((option) => {
                    const adminFullAccess = memberForm.role === "admin";
                    return (
                      <label key={option.value}>
                        <input
                          checked={adminFullAccess || memberForm.editableModules.includes(option.value)}
                          disabled={!canEdit || busy || adminFullAccess}
                          onChange={() => toggleEditableModule(option.value)}
                          type="checkbox"
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {memberForm.role === "admin" ? (
                  <small>Administrador edita todos os módulos automaticamente.</small>
                ) : null}
              </fieldset>
              <label>
                <span>Participação na congregação</span>
                <select aria-label="Participação na congregação" disabled={!canEdit || busy} value={memberForm.participationStatus}
                  onChange={(event) => setMemberForm({ ...memberForm, participationStatus: event.target.value as MemberForm["participationStatus"] })}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="mudou_congregacao">Mudou de congregação</option>
                </select>
                <small>Inativos e quem mudou de congregação ficam fora de novas designações. O histórico é preservado.</small>
              </label>
              <label>
                <span>Gênero</span>
                <select
                  aria-label="Gênero"
                  disabled={!canEdit || busy}
                  value={memberForm.gender ?? ""}
                  onChange={(event) => setMemberForm({ ...memberForm, gender: (event.target.value || null) as MemberGender })}
                >
                  <option value="">Gênero não informado</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
                <small>Informe o gênero para formar duplas de Vida e Ministério.</small>
              </label>
              <label>
                <span>Situação</span>
                <select
                  disabled={!canEdit || busy}
                  value={memberForm.congregationStatus}
                  onChange={(event) =>
                    setMemberForm({ ...memberForm, congregationStatus: event.target.value as CongregationStatus })
                  }
                >
                  {congregationStatusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Grupo de serviço de campo</span>
                <select
                  disabled={!canEdit || busy}
                  value={memberForm.fieldServiceGroupId}
                  onChange={(event) => setMemberForm({ ...memberForm, fieldServiceGroupId: event.target.value })}
                >
                  <option value="">Sem grupo</option>
                  {readyState.fieldServiceGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="form-fieldset">
                <legend>Pioneiro</legend>
                <div className="field-grid compact">
                  {pioneerOptions.map((option) => (
                    <label key={option.value}>
                      <input
                        checked={memberForm.pioneerRoles.includes(option.value)}
                        disabled={!canEdit || busy}
                        onChange={() => togglePioneerRole(option.value)}
                        type="checkbox"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="form-fieldset">
                <legend>Dias para dirigir campo</legend>
                <div className="field-grid days">
                  {fieldDayOptions.map((option) => (
                    <label key={option.value}>
                      <input
                        checked={memberForm.fieldAvailability.includes(option.value)}
                        disabled={!canEdit || busy}
                        onChange={() => toggleFieldDay(option.value)}
                        type="checkbox"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="form-fieldset">
                <legend>Privilégios de designação</legend>
                <div className="privilege-grid">
                  {Object.entries(readyState.roleLabels)
                    .filter(([key]) => key !== "discurso_fora" || ["anciao", "servo_ministerial"].includes(memberForm.congregationStatus))
                    .map(([key, label]) => (
                      <label key={key}>
                        <input
                          checked={memberForm.privileges.includes(key)}
                          disabled={!canEdit || busy}
                          onChange={() => togglePrivilege(key)}
                          type="checkbox"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                </div>
              </fieldset>

              <div className="action-row member-actions">
                <button className="primary-button" disabled={!canEdit || busy} type="submit">
                  {editingMemberId ? "Salvar alterações" : "Cadastrar"}
                </button>
                {editingMemberId ? (
                  <button className="secondary-button" disabled={busy} onClick={resetMemberForm} type="button">
                    Cancelar edição
                  </button>
                ) : null}
              </div>
            </form>

            <div className="member-search-bar">
              <input
                type="search"
                placeholder="Pesquisar participante..."
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
              />
            </div>

            <div className="member-table">
              {readyState.members
                .filter(
                  (member) =>
                    memberSearch.trim() === "" ||
                    normalizeSearchText(member.name).includes(normalizeSearchText(memberSearch)),
                )
                .map((member) => (
                <div className="member-list-item" key={member.id}>
                  <strong>{member.name}</strong>
                  <span>{member.participation_status === "mudou_congregacao" ? "Mudou de congregação" : member.active ? "Ativo" : "Inativo"}</span>
                  <span>
                    {congregationStatusLabel(member.congregation_status)}
                    {member.pioneer_roles.length > 0
                      ? ` - ${member.pioneer_roles.map(pioneerRoleLabel).join(", ")}`
                      : ""}
                  </span>
                  <small>
                    {roleLabel(member.role)} no app - {groupName(member.field_service_group_id)} - Campo: {fieldDaysLabel(member.field_availability)}
                  </small>
                  <small>{editableModulesLabel(member)}</small>
                  <small>
                    {member.whatsapp_phone ? `${member.whatsapp_phone} - ` : ""}
                    {member.privileges.map((item) => readyState.roleLabels[item]).filter(Boolean).join(", ") || "Sem privilégios"}
                  </small>
                  <div className="member-item-actions">
                    <button className="secondary-button" disabled={!canEdit || busy} onClick={() => editMember(member)} type="button">
                      Editar
                    </button>
                    <button
                      className="danger-button"
                      disabled={!canEdit || busy || member.id === readyState.user.id}
                      onClick={() => deleteMember(member)}
                      type="button"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <aside className="panel">
            <section className="side-stack" aria-label="Grupos de serviço de campo">
              <div className="panel-head compact">
                <div>
                  <span className="eyebrow">Campo</span>
                  <h2>Grupos</h2>
                </div>
              </div>
              <form className="mini-form" onSubmit={submitFieldGroup}>
                <label>
                  <span>Nome do grupo</span>
                  <input
                    disabled={!canEdit || busy}
                    placeholder="Grupo 1"
                    value={fieldGroupForm.name}
                    onChange={(event) => setFieldGroupForm({ ...fieldGroupForm, name: event.target.value })}
                  />
                </label>
                <label>
                  <span>Superintendente</span>
                  <MemberSearchSelect
                    disabled={!canEdit || busy}
                    emptyLabel="Sem responsável"
                    label="Superintendente"
                    onChange={(memberId) => setFieldGroupForm({ ...fieldGroupForm, overseerMemberId: memberId })}
                    options={simpleMemberOptions(fieldGroupForm.overseerMemberId)}
                    value={fieldGroupForm.overseerMemberId}
                  />
                </label>
                <label>
                  <span>Ajudante</span>
                  <MemberSearchSelect
                    disabled={!canEdit || busy}
                    emptyLabel="Sem ajudante"
                    label="Ajudante"
                    onChange={(memberId) => setFieldGroupForm({ ...fieldGroupForm, assistantMemberId: memberId })}
                    options={simpleMemberOptions(fieldGroupForm.assistantMemberId)}
                    placeholder="Pesquisar ajudante"
                    value={fieldGroupForm.assistantMemberId}
                  />
                </label>
                <div className="action-row">
                  <button className="primary-button" disabled={!canEdit || busy} type="submit">
                    {fieldGroupForm.id ? "Salvar grupo" : "Cadastrar grupo"}
                  </button>
                  {fieldGroupForm.id ? (
                    <button className="secondary-button" disabled={busy} onClick={resetFieldGroupForm} type="button">
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </form>
              <div className="field-group-list">
                {readyState.fieldServiceGroups.length > 0 ? (
                  readyState.fieldServiceGroups.map((group) => (
                    <div key={group.id}>
                      <strong>{group.name}</strong>
                      <span>Superintendente: {memberName(group.overseer_member_id) || "Não definido"}</span>
                      <span>Ajudante: {memberName(group.assistant_member_id) || "Não definido"}</span>
                      <button className="secondary-button" disabled={!canEdit || busy} onClick={() => editFieldGroup(group)} type="button">
                        Editar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-copy">Nenhum grupo cadastrado.</p>
                )}
              </div>
            </section>

            <div className="panel-head compact">
              <div>
                <span className="eyebrow">Convites</span>
                <h2>Login próprio</h2>
              </div>
            </div>
            <form className="mini-form" onSubmit={submitInvite}>
              <label>
                <span>Participante vinculado</span>
                <MemberSearchSelect
                  disabled={!canEdit || busy}
                  emptyLabel="Sem vínculo"
                  label="Participante"
                  onChange={selectInviteMember}
                  options={simpleMemberOptions(inviteForm.memberId)}
                  placeholder="Pesquisar participante"
                  value={inviteForm.memberId}
                />
              </label>
              <label>
                <span>E-mail</span>
                <input
                  disabled={!canEdit || busy}
                  placeholder="participante@example.invalid"
                  type="email"
                  value={inviteForm.email}
                  onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })}
                />
              </label>
              <label>
                <span>WhatsApp</span>
                <input
                  disabled={!canEdit || busy}
                  inputMode="tel"
                  placeholder="5511999999999"
                  value={inviteForm.whatsappPhone}
                  onChange={(event) => setInviteForm({ ...inviteForm, whatsappPhone: event.target.value })}
                />
              </label>
              <label>
                <span>Permissão</span>
                <select
                  disabled={!canEdit || busy}
                  value={inviteForm.role}
                  onChange={(event) => setInviteForm({ ...inviteForm, role: event.target.value as AppRole })}
                >
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <button className="primary-button" disabled={!canEdit || busy} type="submit">
                Gerar código e enviar por WhatsApp
              </button>
            </form>
            <div className="invite-list">
              {readyState.invitations.length > 0 ? (
                readyState.invitations.map((invite) => {
                  const associatedMember = inviteAssociatedMember(invite);
                  const whatsappPhone = invite.whatsapp_phone ?? associatedMember?.whatsapp_phone ?? null;
                  return (
                    <div key={invite.id}>
                      <strong>{invite.email}</strong>
                      <span>
                        {roleLabel(invite.role)} - {invite.status}
                        {invite.access_code_hint ? ` - código ${invite.access_code_hint}` : ""}
                      </span>
                      <small>
                        {invite.access_code_created_at
                          ? `Gerado em ${formatDateTime(invite.access_code_created_at)}`
                          : "Gere um código e envie junto com o link do app."}
                      </small>
                      <small>{whatsappPhone ? `WhatsApp: ${whatsappPhone}` : "WhatsApp não cadastrado para esta conta."}</small>
                      <small>{associatedMember ? `Conta associada: ${associatedMember.name}` : "Conta não associada a participante."}</small>
                      <button
                        className="secondary-button"
                        disabled={!canEdit || busy}
                        onClick={() => generateInviteCode(invite.email, invite.role, whatsappPhone, invite.member_id ?? associatedMember?.id ?? null)}
                        type="button"
                      >
                        Novo código e WhatsApp
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="empty-copy">Nenhum convite preparado.</p>
              )}
            </div>
          </aside>
        </section>
        ) : null}

        {currentNav === "Folha" ? (
        <section className="tab-panel" aria-label="Folha impressa">
          <div className="sheet-toolbar action-row">
            <button className="secondary-button" onClick={printSheet} type="button">
              Imprimir folha
            </button>
          </div>
        <section className="sheet-zone" aria-label="Folha de designações">
          <article className="assignment-sheet">
            <div className="sheet-topbar">
              REUNIÃO SEMANA {formatWeekRange(readyWeek.week_start)}
            </div>

            <div className="sheet-body">
              <h2>NOSSA VIDA E MINISTÉRIO CRISTÃO</h2>

              <section className="sheet-responsibles" aria-label="Responsáveis">
                <div>
                  <span>Presidente:</span>
                  <strong>{memberName(president?.assignee_member_id ?? null)}</strong>
                </div>
                <div>
                  <span>Cântico:</span>
                  <strong>{formatSong(readyWeek.opening_song)}</strong>
                </div>
                <div>
                  <span>Oração Inicial:</span>
                  <strong>{memberName(openingPrayer?.assignee_member_id ?? null)}</strong>
                </div>
              </section>

              <PrintBlock
                iconSrc="/demo-icon.svg"
                items={treasures}
                memberName={memberName}
                numberFor={(assignment) => printableNumber.get(assignment.id) ?? assignment.sequence}
                tone="teal"
                title="TESOUROS DA PALAVRA DE DEUS"
              />

              <PrintBlock
                iconSrc="/demo-icon.svg"
                items={ministry}
                memberName={memberName}
                numberFor={(assignment) => printableNumber.get(assignment.id) ?? assignment.sequence}
                tone="gold"
                title="FAÇA SEU MELHOR NO MINISTÉRIO"
              />

              <section className="print-life-block">
                <div className="print-life-title">
                  <img alt="" aria-hidden="true" src="/demo-icon.svg" />
                  <h3>NOSSA VIDA CRISTÃ</h3>
                </div>
                <p className="life-song">Cântico: <strong>{formatSong(lifeSong)}</strong></p>
                <div className={`life-grid count-${Math.min(lifeRows.length, 2) || 1}`}>
                  {lifeRows.map((assignment) => (
                    <div className="life-line" key={assignment.id}>
                      <span>
                        {printableNumber.get(assignment.id) ?? assignment.sequence}. {assignment.title}
                        {assignment.duration_min ? ` (${assignment.duration_min} min)` : ""}
                      </span>
                      <strong>{memberName(assignment.assignee_member_id)}</strong>
                    </div>
                  ))}
                </div>
                <div className="ebc-grid">
                  {ebc ? (
                    <div>
                      <span>
                        {printableNumber.get(ebc.id) ?? ebc.sequence}. {circuitVisitEvent ? assignmentDisplayTitle(ebc) : "Dirigente EBC:"}
                      </span>
                      <strong>{circuitVisitEvent ? ebcAssigneeName(ebc) : memberName(ebc.assignee_member_id)}</strong>
                    </div>
                  ) : null}
                  {circuitVisitEvent ? (
                    <div>
                      <span>Visita:</span>
                      <strong>{circuitVisitEvent.circuit_overseer_wife ? `Esposa: ${circuitVisitEvent.circuit_overseer_wife}` : "Fim de semana: dois discursos"}</strong>
                    </div>
                  ) : (
                    <div>
                      <span>Leitor EBC:</span>
                      <strong>{memberName(ebc?.assistant_member_id ?? null)}</strong>
                    </div>
                  )}
                  <div>
                    <span>Oração Final:</span>
                    <strong>{memberName(finalPrayer?.assignee_member_id ?? null)}</strong>
                  </div>
                </div>
                <p className="final-song">Cântico Final : <strong>{formatSong(finalLifeSong)}</strong></p>
              </section>
            </div>
            <footer className="sheet-footer" aria-label="Rodapé da folha">
              <div className="footer-rule" />
              <span>Demonstração acadêmica</span>
            </footer>
          </article>
        </section>
      </section>
        ) : null}
      </section>
    </main>
  );
}

function PrintBlock({
  iconSrc,
  items,
  memberName,
  numberFor,
  title,
  tone,
}: {
  iconSrc: string;
  items: Assignment[];
  memberName: (id: string | null) => string;
  numberFor: (assignment: Assignment) => number;
  title: string;
  tone: "teal" | "gold";
}) {
  return (
    <section className={`print-block ${tone}`}>
      <div className={`print-block-title ${tone}`}>
        <img alt="" aria-hidden="true" src={iconSrc} />
        <h3>{title}</h3>
      </div>
      <div className={`print-card-grid count-${Math.min(items.length, 4) || 1}`}>
        {items.map((assignment) => (
          <div className="print-card" key={assignment.id}>
            <span>
              {numberFor(assignment)}. {assignment.title}
              {assignment.duration_min ? ` (${assignment.duration_min} min)` : ""}
            </span>
            <strong>
              {memberName(assignment.assignee_member_id)}
              {assignmentUsesAssistant(assignment) && assignment.assistant_member_id
                ? ` & ${memberName(assignment.assistant_member_id)}`
                : ""}
            </strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function createA4SvgPrintHtml(title: string, svgs: string[]) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html,
    body {
      width: 210mm;
      margin: 0;
      padding: 0;
      background: #ffffff;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    img {
      display: block;
      width: 210mm;
      height: 297mm;
      object-fit: contain;
      object-position: top center;
      break-after: page;
      page-break-after: always;
    }
    img:last-child {
      break-after: avoid;
      page-break-after: auto;
    }
    @media screen {
      body { background: #eef3f6; padding: 18px; }
      img { margin: 0 auto 18px; box-shadow: 0 18px 50px rgba(31, 42, 47, 0.18); }
    }
  </style>
</head>
<body>
  ${svgs.map((svg, index) => `<img src="${svgToDataUrl(svg)}" alt="${escapeHtml(title)} ${index + 1}" />`).join("")}
</body>
</html>`;
}

function createPublicMeetingSvgPrintHtml({
  meetings,
  memberName,
  themeTitle,
  circuitVisitForDate,
}: {
  meetings: PublicMeeting[];
  memberName: (id: string | null) => string;
  themeTitle: (themeId: string | null) => string;
  circuitVisitForDate: (date: string) => SpecialEvent | null;
}) {
  const svgs = chunkItems(meetings, 5).map((pageMeetings) =>
    createPublicMeetingPageSvg({ meetings: pageMeetings, memberName, themeTitle, circuitVisitForDate }),
  );
  return createA4SvgPrintHtml("Reunião Final de Semana", svgs);
}

function createPublicMeetingPageSvg({
  meetings,
  memberName,
  themeTitle,
  circuitVisitForDate,
}: {
  meetings: PublicMeeting[];
  memberName: (id: string | null) => string;
  themeTitle: (themeId: string | null) => string;
  circuitVisitForDate: (date: string) => SpecialEvent | null;
}) {
  const pageWidth = FIELD_MINISTRY_IMAGE_WIDTH;
  const pageHeight = FIELD_MINISTRY_IMAGE_HEIGHT;
  const x = 55;
  const width = pageWidth - x * 2;
  const compactFiveWeeks = meetings.length === 5;
  const cardHeight = compactFiveWeeks ? 610 : 720;
  const cardGap = compactFiveWeeks ? 25 : 54;
  const startY = compactFiveWeeks ? 215 : 235;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<style>
      .pm-top{font:900 118px Arial,Helvetica,sans-serif;fill:#fff;letter-spacing:0;text-transform:uppercase}
      .pm-date{font:900 70px Arial,Helvetica,sans-serif;fill:#fff;text-decoration:underline;text-transform:uppercase}
      .pm-head{font:900 42px Arial,Helvetica,sans-serif;fill:#fff}
      .pm-label{font:900 40px Arial,Helvetica,sans-serif;fill:#123f73}
      .pm-small{font:900 40px Arial,Helvetica,sans-serif;fill:#123f73}
      .pm-service{font:900 40px Arial,Helvetica,sans-serif;fill:#123f73;text-decoration:underline}
      .pm-value{font:900 40px Arial,Helvetica,sans-serif;fill:#123f73}
      .pm-out{font:900 40px Arial,Helvetica,sans-serif;fill:#fff}
    </style>`,
    `<rect x="0" y="0" width="${pageWidth}" height="205" fill="#1d4f87"/>`,
  ];
  const classSize = (className: string) =>
    className === "pm-top" ? 118 : className === "pm-date" ? 70 : className === "pm-head" ? 42 : 40;
  const fitFontSize = (text: string, baseSize: number, maxWidth: number, minSize: number) => {
    const estimatedWidth = text.length * baseSize * 0.56;
    if (!maxWidth || estimatedWidth <= maxWidth) return baseSize;
    return Math.max(minSize, Math.floor(maxWidth / Math.max(text.length * 0.56, 1)));
  };
  const addText = (text: string, tx: number, ty: number, className: string, anchor = "start", maxWidth = 0, minSize = 20) => {
    const fontSize = maxWidth ? fitFontSize(text, classSize(className), maxWidth, minSize) : classSize(className);
    const fit = maxWidth && text.length * fontSize * 0.56 > maxWidth ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : "";
    parts.push(
      `<text x="${tx}" y="${ty}" text-anchor="${anchor}" class="${className}" style="font-size:${fontSize}px"${fit}>${escapeSvg(text)}</text>`,
    );
  };
  const addWrappedText = (text: string, tx: number, ty: number, className: string, maxWidth: number, lineHeight: number, maxLines = 2, minSize = 22) => {
    const maxChars = Math.max(22, Math.floor(maxWidth / (classSize(className) * 0.45)));
    wrapS89Text(text, maxChars)
      .slice(0, maxLines)
      .forEach((line, index) => addText(line, tx, ty + index * lineHeight, className, "start", maxWidth, minSize));
  };

  addText("REUNIÃO FINAL DE SEMANA", pageWidth / 2, 140, "pm-top", "middle");
  meetings.forEach((meeting, index) => {
    const circuitVisit = circuitVisitForDate(meeting.meeting_date);
    const y = startY + index * (cardHeight + cardGap);
    const incomingTheme = circuitVisit?.weekend_public_talk_title || (meeting.special_talk_title || themeTitle(meeting.public_talk_theme_id)) || "Selecionar tema";
    const incomingSpeaker = circuitVisit?.circuit_overseer_name || meeting.public_talk_speaker || "";
    const incomingCongregation = circuitVisit ? "Visita do superintendente" : meeting.public_talk_speaker_congregation || "";
    const outgoingDate = meeting.outgoing_date ?? meeting.meeting_date;

    parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${cardHeight}" fill="#ffffff" stroke="#164a83" stroke-width="7"/>`);
    const headHeight = compactFiveWeeks ? 78 : 88;
    parts.push(`<rect x="${x}" y="${y}" width="${width}" height="${headHeight}" fill="#164a83"/>`);
    addText(formatPublicSheetDate(meeting.meeting_date), x + 35, y + (compactFiveWeeks ? 58 : 64), "pm-date");
    if (meeting.no_public_meeting_event) {
      addWrappedText(`Evento especial — ${specialEventTypeLabel(meeting.no_public_meeting_event.type)}`, x + 35, y + 155, "pm-label", width - 70, 46);
      addWrappedText(meeting.no_public_meeting_event.title, x + 35, y + 260, "pm-label", width - 70, 46);
      addText("Sem designações", x + 35, y + 370, "pm-label");
      return;
    }
    addText(`Presidente: ${memberName(meeting.chairman_member_id) || "Sem designado"}`, x + width - 35, y + (compactFiveWeeks ? 54 : 60), "pm-head", "end", 900, 30);

    addWrappedText(`${meeting.special_talk_title ? "Discurso Especial" : "Discurso Público"}: ${incomingTheme}`, x + 35, y + (compactFiveWeeks ? 130 : 152), "pm-label", width - 70, compactFiveWeeks ? 42 : 46, 2, 29);
    addText(`Orador: ${incomingSpeaker}`, x + 35, y + (compactFiveWeeks ? 220 : 265), "pm-label", "start", width * 0.46, 30);
    addText(`Congregação: ${incomingCongregation}`, x + width * 0.57, y + (compactFiveWeeks ? 220 : 265), "pm-label", "start", width * 0.39, 30);

    const serviceTop = compactFiveWeeks ? 245 : 302;
    const serviceHeight = compactFiveWeeks ? 130 : 155;
    parts.push(`<rect x="${x}" y="${y + serviceTop}" width="${width}" height="${serviceHeight}" fill="#e8eef4"/>`);
    const serviceWidth = width / 3;
    [
      ["Dirigente de A Sentinela:", memberName(meeting.watchtower_conductor_member_id) || "Participante 001"],
      [circuitVisit ? "Sem leitura" : "Leitor:", circuitVisit ? "Semana da visita" : memberName(meeting.watchtower_reader_member_id) || ""],
      ["Oração Final:", "Orador / Leitor"],
    ].forEach(([label, value], serviceIndex) => {
      const cx = x + serviceWidth * serviceIndex + serviceWidth / 2;
      addText(label, cx, y + (compactFiveWeeks ? 297 : 364), "pm-service", "middle", serviceWidth - 70, 26);
      addText(value, cx, y + (compactFiveWeeks ? 347 : 421), "pm-value", "middle", serviceWidth - 80, 25);
    });

    if (circuitVisit) {
      addWrappedText(`Discurso final da visita: ${circuitVisit.weekend_final_talk_title || "A definir"}`, x + 35, y + (compactFiveWeeks ? 435 : 520), "pm-label", width - 70, compactFiveWeeks ? 42 : 48, 2, 29);
      if (circuitVisit.weekend_final_talk_song) {
        addWrappedText(`Cântico: ${formatSong(circuitVisit.weekend_final_talk_song)}`, x + 35, y + (compactFiveWeeks ? 535 : 628), "pm-small", width - 70, compactFiveWeeks ? 40 : 44, 2, 27);
      }
      return;
    }

    const outgoingTop = compactFiveWeeks ? 375 : 457;
    const outgoingBodyTop = compactFiveWeeks ? 433 : 525;
    parts.push(`<rect x="${x}" y="${y + outgoingTop}" width="${width}" height="${outgoingBodyTop - outgoingTop}" fill="#164a83"/>`);
    addText("SAÍDA DE ORADORES", x + 35, y + (compactFiveWeeks ? 418 : 506), "pm-head");
    addText(`Orador: ${meeting.outgoing_speaker || ""}`, x + width - 35, y + (compactFiveWeeks ? 418 : 506), "pm-head", "end", 830, 30);
    parts.push(`<rect x="${x}" y="${y + outgoingBodyTop}" width="${width}" height="${cardHeight - outgoingBodyTop}" fill="#efac38"/>`);
    addWrappedText(`Tema: ${meeting.outgoing_talk_theme || ""}`, x + 35, y + (compactFiveWeeks ? 490 : 590), "pm-out", width * 0.54, compactFiveWeeks ? 40 : 44, 2, 27);
    addText(`Data: ${formatNumericDate(outgoingDate)}`, x + width * 0.62, y + (compactFiveWeeks ? 490 : 590), "pm-out", "start", width * 0.34, 27);
    addText(`Congregação: ${meeting.outgoing_congregation || ""}`, x + 35, y + (compactFiveWeeks ? 565 : 664), "pm-out", "start", width * 0.54, 26);
    addText(`End. ${meeting.outgoing_address || ""}`, x + width * 0.62, y + (compactFiveWeeks ? 565 : 664), "pm-out", "start", width * 0.34, 26);
  });

  parts.push("</svg>");
  return parts.join("");
}

function createPublicMeetingPrintHtml({
  meetings,
  memberName,
  themeTitle,
  circuitVisitForDate,
}: {
  meetings: PublicMeeting[];
  memberName: (id: string | null) => string;
  themeTitle: (themeId: string | null) => string;
  circuitVisitForDate: (date: string) => SpecialEvent | null;
}) {
  const pages = chunkItems(meetings, 5)
    .map((pageMeetings) => `
      <section class="public-page public-count-${pageMeetings.length}">
        <header class="public-header">REUNIÃO FINAL DE SEMANA</header>
        <main class="public-body">
          ${pageMeetings.map((meeting) => publicMeetingPrintCard(meeting, memberName, themeTitle, circuitVisitForDate(meeting.meeting_date))).join("")}
        </main>
      </section>
    `)
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Reunião Final de Semana</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #ffffff;
      color: #123f73;
      font-family: Arial, Helvetica, sans-serif;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .public-page {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      page-break-after: always;
      overflow: hidden;
    }
    .public-page:last-child { page-break-after: auto; }
    .public-header {
      height: 17mm;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1d4f87;
      color: #ffffff;
      font-size: 24pt;
      font-weight: 900;
      letter-spacing: 1.1pt;
      text-align: center;
    }
    .public-body {
      padding: 7.5mm 10mm 0;
    }
    .public-card {
      margin-bottom: 6.2mm;
      border: 0.8mm solid #164a83;
      color: #123f73;
      font-weight: 800;
    }
    .public-card.visit-card {
      margin-bottom: 5mm;
    }
    .public-card-head,
    .outgoing-head {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      min-height: 7mm;
      padding: 0 3mm;
      background: #164a83;
      color: #ffffff;
      line-height: 1.1;
    }
    .public-date {
      font-size: 16.5pt;
      font-weight: 900;
      text-decoration: underline;
    }
    .public-president,
    .outgoing-speaker {
      justify-self: end;
      font-size: 11.8pt;
      font-weight: 900;
      text-align: right;
    }
    .incoming {
      background: #ffffff;
      font-size: 10.8pt;
    }
    .incoming-theme {
      min-height: 8.4mm;
      padding: 1.6mm 3mm 0;
      line-height: 1.2;
    }
    .incoming-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 6.3mm;
      padding: 0 3mm 1.3mm;
      align-items: end;
      line-height: 1.2;
    }
    .incoming-row span:nth-child(2) {
      text-align: center;
    }
    .service-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      align-items: center;
      min-height: 10mm;
      background: #e8eef4;
      text-align: center;
    }
    .service-row div {
      display: grid;
      gap: 0.5mm;
      padding: 1.2mm 2mm;
      min-width: 0;
    }
    .service-row span {
      text-decoration: underline;
      font-size: 10.8pt;
      font-weight: 900;
    }
    .service-row strong {
      font-size: 10.3pt;
      font-weight: 900;
      color: #123f73;
    }
    .visit-final-row {
      min-height: 5.8mm;
      padding: 1mm 3mm;
      background: #ffffff;
      color: #123f73;
      font-size: 10pt;
      font-weight: 900;
      line-height: 1.15;
    }
    .outgoing-head {
      min-height: 6.8mm;
    }
    .outgoing-title {
      font-size: 13pt;
      font-weight: 900;
      letter-spacing: 0.2pt;
    }
    .outgoing-body {
      display: grid;
      grid-template-columns: 1.55fr 1fr;
      column-gap: 4mm;
      row-gap: 2.5mm;
      min-height: 13mm;
      padding: 1.8mm 3mm 2mm;
      background: #efac38;
      color: #ffffff;
      font-size: 10.6pt;
      line-height: 1.1;
    }
    .outgoing-body span {
      font-weight: 900;
      overflow-wrap: anywhere;
    }
    /* Meses com cinco reunioes usam uma densidade propria para continuar em
       uma unica A4. O modo normal (quatro ou menos) preserva o tamanho atual. */
    .public-count-5 .public-header {
      height: 15mm;
      font-size: 22pt;
    }
    .public-count-5 .public-body {
      padding-top: 5mm;
    }
    .public-count-5 .public-card {
      margin-bottom: 3mm;
    }
    .public-count-5 .public-card-head,
    .public-count-5 .outgoing-head {
      min-height: 6mm;
    }
    .public-count-5 .public-date {
      font-size: 14.5pt;
    }
    .public-count-5 .public-president,
    .public-count-5 .outgoing-speaker {
      font-size: 10.5pt;
    }
    .public-count-5 .incoming {
      font-size: 10pt;
    }
    .public-count-5 .incoming-theme {
      min-height: 7mm;
      padding-top: 1.1mm;
    }
    .public-count-5 .incoming-row {
      min-height: 5.5mm;
      padding-bottom: 0.8mm;
    }
    .public-count-5 .service-row {
      min-height: 9mm;
    }
    .public-count-5 .service-row div {
      gap: 0.3mm;
      padding-top: 0.8mm;
      padding-bottom: 0.8mm;
    }
    .public-count-5 .service-row span {
      font-size: 10pt;
    }
    .public-count-5 .service-row strong {
      font-size: 9.6pt;
    }
    .public-count-5 .visit-final-row {
      min-height: 5mm;
      padding-top: 0.7mm;
      padding-bottom: 0.7mm;
      font-size: 9.5pt;
    }
    .public-count-5 .outgoing-title {
      font-size: 12pt;
    }
    .public-count-5 .outgoing-body {
      min-height: 11.5mm;
      row-gap: 1.5mm;
      padding-top: 1.2mm;
      padding-bottom: 1.3mm;
      font-size: 9.8pt;
    }
    @media screen {
      body { background: #eef3f6; padding: 18px; }
      .public-page { margin: 0 auto 18px; box-shadow: 0 18px 50px rgba(31, 42, 47, 0.18); }
    }
  </style>
</head>
<body>${pages}</body>
</html>`;
}

function publicMeetingPrintCard(
  meeting: PublicMeeting,
  memberName: (id: string | null) => string,
  themeTitle: (themeId: string | null) => string,
  circuitVisit: SpecialEvent | null,
) {
  if (meeting.no_public_meeting_event) return `<article class="public-card">
    <div class="public-card-head"><span class="public-date">${escapeHtml(formatPublicSheetDate(meeting.meeting_date))}</span></div>
    <section class="incoming"><div class="incoming-theme">Evento especial — ${escapeHtml(specialEventTypeLabel(meeting.no_public_meeting_event.type))}</div>
    <p>${escapeHtml(meeting.no_public_meeting_event.title)}</p><p>Sem designações</p></section></article>`;
  const incomingTheme = circuitVisit?.weekend_public_talk_title || (meeting.special_talk_title || themeTitle(meeting.public_talk_theme_id));
  const incomingSpeaker = circuitVisit?.circuit_overseer_name || meeting.public_talk_speaker || "";
  const incomingCongregation = circuitVisit ? "Visita do superintendente" : meeting.public_talk_speaker_congregation || "";
  const outgoingDate = meeting.outgoing_date ?? meeting.meeting_date;
  const readerLabel = circuitVisit ? "Sem leitura" : "Leitor:";
  const readerName = circuitVisit ? "Semana da visita" : memberName(meeting.watchtower_reader_member_id) || "";
  const finalVisitRow = circuitVisit
    ? `<div class="visit-final-row">Discurso final da visita: ${escapeHtml(circuitVisit.weekend_final_talk_title || "A definir")}${circuitVisit.weekend_final_talk_song ? `<br>Cântico: ${escapeHtml(formatSong(circuitVisit.weekend_final_talk_song))}` : ""}</div>`
    : "";
  const outgoingSection = circuitVisit
    ? ""
    : `
      <section class="outgoing">
        <div class="outgoing-head">
          <span class="outgoing-title">SAÍDA DE ORADORES</span>
          <span class="outgoing-speaker">Orador: ${escapeHtml(meeting.outgoing_speaker || "")}</span>
        </div>
        <div class="outgoing-body">
          <span>Tema: ${escapeHtml(meeting.outgoing_talk_theme || "")}</span>
          <span>Data: ${escapeHtml(formatNumericDate(outgoingDate))}</span>
          <span>Congregação: ${escapeHtml(meeting.outgoing_congregation || "")}</span>
          <span>End. ${escapeHtml(meeting.outgoing_address || "")}</span>
        </div>
      </section>
    `;
  return `
    <article class="public-card ${circuitVisit ? "visit-card" : ""}">
      <div class="public-card-head">
        <span class="public-date">${escapeHtml(formatPublicSheetDate(meeting.meeting_date))}</span>
        <span class="public-president">Presidente: ${escapeHtml(memberName(meeting.chairman_member_id) || "Sem designado")}</span>
      </div>
      <section class="incoming">
        <div class="incoming-theme">${meeting.special_talk_title ? "Discurso Especial" : "Discurso Público"}: ${escapeHtml(incomingTheme || "Selecionar tema")}</div>
        <div class="incoming-row">
          <span>Orador: ${escapeHtml(incomingSpeaker)}</span>
          <span>Congregação: ${escapeHtml(incomingCongregation)}</span>
        </div>
        <div class="service-row">
          <div>
            <span>Dirigente de A Sentinela:</span>
            <strong>${escapeHtml(memberName(meeting.watchtower_conductor_member_id) || "Participante 001")}</strong>
          </div>
          <div>
            <span>${escapeHtml(readerLabel)}</span>
            <strong>${escapeHtml(readerName)}</strong>
          </div>
          <div>
            <span>Oração Final:</span>
            <strong>Orador / Leitor</strong>
          </div>
        </div>
        ${finalVisitRow}
      </section>
      ${outgoingSection}
    </article>
  `;
}

// --- Folha de Designacao (Conferencia Publica / discurso fora) -------------
// Dados ja resolvidos pela heranca mensal (resolveOutgoing): override da
// reuniao -> padrao mensal -> vazio. Orador/Tema/Cantico permanecem dados
// individuais da reuniao (sem heranca). Campos vazios ficam em branco.
type OutgoingSheetData = {
  weekdayLabel: string;
  dateLabel: string;
  timeLabel: string;
  speaker: string;
  theme: string;
  congregation: string;
  song: string;
  address: string;
};

const OUTGOING_WEEKDAY_LABEL: Record<"sabado" | "domingo", string> = {
  sabado: "Sábado",
  domingo: "Domingo",
};

function buildOutgoingSheetData(meeting: PublicMeeting, resolved: ResolvedOutgoing): OutgoingSheetData {
  return {
    weekdayLabel: OUTGOING_WEEKDAY_LABEL[resolved.weekday],
    dateLabel: formatNumericDate(resolved.date),
    timeLabel: resolved.time ? `${displayTime(resolved.time)} hs` : "",
    // Dados individuais da reuniao (sem heranca). Vazio => espaco em branco.
    speaker: meeting.outgoing_speaker ?? "",
    theme: meeting.outgoing_talk_theme ?? "",
    congregation: resolved.destinationCongregation,
    song: meeting.outgoing_song ? formatSong(meeting.outgoing_song) : "",
    address: resolved.destinationAddress,
  };
}

// Desenha UMA designacao dentro da moldura (ox,oy,fw,fh). Base visual unica,
// reutilizada tanto no modo digital/A4 (escala grande) quanto na grade 2x2
// (escala compacta) para evitar duplicacao de layout.
function renderOutgoingSheet(data: OutgoingSheetData, frame: { ox: number; oy: number; fw: number; fh: number }): string[] {
  const { ox, oy, fw, fh } = frame;
  const parts: string[] = [];
  const X = (fx: number) => ox + fx;
  const Y = (fy: number) => oy + fy;
  const s = fw / 1024; // fator de escala baseado na largura de referencia (1024)
  const compact = fw < 1400; // grade 2x2 usa moldura estreita
  const ink = "#0d407c";
  const inkDark = "#123f73";
  const clipId = `clip-${Math.round(ox)}-${Math.round(oy)}`;

  // Alturas do cabecalho e do rodape decorativo.
  const headerH = (compact ? 250 : 300) * s;
  const badgeW = (compact ? 250 : 280) * s;

  // Moldura branca do cartao com borda azul (mantida na impressao).
  parts.push(`<rect x="${ox}" y="${oy}" width="${fw}" height="${fh}" rx="${18 * s}" fill="#ffffff" stroke="#0d4d92" stroke-width="${Math.max(2, 4 * s)}"/>`);

  // Clip para nada vazar da moldura arredondada.
  parts.push(`<clipPath id="${clipId}"><rect x="${ox}" y="${oy}" width="${fw}" height="${fh}" rx="${18 * s}"/></clipPath>`);
  parts.push(`<g clip-path="url(#${clipId})">`);

  // ----- Cabecalho -----
  // Faixa clara de fundo + ondas suaves (identidade azul).
  parts.push(`<rect x="${ox}" y="${oy}" width="${fw}" height="${headerH}" fill="#eef5fb"/>`);
  parts.push(`<path d="M${X(0)} ${Y(headerH * 0.62)} C${X(fw * 0.24)} ${Y(headerH * 0.44)} ${X(fw * 0.52)} ${Y(headerH * 0.84)} ${X(fw * 0.76)} ${Y(headerH * 0.58)} C${X(fw * 0.9)} ${Y(headerH * 0.44)} ${X(fw)} ${Y(headerH * 0.56)} ${X(fw)} ${Y(headerH * 0.52)} L${X(fw)} ${Y(headerH)} L${X(0)} ${Y(headerH)} Z" fill="#dbe9f6"/>`);
  parts.push(`<path d="M${X(0)} ${Y(headerH * 0.8)} C${X(fw * 0.3)} ${Y(headerH * 0.64)} ${X(fw * 0.58)} ${Y(headerH * 0.98)} ${X(fw * 0.82)} ${Y(headerH * 0.72)} C${X(fw * 0.93)} ${Y(headerH * 0.62)} ${X(fw)} ${Y(headerH * 0.7)} ${X(fw)} ${Y(headerH * 0.68)} L${X(fw)} ${Y(headerH)} L${X(0)} ${Y(headerH)} Z" fill="#cbdeee"/>`);

  // Biblia aberta vetorial, pequena, no canto superior direito (fica atras do
  // titulo apenas no fundo; o titulo nao alcanca essa area).
  const bibleTopSize = (compact ? 150 : 190) * s;
  parts.push(renderOpenBible(X(fw - bibleTopSize * 0.62), Y(headerH * 0.42), bibleTopSize));

  // Bloco azul solido a esquerda: Dia / Data / Hora (exclusivo desta area).
  parts.push(`<path d="M${X(0)} ${Y(0)} L${X(badgeW)} ${Y(0)} L${X(badgeW - 40 * s)} ${Y(headerH)} L${X(0)} ${Y(headerH)} Z" fill="#1d4f87"/>`);
  const bx = X(26 * s);
  const daySize = (compact ? 40 : 50) * s;
  const dateSize = (compact ? 30 : 38) * s;
  parts.push(`<text x="${bx}" y="${Y(headerH * 0.26)}" style="font:900 ${daySize}px Arial,Helvetica,sans-serif;fill:#ffffff">${escapeSvg(data.weekdayLabel)}</text>`);
  parts.push(`<text x="${bx}" y="${Y(headerH * 0.47)}" style="font:900 ${dateSize}px Arial,Helvetica,sans-serif;fill:#ffffff">${escapeSvg(data.dateLabel)}</text>`);
  parts.push(`<line x1="${bx}" y1="${Y(headerH * 0.54)}" x2="${X(badgeW - 70 * s)}" y2="${Y(headerH * 0.54)}" stroke="#ffffff" stroke-width="${Math.max(1, 3 * s)}"/>`);
  if (data.timeLabel) {
    parts.push(`<text x="${bx}" y="${Y(headerH * 0.72)}" style="font:900 ${dateSize}px Arial,Helvetica,sans-serif;fill:#ffffff">${escapeSvg(data.timeLabel)}</text>`);
  }

  // Titulo centralizado na area entre o bloco azul e a Biblia (sem invadir).
  const titleLeft = X(badgeW);
  const titleRight = X(fw - bibleTopSize * 0.9);
  const titleCx = (titleLeft + titleRight) / 2;
  const titleSize = (compact ? 58 : 92) * s;
  const subSize = (compact ? 34 : 52) * s;
  parts.push(`<text x="${titleCx}" y="${Y(headerH * 0.42)}" text-anchor="middle" style="font:900 ${titleSize}px Arial,Helvetica,sans-serif;fill:#12305c">Designação</text>`);
  parts.push(`<text x="${titleCx}" y="${Y(headerH * 0.66)}" text-anchor="middle" style="font:700 ${subSize}px Arial,Helvetica,sans-serif;fill:#1d4f87">Conferência Pública</text>`);

  parts.push(`</g>`);

  // ----- Corpo: Orador -> Tema -> Congregacao -> Cantico -> Endereco -----
  const fields: { label: string; value: string; symbol: string; lines: number }[] = [
    { label: "Orador", value: data.speaker, symbol: "person", lines: 1 },
    { label: "Tema", value: data.theme, symbol: "book", lines: 3 },
    { label: "Congregação", value: data.congregation, symbol: "people", lines: 1 },
    { label: "Cântico", value: data.song, symbol: "music", lines: 1 },
    { label: "Endereço", value: data.address, symbol: "pin", lines: 2 },
  ];
  const bottomBandH = (compact ? 150 : 210) * s; // rodape da Biblia decorativa
  const bodyTop = headerH + (compact ? 40 : 70) * s;
  const bodyBottom = fh - bottomBandH - (compact ? 20 : 40) * s;
  // Distribui os campos ocupando bem o espaco vertical disponivel.
  const totalLines = fields.reduce((sum, f) => sum + f.lines, 0);
  const lineUnit = valueLineUnit(bodyTop, bodyBottom, totalLines, fields.length, s, compact);

  const labelSize = (compact ? 30 : 44) * s;
  const valueSize = (compact ? 24 : 34) * s;
  const iconR = (compact ? 26 : 42) * s;
  const iconCx = X((compact ? 52 : 74) * s);
  const dividerX1 = X((compact ? 40 : 50) * s);
  const dividerX2 = X(fw - (compact ? 40 : 50) * s);
  const labelX = X((compact ? 110 : 150) * s);
  const rightX = X(fw - (compact ? 40 : 60) * s);

  let cursor = Y(bodyTop);
  fields.forEach((field, index) => {
    const blockH = field.lines * lineUnit.line + lineUnit.gap;
    const firstLineY = cursor + labelSize; // baseline da primeira linha do campo
    const iconCy = firstLineY - labelSize * 0.32;

    // Icone + separador vertical.
    parts.push(`<circle cx="${iconCx}" cy="${iconCy}" r="${iconR}" fill="#dcebf8"/>`);
    parts.push(renderFieldIcon(field.symbol, iconCx, iconCy, iconR));
    parts.push(`<line x1="${X((compact ? 88 : 128) * s)}" y1="${iconCy - iconR}" x2="${X((compact ? 88 : 128) * s)}" y2="${iconCy + iconR}" stroke="${ink}" stroke-width="${Math.max(1, 3 * s)}"/>`);

    // Rotulo.
    parts.push(`<text x="${labelX}" y="${firstLineY}" style="font:900 ${labelSize}px Arial,Helvetica,sans-serif;fill:${ink}">${escapeSvg(field.label)}:</text>`);
    const labelWidth = (field.label.length + 1) * labelSize * 0.58;
    const valueStartX = labelX + labelWidth + 16 * s;

    // Quebra do valor conforme largura disponivel.
    const availWidth = rightX - valueStartX;
    const maxChars = Math.max(8, Math.floor(availWidth / (valueSize * 0.55)));
    const valueLines = field.value ? wrapS89Text(field.value, maxChars).slice(0, field.lines) : [];

    for (let li = 0; li < field.lines; li += 1) {
      const lineY = firstLineY + li * lineUnit.line;
      const startX = li === 0 ? valueStartX : labelX;
      // Linha para preenchimento (sempre presente; vazio = em branco).
      parts.push(`<line x1="${startX}" y1="${lineY + 10 * s}" x2="${rightX}" y2="${lineY + 10 * s}" stroke="${ink}" stroke-width="${Math.max(1, 3 * s)}"/>`);
      const text = valueLines[li];
      if (text) {
        parts.push(`<text x="${startX + 6 * s}" y="${lineY}" style="font:700 ${valueSize}px Arial,Helvetica,sans-serif;fill:${inkDark}">${escapeSvg(text)}</text>`);
      }
    }

    // Divisoria tracejada discreta entre campos.
    if (index < fields.length - 1) {
      const divY = cursor + blockH - lineUnit.gap * 0.4;
      parts.push(`<line x1="${dividerX1}" y1="${divY}" x2="${dividerX2}" y2="${divY}" stroke="#9dc0e2" stroke-width="${Math.max(1, 2 * s)}" stroke-dasharray="${8 * s} ${8 * s}"/>`);
    }
    cursor += blockH;
  });

  // ----- Biblia decorativa inferior, inteiramente dentro da folha -----
  parts.push(renderBottomBibleBand(ox, oy, fw, fh, s, bottomBandH, compact));
  return parts;
}

// Calcula a altura de linha e o espacamento entre campos para preencher a
// area vertical do corpo sem deixar grandes vazios, com limites por modo.
function valueLineUnit(
  bodyTop: number,
  bodyBottom: number,
  totalLines: number,
  fieldCount: number,
  s: number,
  compact: boolean,
) {
  const avail = Math.max(0, bodyBottom - bodyTop);
  // 70% do espaco para linhas, 30% para folgas entre campos.
  const minLine = (compact ? 34 : 58) * s;
  const maxLine = (compact ? 60 : 120) * s;
  const rawLine = (avail * 0.72) / Math.max(totalLines, 1);
  const line = Math.min(maxLine, Math.max(minLine, rawLine));
  const gap = Math.max((compact ? 18 : 32) * s, (avail - line * totalLines) / Math.max(fieldCount, 1));
  return { line, gap };
}

// Biblia aberta vetorial (paginas + lombada), tom azul, sem qualquer texto.
function renderOpenBible(cx: number, cy: number, size: number): string {
  const w = size;
  const h = size * 0.72;
  const half = w / 2;
  return [
    `<g>`,
    `<path d="M${cx - half} ${cy + h * 0.12} Q${cx - half * 0.4} ${cy - h * 0.06} ${cx} ${cy + h * 0.16} L${cx} ${cy + h} Q${cx - half * 0.4} ${cy + h * 0.82} ${cx - half} ${cy + h * 0.9} Z" fill="#e8f1fb" stroke="#4f7fb2" stroke-width="${Math.max(1, size * 0.012)}"/>`,
    `<path d="M${cx + half} ${cy + h * 0.12} Q${cx + half * 0.4} ${cy - h * 0.06} ${cx} ${cy + h * 0.16} L${cx} ${cy + h} Q${cx + half * 0.4} ${cy + h * 0.82} ${cx + half} ${cy + h * 0.9} Z" fill="#f4f9ff" stroke="#4f7fb2" stroke-width="${Math.max(1, size * 0.012)}"/>`,
    `<path d="M${cx} ${cy + h * 0.16} L${cx} ${cy + h}" stroke="#2f6cae" stroke-width="${Math.max(1, size * 0.02)}"/>`,
    `<path d="M${cx - half * 0.72} ${cy + h * 0.32} q${half * 0.3} -${h * 0.08} ${half * 0.62} ${h * 0.02}" fill="none" stroke="#8fb4d8" stroke-width="${Math.max(1, size * 0.01)}"/>`,
    `<path d="M${cx - half * 0.72} ${cy + h * 0.5} q${half * 0.3} -${h * 0.08} ${half * 0.62} ${h * 0.02}" fill="none" stroke="#8fb4d8" stroke-width="${Math.max(1, size * 0.01)}"/>`,
    `<path d="M${cx + half * 0.1} ${cy + h * 0.34} q${half * 0.3} -${h * 0.06} ${half * 0.6} ${h * 0.02}" fill="none" stroke="#8fb4d8" stroke-width="${Math.max(1, size * 0.01)}"/>`,
    `<path d="M${cx + half * 0.1} ${cy + h * 0.52} q${half * 0.3} -${h * 0.06} ${half * 0.6} ${h * 0.02}" fill="none" stroke="#8fb4d8" stroke-width="${Math.max(1, size * 0.01)}"/>`,
    `</g>`,
  ].join("");
}

// Faixa inferior com Biblia estilizada (azul), sem texto/versiculo.
function renderBottomBibleBand(ox: number, oy: number, fw: number, fh: number, s: number, bandH: number, compact: boolean): string {
  const top = oy + fh - bandH;
  const cx = ox + fw / 2;
  // Largura tal que a Biblia (altura = size*0.72) caiba inteira dentro da
  // banda, com folga acima da borda inferior da folha.
  const maxByHeight = (bandH * 0.82) / 0.72;
  const bibleW = Math.min(fw * (compact ? 0.55 : 0.62), (compact ? 360 : 520) * s, maxByHeight);
  const bibleCy = top + bandH * 0.1;
  return [
    `<g>`,
    `<path d="M${ox} ${top + bandH * 0.5} C${ox + fw * 0.25} ${top + bandH * 0.2} ${ox + fw * 0.55} ${top + bandH * 0.7} ${ox + fw * 0.78} ${top + bandH * 0.4} C${ox + fw * 0.9} ${top + bandH * 0.25} ${ox + fw} ${top + bandH * 0.4} ${ox + fw} ${top + bandH * 0.35} L${ox + fw} ${oy + fh} L${ox} ${oy + fh} Z" fill="#dcebf8"/>`,
    `<path d="M${ox} ${top + bandH * 0.72} C${ox + fw * 0.3} ${top + bandH * 0.5} ${ox + fw * 0.6} ${top + bandH * 0.95} ${ox + fw * 0.85} ${top + bandH * 0.62} C${ox + fw * 0.94} ${top + bandH * 0.52} ${ox + fw} ${top + bandH * 0.6} ${ox + fw} ${top + bandH * 0.58} L${ox + fw} ${oy + fh} L${ox} ${oy + fh} Z" fill="#bcd8ef"/>`,
    renderOpenBible(cx, bibleCy, bibleW),
    `</g>`,
  ].join("");
}

// Icone simples por campo (pessoa, livro, pessoas, musica, pino), tom azul.
function renderFieldIcon(symbol: string, cx: number, cy: number, r: number): string {
  const c = "#0d407c";
  const sw = Math.max(1, r * 0.16);
  switch (symbol) {
    case "person":
      return `<g fill="${c}"><circle cx="${cx}" cy="${cy - r * 0.3}" r="${r * 0.34}"/><path d="M${cx - r * 0.5} ${cy + r * 0.55} q${r * 0.5} -${r * 0.7} ${r} 0 Z"/></g>`;
    case "book":
      return `<g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"><path d="M${cx - r * 0.55} ${cy - r * 0.4} h${r * 0.5} v${r * 0.8} h-${r * 0.5} Z"/><path d="M${cx + r * 0.05} ${cy - r * 0.4} h${r * 0.5} v${r * 0.8} h-${r * 0.5} Z"/></g>`;
    case "people":
      return `<g fill="${c}"><circle cx="${cx - r * 0.32}" cy="${cy - r * 0.25}" r="${r * 0.26}"/><circle cx="${cx + r * 0.32}" cy="${cy - r * 0.25}" r="${r * 0.26}"/><path d="M${cx - r * 0.75} ${cy + r * 0.5} q${r * 0.43} -${r * 0.55} ${r * 0.86} 0 Z"/><path d="M${cx - r * 0.11} ${cy + r * 0.5} q${r * 0.43} -${r * 0.55} ${r * 0.86} 0 Z"/></g>`;
    case "music":
      return `<g fill="${c}"><rect x="${cx - r * 0.05}" y="${cy - r * 0.5}" width="${sw * 1.4}" height="${r * 0.85}"/><circle cx="${cx - r * 0.18}" cy="${cy + r * 0.4}" r="${r * 0.2}"/></g>`;
    case "pin":
      return `<path d="M${cx} ${cy - r * 0.55} a${r * 0.4} ${r * 0.4} 0 1 1 -0.1 0 Z M${cx - r * 0.4} ${cy - r * 0.15} L${cx} ${cy + r * 0.6} L${cx + r * 0.4} ${cy - r * 0.15} Z" fill="${c}"/>`;
    default:
      return "";
  }
}

// Modo digital / WhatsApp: uma designacao ocupando a pagina A4 (vertical).
function createOutgoingSpeakerSvg(meeting: PublicMeeting, resolved: ResolvedOutgoing) {
  const pageWidth = FIELD_MINISTRY_IMAGE_WIDTH;
  const pageHeight = FIELD_MINISTRY_IMAGE_HEIGHT;
  const data = buildOutgoingSheetData(meeting, resolved);
  const margin = Math.round(pageWidth * 0.05);
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    ...renderOutgoingSheet(data, { ox: margin, oy: margin, fw: pageWidth - margin * 2, fh: pageHeight - margin * 2 }),
    "</svg>",
  ];
  return parts.join("");
}

// Modo impressao do mes: grade 2x2 por pagina A4, com linhas de corte.
function createOutgoingSpeakerMonthPageSvg(pageData: OutgoingSheetData[]) {
  const pageWidth = FIELD_MINISTRY_IMAGE_WIDTH;
  const pageHeight = FIELD_MINISTRY_IMAGE_HEIGHT;
  const margin = Math.round(pageWidth * 0.04);
  const gap = Math.round(pageWidth * 0.03);
  const cols = 2;
  const rows = 2;
  const cellW = (pageWidth - margin * 2 - gap * (cols - 1)) / cols;
  const cellH = (pageHeight - margin * 2 - gap * (rows - 1)) / rows;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
  ];
  // Linhas de corte discretas (centrais horizontal e vertical).
  const midX = margin + cellW + gap / 2;
  const midY = margin + cellH + gap / 2;
  parts.push(`<line x1="${midX}" y1="0" x2="${midX}" y2="${pageHeight}" stroke="#c4d6ea" stroke-width="2" stroke-dasharray="16 14"/>`);
  parts.push(`<line x1="0" y1="${midY}" x2="${pageWidth}" y2="${midY}" stroke="#c4d6ea" stroke-width="2" stroke-dasharray="16 14"/>`);
  pageData.slice(0, 4).forEach((data, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const ox = margin + col * (cellW + gap);
    const oy = margin + row * (cellH + gap);
    parts.push(...renderOutgoingSheet(data, { ox, oy, fw: cellW, fh: cellH }));
  });
  parts.push("</svg>");
  return parts.join("");
}

function createOutgoingSpeakerMonthPrintHtml(sheets: OutgoingSheetData[]) {
  const svgs = chunkItems(sheets, 4).map((pageData) => createOutgoingSpeakerMonthPageSvg(pageData));
  return createA4SvgPrintHtml("Designações de Conferência Pública do mês", svgs);
}

function createMechanicalSvgPrintHtml({
  assignments,
  memberName,
  monthKey,
}: {
  assignments: MechanicalAssignment[];
  memberName: (id: string | null) => string;
  monthKey: string;
}) {
  return createA4SvgPrintHtml("A/V - Indicadores - Palco", [createMechanicalImageSvg({ assignments, memberName, monthKey })]);
}

function createMechanicalImageSvg({
  assignments,
  memberName,
  monthKey,
}: {
  assignments: MechanicalAssignment[];
  memberName: (id: string | null) => string;
  monthKey: string;
}) {
  const pageWidth = FIELD_MINISTRY_IMAGE_WIDTH;
  const pageHeight = FIELD_MINISTRY_IMAGE_HEIGHT;
  const x = 45;
  const width = pageWidth - x * 2;
  const tableY = 545;
  const headHeight = 270;
  const bottomBandHeight = 95;
  const bottomMargin = 38;
  const rowHeight = Math.max(
    180,
    Math.min(278, Math.floor((pageHeight - tableY - headHeight - bottomBandHeight - bottomMargin) / Math.max(assignments.length, 1))),
  );
  const cellWidth = width / 6;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pageWidth}" height="${pageHeight}" viewBox="0 0 ${pageWidth} ${pageHeight}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<style>
      .av-top{font:900 124px Arial,Helvetica,sans-serif;fill:#fff;letter-spacing:0;text-transform:uppercase}
      .av-month{font:900 116px Arial,Helvetica,sans-serif;fill:#1d4f87;text-decoration:underline;text-transform:uppercase}
      .av-head{font:900 48px Arial,Helvetica,sans-serif;fill:#fff;text-transform:uppercase}
      .av-sub{font:900 36px Arial,Helvetica,sans-serif;fill:#fff;text-decoration:underline;text-transform:uppercase}
    </style>`,
    `<rect x="0" y="0" width="${pageWidth}" height="210" fill="#1d4f87"/>`,
    `<text x="${pageWidth / 2}" y="143" text-anchor="middle" class="av-top">A/V - INDICADORES - PALCO</text>`,
    `<text x="${pageWidth / 2}" y="455" text-anchor="middle" class="av-month">${escapeSvg(monthTitle(monthKey))}</text>`,
  ];

  const fitFontSize = (text: string, baseSize: number, maxWidth: number, minSize: number) => {
    const estimatedWidth = text.length * baseSize * 0.64;
    if (!maxWidth || estimatedWidth <= maxWidth) return baseSize;
    return Math.max(minSize, Math.floor((maxWidth / Math.max(text.length * 0.64, 1))));
  };
  const addText = (text: string, tx: number, ty: number, className: string, anchor = "middle", maxWidth = 0) => {
    const averageWidth = className === "av-head" ? 24 : 18;
    const fit = maxWidth && text.length * averageWidth > maxWidth ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : "";
    parts.push(`<text x="${tx}" y="${ty}" text-anchor="${anchor}" class="${className}"${fit}>${escapeSvg(text)}</text>`);
  };
  const addCellText = (text: string, tx: number, ty: number, maxWidth: number, clipId: string, isDate = false) => {
    const fontSize = fitFontSize(text, isDate ? 58 : 55, maxWidth, isDate ? 50 : 44);
    parts.push(
      `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" clip-path="url(#${clipId})" style="font:900 ${fontSize}px Arial,Helvetica,sans-serif;fill:#4f5863">${escapeSvg(text)}</text>`,
    );
  };
  const drawCell = (cellX: number, cellY: number, cellH: number, fill: string, stroke = "#59636d") => {
    parts.push(`<rect x="${cellX}" y="${cellY}" width="${cellWidth}" height="${cellH}" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`);
  };

  ["DATAS", "OPERADOR\nÁUDIO", "OPERADOR\nVÍDEO", "INDICADOR 1\nINTERNO", "INDICADOR 2\nEXTERNO", "VOLANTE\nPALCO"].forEach((heading, index) => {
    const cellX = x + index * cellWidth;
    drawCell(cellX, tableY, headHeight, "#1d4f87");
    heading.split("\n").forEach((line, lineIndex) => {
      addText(line, cellX + cellWidth / 2, tableY + 112 + lineIndex * 58, lineIndex === 0 ? "av-head" : "av-sub", "middle", cellWidth - 34);
    });
  });

  assignments.forEach((assignment, rowIndex) => {
    const rowY = tableY + headHeight + rowIndex * rowHeight;
    const fill = rowIndex % 2 === 0 ? "#d8e1ed" : "#ffffff";
    [
      formatNumericDate(assignment.assignment_date),
      shortName(memberName(assignment.audio_member_id)),
      shortName(memberName(assignment.video_member_id)),
      shortName(memberName(assignment.internal_attendant_member_id)),
      shortName(memberName(assignment.external_attendant_member_id)),
      shortName(memberName(assignment.roaming_microphone_member_id)),
    ].forEach((value, cellIndex) => {
      const cellX = x + cellIndex * cellWidth;
      const clipId = `av-cell-${rowIndex}-${cellIndex}`;
      drawCell(cellX, rowY, rowHeight, fill);
      parts.push(`<clipPath id="${clipId}"><rect x="${cellX + 12}" y="${rowY + 8}" width="${cellWidth - 24}" height="${rowHeight - 16}"/></clipPath>`);
      addCellText(value.toUpperCase(), cellX + cellWidth / 2, rowY + rowHeight / 2, cellWidth - 36, clipId, cellIndex === 0);
    });
  });

  parts.push(`<rect x="0" y="${pageHeight - bottomBandHeight}" width="${pageWidth}" height="${bottomBandHeight}" fill="#1d4f87"/>`);
  parts.push("</svg>");
  return parts.join("");
}

function createMechanicalPrintHtml({
  assignments,
  memberName,
  monthKey,
}: {
  assignments: MechanicalAssignment[];
  memberName: (id: string | null) => string;
  monthKey: string;
}) {
  const rows = assignments
    .map(
      (assignment, index) => `
        <tr class="${index % 2 === 0 ? "alt" : ""}">
          <td>${escapeHtml(formatNumericDate(assignment.assignment_date))}</td>
          <td>${escapeHtml(shortName(memberName(assignment.audio_member_id)))}</td>
          <td>${escapeHtml(shortName(memberName(assignment.video_member_id)))}</td>
          <td>${escapeHtml(shortName(memberName(assignment.internal_attendant_member_id)))}</td>
          <td>${escapeHtml(shortName(memberName(assignment.external_attendant_member_id)))}</td>
          <td>${escapeHtml(shortName(memberName(assignment.roaming_microphone_member_id)))}</td>
        </tr>
      `,
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>A/V - Indicadores - Palco</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #ffffff;
      color: #454b52;
      font-family: Arial, Helvetica, sans-serif;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .av-page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      overflow: hidden;
      background: #ffffff;
      padding: 0 9mm;
    }
    .av-top,
    .av-footer {
      margin: 0 -9mm;
      background: #1d4f87;
      color: #ffffff;
    }
    .av-top {
      display: grid;
      place-items: center;
      height: 18mm;
      font-size: 25pt;
      font-weight: 900;
      letter-spacing: 1.2pt;
      text-align: center;
      text-transform: uppercase;
    }
    .av-month {
      margin: 15mm 0 6mm;
      color: #1d4f87;
      font-size: 29pt;
      font-weight: 900;
      text-align: center;
      text-decoration: underline;
      text-transform: uppercase;
    }
    .av-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      border: 0.8mm solid #59636d;
      font-size: 12pt;
      font-weight: 850;
      text-align: center;
    }
    .av-table th {
      height: 24mm;
      padding: 2mm;
      border: 0.55mm solid #59636d;
      background: #1d4f87;
      color: #ffffff;
      font-size: 10.8pt;
      line-height: 1.25;
      text-transform: uppercase;
    }
    .av-table th span {
      display: block;
      font-size: 8.7pt;
      text-decoration: underline;
    }
    .av-table td {
      height: 13.2mm;
      padding: 1.8mm;
      border: 0.45mm solid #59636d;
      background: #ffffff;
    }
    .av-table tr.alt td {
      background: #d8e1ed;
    }
    .av-table td:first-child {
      color: #5b626b;
      font-weight: 900;
    }
    .av-footer {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 18mm;
      height: 56mm;
      border-bottom: 1.2mm solid #ffffff;
    }
    .av-footer::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -34mm;
      height: 33mm;
      background: #1d4f87;
    }
    @media screen {
      body { background: #eef3f6; padding: 18px; }
      .av-page { margin: 0 auto; box-shadow: 0 18px 50px rgba(31, 42, 47, 0.18); }
    }
  </style>
</head>
<body>
  <section class="av-page">
    <header class="av-top">A/V - Indicadores - Palco</header>
    <h1 class="av-month">${escapeHtml(monthTitle(monthKey))}</h1>
    <table class="av-table">
      <thead>
        <tr>
          <th>Datas</th>
          <th>Operador<br />Áudio</th>
          <th>Operador<br />Vídeo</th>
          <th>Indicador 1<span>Interno</span></th>
          <th>Indicador 2<span>Externo</span></th>
          <th>Volante<br />Palco</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <footer class="av-footer"></footer>
  </section>
</body>
</html>`;
}

function createFieldMinistryPrintHtml({
  assignments,
  memberName,
  groupName,
  monthKey,
}: {
  assignments: FieldMinistryAssignment[];
  memberName: (id: string | null) => string;
  groupName: (id: string | null) => string;
  monthKey: string;
}) {
  const weekdays: FieldDay[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const weekdayLabels = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
  const weeklyCells = weekdays
    .map((weekday) => {
      const fixedSlots = fixedFieldWeeklySlots[weekday] ?? [];
      const fixedConductor = fixedFieldWeeklyConductors[weekday];
      if (fixedConductor) {
        return `<div class="weekly-cell fixed"><strong>8:45</strong><span>${escapeHtml(shortName(fixedConductor))}</span></div>`;
      }
      if (weekday === "sex") {
        const fixedSlot = fixedSlots[0];
        return `<div class="weekly-cell friday"><strong>${escapeHtml(displayTime(fixedSlot?.startTime ?? "08:45"))}</strong><span>${escapeHtml(shortName(fixedSlot?.conductor ?? "Participante 005"))}</span></div>`;
      }
      if (weekday === "sab") {
        return `<div class="weekly-cell weekly-muted"><strong>9:00</strong><span>Ver tabela<br />abaixo</span></div>`;
      }
      if (weekday === "dom") {
        return `<div class="weekly-cell weekly-muted"><strong>9:00</strong><span>Saída de<br />grupos</span></div>`;
      }
      return `<div class="weekly-cell"><strong></strong><span></span></div>`;
    })
    .join("");
  const fridayRows = assignments
    .filter(
      (assignment) =>
        assignment.weekday === "sex" &&
        assignment.arrangement === "salao_reino" &&
        (assignment.start_time ?? "").slice(0, 5) === FRIDAY_AFTERNOON_TIME,
    )
    .map((assignment, index) => fieldTableRow(assignment, memberName, index))
    .join("");
  const saturdayRows = assignments
    .filter((assignment) => assignment.weekday === "sab")
    .map((assignment, index) => fieldTableRow(assignment, memberName, index))
    .join("");
  const allGroupsRows = assignments
    .filter((assignment) => assignment.arrangement === "todos_grupos")
    .map((assignment, index) => fieldTableRow(assignment, memberName, index))
    .join("");
  const sundayGroups = assignments.filter((assignment) => assignment.arrangement === "grupo_servico");
  const groupIds = [...new Set(sundayGroups.map((assignment) => assignment.field_service_group_id).filter((id): id is string => Boolean(id)))];
  const sundayDates = [...new Set(sundayGroups.map((assignment) => assignment.activity_date))].sort();
  const sundayGroupColumns = groupIds
    .map((groupId, index) => {
      const groupAssignments = sundayGroups.filter((assignment) => assignment.field_service_group_id === groupId);
      const first = groupAssignments[0];
      return `
        <div class="group-column tone-${index % 3}">
          <div class="group-title">Grupo: ${escapeHtml(groupName(groupId))}</div>
          <div class="group-place">Local saída: ${escapeHtml(first?.location ?? "")}</div>
          <div class="group-row group-row-head"><span>Datas</span><span>Horário</span><span>Dirigente</span></div>
          ${sundayDates
            .map((date) => {
              const assignment = groupAssignments.find((item) => item.activity_date === date);
              return `<div class="group-row"><span>${escapeHtml(formatShortNumericDate(date))}</span><span>${escapeHtml(displayTime(assignment?.start_time ?? ""))}</span><span>${escapeHtml(shortName(fieldConductorPrintName(assignment, memberName)))}</span></div>`;
            })
            .join("")}
        </div>
      `;
    })
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Campo - ${escapeHtml(monthTitle(monthKey))}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html,
    body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      overflow: hidden;
      background: #ffffff;
      color: #34404a;
      font-family: Arial, Helvetica, sans-serif;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .field-page {
      width: 210mm;
      height: 296mm;
      max-height: 296mm;
      padding: 0 6.2mm 5mm;
      background: #ffffff;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .field-top {
      display: grid;
      place-items: center;
      height: 16mm;
      margin: 0 -6.2mm;
      background: #1d4f87;
      color: #ffffff;
      font-size: 24pt;
      font-weight: 900;
      text-transform: uppercase;
    }
    .field-section-title {
      margin: 5.1mm 0 2mm;
      color: #1d4f87;
      font-size: 17.6pt;
      font-weight: 900;
      text-align: center;
      text-decoration: underline;
      text-transform: uppercase;
      line-height: 1.05;
      flex: 0 0 auto;
    }
    .weekly-labels,
    .weekly-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      text-align: center;
    }
    .weekly-labels {
      margin-left: 7mm;
      color: #4b6d9b;
      font-size: 10.8pt;
      font-weight: 900;
    }
    .weekly-wrap {
      display: grid;
      grid-template-columns: 7mm 1fr;
      align-items: stretch;
      margin: 0 5mm;
    }
    .shift-label {
      display: grid;
      place-items: center;
      color: #4b6d9b;
      font-size: 9.5pt;
      font-weight: 900;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
    }
    .weekly-grid {
      gap: 0;
    }
    .weekly-cell {
      display: grid;
      align-content: center;
      justify-items: center;
      min-height: 15.8mm;
      border: 0.45mm solid #333;
      border-left-width: 0;
      background: #ffc099;
      color: #4b6d9b;
      font-size: 10.8pt;
      font-weight: 900;
      line-height: 1.12;
    }
    .weekly-cell strong,
    .weekly-cell span {
      display: block;
      width: 100%;
      min-width: 0;
      max-width: 100%;
      padding: 0 0.8mm;
      text-align: center;
      white-space: normal;
      overflow-wrap: normal;
      word-break: normal;
    }
    .weekly-cell:first-child {
      border-left-width: 0.45mm;
    }
    .weekly-cell.fixed,
    .weekly-cell.friday {
      background: #bdf4d9;
    }
    .weekly-cell:nth-child(2),
    .weekly-cell:nth-child(3),
    .weekly-cell:nth-child(4) {
      background: #ffc099;
    }
    .weekly-cell.weekly-muted {
      background: #ffffff;
    }
    .weekly-cell span {
      margin-top: 0.6mm;
      font-size: 8.2pt;
      text-transform: uppercase;
    }
    .weekly-cell .secondary-time {
      margin-top: 1mm;
      font-size: 9.5pt;
    }
    table.field-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 12.1pt;
      font-weight: 850;
      text-align: center;
      flex: 0 0 auto;
    }
    .field-table th {
      height: 8.4mm;
      border: 0.4mm solid #6b7378;
      background: #1d4f87;
      color: #ffffff;
      font-size: 12.2pt;
      text-transform: uppercase;
    }
    .field-table.teal th { background: #3f8790; }
    .field-table td {
      height: 8.6mm;
      padding: 1mm 1.4mm;
      border: 0.35mm solid #9da4a8;
      background: #ffffff;
      overflow-wrap: anywhere;
    }
    .field-table tr.alt td {
      background: #d2f7e2;
    }
    .field-table.blue tr.alt td {
      background: #bfd1ed;
    }
    .group-grid {
      display: grid;
      grid-template-columns: repeat(${Math.max(groupIds.length, 1)}, 1fr);
      border: 0.45mm solid #111;
    }
    .group-head {
      padding: 1mm;
      background: #1d4f87;
      color: #ffffff;
      font-size: 12pt;
      font-weight: 900;
      text-align: center;
      text-decoration: underline;
      text-transform: uppercase;
    }
    .group-column {
      border-right: 0.45mm solid #111;
      background: #e7f1f3;
      font-size: 7.9pt;
      font-weight: 900;
      text-transform: uppercase;
      min-width: 0;
      overflow: hidden;
    }
    .group-column:last-child { border-right: 0; }
    .tone-0 .group-title, .tone-0 .group-place { background: #569aa0; }
    .tone-1 .group-title, .tone-1 .group-place { background: #ffa167; }
    .tone-2 .group-title, .tone-2 .group-place { background: #ef4b61; }
    .group-title,
    .group-place {
      display: flex;
      min-height: 8mm;
      padding: 0.8mm 1.1mm;
      align-items: center;
      justify-content: center;
      color: #172331;
      text-align: center;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: normal;
      line-height: 1.12;
    }
    .group-place {
      min-height: 12mm;
      border-bottom: 0.35mm solid #111;
    }
    .group-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr;
      height: 5.6mm;
      align-items: center;
      border-bottom: 0.3mm solid #9da4a8;
      background: #ffffff;
      text-align: center;
      line-height: 1.1;
    }
    .group-row span {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .group-row:nth-child(even) {
      background: #dfeff3;
    }
    .group-row-head {
      height: 4.8mm;
      background: #f8cfbd !important;
      text-decoration: underline;
    }
    .all-groups {
      margin-top: 1.6mm;
    }
    .field-spacer {
      flex: 1 1 0;
      min-height: 3mm;
    }
    @media screen {
      body { background: #eef3f6; padding: 18px; }
      .field-page { height: 297mm; max-height: 297mm; margin: 0 auto; box-shadow: 0 18px 50px rgba(31, 42, 47, 0.18); }
    }
    @media print {
      body {
        position: relative;
      }
      .field-page {
        transform: scale(0.96);
        transform-origin: top left;
        width: 218.75mm;
        height: 308.3mm;
        max-height: 308.3mm;
        break-after: avoid;
        break-inside: avoid;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <section class="field-page">
    <header class="field-top">Campo - ${escapeHtml(monthTitle(monthKey))}</header>
    <h2 class="field-section-title">Programação semanal</h2>
    <div class="weekly-labels">${weekdayLabels.map((label) => `<span>${label}</span>`).join("")}</div>
    <div class="weekly-wrap">
      <div class="shift-label">Manhã</div>
      <div class="weekly-grid">${weeklyCells}</div>
    </div>

    <h2 class="field-section-title">Dirigentes às sextas</h2>
    <table class="field-table teal">
      <thead><tr><th>Datas</th><th>Horário</th><th>Dirigente</th><th>Local de saída</th></tr></thead>
      <tbody>${fridayRows}</tbody>
    </table>
    <div class="field-spacer"></div>

    <h2 class="field-section-title">Dirigentes aos sábados</h2>
    <table class="field-table blue">
      <thead><tr><th>Datas</th><th>Horário</th><th>Dirigente</th><th>Local de saída</th></tr></thead>
      <tbody>${saturdayRows}</tbody>
    </table>
    <div class="field-spacer"></div>

    <h2 class="field-section-title">Saída dos grupos aos domingos</h2>
    <div class="group-head">Grupos e locais de saída</div>
    <div class="group-grid">${sundayGroupColumns || "<div class=\"group-column\"><div class=\"group-title\">Nenhum grupo</div></div>"}</div>
    <div class="field-spacer"></div>

    <h2 class="field-section-title">Saída com todos os grupos</h2>
    <table class="field-table blue all-groups">
      <thead><tr><th>Datas</th><th>Horário</th><th>Dirigente</th><th>Local de saída</th></tr></thead>
      <tbody>${allGroupsRows}</tbody>
    </table>
  </section>
</body>
</html>`;
}

function createFieldMinistrySvgPrintHtml({
  assignments,
  memberName,
  groupName,
  monthKey,
}: {
  assignments: FieldMinistryAssignment[];
  memberName: (id: string | null) => string;
  groupName: (id: string | null) => string;
  monthKey: string;
}) {
  const svg = createFieldMinistryImageSvg({ assignments, memberName, groupName, monthKey });
  const src = svgToDataUrl(svg);

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Campo - ${escapeHtml(monthTitle(monthKey))}</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; }
    html,
    body {
      width: 210mm;
      height: 297mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: #ffffff;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    img {
      display: block;
      width: 210mm;
      height: 297mm;
      object-fit: contain;
      object-position: top center;
      break-after: avoid;
      break-inside: avoid;
      page-break-after: avoid;
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  <img src="${src}" alt="Campo - ${escapeHtml(monthTitle(monthKey))}" />
</body>
</html>`;
}

const FIELD_MINISTRY_PAGE_CSS_WIDTH = (210 / 25.4) * 96;
const FIELD_MINISTRY_PAGE_CSS_HEIGHT = (297 / 25.4) * 96;
const FIELD_MINISTRY_IMAGE_SCALE = 3.125;
const FIELD_MINISTRY_IMAGE_WIDTH = Math.round(FIELD_MINISTRY_PAGE_CSS_WIDTH * FIELD_MINISTRY_IMAGE_SCALE);
const FIELD_MINISTRY_IMAGE_HEIGHT = Math.round(FIELD_MINISTRY_PAGE_CSS_HEIGHT * FIELD_MINISTRY_IMAGE_SCALE);

async function createFieldMinistryImageBlob({
  assignments,
  memberName,
  groupName,
  monthKey,
  mimeType,
}: {
  assignments: FieldMinistryAssignment[];
  memberName: (id: string | null) => string;
  groupName: (id: string | null) => string;
  monthKey: string;
  mimeType: "image/png" | "image/jpeg";
}) {
  const svg = createFieldMinistryImageSvg({ assignments, memberName, groupName, monthKey });
  return createSvgImageBlob(svg, mimeType, `Não foi possível gerar o ${mimeType === "image/png" ? "PNG" : "JPG"} do campo.`);
}

async function createSvgImageBlobs(svgs: string[], mimeType: "image/png" | "image/jpeg") {
  return Promise.all(svgs.map((svg) => createSvgImageBlob(svg, mimeType)));
}

async function createSvgImageBlob(
  svg: string,
  mimeType: "image/png" | "image/jpeg",
  errorMessage = `Não foi possível gerar o ${mimeType === "image/png" ? "PNG" : "JPG"} da folha.`,
) {
  const image = await loadImage(svgToDataUrl(svg), "Não foi possível carregar a imagem da folha.");
  const canvas = document.createElement("canvas");
  canvas.width = FIELD_MINISTRY_IMAGE_WIDTH;
  canvas.height = FIELD_MINISTRY_IMAGE_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem da folha.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, FIELD_MINISTRY_IMAGE_WIDTH, FIELD_MINISTRY_IMAGE_HEIGHT);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, FIELD_MINISTRY_IMAGE_WIDTH, FIELD_MINISTRY_IMAGE_HEIGHT);

  return canvasToBlob(canvas, mimeType, mimeType === "image/jpeg" ? 0.97 : undefined, errorMessage);
}

function createFieldMinistryImageSvg({
  assignments,
  memberName,
  groupName,
  monthKey,
}: {
  assignments: FieldMinistryAssignment[];
  memberName: (id: string | null) => string;
  groupName: (id: string | null) => string;
  monthKey: string;
}) {
  const x = 90;
  const width = FIELD_MINISTRY_IMAGE_WIDTH - x * 2;
  let y = 0;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FIELD_MINISTRY_IMAGE_WIDTH}" height="${FIELD_MINISTRY_IMAGE_HEIGHT}" viewBox="0 0 ${FIELD_MINISTRY_IMAGE_WIDTH} ${FIELD_MINISTRY_IMAGE_HEIGHT}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<style>
      .top{font:900 104px Arial,Helvetica,sans-serif;fill:#fff;letter-spacing:0;text-transform:uppercase}
      .title{font:900 82px Arial,Helvetica,sans-serif;fill:#1d4f87;text-decoration:underline;text-transform:uppercase}
      .head{font:900 48px Arial,Helvetica,sans-serif;fill:#fff;text-transform:uppercase}
      .cell{font:900 49px Arial,Helvetica,sans-serif;fill:#2f3a45;text-transform:uppercase}
      .small{font:900 34px Arial,Helvetica,sans-serif;fill:#4b6d9b;text-transform:uppercase}
      .group{font:900 31px Arial,Helvetica,sans-serif;fill:#111827;text-transform:uppercase}
    </style>`,
  ];

  const addText = (text: string, cx: number, cy: number, className: string, maxWidth = 0) => {
    const safe = escapeSvg(text);
    const fit = maxWidth && text.length > 18 ? ` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"` : "";
    parts.push(`<text x="${cx}" y="${cy}" text-anchor="middle" class="${className}"${fit}>${safe}</text>`);
  };
  const addLeftText = (text: string, tx: number, ty: number, className: string) => {
    parts.push(`<text x="${tx}" y="${ty}" class="${className}">${escapeSvg(text)}</text>`);
  };
  const row = (cells: string[], ry: number, rh: number, fill: string, className = "cell") => {
    const cellWidth = width / cells.length;
    cells.forEach((cell, index) => {
      const rx = x + index * cellWidth;
      parts.push(`<rect x="${rx}" y="${ry}" width="${cellWidth}" height="${rh}" fill="${fill}" stroke="#8b949e" stroke-width="3"/>`);
      addText(cell.toUpperCase(), rx + cellWidth / 2, ry + rh / 2 + 15, className, cellWidth - 36);
    });
  };
  const table = (title: string, rows: FieldMinistryAssignment[], headerFill: string) => {
    addText(title, FIELD_MINISTRY_IMAGE_WIDTH / 2, y + 82, "title");
    y += 118;
    row(["Datas", "Horário", "Dirigente", "Local de saída"], y, 82, headerFill, "head");
    y += 82;
    rows.forEach((assignment, index) => {
      row(
        [
          formatShortNumericDate(assignment.activity_date),
          displayTime(assignment.start_time),
          fieldConductorPrintName(assignment, memberName),
          assignment.location ?? "",
        ],
        y,
        82,
        index % 2 === 0 ? (headerFill === "#3f8790" ? "#d2f7e2" : "#bfd1ed") : "#ffffff",
      );
      y += 82;
    });
    y += 112;
  };

  parts.push(`<rect x="0" y="0" width="${FIELD_MINISTRY_IMAGE_WIDTH}" height="194" fill="#1d4f87"/>`);
  addText(`Campo - ${monthTitle(monthKey)}`, FIELD_MINISTRY_IMAGE_WIDTH / 2, 132, "top");
  y = 228;
  addText("Programação semanal", FIELD_MINISTRY_IMAGE_WIDTH / 2, y + 74, "title");
  y += 128;

  const weekdays: FieldDay[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const labels = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"];
  const weekX = 210;
  const weekWidth = FIELD_MINISTRY_IMAGE_WIDTH - 330;
  const dayWidth = weekWidth / 7;
  labels.forEach((label, index) => addText(label, weekX + index * dayWidth + dayWidth / 2, y, "small"));
  y += 34;
  weekdays.forEach((weekday, index) => {
    const rx = weekX + index * dayWidth;
    const fixed = fixedFieldWeeklyConductors[weekday];
    const fixedSlot = (fixedFieldWeeklySlots[weekday] ?? [])[0];
    const fill = weekday === "seg" || weekday === "sex" ? "#bdf4d9" : ["ter", "qua", "qui"].includes(weekday) ? "#ffc099" : "#ffffff";
    const main = fixed ? ["8:45", shortName(fixed)] : weekday === "sex" ? [displayTime(fixedSlot?.startTime ?? "08:45"), shortName(fixedSlot?.conductor ?? "Participante 005")] : weekday === "sab" ? ["9:00", "Ver tabela abaixo"] : ["9:00", "Saída de grupos"];
    parts.push(`<rect x="${rx}" y="${y}" width="${dayWidth}" height="190" fill="${fill}" stroke="#333" stroke-width="4"/>`);
    main.forEach((line, lineIndex) => addText(line.toUpperCase(), rx + dayWidth / 2, y + 74 + lineIndex * 46, lineIndex % 2 === 0 ? "cell" : "small", dayWidth - 28));
  });
  addText("MANHÃ", 125, y + 112, "small");
  y += 300;

  table("Dirigentes às sextas", assignments.filter((a) => a.weekday === "sex" && a.arrangement === "salao_reino" && (a.start_time ?? "").slice(0, 5) === FRIDAY_AFTERNOON_TIME), "#3f8790");
  table("Dirigentes aos sábados", assignments.filter((a) => a.weekday === "sab"), "#1d4f87");

  const sundayGroups = assignments.filter((a) => a.arrangement === "grupo_servico");
  const groupIds = [...new Set(sundayGroups.map((a) => a.field_service_group_id).filter((id): id is string => Boolean(id)))];
  const sundayDates = [...new Set(sundayGroups.map((a) => a.activity_date))].sort();
  addText("Saída dos grupos aos domingos", FIELD_MINISTRY_IMAGE_WIDTH / 2, y + 82, "title");
  y += 118;
  parts.push(`<rect x="${x}" y="${y}" width="${width}" height="78" fill="#1d4f87" stroke="#111" stroke-width="4"/>`);
  addText("Grupos e locais de saída", FIELD_MINISTRY_IMAGE_WIDTH / 2, y + 55, "head");
  y += 78;
  const groupWidth = width / Math.max(groupIds.length, 1);
  const groupColors = ["#569aa0", "#ffa167", "#ef4b61"];
  groupIds.forEach((groupId, index) => {
    const gx = x + index * groupWidth;
    const groupAssignments = sundayGroups.filter((a) => a.field_service_group_id === groupId);
    const first = groupAssignments[0];
    parts.push(`<rect x="${gx}" y="${y}" width="${groupWidth}" height="154" fill="${groupColors[index % groupColors.length]}" stroke="#111" stroke-width="4"/>`);
    addLeftText(`GRUPO: ${groupName(groupId).toUpperCase()}`, gx + 16, y + 43, "group");
    addLeftText(`LOCAL SAÍDA: ${(first?.location ?? "").toUpperCase()}`, gx + 16, y + 106, "group");
    ["Datas", "Horário", "Dirigente"].forEach((cell, cellIndex) => {
      const cellWidth = groupWidth / 3;
      const rx = gx + cellIndex * cellWidth;
      parts.push(`<rect x="${rx}" y="${y + 154}" width="${cellWidth}" height="58" fill="#f8cfbd" stroke="#8b949e" stroke-width="2"/>`);
      addText(cell.toUpperCase(), rx + cellWidth / 2, y + 193, "group", cellWidth - 20);
    });
    sundayDates.forEach((date, dateIndex) => {
      const assignment = groupAssignments.find((item) => item.activity_date === date);
      const ry = y + 212 + dateIndex * 66;
      const cellWidth = groupWidth / 3;
      [formatShortNumericDate(date), displayTime(assignment?.start_time ?? ""), shortName(fieldConductorPrintName(assignment, memberName))].forEach((cell, cellIndex) => {
        const rx = gx + cellIndex * cellWidth;
        parts.push(`<rect x="${rx}" y="${ry}" width="${cellWidth}" height="66" fill="${dateIndex % 2 === 0 ? "#dfeff3" : "#ffffff"}" stroke="#8b949e" stroke-width="2"/>`);
        addText(cell.toUpperCase(), rx + cellWidth / 2, ry + 44, "group", cellWidth - 20);
      });
    });
  });
  y += 212 + sundayDates.length * 66 + 112;
  table("Saída com todos os grupos", assignments.filter((a) => a.arrangement === "todos_grupos"), "#1d4f87");

  parts.push("</svg>");
  return parts.join("");
}

function fieldTableRow(
  assignment: FieldMinistryAssignment,
  memberName: (id: string | null) => string,
  index: number,
) {
  return `
    <tr class="${index % 2 === 0 ? "alt" : ""}">
      <td>${escapeHtml(formatShortNumericDate(assignment.activity_date))}</td>
      <td>${escapeHtml(displayTime(assignment.start_time))}</td>
      <td>${escapeHtml(fieldConductorPrintName(assignment, memberName).toUpperCase())}</td>
      <td>${escapeHtml((assignment.location ?? "").toUpperCase())}</td>
    </tr>
  `;
}

function fieldConductorPrintName(
  assignment: FieldMinistryAssignment | undefined,
  memberName: (id: string | null) => string,
) {
  if (!assignment) return "";
  return assignment.guest_conductor_name || memberName(assignment.conductor_member_id);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatShortDate(value: string) {
  return monthFormatter.format(new Date(`${value}T12:00:00`)).replace(".", "");
}

function formatLongDate(value: string) {
  return longDateFormatter.format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// --- Reuniao Publica: heranca de configuracao mensal e deteccao de excecao ---
const PUBLIC_MEETING_WEEKDAY_OFFSET = { sabado: 5, domingo: 6 } as const;

function monthDefaultFor(
  defaults: PublicMeetingMonthDefault[] | undefined,
  monthKey: string,
): PublicMeetingMonthDefault | null {
  if (!defaults) return null;
  return defaults.find((item) => item.month_key === monthKey) ?? null;
}

function outgoingOptionsForMonth<T extends { date: string; day: "sabado" | "domingo" }>(
  options: T[], month: string, day: "sabado" | "domingo",
): T[] {
  return options.filter((option) => option.day === day && option.date.slice(0, 7) === month)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function defaultDateForWeek(weekStart: string, weekday: "sabado" | "domingo") {
  return addDays(weekStart, PUBLIC_MEETING_WEEKDAY_OFFSET[weekday]);
}

type ResolvedOutgoing = {
  date: string;
  destinationCongregation: string;
  destinationAddress: string;
  time: string;
  weekday: "sabado" | "domingo";
  isException: boolean;
  exceptionFields: string[];
};

function resolveOutgoing(
  meeting: PublicMeeting,
  monthDefault: PublicMeetingMonthDefault | null,
  weekStart: string | null,
): ResolvedOutgoing {
  if (meeting.no_public_meeting_event) return {
    date: meeting.meeting_date, destinationCongregation: "", destinationAddress: "", time: "",
    weekday: new Date(`${meeting.meeting_date}T12:00:00`).getDay() === 0 ? "domingo" : "sabado",
    isException: false, exceptionFields: [],
  };
  const fields: string[] = [];
  const defCong = monthDefault?.destination_congregation ?? "";
  const defAddr = monthDefault?.destination_address ?? "";
  const defTime = monthDefault?.default_time ?? "";
  const defWeekday: "sabado" | "domingo" = monthDefault?.default_weekday ?? "sabado";
  const ovCong = meeting.outgoing_congregation ?? "";
  const ovAddr = meeting.outgoing_address ?? "";
  const ovTime = meeting.outgoing_time ?? "";
  if (ovCong) fields.push("congregacao");
  if (ovAddr) fields.push("endereco");
  if (ovTime) fields.push("horario");
  const effectiveDate = meeting.outgoing_date ||
    (monthDefault && weekStart ? defaultDateForWeek(weekStart, defWeekday) : meeting.meeting_date);
  const effectiveWeekday: "sabado" | "domingo" =
    new Date(`${effectiveDate}T12:00:00`).getDay() === 0 ? "domingo" : "sabado";
  if (meeting.outgoing_date) fields.push("data");
  return {
    date: effectiveDate,
    destinationCongregation: ovCong || defCong,
    destinationAddress: ovAddr || defAddr,
    time: ovTime || defTime,
    weekday: effectiveWeekday,
    isException: fields.length > 0,
    exceptionFields: fields,
  };
}

function outgoingOverridesForDraft(
  meeting: PublicMeeting,
  draft: PublicMeetingDraft,
  monthDefault: PublicMeetingMonthDefault | null,
  weekStart: string | null,
) {
  const resolved = resolveOutgoing(meeting, monthDefault, weekStart);
  // Salvar outros campos não transforma valores apenas exibidos por herança em overrides.
  return {
    outgoing_date: draft.outgoing_date === resolved.date ? meeting.outgoing_date ?? null : draft.outgoing_date || null,
    outgoing_time: draft.outgoing_time === resolved.time ? meeting.outgoing_time ?? null : draft.outgoing_time || null,
    outgoing_congregation: draft.outgoing_congregation === resolved.destinationCongregation ? meeting.outgoing_congregation ?? null : draft.outgoing_congregation || null,
    outgoing_address: draft.outgoing_address === resolved.destinationAddress ? meeting.outgoing_address ?? null : draft.outgoing_address || null,
  };
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function fieldDayForDate(value: string): FieldDay {
  const day = new Date(`${value}T12:00:00`).getDay();
  return fieldCalendarWeekdays[day];
}

function buildFieldCalendarDays(monthKey: string) {
  const firstDate = `${monthKey}-01`;
  const firstWeekday = fieldCalendarWeekdays.indexOf(fieldDayForDate(firstDate));
  const calendarStart = addDays(firstDate, -firstWeekday);
  return Array.from({ length: 42 }, (_, index) => {
    const date = addDays(calendarStart, index);
    return {
      date,
      dayNumber: String(Number(date.slice(8, 10))),
      inMonth: date.startsWith(monthKey),
      weekday: fieldDayForDate(date),
    };
  });
}

function fixedFieldSlotsForDate(value: string) {
  if (isSaoPauloHoliday(value)) return [];
  return fixedFieldWeeklySlots[fieldDayForDate(value)] ?? [];
}

function sameMonth(left: string, right: string) {
  return left.slice(0, 7) === right.slice(0, 7);
}

function monthOptionsFromDates(values: string[]) {
  return [...new Set(values.map((value) => value.slice(0, 7)).filter(Boolean))].sort();
}

function chooseMonthKey(selected: string, options: string[], preferred: string) {
  if (selected && options.includes(selected)) return selected;
  if (options.includes(preferred)) return preferred;
  return options.find((option) => option >= preferred) ?? options[0] ?? preferred;
}

function isEditableFieldMinistryAssignment(assignment: FieldMinistryAssignment) {
  return (
    assignment.weekday === "sex" ||
    assignment.weekday === "sab" ||
    assignment.weekday === "dom" ||
    isSaoPauloHoliday(assignment.activity_date)
  );
}

function isFieldMinistryAllowedAssignment(assignment: FieldMinistryAssignment) {
  return assignment.activity_date <= FIELD_MINISTRY_MAX_DATE;
}

function isSaoPauloHoliday(value: string) {
  const fixed = new Set([
    "2026-01-01",
    "2026-01-25",
    "2026-02-16",
    "2026-02-17",
    "2026-04-03",
    "2026-04-21",
    "2026-05-01",
    "2026-06-04",
    "2026-07-09",
    "2026-09-07",
    "2026-10-12",
    "2026-11-02",
    "2026-11-15",
    "2026-11-20",
    "2026-12-25",
  ]);
  return fixed.has(value);
}

function publicThemeAgeClass(lastDate: string | null, referenceDate: string) {
  if (!lastDate) return "fresh";
  const anniversary = (months: number) => {
    const [year, month, day] = lastDate.split("-").map(Number);
    const end = new Date(Date.UTC(year, month - 1 + months + 1, 0));
    return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), Math.min(day, end.getUTCDate()))).toISOString().slice(0, 10);
  };
  if (referenceDate <= anniversary(6)) return "recent";
  if (referenceDate <= anniversary(12)) return "warm";
  return "old";
}

function publicThemeAgeLabel(lastDate: string | null, referenceDate: string) {
  return { fresh: "Nunca proferido aqui", recent: "Proferido há 6 meses ou menos", warm: "Proferido há mais de 6 meses e até 1 ano", old: "Proferido há mais de 1 ano" }[publicThemeAgeClass(lastDate, referenceDate)];
}

function eventsForPublicMeeting(meeting: PublicMeeting, events: SpecialEvent[], weeks: Week[]) {
  const weekStart = weeks.find((week) => week.id === meeting.week_id)?.week_start;
  return events.filter((event) => event.start_date <= (weekStart ? addDays(weekStart, 6) : meeting.meeting_date) && event.end_date >= (weekStart ?? meeting.meeting_date));
}

function findRecentPublicTalkUse(
  themeId: string,
  currentMeeting: Pick<PublicMeeting, "id" | "meeting_date">,
  meetings: PublicMeeting[],
  history: PublicTalkHistory[] = [],
) {
  const currentTime = Date.parse(`${currentMeeting.meeting_date}T12:00:00`);
  if (!Number.isFinite(currentTime)) return null;
  // Candidatos: reuniões do app (com orador) + histórico importado (sem orador).
  const fromMeetings = meetings
    .filter((meeting) => meeting.id !== currentMeeting.id && !meeting.special_talk_title && meeting.public_talk_theme_id === themeId)
    .map((meeting) => ({
      date: meeting.meeting_date,
      speaker: meeting.public_talk_speaker ?? "",
    }));
  const fromHistory = history
    .filter((entry) => entry.public_talk_theme_id === themeId)
    .map((entry) => ({ date: entry.talk_date, speaker: "" }));
  const candidate = [...fromMeetings, ...fromHistory]
    .map((item) => ({ ...item, age: currentTime - Date.parse(`${item.date}T12:00:00`) }))
    .filter(({ age }) => age >= 0)
    .sort((a, b) => a.age - b.age)[0];
  if (!candidate) return null;
  // Reuniões de fim de semana entre a data anterior e a atual (cada 7 dias = 1 reunião).
  const meetingsAgo = Math.max(1, Math.round(candidate.age / (7 * 24 * 60 * 60 * 1000)));
  return { meeting_date: candidate.date, public_talk_speaker: candidate.speaker, meetingsAgo };
}

function formatPublicSheetDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleDateString("pt-BR", { month: "long" }).toUpperCase();
  return `${day} DE ${month}`;
}

function formatNumericDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatShortNumericDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function monthTitle(monthKey: string) {
  const date = new Date(`${monthKey}-02T12:00:00`);
  if (Number.isNaN(date.getTime())) return monthKey.toUpperCase();
  const month = date.toLocaleDateString("pt-BR", { month: "long" }).toUpperCase();
  return `${month} ${date.getFullYear()}`;
}

function shortName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return value;
  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
}

function displayTime(value: string) {
  if (!value) return "";
  return value.replace(/^0/, "");
}

function chunkItems<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function formatWeekRange(weekStart: string) {
  const start = new Date(`${weekStart}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startDay = String(start.getDate()).padStart(2, "0");
  const endDay = String(end.getDate()).padStart(2, "0");
  const startMonth = start.toLocaleDateString("pt-BR", { month: "long" });
  const endMonth = end.toLocaleDateString("pt-BR", { month: "long" });

  if (startMonth === endMonth) {
    return `${startDay} A ${endDay} DE ${endMonth.toUpperCase()}`;
  }

  return `${startDay} DE ${startMonth.toUpperCase()} A ${endDay} DE ${endMonth.toUpperCase()}`;
}

function formatSong(value: string) {
  return formatSongDisplay(value);
}

const S89_WIDTH = 1800;
const S89_HEIGHT = 1160;
const S89_OBSERVATION =
  "Observação para o estudante: A lição e a fonte de matéria para a sua designação estão na Apostila da Reunião Vida e Ministério. Veja as instruções para a parte que estão nas Instruções para a Reunião Nossa Vida e Ministério Cristão (S-38).";

function buildS89Data(
  student: Member,
  assistant: Member | null,
  week: Week,
  assignment: Assignment,
  partNumber: number,
): S89Data {
  const duration = assignment.duration_min ? ` (${assignment.duration_min} min)` : "";
  return {
    studentName: student.name,
    assistantName: assistant?.name ?? "",
    meetingDate: formatLongDate(week.meeting_date),
    partNumber,
    partTitle: `${assignment.title}${duration}`,
    location: "Salão Principal",
  };
}

function createS89Svg(data: S89Data) {
  const titleLines = wrapS89Text(data.partTitle, 58).slice(0, 3);
  const observationLines = wrapS89Text(S89_OBSERVATION, 116);
  const fieldText = (value: string) => escapeSvg(value.toUpperCase());
  const titleMarkup = titleLines
    .map(
      (line, index) =>
        `<text x="420" y="${530 + index * 42}" class="s89-value">${escapeSvg(line)}</text>`,
    )
    .join("");
  const observationMarkup = observationLines
    .map(
      (line, index) =>
        `<text x="150" y="${850 + index * 32}" class="s89-observation">${escapeSvg(line)}</text>`,
    )
    .join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${S89_WIDTH}" height="${S89_HEIGHT}" viewBox="0 0 ${S89_WIDTH} ${S89_HEIGHT}">
  <style>
    .s89-title { font: 800 48px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
    .s89-subtitle { font: 900 53px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
    .s89-label { font: 700 32px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
    .s89-value { font: 900 36px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
    .s89-location { font: 800 34px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
    .s89-footer { font: 700 26px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
    .s89-observation { font: 400 27px Arial, Helvetica, sans-serif; fill: #111827; letter-spacing: 0; }
  </style>
  <rect width="${S89_WIDTH}" height="${S89_HEIGHT}" fill="#ffffff"/>
  <rect x="62" y="62" width="1676" height="1036" fill="#ffffff" stroke="#111827" stroke-width="5"/>
  <rect x="62" y="62" width="1676" height="166" fill="#f3f4f6" stroke="#111827" stroke-width="5"/>
  <text x="900" y="130" text-anchor="middle" class="s89-title">DESIGNAÇÃO PARA A REUNIÃO</text>
  <text x="900" y="194" text-anchor="middle" class="s89-subtitle">NOSSA VIDA E MINISTÉRIO CRISTÃO</text>

  <text x="150" y="323" class="s89-label">Nome:</text>
  <line x1="286" y1="332" x2="1650" y2="332" stroke="#111827" stroke-width="4"/>
  <text x="310" y="311" class="s89-value"${fitSvgText(data.studentName, 38, 1300)}>${fieldText(data.studentName)}</text>

  <text x="150" y="445" class="s89-label">Ajudante:</text>
  <line x1="345" y1="454" x2="1015" y2="454" stroke="#111827" stroke-width="4"/>
  <text x="370" y="433" class="s89-value"${fitSvgText(data.assistantName, 20, 620)}>${fieldText(data.assistantName)}</text>

  <text x="1072" y="445" class="s89-label">Data:</text>
  <line x1="1192" y1="454" x2="1650" y2="454" stroke="#111827" stroke-width="4"/>
  <text x="1215" y="433" class="s89-value"${fitSvgText(data.meetingDate, 22, 420)}>${escapeSvg(data.meetingDate)}</text>

  <text x="150" y="553" class="s89-label">Parte nº:</text>
  <line x1="320" y1="562" x2="385" y2="562" stroke="#111827" stroke-width="4"/>
  <text x="344" y="544" text-anchor="middle" class="s89-value">${data.partNumber}</text>
  ${titleMarkup}

  <text x="150" y="681" class="s89-label">A ser feito no(a):</text>
  <rect x="493" y="647" width="38" height="38" fill="#ffffff" stroke="#111827" stroke-width="4"/>
  <path d="M 502 667 L 512 677 L 527 653" fill="none" stroke="#111827" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="552" y="681" class="s89-location">${escapeSvg(data.location)}</text>
  <rect x="915" y="647" width="38" height="38" fill="#ffffff" stroke="#111827" stroke-width="4"/>
  <text x="974" y="681" class="s89-location">Sala B</text>
  <rect x="1165" y="647" width="38" height="38" fill="#ffffff" stroke="#111827" stroke-width="4"/>
  <text x="1224" y="681" class="s89-location">Sala C</text>

  <line x1="62" y1="753" x2="1738" y2="753" stroke="#111827" stroke-width="5"/>
  ${observationMarkup}
  <text x="150" y="1040" class="s89-footer">S-89-T</text>
  <text x="1650" y="1040" text-anchor="end" class="s89-footer">11/23</text>
</svg>`.trim();
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function createS89Canvas(data: S89Data) {
  const image = await loadImage(svgToDataUrl(createS89Svg(data)));
  const canvas = document.createElement("canvas");
  canvas.width = S89_WIDTH;
  canvas.height = S89_HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem da S-89.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, S89_WIDTH, S89_HEIGHT);
  context.drawImage(image, 0, 0, S89_WIDTH, S89_HEIGHT);
  return canvas;
}

async function createS89PngBlob(data: S89Data) {
  const canvas = await createS89Canvas(data);
  return canvasToBlob(canvas, "image/png", undefined, "Não foi possível gerar o PNG da S-89.");
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number | undefined, errorMessage: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error(errorMessage));
      },
      mimeType,
      quality,
    );
  });
}

function loadImage(src: string, errorMessage = "Não foi possível carregar a prévia da S-89.") {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(errorMessage));
    image.src = src;
  });
}

function createPdfFromJpeg(canvas: HTMLCanvasElement) {
  const jpegBytes = dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.96));
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 24;
  const scale = Math.min((pageWidth - margin * 2) / canvas.width, (pageHeight - margin * 2) / canvas.height);
  const drawWidth = canvas.width * scale;
  const drawHeight = canvas.height * scale;
  const x = (pageWidth - drawWidth) / 2;
  const y = (pageHeight - drawHeight) / 2;
  const content = `q\n${drawWidth.toFixed(2)} 0 0 ${drawHeight.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm\n/Im0 Do\nQ\n`;
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets = [0];
  let position = 0;

  function pushText(text: string) {
    const bytes = encoder.encode(text);
    chunks.push(bytes);
    position += bytes.length;
  }

  function pushBytes(bytes: Uint8Array) {
    chunks.push(bytes);
    position += bytes.length;
  }

  function beginObject(id: number) {
    offsets[id] = position;
    pushText(`${id} 0 obj\n`);
  }

  pushText("%PDF-1.4\n");
  beginObject(1);
  pushText("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  beginObject(2);
  pushText("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
  beginObject(3);
  pushText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);
  beginObject(4);
  pushText(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
  pushBytes(jpegBytes);
  pushText("\nendstream\nendobj\n");
  beginObject(5);
  pushText(`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  const xrefPosition = position;
  pushText("xref\n0 6\n0000000000 65535 f \n");
  for (let id = 1; id <= 5; id += 1) {
    pushText(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`);

  return new Blob(chunks.map(chunk => new Uint8Array(chunk).buffer), { type: "application/pdf" });
}

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function s89FileName(data: S89Data, extension: "png" | "pdf") {
  const base = slugFileName(`s-89 ${data.studentName} parte ${data.partNumber}`);
  return `${base}.${extension}`;
}

function fieldMinistryFileName(monthKey: string, extension: "png" | "jpg") {
  return `${slugFileName(`campo ${monthTitle(monthKey)}`)}.${extension}`;
}

function publicMeetingFileName(monthKey: string, extension: "png" | "jpg", page = 0) {
  const suffix = page ? ` pagina ${page}` : "";
  return `${slugFileName(`reuniao publica ${monthTitle(monthKey)}${suffix}`)}.${extension}`;
}

function outgoingSpeakerFileName(meeting: PublicMeeting, extension: "png" | "jpg") {
  return `${slugFileName(`discurso fora ${meeting.outgoing_speaker || "orador"} ${meeting.outgoing_date || meeting.meeting_date}`)}.${extension}`;
}

function mechanicalFileName(monthKey: string, extension: "png" | "jpg") {
  return `${slugFileName(`av indicadores palco ${monthTitle(monthKey)}`)}.${extension}`;
}

function slugFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizePhoneForWhatsApp(value: string | null) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12 && digits.length <= 15) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  if (digits.length >= 10 && digits.length <= 15) return digits;
  return "";
}

function supportsS89FileShare() {
  if (!navigator.share || typeof File === "undefined") return false;
  if (!("canShare" in navigator)) return true;
  const testFile = new File([""], "s-89.png", { type: "image/png" });
  return navigator.canShare({ files: [testFile] });
}

async function shareS89Image(data: S89Data): Promise<{ status: "shared" | "unsupported" | "cancelled" }> {
  if (!navigator.share || typeof File === "undefined") return { status: "unsupported" };

  const blob = await createS89PngBlob(data);
  const file = new File([blob], s89FileName(data, "png"), { type: "image/png" });
  const shareData = {
    title: "Folha S-89",
    text: buildWhatsAppMessage(data),
    files: [file],
  };

  if ("canShare" in navigator && !navigator.canShare(shareData)) {
    return { status: "unsupported" };
  }

  try {
    await navigator.share(shareData);
    return { status: "shared" };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return { status: "cancelled" };
    }
    throw error;
  }
}

function buildWhatsAppMessage(data: S89Data) {
  const firstName = data.studentName.trim().split(/\s+/)[0] || data.studentName;
  const assistantLine = data.assistantName ? `\nAjudante: ${data.assistantName}` : "";
  return `Olá, ${firstName}! Tudo bem?\n\nSegue sua designação S-89:\nData: ${data.meetingDate}\nParte nº: ${data.partNumber}\nParte: ${data.partTitle}${assistantLine}\nLocal: ${data.location}\n\nVou anexar a imagem da folha aqui na conversa.`;
}

function wrapS89Text(value: string, maxChars: number) {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines;
}

function fitSvgText(value: string, maxChars: number, length: number) {
  return value.length > maxChars ? ` textLength="${length}" lengthAdjust="spacingAndGlyphs"` : "";
}

function escapeSvg(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
