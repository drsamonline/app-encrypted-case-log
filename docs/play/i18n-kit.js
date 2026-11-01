/* i18n-kit — the four languages this app speaks, bundled.
 *
 * No network, no translation service, no dependency: the dictionaries ARE the
 * file. Anything without a translation falls back to English, which is honest —
 * a half-translated screen should not pretend.
 *
 *   ECL_I18N.apply("hi")   // walks [data-i18n] and [data-i18n-ph]
 */
(function (root) {
  "use strict";

  var DICTS = {
    en: {
      patients: "Patients", timeline: "Timeline", earlier: "Earlier versions",
      severityOver: "Severity over time", settings: "Settings",
      newPatient: "New patient", exportEcl: "Export .ecl", importEcl: "Import .ecl",
      exportCsv: "Export CSV…", importCsv: "Import CSV…", lockNow: "Lock now",
      clear: "Clear", save: "Save", close: "Close", del: "Delete", print: "Print",
      searchPh: "Search notes… (decrypted in memory while unlocked)",
      noPatients: "No patients yet.",
      appearance: "Appearance", locking: "Locking", passphrase: "Passphrase and recovery",
      decoy: "Decoy vault", storage: "Storage and health",
      textSize: "Text size", language: "Language", autoLock: "Auto-lock after (minutes)",
      redact: "Redact names and notes on screen (for a shared display)",
      lockHide: "Lock as soon as the tab is hidden",
      newPass: "New passphrase", repeat: "Repeat it",
      changePass: "Change passphrase", newRecovery: "New recovery code",
      verifyAll: "Verify every record", runTests: "Run the self-tests",
      backup: "Export .ecl now", records: "record(s)", notes: "note(s)"
    },
    hi: {
      patients: "रोगी", timeline: "समयरेखा", earlier: "पुराने संस्करण",
      severityOver: "समय के साथ गंभीरता", settings: "सेटिंग्स",
      newPatient: "नया रोगी", exportEcl: ".ecl निर्यात करें", importEcl: ".ecl आयात करें",
      exportCsv: "CSV निर्यात करें…", importCsv: "CSV आयात करें…", lockNow: "अभी लॉक करें",
      clear: "साफ़ करें", save: "सहेजें", close: "बंद करें", del: "हटाएँ", print: "छापें",
      searchPh: "टिप्पणियाँ खोजें… (अनलॉक रहते हुए मेमोरी में डिक्रिप्ट)",
      noPatients: "अभी कोई रोगी नहीं।",
      appearance: "रूप", locking: "लॉकिंग", passphrase: "पासफ़्रेज़ और रिकवरी",
      decoy: "छद्म वॉल्ट", storage: "संग्रहण और स्वास्थ्य",
      textSize: "पाठ का आकार", language: "भाषा", autoLock: "स्वतः लॉक (मिनट में)",
      redact: "साझा स्क्रीन के लिए नाम और टिप्पणियाँ छिपाएँ",
      lockHide: "टैब छिपते ही लॉक करें",
      newPass: "नया पासफ़्रेज़", repeat: "दोहराएँ",
      changePass: "पासफ़्रेज़ बदलें", newRecovery: "नया रिकवरी कोड",
      verifyAll: "हर रिकॉर्ड जाँचें", runTests: "स्वयं-परीक्षण चलाएँ",
      backup: "अभी .ecl निर्यात करें", records: "रिकॉर्ड", notes: "टिप्पणियाँ"
    },
    gu: {
      patients: "દર્દીઓ", timeline: "સમયરેખા", earlier: "જૂની આવૃત્તિઓ",
      severityOver: "સમય સાથે તીવ્રતા", settings: "સેટિંગ્સ",
      newPatient: "નવો દર્દી", exportEcl: ".ecl નિકાસ કરો", importEcl: ".ecl આયાત કરો",
      exportCsv: "CSV નિકાસ કરો…", importCsv: "CSV આયાત કરો…", lockNow: "હવે લૉક કરો",
      clear: "સાફ કરો", save: "સાચવો", close: "બંધ કરો", del: "દૂર કરો", print: "છાપો",
      searchPh: "નોંધ શોધો… (અનલૉક હોય ત્યારે મેમરીમાં ડિક્રિપ્ટ)",
      noPatients: "હજી કોઈ દર્દી નથી.",
      appearance: "દેખાવ", locking: "લૉકિંગ", passphrase: "પાસફ્રેઝ અને રિકવરી",
      decoy: "છદ્મ વૉલ્ટ", storage: "સંગ્રહ અને આરોગ્ય",
      textSize: "લખાણનું માપ", language: "ભાષા", autoLock: "સ્વયં લૉક (મિનિટ)",
      redact: "વહેંચાયેલ સ્ક્રીન માટે નામ અને નોંધ છુપાવો",
      lockHide: "ટૅબ છુપાય કે તરત લૉક કરો",
      newPass: "નવો પાસફ્રેઝ", repeat: "પુનરાવર્તન",
      changePass: "પાસફ્રેઝ બદલો", newRecovery: "નવો રિકવરી કોડ",
      verifyAll: "દરેક રેકોર્ડ ચકાસો", runTests: "સ્વયં-પરીક્ષણ ચલાવો",
      backup: "હવે .ecl નિકાસ કરો", records: "રેકોર્ડ", notes: "નોંધ"
    },
    mr: {
      patients: "रुग्ण", timeline: "कालरेषा", earlier: "जुनी आवृत्ती",
      severityOver: "कालानुसार तीव्रता", settings: "सेटिंग्ज",
      newPatient: "नवीन रुग्ण", exportEcl: ".ecl निर्यात करा", importEcl: ".ecl आयात करा",
      exportCsv: "CSV निर्यात करा…", importCsv: "CSV आयात करा…", lockNow: "आता लॉक करा",
      clear: "साफ करा", save: "जतन करा", close: "बंद करा", del: "हटवा", print: "छापा",
      searchPh: "नोंदी शोधा… (अनलॉक असताना मेमरीत डिक्रिप्ट)",
      noPatients: "अजून कोणतेही रुग्ण नाहीत.",
      appearance: "स्वरूप", locking: "लॉकिंग", passphrase: "पासफ्रेज आणि रिकव्हरी",
      decoy: "छद्म व्हॉल्ट", storage: "साठवण आणि आरोग्य",
      textSize: "मजकुराचा आकार", language: "भाषा", autoLock: "स्वयं लॉक (मिनिटे)",
      redact: "सामायिक स्क्रीनसाठी नावे आणि नोंदी लपवा",
      lockHide: "टॅब लपताच लॉक करा",
      newPass: "नवीन पासफ्रेज", repeat: "पुन्हा लिहा",
      changePass: "पासफ्रेज बदला", newRecovery: "नवीन रिकव्हरी कोड",
      verifyAll: "प्रत्येक रेकॉर्ड तपासा", runTests: "स्वयं-चाचण्या चालवा",
      backup: "आता .ecl निर्यात करा", records: "रेकॉर्ड", notes: "नोंदी"
    }
  };

  function apply(lang) {
    var d = DICTS[lang] || DICTS.en, base = DICTS.en, k, els;
    els = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < els.length; i++) {
      k = els[i].getAttribute("data-i18n");
      els[i].textContent = d[k] || base[k] || els[i].textContent;
    }
    els = document.querySelectorAll("[data-i18n-ph]");
    for (var j = 0; j < els.length; j++) {
      k = els[j].getAttribute("data-i18n-ph");
      els[j].setAttribute("placeholder", d[k] || base[k] || "");
    }
    document.documentElement.setAttribute("lang", lang || "en");
  }

  root.ECL_I18N = { dicts: DICTS, apply: apply, languages: ["en", "hi", "gu", "mr"] };
})(typeof window !== "undefined" ? window : this);
