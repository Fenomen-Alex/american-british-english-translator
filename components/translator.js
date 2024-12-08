"use strict";

const americanOnly = require("./american-only.js");
const americanToBritishSpelling = require("./american-to-british-spelling.js");
const americanToBritishTitles = require("./american-to-british-titles.js");
const britishOnly = require("./british-only.js");

const reverseDict = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

class Translator {
    constructor() {
        this.dictBritish = { ...americanOnly, ...americanToBritishSpelling };
        this.dictAmerican = { ...britishOnly, ...reverseDict(americanToBritishSpelling) };
        this.titlesBritish = americanToBritishTitles;
        this.titlesAmerican = reverseDict(americanToBritishTitles);
        this.timeRegexBritish = /([1-9]|1[012]):[0-5][0-9]/g;
        this.timeRegexAmerican = /([1-9]|1[012])\.([0-5][0-9])/g;
    }

    toBritishEnglish(text) {
        return this.translate(text, this.dictBritish, this.titlesBritish, this.timeRegexBritish, "toBritish");
    }

    toAmericanEnglish(text) {
        return this.translate(text, this.dictAmerican, this.titlesAmerican, this.timeRegexAmerican, "toAmerican");
    }

    translate(text, dict, titles, timeRegex, locale) {
        const lowerText = text.toLowerCase();
        const matchesMap = {...this.findMatches(lowerText, dict, titles), ...this.findTimeMatches(lowerText, timeRegex, locale)};

        // No matches
        if (Object.keys(matchesMap).length === 0) return null;

        return [this.replaceAll(text, matchesMap), this.replaceAllWithHighlight(text, matchesMap)];
    }

    findMatches(lowerText, dict, titles) {
        const matchesMap = {};
        Object.entries(titles).forEach(([k, v]) => {
            if (lowerText.includes(k)) {
                matchesMap[k] = v.charAt(0).toUpperCase() + v.slice(1);
            }
        });

        // Check individual word matches
        lowerText.match(/(\w+([-'])(\w+)?['-]?(\w+))|\w+/g)?.forEach(word => {
            if (dict[word]) matchesMap[word] = dict[word];
        });

        // Filter words with spaces from current dictionary
        Object.entries(Object.fromEntries(Object.entries(dict).filter(([k]) => k.includes(" ")))).forEach(([k, v]) => {
            if (lowerText.includes(k)) matchesMap[k] = v;
        });

        return matchesMap;
    }

    findTimeMatches(lowerText, timeRegex, locale) {
        const matchesMap = {};
        lowerText.match(timeRegex)?.forEach(time => {
            matchesMap[time] = locale === "toBritish" ? time.replace(":", ".") : time.replace(".", ":");
        });
        return matchesMap;
    }

    replaceAll(text, matchesMap) {
        const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
        return text.replace(re, matched => matchesMap[matched.toLowerCase()]);
    }

    replaceAllWithHighlight(text, matchesMap) {
        const re = new RegExp(Object.keys(matchesMap).join("|"), "gi");
        return text.replace(re, matched => `<span class="highlight">${matchesMap[matched.toLowerCase()]}</span>`);
    }
}

module.exports = Translator;
