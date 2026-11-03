export type MemberGender = "masculino" | "feminino" | null;

export function sameGenderPair(
  principal: { id: string; gender?: MemberGender } | undefined,
  assistant: { id: string; gender?: MemberGender } | undefined,
) {
  return Boolean(principal && assistant && principal.id !== assistant.id && principal.gender && principal.gender === assistant.gender);
}

export function midweekParticipationHistory<T extends {
  id: string; week_id: string; assignee_member_id: string | null; assistant_member_id: string | null;
}>(assignments: T[], weeks: Array<{ id: string; meeting_date: string }>, memberId: string, date: string, excludeId = "") {
  const dates = new Map(weeks.map((week) => [week.id, week.meeting_date]));
  const history = assignments
    .filter((item) => item.id !== excludeId && (item.assignee_member_id === memberId || item.assistant_member_id === memberId))
    .map((assignment) => ({ assignment, date: dates.get(assignment.week_id) ?? "", assistant: assignment.assignee_member_id !== memberId }))
    .filter((item) => item.date);
  const past = history.filter((item) => item.date < date).sort((a, b) => b.date.localeCompare(a.date));
  const previousDate = weeks.map((week) => week.meeting_date).filter((value) => value < date).sort().at(-1);
  const nextDate = weeks.map((week) => week.meeting_date).filter((value) => value > date).sort()[0];
  const adjacent = history.filter((item) => item.date === previousDate || item.date === nextDate);
  return { past, adjacent };
}
