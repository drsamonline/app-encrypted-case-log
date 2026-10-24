/* case-kit — clinical case tracking. Zero dependencies.
 *
 * The shared record behind the case-taking apps (skin cases, hospital records,
 * first-aid logs): a case has sections, dated symptoms, and follow-ups, with a
 * timeline and a summary.
 *
 *   var c = Case.create({ title: "Skin case 12" });
 *   Case.addSymptom(c, { note: "Itching worse at night", severity: 3 });
 *   Case.summary(c);
 *
 * No patient-identifying data is modelled — the app owns that, and should keep
 * it local. MIT License. (c) 2026 Dr Sohil Momin.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.Case = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  var C = { version: "0.2.0" };
  var uid = 0;
  function id() { uid++; return "c" + Date.now().toString(36) + "-" + uid.toString(36); }
  function day(ts) { return new Date(ts == null ? Date.now() : ts).toISOString().slice(0, 10); }

  C.create = function (opts) {
    opts = opts || {};
    return {
      id: opts.id || id(),
      title: opts.title || "Untitled case",
      created: opts.created || Date.now(),
      sections: opts.sections || {},   // history, habits, mapping, ...
      symptoms: opts.symptoms || [],   // {id, note, severity, tags, date}
      followUps: opts.followUps || []  // {id, date, note, remedy, potency, response}
    };
  };

  C.section = function (c, name, value) {
    if (value === undefined) return c.sections[name] || "";
    c.sections[name] = value; return c;
  };

  C.addSymptom = function (c, s) {
    s = s || {};
    var rec = { id: s.id || id(), note: s.note || "", severity: s.severity == null ? 1 : Math.max(1, Math.min(5, s.severity | 0)),
                tags: s.tags || [], date: s.date || Date.now() };
    c.symptoms.push(rec);
    return rec;
  };

  C.addFollowUp = function (c, f) {
    f = f || {};
    var rec = { id: f.id || id(), date: f.date || Date.now(), note: f.note || "",
                remedy: f.remedy || "", potency: f.potency || "", response: f.response || "" };
    c.followUps.push(rec);
    return rec;
  };

  C.timeline = function (c) {
    var ev = [];
    c.symptoms.forEach(function (s) { ev.push({ kind: "symptom", date: s.date, text: s.note, severity: s.severity, tags: s.tags }); });
    c.followUps.forEach(function (f) { ev.push({ kind: "follow-up", date: f.date, text: f.note, remedy: f.remedy, potency: f.potency, response: f.response }); });
    ev.sort(function (a, b) { return a.date - b.date; });
    return ev;
  };

  C.summary = function (c) {
    var sev = c.symptoms.map(function (s) { return s.severity; });
    var tl = C.timeline(c);
    return {
      title: c.title,
      created: day(c.created),
      symptoms: c.symptoms.length,
      maxSeverity: sev.length ? Math.max.apply(null, sev) : 0,
      avgSeverity: sev.length ? Math.round((sev.reduce(function (a, b) { return a + b; }, 0) / sev.length) * 10) / 10 : 0,
      followUps: c.followUps.length,
      sections: Object.keys(c.sections).filter(function (k) { return c.sections[k]; }),
      lastEvent: tl.length ? day(tl[tl.length - 1].date) : null
    };
  };

  C.toJSON = function (c) { return JSON.stringify(c, null, 2); };
  C.fromJSON = function (text) {
    var o = typeof text === "string" ? JSON.parse(text) : text;
    return C.create(o);
  };

  /* ------------------------------------------------------------------ *
   * Interchange record — hand a case (or a set of cases) to another app  *
   * ------------------------------------------------------------------ *
   * One plain-JSON envelope any app in the family can read and write:
   *
   *   { "format": "case-kit/record", "version": 1, "exported": "<ISO>",
   *     "patient": { "id": "<opaque>", "label": "<initials or code>" },
   *     "cases": [ <case>, ... ] }
   *
   * The patient block carries an OPAQUE id and a SHORT LABEL — never a name.
   * The envelope is plain JSON, so a human and another tool can both read it,
   * and it never touches the network. Where a record is encrypted (the
   * Encrypted Case Log), the whole envelope is what gets encrypted, not the
   * plaintext. See the README for the shape and the family mapping.
   */
  C.RECORD_FORMAT = "case-kit/record";
  C.RECORD_VERSION = 1;

  // Normalise a patient block: an opaque id plus a short label. Never a name.
  C.patient = function (p) {
    p = p || {};
    return { id: p.id ? String(p.id) : "", label: p.label ? String(p.label) : "" };
  };

  // Export one case, or a set of cases, as a single interchange record (a JSON string).
  C.exportRecord = function (cases, patient, opts) {
    opts = opts || {};
    var list = Array.isArray(cases) ? cases : (cases ? [cases] : []);
    var rec = {
      format: C.RECORD_FORMAT,
      version: C.RECORD_VERSION,
      exported: opts.exported || new Date().toISOString(),
      patient: C.patient(patient),
      cases: list
    };
    return JSON.stringify(rec, null, 2);
  };

  // Read an interchange record back. Accepts a JSON string or an object.
  // Older versions are migrated; a NEWER version is refused, never guessed.
  C.importRecord = function (text) {
    var o = typeof text === "string" ? JSON.parse(text) : text;
    if (!o || typeof o !== "object" || Array.isArray(o)) throw new Error("case-kit: record is not an object");
    if (o.format && o.format !== C.RECORD_FORMAT) throw new Error("case-kit: not a " + C.RECORD_FORMAT + " record");
    var v = o.version == null ? 0 : (o.version | 0);
    if (v > C.RECORD_VERSION) {
      throw new Error("case-kit: record version " + v + " is newer than this kit can read (max " + C.RECORD_VERSION + ")");
    }
    // Migration point: as the shape evolves, older versions are upgraded here.
    // v0 = records written before the version field existed.
    var list = Array.isArray(o.cases) ? o.cases : [];
    return {
      version: v,
      patient: C.patient(o.patient),
      cases: list.map(function (cse) { return C.create(cse); })
    };
  };

  return C;
});
