"use strict";

const Translator = require("../components/translator.js");

module.exports = function (app) {
  const translator = new Translator();

  app.route("/api/translate").post((req, res) => {
    const { text, locale } = req.body;

    if (!locale || text === undefined) {
      return res.json({ error: "Required field(s) missing" });
    }

    if (text === "") {
      return res.json({ error: "No text to translate" });
    }

    let translation;

    if (locale === "american-to-british") {
      translation = translator.toBritishEnglish(text);
    } else if (locale === "british-to-american") {
      translation = translator.toAmericanEnglish(text);
    } else {
      return res.json({ error: "Invalid value for locale field" });
    }

    if (!translation || translation[0] === text) {
      return res.json({ text, translation: "Everything looks good to me!" });
    }

    return res.json({ text, translation: translation[1] });
  });
};
