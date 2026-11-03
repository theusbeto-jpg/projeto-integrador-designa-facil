import { useState } from "react";
import { elderGroup, privilegeGroups, privilegeSlotValue, validatePrivilegeValues, type PrivilegeAssignments, type PrivilegeGroup, type PrivilegeMember } from "./privilegeDefinitions";

export default function PrivilegesSection({ members, assignments, busy, onSave }: {
  members: PrivilegeMember[];
  assignments: PrivilegeAssignments;
  busy: boolean;
  onSave: (groupKey: string, values: Record<string, string>, updatedAt: string) => Promise<boolean>;
}) {
  const [drafts, setDrafts] = useState<PrivilegeAssignments>({});
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"privilegios" | "anciaos">("privilegios");
  const activeMembers = members.filter((member) => member.active).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  async function save(group: PrivilegeGroup) {
    setError("");
    const draft = drafts[group.key];
    if (!draft) return;
    try {
      const values = validatePrivilegeValues(group, draft.values, members, assignments);
      if (await onSave(group.key, values, draft.updatedAt)) {
        setDrafts((current) => {
          const next = { ...current };
          delete next[group.key];
          return next;
        });
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível salvar.");
    }
  }

  function renderGroup(group: PrivilegeGroup) {
    const saved = assignments[group.key] ?? { values: {}, updatedAt: "" };
    const draft = drafts[group.key];
    const values = draft?.values ?? saved.values;
    return <article className="panel privilege-card" key={group.key}>
      <div className="panel-head"><h3>{group.label}</h3>{draft ? <span className="muted">Alterações não salvas</span> : null}</div>
      <div className="privilege-fields">
        {group.slots.map((slot) => {
          const id = slot.source ? privilegeSlotValue(group.key, slot, assignments) : values[slot.key] ?? "";
          const member = members.find((candidate) => candidate.id === id);
          const otherIds = group.eldersOnly ? [] : group.slots.filter((other) => other.key !== slot.key).map((other) => other.source ? privilegeSlotValue(group.key, other, assignments) : values[other.key]);
          const options = activeMembers.filter((candidate) => (!slot.status || candidate.congregation_status === slot.status) && (!otherIds.includes(candidate.id) || candidate.id === id));
          const unavailable = id && !options.some((candidate) => candidate.id === id);
          return <label key={slot.key} className="privilege-field">
            <span>{slot.label}</span>
            {slot.source ? <>
              <div className="privilege-linked">{member?.name ?? (id ? "Participante indisponível" : "Sem designado")}</div>
              <small>Vem das designações de anciãos.{!member?.active && id ? " Revise esta designação." : ""}</small>
              <button className="text-button" type="button" onClick={() => setTab("anciaos")}>Ir para designações de anciãos</button>
            </> : <>
              <select disabled={busy} value={id} onChange={(event) => {
                const memberId = event.target.value;
                setError("");
                setDrafts((current) => {
                  const previous = current[group.key] ?? saved;
                  const initial = Object.fromEntries(group.slots.filter((entry) => !entry.source).map((entry) => [entry.key, previous.values[entry.key] ?? ""]));
                  return { ...current, [group.key]: { ...previous, values: { ...initial, [slot.key]: memberId } } };
                });
              }}>
                <option value="">Sem designado</option>
                {unavailable ? <option value={id}>{member?.name ?? "Participante removido"} — revisar designação</option> : null}
                {options.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.name}</option>)}
              </select>
              {slot.status ? <small>{slot.status === "anciao" ? "Somente anciãos" : "Somente servos ministeriais"}</small> : null}
            </>}
          </label>;
        })}
      </div>
      <div className="privilege-actions">
        <button className="primary-button" disabled={busy || !draft} type="button" onClick={() => save(group)}>Salvar {group.eldersOnly ? "designações de anciãos" : group.label}</button>
        {draft ? <button className="secondary-button" disabled={busy} type="button" onClick={() => { setError(""); setDrafts((current) => { const next = { ...current }; delete next[group.key]; return next; }); }}>Descartar alterações</button> : null}
      </div>
    </article>;
  }

  return <section className="privileges-section" aria-label="Definições de privilégios">
    <div className="panel privilege-intro">
      <h2>Privilégios</h2>
      <p>Defina os responsáveis e ajudantes de cada área. Estas designações ficam salvas para a congregação.</p>
      <p className="muted">Conferência Pública, Vida e Ministério e Áudio e Vídeo usam automaticamente o superintendente definido em Designações de anciãos.</p>
      <div className="privilege-tabs" role="group" aria-label="Blocos de privilégios">
        <button type="button" className={tab === "privilegios" ? "primary-button" : "secondary-button"} aria-pressed={tab === "privilegios"} onClick={() => setTab("privilegios")}>Privilégios</button>
        <button type="button" className={tab === "anciaos" ? "primary-button" : "secondary-button"} aria-pressed={tab === "anciaos"} onClick={() => setTab("anciaos")}>Designações de anciãos</button>
      </div>
      {tab === "anciaos" ? <p className="muted">Somente anciãos ativos. Um ancião pode exercer mais de uma função.</p> : null}
      {Object.keys(drafts).length ? <p className="muted">Há alterações não salvas. Salve cada área antes de sair desta seção.</p> : null}
      {error ? <p role="alert" className="privilege-error">{error}</p> : null}
    </div>
    <div className={`privilege-grid ${tab === "anciaos" ? "elder-privileges" : ""}`}>
      {(tab === "anciaos" ? [elderGroup] : privilegeGroups).map(renderGroup)}
    </div>
  </section>;
}
