/* ============================================================================
   ELIGIBILITY — can this candidate actually apply for this exam?

   "Which exams can I sit" is the question the whole app should answer first,
   and until now it answered a smaller one: do your MARKS clear the bar
   (marksVerdict). Marks are only one of the gates. Age, education, category
   relaxations and domicile decide the rest, and they differ per exam.

   The rule here is the same as marksVerdict's: an honest "check the
   notification" beats a confident wrong answer. Verdicts are one of:

     "yes"   every rule the app holds is satisfied
     "no"    a rule the app holds is failed — stated with its reason
     "check" the app does not hold the rule that decides it, or the
             candidate has not entered the fact it needs

   Every rule carries a `basis` saying where it came from. A rule without a
   source is not written down at all — see the house style in exams.js.

   Profile comes from localStorage (qualification, marks, category — already
   collected in the menu — plus DOB and state, added beside them). Nothing
   leaves the device.
   ========================================================================== */

/* Age on a date, in whole years. The reference date is per-exam (cutoffs
   differ), never "today" — a cutoff is the only date that matters. */
function ageOn(dobIso, onIso) {
  if (!dobIso || !onIso) return null;
  const dob = new Date(dobIso + "T00:00:00");
  const on = new Date(onIso + "T00:00:00");
  if (isNaN(dob) || isNaN(on)) return null;
  let a = on.getFullYear() - dob.getFullYear();
  const before = (on.getMonth() < dob.getMonth()) ||
                 (on.getMonth() === dob.getMonth() && on.getDate() < dob.getDate());
  if (before) a--;
  return a;
}

function candidateProfile() {
  const ls = (k) => { try { return localStorage.getItem(k) || null; } catch (e) { return null; } };
  const pct = parseFloat(ls("jobhunt_marks_pct"));
  return {
    qualification: ls("jobhunt_qualification"),
    category: ls("jobhunt_category"),
    marksPct: isNaN(pct) ? null : pct,
    dob: ls("jobhunt_dob"),
    state: ls("jobhunt_state"),
  };
}

/* One rule check. rule shapes, all optional:
     age: { min, max, asOf, relax: { SC: 5, ... }, basis }
     education: { anyOf: ["bachelor", ...], basis }   — matches qualification keys
     domicile: { state: "Telangana", basis }
   Marks are checked separately through marksVerdict, which already exists. */
function examEligibility(exam, profile) {
  const reasons = [];
  let hard = null;   // a failed rule
  let checks = 0;    // rules we cannot decide
  const rules = (exam && exam.eligibility) || {};

  if (rules.age) {
    const r = rules.age;
    const age = ageOn(profile.dob, r.asOf || exam.examDateStart);
    if (age == null) {
      checks++;
      reasons.push("add your date of birth in the menu — the age limit is " +
        r.min + "–" + r.max + (r.relax && profile.category && r.relax[profile.category] ?
        " (+" + r.relax[profile.category] + " for " + profile.category + ")" : "") + " as of " + r.asOf);
    } else {
      const relax = (r.relax && profile.category && r.relax[profile.category]) || 0;
      const max = r.max + relax;
      if (age < r.min || age > max) {
        hard = "age " + age + " is outside " + r.min + "–" + max +
               (relax ? " (includes your " + profile.category + " relaxation)" : "") +
               " as of " + r.asOf;
      }
      if (r.basis) reasons.push("age limit: " + r.basis);
    }
  }

  if (rules.education) {
    const r = rules.education;
    if (!profile.qualification) {
      checks++;
      reasons.push("pick your qualification in the menu — this exam needs " + r.label);
    } else if (r.anyOf && r.anyOf.indexOf(profile.qualification) === -1) {
      hard = "requires " + r.label;
    }
    if (r.basis) reasons.push("education: " + r.basis);
  }

  if (rules.domicile) {
    const r = rules.domicile;
    if (!profile.state) {
      checks++;
      reasons.push("add your home state in the menu — this exam is for " + r.state + " candidates");
    } else if (profile.state.toLowerCase() !== r.state.toLowerCase()) {
      hard = "requires " + r.state + " domicile";
    }
    if (r.basis) reasons.push("domicile: " + r.basis);
  }

  const mv = marksVerdict(exam, profile.marksPct, profile.category);
  if (mv.known && !mv.clears) {
    hard = "aggregate " + mv.pct + "% is below the " + mv.need + "% bar for " + profile.category;
  } else if (!mv.known && exam.minMarks) {
    checks++;
    reasons.push(mv.why);
  }

  if (hard) return { status: "no", reason: hard, reasons: reasons };
  if (checks > 0) return { status: "check", reason: reasons[0] || "verify against the notification", reasons: reasons };
  if (!rules.age && !rules.education && !rules.domicile && !exam.minMarks)
    return { status: "check", reason: "no eligibility rules held for this exam — check the notification", reasons: reasons };
  return { status: "yes", reason: "you meet every requirement the app holds", reasons: reasons };
}
