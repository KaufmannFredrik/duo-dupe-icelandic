// Section checks (docs/PLAN.md: "A checkpoint ends each section ... scored per goal"): the A1 check
// draws tasks for each goal of its section from the words of the units that train it
// (content/goals.json), and scores the answers per goal. A learner who misses a goal is shown the
// units that train it. Pure functions, shared by the lesson page and the tests.

/** Share of tasks to get right overall, and per goal at least half. */
export const PASS_SHARE = 0.75;

/**
 * The goals a section's check tests: each goal of the section that units of the course train, with
 * the units (in the section, before the check) and their words.
 * @returns {{ id: string, goal: object, units: object[], words: string[] }[]}
 */
export function checkGoals(course, goals, sectionId) {
  const section = course.sections.find((s) => s.id === sectionId);
  const inSection = new Map((section?.units ?? []).filter((u) => !u.check).map((u) => [u.id, u]));
  return goals
    .filter((g) => g.section === sectionId)
    .map((g) => {
      const units = g.units.map((id) => inSection.get(id)).filter(Boolean);
      return { id: g.id, goal: g, units, words: [...new Set(units.flatMap((u) => u.lemmas))] };
    })
    .filter((g) => g.words.length);
}

/**
 * Scores a check: per goal, the tasks answered right (correct or almost) of those asked.
 * @param {{ goal: string }[]} specs the check's tasks, each with its goal
 * @param {('correct'|'almost'|'wrong')[]} results one per task
 * @returns {{ goals: { id: string, right: number, total: number, passed: boolean }[], right: number, total: number, passed: boolean }}
 */
export function checkScore(specs, results) {
  const by = new Map();
  specs.forEach((s, i) => {
    const g = by.get(s.goal) ?? { id: s.goal, right: 0, total: 0 };
    g.total++;
    if (results[i] && results[i] !== 'wrong') g.right++;
    by.set(s.goal, g);
  });
  const goals = [...by.values()].map((g) => ({ ...g, passed: g.right * 2 >= g.total }));
  const right = goals.reduce((n, g) => n + g.right, 0);
  const total = goals.reduce((n, g) => n + g.total, 0);
  return { goals, right, total, passed: total > 0 && right >= PASS_SHARE * total && goals.every((g) => g.passed) };
}
