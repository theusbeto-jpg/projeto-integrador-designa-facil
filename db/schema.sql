-- Estrutura da demonstração. Não contém dados.
CREATE TABLE account_audits (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, period_label TEXT NOT NULL, months_label TEXT NOT NULL, due_date TEXT NOT NULL, auditor_member_id TEXT, completed_date TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE app_sessions (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, token_hash TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL);

CREATE TABLE assignments (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, section TEXT NOT NULL, section_tone TEXT NOT NULL, sequence INTEGER NOT NULL, title TEXT NOT NULL, duration_min INTEGER, role_key TEXT NOT NULL, assignee_member_id TEXT, assistant_member_id TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE congregation_privileges (congregation_id TEXT NOT NULL, group_key TEXT NOT NULL, assignments TEXT NOT NULL DEFAULT '{}', updated_at TEXT NOT NULL, PRIMARY KEY (congregation_id, group_key));

CREATE TABLE congregations (id TEXT PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, meeting_title TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE field_ministry_assignments (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, activity_date TEXT NOT NULL, weekday TEXT NOT NULL, start_time TEXT NOT NULL DEFAULT '09:00', arrangement TEXT NOT NULL, field_service_group_id TEXT, conductor_member_id TEXT, guest_conductor_name TEXT, location TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE field_service_groups (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, name TEXT NOT NULL, overseer_member_id TEXT, assistant_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE invitations (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT, email TEXT NOT NULL, whatsapp_phone TEXT, role TEXT NOT NULL DEFAULT 'publicador', status TEXT NOT NULL DEFAULT 'pendente', access_code_hash TEXT, access_code_hint TEXT, access_code_created_at TEXT, password_hash TEXT, password_created_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE jw_sync_logs (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, checked_at TEXT NOT NULL, source_url TEXT NOT NULL, publications TEXT NOT NULL DEFAULT '[]', imported_weeks INTEGER NOT NULL DEFAULT 0, updated_weeks INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL);

CREATE TABLE maintenance_tasks (id TEXT PRIMARY KEY, completed_at TEXT NOT NULL);

CREATE TABLE mechanical_assignments (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, assignment_date TEXT NOT NULL, meeting_kind TEXT NOT NULL, audio_member_id TEXT, video_member_id TEXT, external_attendant_member_id TEXT, internal_attendant_member_id TEXT, roaming_microphone_member_id TEXT, attendance_total INTEGER, attendance_in_person INTEGER, attendance_zoom INTEGER, attendance_reported_at TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE meeting_attendance (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, field_service_group_id TEXT NOT NULL, member_id TEXT NOT NULL, meeting_date TEXT NOT NULL, status TEXT NOT NULL, notes TEXT, recorded_by_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE meeting_timings (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, assignment_id TEXT, part_key TEXT NOT NULL, part_title TEXT NOT NULL, planned_seconds INTEGER, actual_seconds INTEGER, started_at TEXT, ended_at TEXT, recorded_by_member_id TEXT, reported_at TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE member_visits (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, field_service_group_id TEXT NOT NULL, member_id TEXT NOT NULL, visit_date TEXT NOT NULL, notes TEXT, recorded_by_member_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE members (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT, whatsapp_phone TEXT, congregation_status TEXT NOT NULL DEFAULT 'publicador', pioneer_roles TEXT NOT NULL DEFAULT '[]', field_service_group_id TEXT, field_availability TEXT NOT NULL DEFAULT '[]', role TEXT NOT NULL DEFAULT 'publicador', active INTEGER NOT NULL DEFAULT 1, privileges TEXT NOT NULL DEFAULT '[]', editable_modules TEXT NOT NULL DEFAULT '[]', source TEXT NOT NULL DEFAULT 'manual', created_at TEXT NOT NULL, updated_at TEXT NOT NULL, gender TEXT, participation_status TEXT);

CREATE TABLE public_meeting_month_defaults (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, month_key TEXT NOT NULL, default_weekday TEXT NOT NULL DEFAULT 'sabado', default_time TEXT, destination_congregation TEXT, destination_address TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE public_meetings (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_id TEXT NOT NULL, meeting_date TEXT NOT NULL, chairman_member_id TEXT, watchtower_conductor_member_id TEXT, watchtower_reader_member_id TEXT, watchtower_study_id TEXT, public_talk_theme_id TEXT, public_talk_speaker TEXT, public_talk_speaker_congregation TEXT, outgoing_speaker TEXT, outgoing_talk_theme TEXT, outgoing_date TEXT, outgoing_time TEXT, outgoing_congregation TEXT, outgoing_address TEXT, outgoing_song TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE public_talk_history (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, public_talk_theme_id TEXT NOT NULL, talk_date TEXT NOT NULL, source_label TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE public_talk_themes (id TEXT PRIMARY KEY, number INTEGER NOT NULL, title TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'S-34', active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE speaker_talks (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, theme_id TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE special_events (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, type TEXT NOT NULL, title TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, circuit_overseer_name TEXT, circuit_overseer_wife TEXT, midweek_service_talk_title TEXT, midweek_service_talk_song TEXT, weekend_public_talk_title TEXT, weekend_final_talk_title TEXT, weekend_final_talk_song TEXT, notes TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, special_talk_speaker TEXT);

CREATE TABLE time_away (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, member_id TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, reason TEXT NOT NULL DEFAULT 'Folga', source TEXT NOT NULL DEFAULT 'manual', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE watchtower_studies (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, issue_title TEXT NOT NULL, study_title TEXT NOT NULL, study_week_label TEXT NOT NULL, study_start_date TEXT, study_end_date TEXT, source_url TEXT NOT NULL, sort_key TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE TABLE watchtower_sync_logs (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, checked_at TEXT NOT NULL, source_url TEXT NOT NULL, publications TEXT NOT NULL DEFAULT '[]', imported_studies INTEGER NOT NULL DEFAULT 0, message TEXT NOT NULL);

CREATE TABLE weeks (id TEXT PRIMARY KEY, congregation_id TEXT NOT NULL, week_start TEXT NOT NULL, meeting_date TEXT NOT NULL, bible_reading TEXT NOT NULL, opening_song TEXT NOT NULL, closing_song TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'rascunho', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);

CREATE INDEX idx_account_audits_auditor ON account_audits(congregation_id, auditor_member_id);

CREATE UNIQUE INDEX idx_account_audits_congregation_period ON account_audits(congregation_id, period_label);

CREATE INDEX idx_account_audits_due ON account_audits(congregation_id, due_date);

CREATE INDEX idx_app_sessions_expires ON app_sessions(expires_at);

CREATE INDEX idx_app_sessions_member ON app_sessions(congregation_id, member_id);

CREATE UNIQUE INDEX idx_app_sessions_token ON app_sessions(token_hash);

CREATE INDEX idx_assignments_assignee ON assignments(assignee_member_id);

CREATE INDEX idx_assignments_week ON assignments(week_id);

CREATE INDEX idx_field_ministry_assignments_conductor ON field_ministry_assignments(congregation_id, conductor_member_id);

CREATE INDEX idx_field_ministry_assignments_congregation_date ON field_ministry_assignments(congregation_id, activity_date);

CREATE INDEX idx_field_service_groups_congregation ON field_service_groups(congregation_id);

CREATE INDEX idx_invitations_congregation ON invitations(congregation_id);

CREATE UNIQUE INDEX idx_invitations_email ON invitations(email);

CREATE INDEX idx_invitations_member ON invitations(congregation_id, member_id);

CREATE INDEX idx_jw_sync_logs_congregation ON jw_sync_logs(congregation_id, checked_at);

CREATE INDEX idx_mechanical_assignments_audio ON mechanical_assignments(congregation_id, audio_member_id);

CREATE UNIQUE INDEX idx_mechanical_assignments_congregation_date_kind ON mechanical_assignments(congregation_id, assignment_date, meeting_kind);

CREATE INDEX idx_mechanical_assignments_video ON mechanical_assignments(congregation_id, video_member_id);

CREATE INDEX idx_meeting_attendance_group_date ON meeting_attendance(congregation_id, field_service_group_id, meeting_date);

CREATE UNIQUE INDEX idx_meeting_attendance_group_member_date ON meeting_attendance(congregation_id, field_service_group_id, member_id, meeting_date);

CREATE INDEX idx_meeting_timings_week ON meeting_timings(congregation_id, week_id);

CREATE UNIQUE INDEX idx_meeting_timings_week_part ON meeting_timings(congregation_id, week_id, part_key);

CREATE UNIQUE INDEX idx_member_visits_group_member_date ON member_visits(congregation_id, field_service_group_id, member_id, visit_date);

CREATE INDEX idx_member_visits_member ON member_visits(congregation_id, member_id, visit_date);

CREATE INDEX idx_members_congregation ON members(congregation_id);

CREATE UNIQUE INDEX idx_members_email ON members(email) WHERE email IS NOT NULL;

CREATE UNIQUE INDEX idx_pmmd_congregation_month ON public_meeting_month_defaults(congregation_id, month_key);

CREATE UNIQUE INDEX idx_public_meetings_congregation_week ON public_meetings(congregation_id, week_id);

CREATE INDEX idx_public_meetings_theme ON public_meetings(congregation_id, public_talk_theme_id, meeting_date);

CREATE INDEX idx_public_talk_history_date ON public_talk_history(congregation_id, talk_date);

CREATE UNIQUE INDEX idx_public_talk_history_theme_date ON public_talk_history(congregation_id, public_talk_theme_id, talk_date);

CREATE UNIQUE INDEX idx_public_talk_themes_number ON public_talk_themes(number);

CREATE UNIQUE INDEX idx_speaker_talks_member_theme ON speaker_talks(congregation_id, member_id, theme_id);

CREATE INDEX idx_speaker_talks_theme ON speaker_talks(congregation_id, theme_id);

CREATE INDEX idx_special_events_congregation_dates ON special_events(congregation_id, start_date, end_date);

CREATE INDEX idx_time_away_member_dates ON time_away(member_id, start_date, end_date);

CREATE INDEX idx_watchtower_studies_congregation_dates ON watchtower_studies(congregation_id, study_start_date, study_end_date);

CREATE INDEX idx_watchtower_sync_logs_congregation ON watchtower_sync_logs(congregation_id, checked_at);

CREATE INDEX idx_weeks_congregation ON weeks(congregation_id);

CREATE UNIQUE INDEX idx_weeks_congregation_meeting ON weeks(congregation_id, meeting_date);
