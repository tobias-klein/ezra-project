/* This file is part of Ezra Bible App.

   Copyright (C) 2019 - 2021 Tobias Klein <contact@ezra-project.net>

   Ezra Bible App is free software: you can redistribute it and/or modify
   it under the terms of the GNU General Public License as published by
   the Free Software Foundation, either version 2 of the License, or
   (at your option) any later version.

   Ezra Bible App is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.

   You should have received a copy of the GNU General Public License
   along with Ezra Bible App. See the file LICENSE.
   If not, see <http://www.gnu.org/licenses/>. */

const PlatformHelper = require('../../lib/platform_helper.js');
const jqueryI18next = require('jquery-i18next');

const i18nextOptions = {
  debug: false,
  interpolation: {
    escapeValue: false
  },
  saveMissing: false,
  fallbackLng: 'en',
  whitelist: ['de', 'en', 'nl', 'fr', 'es', 'sk'],
  react: {
    wait: false
  }
};

class I18nHelper {
  constructor() {
    this._platformHelper = new PlatformHelper();
    this._isCordova = this._platformHelper.isCordova();
  }

  async init() {
    window.i18n = require('i18next');
    const I18nIpcBackend = require('../ipc/i18n_ipc_backend.js');

    let LanguageDetector = null;
    
    if (platformHelper.isElectron()) {
      LanguageDetector = require('i18next-electron-language-detector');
    } else {
      const _LanguageDetector = require('../platform/i18next_browser_language_detector.js');
      LanguageDetector = new _LanguageDetector();
    }

    await i18n
    .use(LanguageDetector)
    .use(I18nIpcBackend)
    .init(i18nextOptions);

    jqueryI18next.init(i18n, $, {
      tName: 't', // --> appends $.t = i18next.t
      i18nName: 'i18n', // --> appends $.i18n = i18next
      handleName: 'localize', // --> appends $(selector).localize(opts);
      selectorAttr: 'i18n', // selector for translating elements
      targetAttr: 'i18n-target', // data-() attribute to grab target element to translate (if different than itself)
      optionsAttr: 'i18n-options', // data-() attribute that contains options, will load/set if useOptionsAttr = true
      useOptionsAttr: false, // see optionsAttr
      parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
    });
  }

  getLanguage() {
    var lang = i18n.language;

    if (this._isCordova) {
      // Force lang to English as long as SWORD i18n functionality on Android is not fully working.
      lang = 'en';
    }

    return lang;
  }

  async getSwordTranslation(originalString) {
    return await ipcNsi.getSwordTranslation(originalString, i18n.language);
  }

  async getBookAbbreviation(bookCode) {
    var currentBibleTranslationId = app_controller.tab_controller.getTab().getBibleTranslationId();
    return await ipcNsi.getBookAbbreviation(currentBibleTranslationId, bookCode, this.getLanguage());
  }

  async getSpecificTranslation(lang, key) {
    var origLang = i18n.language;

    await i18n.changeLanguage(lang);
    var specificTranslation = i18n.t(key);
    await i18n.changeLanguage(origLang);

    return specificTranslation;
  }

  async getChapterTranslation(lang) {
    var language = lang;

    if (this._isCordova) {
      language = 'en';
    }

    return await this.getSpecificTranslation(language, 'bible-browser.chapter');
  }

  async getPsalmTranslation(lang) {
    var language = lang;

    if (this._isCordova) {
      language = 'en';
    }

    return await this.getSpecificTranslation(language, 'bible-browser.psalm');
  }

  getLocalizedDate(timestamp) {
    var language = this.getLanguage();
    return new Date(Date.parse(timestamp)).toLocaleDateString(language);
  }
}

module.exports = I18nHelper;
