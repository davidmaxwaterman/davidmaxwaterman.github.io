'use strict';

/*
 * Copyright (c) 2012, Intel Corporation.
 *
 * This program is licensed under the terms and conditions of the
 * Apache License, version 2.0.  The full text of the Apache License is at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 */

var Calculator = {};

(function () {
  'use strict';

  var Raf = new function () {
    //
    // Functions
    //
    var _domChanges = [];

    var _setClass = function _setClass(selectorOrElement, classToSet) {
      var elements = [];
      if (typeof selectorOrElement === 'string') {
        elements = document.querySelectorAll(selectorOrElement);
      } else {
        elements.push(selectorOrElement);
      }

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        element.className = '';
        element.classList.add(classToSet);
      }
    };

    var _setStyle = function _setStyle(selector, property, value) {
      var elements = document.querySelectorAll(selector);

      for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        element.style[property] = value;
      }
    };

    var _appendChild = function _appendChild(parentElement, child) {
      parentElement.appendChild(child);
    };

    var _doDomChanges = function _doDomChanges() {
      var numDomChanges = _domChanges.length;
      for (var i = 0; i < numDomChanges; i++) {
        var thisChange = _domChanges.pop();

        switch (thisChange.type) {
          case 'class':
            _setClass(thisChange.selectorOrElement, thisChange.classToSet);
            break;
          case 'style':
            _setStyle(thisChange.selector, thisChange.property, thisChange.value);
            break;
          case 'child':
            _appendChild(thisChange.parentElement, thisChange.child);
            break;
          default:
            console.error('Unknown dom change type');
            break;
        }
      }
    };

    this.queueClassChange = function (selectorOrElement, classToSet) {
      var newChange = {
        type: 'class',
        selectorOrElement: selectorOrElement,
        classToSet: classToSet
      };

      _domChanges.push(newChange);

      if (_domChanges.length === 1) {
        window.requestAnimationFrame(_doDomChanges);
      }
    };

    this.queueStyleChange = function (selector, property, value) {
      var newChange = {
        type: 'style',
        selector: selector,
        property: property,
        value: value
      };

      _domChanges.push(newChange);

      if (_domChanges.length === 1) {
        window.requestAnimationFrame(_doDomChanges);
      }
    };

    this.queueAppendChild = function (parentElement, child) {
      var newChange = {
        type: 'child',
        parentElement: parentElement,
        child: child
      };

      _domChanges.push(newChange);

      if (_domChanges.length === 1) {
        window.requestAnimationFrame(_doDomChanges);
      }
    };

    this.maximiseBody = function () {
      // doMaximiseBody is defined in index.html
      window.requestAnimationFrame(doMaximiseBody);
    };
  }();

  Calculator = new function () {
    this.localizer = null;
    this.parser = '';
    this.currentKey = '';
    this.cssAppendix = '_portrait.css';

    /**
     * formula that has been computed already and its shown in the current formula area
     */
    this.currentFormula = '';

    // The below two stacks are maintained to do consistent backspace operation
    /**
     * Stack of elements that has been pressed after '=' press && which are shown
     * in mainEntry area.
     *
     * This stack is used to undo user's button presses until the previous
     * valid calculation ('=' press)
     */
    this.mainEntryStack = [];

    /**
     * Stack of elements that has been pressed after '=' press && which are shown
     * in current formula area (except already computed formula).
     *
     * This stack is used to undo user's button presses until the previous
     * valid calculation ('=' press)
     */
    this.currentFormulaStack = [];
    this.currentPage = 'calculationpane';

    /**
     * number of decimal digits to be preserved on trigonometric calculations
     */
    this.trigPrecision = 10000000000;

    // Functions for transitioning between states.
    //
    this.transitionToDegrees = function () {
      var classes = {
        '#degradswitch': 'switchleftactive',
        '#buttondeg': 'buttontogglebackgroundB',
        '#buttonrad': 'buttontogglebackgroundA'
      };

      Object.keys(classes).forEach(function (id) {
        return Raf.queueClassChange(id, classes[id]);
      });

      Calculator.angleDivisor = 180 / Math.PI;
    };

    this.transitionToRadians = function () {
      var classes = {
        '#degradswitch': 'switchrightactive',
        '#buttondeg': 'buttontogglebackgroundA',
        '#buttonrad': 'buttontogglebackgroundB'
      };

      Object.keys(classes).forEach(function (id) {
        return Raf.queueClassChange(id, classes[id]);
      });

      Calculator.angleDivisor = 1;
    };

    this.transitionToTrigonometricFunctions = function () {
      var classes = {
        '#traghypswitch': 'switchleftactive',
        '#buttontrig': 'buttontogglebackgroundB',
        '#buttonhyp': 'buttontogglebackgroundA'
      };

      Object.keys(classes).forEach(function (id) {
        return Raf.queueClassChange(id, classes[id]);
      });

      Raf.queueStyleChange('#trigonometric', 'display', 'inherit');
      Raf.queueStyleChange('#hyperbolic', 'display', 'none');
    };

    this.transitionToHyperbolicFunctions = function () {
      var classes = {
        '#traghypswitch': 'switchrightactive',
        '#buttontrig': 'buttontogglebackgroundA',
        '#buttonhyp': 'buttontogglebackgroundB'
      };

      Object.keys(classes).forEach(function (id) {
        return Raf.queueClassChange(id, classes[id]);
      });

      Raf.queueStyleChange('#trigonometric', 'display', 'none');
      Raf.queueStyleChange('#hyperbolic', 'display', 'inherit');
    };

    // Helper function for clearing main entry and current formula as needed.
    //
    this.handleClearOnNumberButtonClick = function () {
      if (Calculator.clearMainEntryOnNextNumberButton) {
        Calculator.setMainEntry('');
        Calculator.mainEntryStack.splice(0, Calculator.mainEntryStack.length);
      }

      if (Calculator.clearCurrentFormulaOnNextNumberButton) {
        Calculator.setCurrentFormula('');
        Calculator.currentFormulaStack.splice(0, Calculator.currentFormulaStack.length);
      }
    };

    this.handleClearOnFunctionButtonClick = function () {
      if (Calculator.clearMainEntryOnNextFunctionButton) {
        Calculator.setMainEntry('');
        Calculator.mainEntryStack.splice(0, Calculator.mainEntryStack.length);
      }

      if (Calculator.clearCurrentFormulaOnNextFunctionButton) {
        Calculator.setCurrentFormula('');
        Calculator.mainEntryStack.splice(0, Calculator.currentFormulaStack.length);
      }
    };

    // Functions for handling button presses.
    //
    this.onFunctionButtonClick = function () {
      Calculator.buttonClickAudio.play();
      Calculator.handleClearOnFunctionButtonClick();

      var operator = this.getAttribute('data-operator');

      if (!operator) {
        operator = this.innerHTML;
      }

      // move mainEntryStack content to currentFormulaStack
      for (var i = 0; i < Calculator.mainEntryStack.length; i++) {
        Calculator.currentFormulaStack.push(Calculator.mainEntryStack[i]);
      }

      // clear mainEntryStack
      Calculator.mainEntryStack.splice(0, Calculator.mainEntryStack.length);

      // append main entry and the operator to current formula
      document.getElementById('currentformula').innerHTML += Calculator.getMainEntry() + operator;
      Calculator.setMainEntry('');

      // push the recent operator to currentFormulaStack
      Calculator.currentFormulaStack.push(operator);

      Calculator.clearMainEntryOnNextNumberButton = false;
      Calculator.clearMainEntryOnNextFunctionButton = false;
      Calculator.clearCurrentFormulaOnNextNumberButton = false;
    };

    this.onNumericalButtonClick = function () {
      Calculator.buttonClickAudio.play();
      Calculator.handleClearOnNumberButtonClick();

      var value = this.innerHTML;
      var mainEntry = Calculator.getMainEntry();

      if (mainEntry.length >= 22) {
        return;
      }

      if (value === '0') {
        if (mainEntry === '0') {
          return;
        }
      } else if (value === '00') {
        if (mainEntry === '0' || mainEntry === '') {
          return;
        }
      } else if (value === '.') {
        if (mainEntry === '') {
          Calculator.appendToMainEntry('0');
          Calculator.mainEntryStack.push('0');
        } else if (mainEntry.indexOf(value) !== -1) {
          return;
        }
      } else if (value === '+/–') {
        // 'Plus/minus' sign.

        if (mainEntry === '' || mainEntry === '0') {
          return;
        }
        Calculator.setMainEntry('');

        if (mainEntry.charAt(0) === '-') {
          Calculator.appendToMainEntry(mainEntry.substring(1));
        } else {
          Calculator.appendToMainEntry('-' + mainEntry);
        }
        value = '';
      }
      // push into mainEntryStack
      Calculator.mainEntryStack.push(value);

      Calculator.appendToMainEntry(value);
      Calculator.setClearButtonMode('C');
      Calculator.clearMainEntryOnNextNumberButton = false;
      Calculator.clearMainEntryOnNextFunctionButton = false;
      Calculator.clearCurrentFormulaOnNextNumberButton = false;
    };

    this.onClearButtonClick = function () {
      Calculator.buttonClickAudio.play();
      var clearButtonText = document.getElementById('buttonclear').innerHTML;

      if (clearButtonText === 'C') {
        Calculator.setMainEntry('');
      } else if (clearButtonText === 'AC') {
        Calculator.setCurrentFormula('');
        Calculator.currentFormula = '';
      }
      // clear stacks
      var len = Calculator.mainEntryStack.length;
      Calculator.mainEntryStack.splice(0, len);
      len = Calculator.currentFormulaStack.length;
      Calculator.currentFormulaStack.splice(0, len);

      // update the currentformula area
      document.getElementById('currentformula').innerHTML = Calculator.currentFormula;
    };

    this.onDeleteButtonClick = function () {
      Calculator.buttonClickAudio.play();
      var mainEntry = Calculator.getMainEntry();

      if (Calculator.currentFormulaStack.length <= 0 && Calculator.mainEntryStack.length <= 0) {
        return;
      }

      var malformedExpressionText = Calculator.localizer.getTranslation('malformedExpressionText');
      if (malformedExpressionText === mainEntry) {
        Calculator.setMainEntry('');
        return;
      }

      var len = 0;
      // first delete mainEntry then currentFormula
      if (Calculator.mainEntryStack.length > 0) {
        // splice one element
        len = Calculator.mainEntryStack.length;
        Calculator.mainEntryStack.splice(len - 1, 1);

        // update the remaining elements
        mainEntry = '';
        for (var i = 0; i < Calculator.mainEntryStack.length; i++) {
          mainEntry += Calculator.mainEntryStack[i];
        }
        Calculator.setMainEntry(mainEntry);
      } else {
        // splice one element
        len = Calculator.currentFormulaStack.length;
        Calculator.currentFormulaStack.splice(len - 1, 1);

        // update the remaining elements
        var text = '';
        for (var j = 0; j < Calculator.currentFormulaStack.length; j++) {
          text += Calculator.currentFormulaStack[j];
        }
        document.getElementById('currentformula').innerHTML = Calculator.currentFormula + text;
      }
    };

    this.onEqualButtonClick = function () {
      Calculator.equalClickAudio.play();
      Calculator.handleClearOnFunctionButtonClick();

      var mainEntry = Calculator.getMainEntry();
      var prevFormula = Calculator.currentFormula;
      Calculator.currentFormulaStack.push(mainEntry);
      Calculator.appendToCurrentFormula(mainEntry);

      var formula = Calculator.getCurrentFormula();

      // replace ^ with x for unambiguous parsing.
      formula = formula.replace('e<sup>^</sup>', 'e<sup>x</sup>');

      var entry = '';
      if (formula !== '') {
        try {
          entry = Calculator.parser.parse(formula);
          if (isNaN(entry)) {
            entry = Calculator.localizer.getTranslation('malformedExpressionText');
          } else if (mainEntry !== '') {
            Calculator.appendEntryToCalculationHistory(Calculator.formHistoryEntry(formula, entry));
            Calculator.createHistoryEntryInLocalStorage(formula, entry);
          }
        } catch (err) {
          entry = Calculator.localizer.getTranslation('malformedExpressionText');
        }

        Calculator.setMainEntry(entry);
      }

      Calculator.clearMainEntryOnNextNumberButton = true;
      Calculator.clearMainEntryOnNextFunctionButton = true;
      Calculator.clearCurrentFormulaOnNextNumberButton = true;

      var len = 0;
      // clear undo stacks
      var malformedExpressionText = Calculator.localizer.getTranslation('malformedExpressionText');
      if (entry === malformedExpressionText) {
        // restore previous formula on error cases
        Calculator.currentFormula = prevFormula;
        Calculator.clearCurrentFormulaOnNextNumberButton = false;
      } else {
        // clear current formula stack only on valid computation
        len = Calculator.currentFormulaStack.length;
        Calculator.currentFormulaStack.splice(0, len);

        // To maintain operator precedence, enclose the formula that has been already computed
        Calculator.setCurrentFormula(entry);
      }
      len = Calculator.mainEntryStack.length;
      Calculator.mainEntryStack.splice(0, len);
    };

    this.setClearButtonMode = function (mode) {
      document.getElementById('buttonclear').innerHTML = mode;
    };

    // Function for adding a result history entry.
    //
    this.formHistoryEntry = function (formula, entry) {
      var historyEntry = '<div class="thickdivisor"></div><div class="calculationpane">  <div class="calculation">    <div class="calculationtext">' + formula + '</div>  </div></div><div class="thindivisor"></div><div class="resultpane">  <div class="result">    <div class="resulttext">' + entry + '</div>  </div></div>';

      return historyEntry;
    };

    this.setCalculationHistoryEntries = function (historyEntries) {
      document.getElementById('calculationhistory').innerHTML = historyEntries;
    };

    this.appendEntryToCalculationHistory = function (historyEntry) {
      var calculationHistory = document.getElementById('calculationhistory');
      calculationHistory.innerHTML += historyEntry;
    };

    // Functions for manipulating history persistent storage data.
    //
    this.createHistoryEntryInLocalStorage = function (formula, result) {
      var historyEntry = {
        formula: formula,
        result: result,
        timestamp: new Date().getTime()
      };

      localStorage.setItem('history' + Calculator.nexthistoryindex, JSON.stringify(historyEntry));
      Calculator.nexthistoryindex++;
    };

    this.populateHistoryPaneFromLocalStorage = function () {
      var firsthistoryindex = localStorage.getItem('firsthistoryindex');

      if (firsthistoryindex === null) {
        // Initialize history local storage if not used yet.
        Calculator.nexthistoryindex = 0;
        localStorage.setItem('firsthistoryindex', 0);
      } else {
        // If history local storage is used, then populate the history
        // list with stored items that are less than a week old.
        var time = new Date().getTime();
        var historyEntries = '';

        var i = firsthistoryindex;
        var historyitemstr = localStorage.getItem('history' + i);
        while (historyitemstr !== null) {
          try {
            var historyitem = JSON.parse(historyitemstr);

            var oneWeek = 604800000; /* One week in milliseconds */
            if (time - historyitem.timestamp > oneWeek) {
              localStorage.removeItem('history' + i);
              firsthistoryindex = i + 1;
            } else {
              historyEntries += Calculator.formHistoryEntry(historyitem.formula, historyitem.result);
            }
          } catch (err) {
            localStorage.removeItem('history' + i);
          }

          i++;
          historyitemstr = localStorage.getItem('history' + i);
        }
        Calculator.setCalculationHistoryEntries(historyEntries);
        localStorage.setItem('firsthistoryindex', firsthistoryindex);
      }
    };

    // Functions for manipulating entries.
    //
    this.getMainEntry = function () {
      return document.getElementById('mainentry').innerHTML;
    };

    this.setMainEntry = function (string) {
      var mainentryelement = document.getElementById('mainentry');

      mainentryelement.innerHTML = string;
      document.getElementById('mpmainentry').innerHTML = string;

      if (string === '') {
        document.getElementById('buttonclear').innerHTML = 'AC';
      } else {
        document.getElementById('buttonclear').innerHTML = 'C';
      }

      Raf.queueClassChange(mainentryelement, 'mainentryshort');
      if (mainentryelement.offsetWidth < mainentryelement.scrollWidth) {
        Raf.queueClassChange(mainentryelement, 'mainentrylong');
      }
    };

    this.appendToMainEntry = function (string) {
      Calculator.setMainEntry(document.getElementById('mainentry').innerHTML + string);
    };

    this.getCurrentFormula = function () {
      return document.getElementById('currentformula').innerHTML;
    };

    this.setCurrentFormula = function (string) {
      var currentformulaelement = document.getElementById('currentformula');

      currentformulaelement.innerHTML = string;
      Raf.queueClassChange(currentformulaelement, 'currentformulashort');
      var thisOffsetWidth = currentformulaelement.offsetWidth;
      var thisScrollWidth = currentformulaelement.scrollWidth;
      if (thisOffsetWidth < thisScrollWidth) {
        Raf.queueClassChange(currentformulaelement, 'currentformulalong');
      }
      Calculator.currentFormula = string;
    };

    this.appendToCurrentFormula = function (string) {
      var newstring = document.getElementById('currentformula').innerHTML + string;
      Calculator.currentFormula = newstring;
      Calculator.setCurrentFormula(newstring);
    };

    // Functions for handling arrow button click events.
    //
    this.onButtonMainEntryToMemoryClick = function () {
      var value = Calculator.getMainEntry();

      Calculator.addValueToEmptyMemoryEntry(value);
      Calculator.setFreeMemorySlot();
    };

    this.onButtonHistoryResultToMemoryClick = function (value) {
      Calculator.addValueToEmptyMemoryEntry(value);
    };

    this.onButtonHistoryResultToMainEntryClick = function (value) {
      Calculator.handleClearOnNumberButtonClick();

      Calculator.setMainEntry(value);
      Calculator.clearMainEntryOnNextNumberButton = true;
      Calculator.clearMainEntryOnNextFunctionButton = false;
    };

    // Functions for manipulating memory entries.
    //
    this.addValueToEmptyMemoryEntry = function (value) {
      if (value !== '') {
        // Try to find an empty memory entry.
        var i = Calculator.getNextEmptyMemorySlot();

        if (i <= 8) {
          // Empty memory entry found, store entry.
          var mplusi = 'M' + i;
          localStorage.setItem(mplusi, value + '##');
          Calculator.setMemoryEntry(mplusi, value, '');
          Raf.queueStyleChange('#button' + mplusi, 'color', '#d9e2d0');
        }
      }
    };

    this.getNextEmptyMemorySlot = function () {
      var i = 1;
      while (i <= 8) {
        if (localStorage.getItem('M' + i) === null) {
          break;
        }

        i++;
      }
      return i;
    };

    this.setMemoryEntry = function (key, value, description) {
      var buttonkey = '#button' + key;
      var hashkey = '#' + key;
      var children = document.querySelector(buttonkey).children;
      children[0].setAttribute('src', 'images/ico_arrow_white.png');
      Raf.queueClassChange(buttonkey + 'edit', 'buttonmemoryeditenabled');
      Raf.queueClassChange(buttonkey + 'close', 'buttonmemorycloseenabled');
      document.querySelector(hashkey + 'text').innerHTML = value;
      document.querySelector(hashkey + 'description').textContent = description;
      Raf.queueStyleChange(buttonkey, 'color', '#d9e2d0');
    };

    this.setMemoryDescription = function (key, description) {
      var memoryitemstr = localStorage.getItem(key);

      if (!(memoryitemstr === null)) {
        var memoryitem = memoryitemstr.split('##');

        Calculator.setMemoryEntry(key, memoryitem[0], description);
        localStorage.setItem(key, memoryitem[0] + '##' + description);
      }
    };

    this.onButtonMemoryEditClick = function (key) {
      var keyElement = document.querySelector('#button' + key + 'edit');
      if (!keyElement.classList.contains('buttonmemoryeditenabled')) {
        return;
      }

      Calculator.currentKey = key;
      Raf.queueStyleChange('#memorynoteeditor', 'display', 'block');
      var hashkey = '#' + key;
      var memoryitemstr = document.querySelector(hashkey + 'text').textContent;
      var description = document.querySelector(hashkey + 'description').textContent;
      document.getElementById('mnebutton').textContent = key;
      document.getElementById('mnetext').textContent = memoryitemstr;

      var input = document.getElementById('mnedescriptioninput');
      var text = document.getElementById('mnedescription');

      if (input.style.display === '' || input.style.display === 'none' || input.style.visibility !== 'visible') {
        input.style.display = 'inline';
        text.style.display = '';
        document.getElementById('mnedescriptioninput').focus();
      } else {
        input.style.display = '';
        text.style.display = 'inline';
      }

      input.value = description;
    };

    this.onMemoryDescriptionInputFocusOut = function (key) {
      var keydescription = '#' + key;
      var input = document.querySelector(keydescription + 'input');
      var value = input.value;
      var description = document.querySelector(keydescription);

      description.textContent = value;
      Calculator.setMemoryDescription(key, value);
      input.style.display = '';
      Raf.queueStyleChange(description, 'display', 'inline');
    };

    this.onButtonMemoryClick = function (key) {
      Calculator.handleClearOnNumberButtonClick();

      var value = document.querySelector('#' + key + 'text').textContent;

      if (value !== null) {
        Calculator.setMainEntry(value);
        Calculator.clearMainEntryOnNextNumberButton = true;
        Calculator.clearMainEntryOnNextFunctionButton = false;
      }
    };

    this.onButtonMemoryCloseClick = function (key) {
      var hashkey = '#' + key;
      var buttonkey = '#button' + key;
      var children = document.querySelector(buttonkey).children;
      children[0].setAttribute('src', 'images/ico_arrow_black.png');
      Raf.queueClassChange(buttonkey + 'edit', 'buttonmemoryedit');
      Raf.queueClassChange(buttonkey + 'close', 'buttonmemoryclose');
      Raf.queueClassChange(buttonkey + 'close', 'buttonmemoryclose');
      localStorage.removeItem(key);
      document.querySelector(hashkey + 'descriptioninput').value = '';
      document.querySelector(hashkey + 'text').textContent = '';
      Raf.queueStyleChange(buttonkey, 'color', '#727272');
      document.querySelector(hashkey + 'description').textContent = '';
    };

    this.populateMemoryPaneFromLocalStorage = function () {
      for (var i = 0; i < 9; i++) {
        var memoryitemstr = localStorage.getItem('M' + i);

        if (!(memoryitemstr === null)) {
          var memoryitem = memoryitemstr.split('##');

          Calculator.setMemoryEntry('M' + i, memoryitem[0], memoryitem[1]);
        }
      }
    };

    this.onButtonMemoryListClick = function () {
      Raf.queueStyleChange('#memorypage', 'display', 'block');
      Calculator.currentPage = 'memorypage';
      document.getElementById('mpmainentry').innerHTML = Calculator.getMainEntry();
    };

    this.onButtonMemoryClearAll = function () {
      Raf.queueStyleChange('#clearconfirmationdialog', 'visibility', 'visible');
    };

    this.clearAllMemorySlots = function () {
      Raf.queueStyleChange('#clearconfirmationdialog', 'visibility', 'hidden');
      for (var i = 1; i <= 8; i++) {
        Calculator.onButtonMemoryCloseClick('M' + i);
      }
      Calculator.setFreeMemorySlot();
    };

    this.cancelClearAllDialog = function () {
      Raf.queueStyleChange('#clearconfirmationdialog', 'visibility', 'hidden');
    };

    this.onButtonMemoryClose = function () {
      Calculator.setFreeMemorySlot();
      Raf.queueStyleChange('#memorypage', 'display', '');
      Calculator.currentPage = 'calculationpane';
    };

    // Function for initializing the UI buttons.
    //
    this.initButtons = function () {
      var buttons = document.querySelectorAll('.buttonblackshort,.buttonyellow,.buttonblack,.buttonblue:not(#buttondot)');
      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.addEventListener('mousedown', Calculator.onFunctionButtonClick, false);
      }

      buttons = document.querySelectorAll('.buttonwhite');
      for (var _i = 0; _i < buttons.length; _i++) {
        var thisButton = buttons[_i];

        thisButton.addEventListener('mousedown', Calculator.onNumericalButtonClick, false);
      }

      // Initialize memorize button
      Calculator.setFreeMemorySlot();

      // Initialize button special cases.
      var handlerMap = {
        '#buttonclear': Calculator.onClearButtonClick,
        '#buttondelete': Calculator.onDeleteButtonClick,
        '#buttondot': Calculator.onNumericalButtonClick,
        '#buttonplusminus': Calculator.onNumericalButtonClick,
        '#buttonequal': Calculator.onEqualButtonClick
      };
      var keys = Object.keys(handlerMap);

      for (var _i2 = 0; _i2 < keys.length; _i2++) {
        var thisKey = keys[_i2];
        var thisElement = document.querySelector(thisKey);
        thisElement.addEventListener('mousedown', handlerMap[thisKey], false);
      }

      Calculator.initAudio();
    };

    /**
     * initializes the audio files and assigns audio for various button presses
     */
    this.initAudio = function () {
      Calculator.buttonClickAudio = new Audio();
      Calculator.buttonClickAudio.src = './audio/GeneralButtonPress_R2.ogg';
      Calculator.equalClickAudio = new Audio();
      Calculator.equalClickAudio.src = './audio/EqualitySign_R2.ogg';

      var buttons = document.querySelectorAll('#closehistorybutton,.historybutton,.buttonclose,.switchleftactive,.buttonpurple,.dialogAbuttonPurple,.dialogAbuttonBlack,.dialogBpurplebutton,.dialogBblackbutton,.buttonmemory,.buttonmemoryedit,.buttonmemoryclose');

      var _addListener = function _addListener(button) {
        button.addEventListener('mousedown', function () {
          return Calculator.buttonClickAudio.play();
        });
      };

      for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];

        _addListener(button);
      }
    };

    this.openHistory = function () {
      Raf.queueStyleChange('#LCD_Upper', 'display', 'block');
      Raf.queueStyleChange('#licensebtnl', 'display', '');
    };

    this.closeHistory = function () {
      Raf.queueStyleChange('#LCD_Upper', 'display', '');
      Raf.queueStyleChange('#licensebtnl', 'display', 'block');
      Raf.queueStyleChange('#' + Calculator.currentPage, 'display', 'block');
      Calculator.historyScrollbar.refresh();
      return false;
    };

    this.setFreeMemorySlot = function () {
      var i = Calculator.getNextEmptyMemorySlot();
      if (i <= 8) {
        document.getElementById('buttonmemorizetext').innerHTML = 'M' + i;
      } else {
        document.getElementById('buttonmemorizetext').innerHTML = 'Mx';
      }
    };

    this.registerInlineHandlers = function () {
      var handlers = {
        click: {
          '#closehistorybutton': Calculator.closeHistory,
          '#openhistorybutton': Calculator.openHistory,
          '#buttondeg': Calculator.transitionToDegrees,
          '#buttonrad': Calculator.transitionToRadians,
          '#buttontrig': Calculator.transitionToTrigonometricFunctions,
          '#buttonhyp': Calculator.transitionToHyperbolicFunctions,
          '#buttonmemorylist': Calculator.onButtonMemoryListClick,
          '#buttonmemorize': Calculator.onButtonMainEntryToMemoryClick,
          '#memoryclearall': Calculator.onButtonMemoryClearAll,
          '#memoryClose': Calculator.onButtonMemoryClose,
          '#dialogokbutton': Calculator.clearAllMemorySlots,
          '#dialogcancelbutton': Calculator.cancelClearAllDialog,
          '#mpopenhistorybutton': Calculator.openHistory,

          '#buttonclosecurrentformula': function buttonclosecurrentformula() {
            Calculator.setCurrentFormula('');
          },
          '#buttonclosemainentry, #mplcdbuttonclose': function buttonclosemainentryMplcdbuttonclose() {
            Calculator.setMainEntry('');
          },
          '#buttonM1': function buttonM1() {
            Calculator.onButtonMemoryClick('M1');
          },
          '#buttonM1edit': function buttonM1edit() {
            Calculator.onButtonMemoryEditClick('M1');
          },
          '#buttonM1close': function buttonM1close() {
            Calculator.onButtonMemoryCloseClick('M1');
          },
          '#buttonM2': function buttonM2() {
            Calculator.onButtonMemoryClick('M2');
          },
          '#buttonM2edit': function buttonM2edit() {
            Calculator.onButtonMemoryEditClick('M2');
          },
          '#buttonM2close': function buttonM2close() {
            Calculator.onButtonMemoryCloseClick('M2');
          },
          '#buttonM3': function buttonM3() {
            Calculator.onButtonMemoryClick('M3');
          },
          '#buttonM3edit': function buttonM3edit() {
            Calculator.onButtonMemoryEditClick('M3');
          },
          '#buttonM3close': function buttonM3close() {
            Calculator.onButtonMemoryCloseClick('M3');
          },
          '#buttonM4': function buttonM4() {
            Calculator.onButtonMemoryClick('M4');
          },
          '#buttonM4edit': function buttonM4edit() {
            Calculator.onButtonMemoryEditClick('M4');
          },
          '#buttonM4close': function buttonM4close() {
            Calculator.onButtonMemoryCloseClick('M4');
          },
          '#buttonM5': function buttonM5() {
            Calculator.onButtonMemoryClick('M5');
          },
          '#buttonM5edit': function buttonM5edit() {
            Calculator.onButtonMemoryEditClick('M5');
          },
          '#buttonM5close': function buttonM5close() {
            Calculator.onButtonMemoryCloseClick('M5');
          },
          '#buttonM6': function buttonM6() {
            Calculator.onButtonMemoryClick('M6');
          },
          '#buttonM6edit': function buttonM6edit() {
            Calculator.onButtonMemoryEditClick('M6');
          },
          '#buttonM6close': function buttonM6close() {
            Calculator.onButtonMemoryCloseClick('M6');
          },
          '#buttonM7': function buttonM7() {
            Calculator.onButtonMemoryClick('M7');
          },
          '#buttonM7edit': function buttonM7edit() {
            Calculator.onButtonMemoryEditClick('M7');
          },
          '#buttonM7close': function buttonM7close() {
            Calculator.onButtonMemoryCloseClick('M7');
          },
          '#buttonM8': function buttonM8() {
            Calculator.onButtonMemoryClick('M8');
          },
          '#buttonM8edit': function buttonM8edit() {
            Calculator.onButtonMemoryEditClick('M8');
          },
          '#buttonM8close': function buttonM8close() {
            Calculator.onButtonMemoryCloseClick('M8');
          }
        },
        focusout: {
          '#M1descriptioninput': function M1descriptioninput() {
            Calculator.onMemoryDescriptionInputFocusOut('M1');
          },
          '#M2descriptioninput': function M2descriptioninput() {
            Calculator.onMemoryDescriptionInputFocusOut('M2');
          },
          '#M3descriptioninput': function M3descriptioninput() {
            Calculator.onMemoryDescriptionInputFocusOut('M3');
          },
          '#M4descriptioninput': function M4descriptioninput() {
            Calculator.onMemoryDescriptionInputFocusOut('M4');
          },
          '#M5descriptioninput': function M5descriptioninput() {
            Calculator.onMemoryDescriptionInputFocusOut('M5');
          },
          '#M6descriptioninput': function M6descriptioninput() {
            Calculator.saveMemoryDescription('M6');
          },
          '#M7descriptioninput': function M7descriptioninput() {
            Calculator.onMemoryDescriptionInputFocusOut('M7');
          },
          '#M8descriptioninput': function M8descriptioninput() {
            Calculator.saveMemoryDescription('M8');
          }
        }
      };

      var events = Object.keys(handlers);
      events.forEach(function (event) {
        var selectors = Object.keys(handlers[event]);

        selectors.forEach(function (selector) {
          var handler = handlers[event][selector];
          var elements = document.querySelectorAll(selector);

          for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.addEventListener(event, handler);
          }
        });
      });
    };

    this.registerMneClickHandlers = function () {
      document.getElementById('mnecancel').addEventListener('click', function () {
        Raf.queueStyleChange('#memorynoteeditor', 'display', 'none');
      });

      document.getElementById('mnesave').addEventListener('click', function () {
        Raf.queueStyleChange('#memorynoteeditor', 'display', '');
        var mnedescriptioninputval = document.getElementById('mnedescriptioninput').value;
        document.getElementById(Calculator.currentKey + 'description').textContent = mnedescriptioninputval;
        Calculator.setMemoryDescription(Calculator.currentKey, mnedescriptioninputval);
      });

      document.getElementById('mnedescriptiondelete').addEventListener('click', function () {
        document.getElementById('mnedescriptioninput').value = '';
      });
    };

    /**
     * register for the orientation event changes
     * changing layout is handled by @media, but resize is done manually
     */
    this.registerOrientationChange = function () {
      // on page create
      document.addEventListener('pagecreate', function () {
        Raf.maximiseBody();
      });

      document.addEventListener('create', function () {
        Raf.maximiseBody();
      });

      if ('onorientationchange' in window) {
        window.onorientationchange = function () {
          Raf.maximiseBody();
        };

        window.onresize = function () {
          Raf.maximiseBody();
        };
      } else {
        window.onresize = function () {
          if (window.innerHeight > window.innerWidth) {
            window.orientation = 0;
          } else {
            window.orientation = 90;
          }

          Raf.maximiseBody();
        };
      }
    };

    /**
     * creates scroll bar for the history page
     */
    this.createScrollbars = function () {
      Calculator.historyScrollbar = new IScroll('#wrapper', {
        scrollbarClass: 'customScrollbar',
        hScrollbar: true, vScrollbar: true,
        hideScrollbar: true,
        checkDOMChanges: true
      });
    };

    this.fillServiceWorkerCache = function () {
      var allFiles = ["/css/calc.css", "/css/lazy.css", "/css/calc_portrait.css", "/css/lazy_portrait.css", "/css/jquery.jscrollpane.css", "/sw-import.js", "/manifest.json", "/locales/fi/messages.json", "/locales/en_US/messages.json", "/locales/locales.json", "/audio/GeneralButtonPress_R2.ogg", "/audio/EqualitySign_R2.ogg", "/index.html", "/js/localizer.js", "/js/license.js", "/js/help.js", "/js/calc.js", "/data/peg-code.txt", "/lib/open-sans/index.woff", "/lib/polymer/polymer-micro.html", "/lib/polymer/polymer.html", "/lib/polymer/polymer-mini.html", "/lib/fetch/fetch.js", "/lib/webcomponentsjs/MutationObserver.js", "/lib/webcomponentsjs/ShadowDOM.js", "/lib/webcomponentsjs/HTMLImports.js", "/lib/webcomponentsjs/webcomponents-lite.min.js", "/lib/webcomponentsjs/webcomponents.min.js", "/lib/webcomponentsjs/MutationObserver.min.js", "/lib/webcomponentsjs/ShadowDOM.min.js", "/lib/webcomponentsjs/CustomElements.min.js", "/lib/webcomponentsjs/HTMLImports.min.js", "/lib/webcomponentsjs/CustomElements.js", "/lib/webcomponentsjs/webcomponents.js", "/lib/webcomponentsjs/webcomponents-lite.js", "/lib/sw-toolbox/sw-toolbox.map.json", "/lib/sw-toolbox/recipes/common.css", "/lib/sw-toolbox/recipes/cache-expiration-options/service-worker.js", "/lib/sw-toolbox/recipes/cache-expiration-options/styles.css", "/lib/sw-toolbox/recipes/cache-expiration-options/app.js", "/lib/sw-toolbox/recipes/cache-expiration-options/index.html", "/lib/sw-toolbox/recipes/index.html", "/lib/sw-toolbox/companion.js", "/lib/sw-toolbox/sw-toolbox.js", "/lib/open-sans-light/index.woff", "/lib/platinum-sw/service-worker.js", "/lib/platinum-sw/bootstrap/sw-toolbox-setup.js", "/lib/platinum-sw/bootstrap/offline-analytics.js", "/lib/platinum-sw/bootstrap/simple-db.js", "/lib/platinum-sw/platinum-sw-fetch.html", "/lib/platinum-sw/platinum-sw-import-script.html", "/lib/platinum-sw/platinum-sw-elements.html", "/lib/platinum-sw/platinum-sw-register.html", "/lib/platinum-sw/platinum-sw-cache.html", "/lib/platinum-sw/index.html", "/lib/platinum-sw/platinum-sw-offline-analytics.html", "/lib/iscroll/dist/iscroll-zoom-min.js", "/lib/iscroll/dist/iscroll-min.js", "/lib/iscroll/dist/iscroll-lite-min.js", "/lib/iscroll/dist/iscroll-probe-min.js", "/lib/es6-promise/es6-promise.js", "/lib/es6-promise/promise.js", "/lib/es6-promise/es6-promise.min.js", "/lib/es6-promise/promise.min.js", "/lib/open-sans-semibold/index.woff", "/lib/pegjs/peg-0.9.0.js", "/lib/pegjs/peg-0.9.0.min.js", "/images/switch_science_land_press.png", "/images/bt_yellow_port.png", "/images/switch_science_port_press.png", "/images/bg_memory_list_port.png", "/images/scrollbar_bottom.png", "/images/line_history_hor2px_land.png", "/images/switch_single_land.png", "/images/icon_300.png", "/images/bt_blue_land_press.png", "/images/bt_equals_port_press.png", "/images/bt_dialogB_purple.png", "/images/bt_white_port_press.png", "/images/LineHorizontalBlackThick.png", "/images/bt_black_port_press.png", "/images/bg_display_memory_land.png", "/images/bt_dialogB_purple_press.png", "/images/bt_dialogA_purple.png", "/images/bg_keyboard_port.png", "/images/bt_history_exp_land_press.png", "/images/bt_whiteA_land.png", "/images/bg_display_land.png", "/images/bt_blue_land.png", "/images/bt_dialogA_purple_press.png", "/images/bt_white_port.png", "/images/switch_single_port_press.png", "/images/bt_purple_land.png", "/images/bt_blackSmall_land_press.png", "/images/bt_blue_port.png", "/images/bt_whiteA_port_press.png", "/images/bg_land.png", "/images/bt_purple_port.png", "/images/bt_white_land_press.png", "/images/ico_arrow_black.png", "/images/switch_land_left_act.png", "/images/bt_red_land_press.png", "/images/bt_yellow_port_press.png", "/images/bg_memory_slot_land.png", "/images/bt_yellow_land.png", "/images/switch_science_port.png", "/images/bt_blackSmall_port_press.png", "/images/bt_history_contr_port_press.png", "/images/LineVertical19Black.png", "/images/bt_whiteA_land_press.png", "/images/ico_mem_list.png", "/images/clear_memory.png", "/images/bt_equals_port.png", "/images/switch_science_land.png", "/images/bt_grey_port.png", "/images/bt_history_exp_land.png", "/images/pencil_disable.png", "/images/bg_history_land.png", "/images/bt_red_port.png", "/images/bg_port.png", "/images/bt_whiteB_port.png", "/images/bt_whiteB_land.png", "/images/bt_history_contr_port.png", "/images/switch_single_land_act.png", "/images/line_history_hor4px_port.png", "/images/line_display_land.png", "/images/bt_purple_land_press.png", "/images/ico_back.png", "/images/bt_yellow_land_press.png", "/images/clear_memory_press.png", "/images/line_history_hor4px_land.png", "/images/LineHorizontalBlack.png", "/images/bg_memory_note.png", "/images/bt_whiteB_land_press.png", "/images/bt_purple_port_press.png", "/images/bt_red_land.png", "/images/switch_single_land_press.png", "/images/ico_arrow_grey.png", "/images/switch_port_right_act.png", "/images/bt_grey_land.png", "/images/bt_bin_press.png", "/images/LineVertical38Black.png", "/images/pencil_press.png", "/images/switch_science_land_act.png", "/images/bt_whiteB_port_press.png", "/images/bt_history_contr_land.png", "/images/bt_dialogA_black_press.png", "/images/bg_keyboard_land.png", "/images/bt_black_land.png", "/images/bt_history_exp_port.png", "/images/bt_whiteA_port.png", "/images/clear_memory_disable.png", "/images/bg_history_port.png", "/images/clear_text_press.png", "/images/bt_history_exp_port_press.png", "/images/bt_dialogB_blacks.png", "/images/bt_red_port_press.png", "/images/switch_single_port.png", "/images/bg_memory_list_land.png", "/images/bt_equals_land.png", "/images/switch_port_press.png", "/images/bg_display_port.png", "/images/bg_dialog.png", "/images/ico_arrow_white.png", "/images/switch_land_right_act.png", "/images/bt_equals_land_press.png", "/images/clear_text.png", "/images/bt_blue_port_press.png", "/images/bg_display_memory_port.png", "/images/bt_blackSmall_port.png", "/images/bt_black_port.png", "/images/switch_science_port_act.png", "/images/switch_single_port_act.png", "/images/bt_mem_list_land.png", "/images/line_history_vert_land.png", "/images/bt_blackSmall_land.png", "/images/bt_dialogB_black_press.png", "/images/bt_bin.png", "/images/bt_dialogA_black.png", "/images/line_history_hor2px_port.png", "/images/bt_mem_list_land_press.png", "/images/line_display_port.png", "/images/switch_land_press.png", "/images/switch_port_left_act.png", "/images/line_keyboard_land.png", "/images/line_keyboard_port.png", "/images/line_history_vert_port.png", "/images/scrollbar_top.png", "/images/bg_memory_slot_port.png", "/images/scrollbar_middle.png", "/images/bt_black_land_press.png", "/images/pencil.png", "/images/bt_white_land.png", "/images/bt_history_contr_land_press.png", "/lazy.html"];

      document.addEventListener('WebComponentsReady', function () {
        document.querySelector('platinum-sw-cache').precache = allFiles;
      });
    };
  }();

  (function () {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('media', 'all and (orientation:landscape)');
    link.setAttribute('href', 'css/lazy.css');

    Raf.queueAppendChild(document.head, link);

    link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('media', 'all and (orientation:portrait)');
    link.setAttribute('href', 'css/lazy_portrait.css');

    Raf.queueAppendChild(document.head, link);

    Calculator.registerOrientationChange();

    fetch('lazy.html').then(function (response) {
      return response.text();
    }).then(function (body) {
      // inject rest of js files
      // and run Calculator init code that depends on them

      var lazyScripts = [{
        type: 'script',
        file: 'lib/webcomponentsjs/webcomponents-lite.min.js',
        success: function success(resolve) {
          // once webcomponents is loaded, load the polymer elements
          var files = ['lib/platinum-sw/platinum-sw-register.html', 'lib/platinum-sw/platinum-sw-cache.html'];
          var elements = [];

          files.forEach(function (file) {
            var element = document.createElement('link');
            element.setAttribute('rel', 'import');
            element.setAttribute('href', file);
            elements.push(element);
          });

          elements.forEach(function (element) {
            Raf.queueAppendChild(document.head, element);
          });

          Calculator.fillServiceWorkerCache();

          resolve();
        }
      }, {
        type: 'script',
        file: 'lib/pegjs/peg-0.9.0.min.js',
        success: function success(resolve) {
          fetch('data/peg-code.txt').then(function (response) {
            return response.text();
          }).then(function (data) {
            try {
              Calculator.parser = PEG.buildParser(data);
              resolve();
            } catch (err) {
              console.log(err.message);
            }
          });
        }
      }, {
        type: 'script',
        file: 'js/license.js',
        success: function success(resolve) {
          licenseInit('license', 'background');
          document.getElementById('licensebtnl').addEventListener('mousedown', function () {
            Calculator.buttonClickAudio.play();
          });
          document.getElementById('licensebtnq').addEventListener('mousedown', function () {
            Calculator.buttonClickAudio.play();
          });
          resolve();
        }
      }, {
        type: 'script',
        file: 'js/help.js',
        success: function success(resolve) {
          helpInit('home_help', 'help_');
          document.getElementById('home_help').addEventListener('mousedown', function () {
            Calculator.buttonClickAudio.play();
          });
          document.getElementById('help_close').addEventListener('mousedown', function () {
            Calculator.buttonClickAudio.play();
          });
          resolve();
        }
      }, {
        type: 'script',
        file: 'js/localizer.js',
        success: function success(resolve) {
          Calculator.localizer = new Localizer();
          Calculator.localizer.localizeHtmlElements();
          resolve();
        }
      }, {
        type: 'script',
        file: 'lib/iscroll/dist/iscroll-lite-min.js',
        success: function success(resolve) {
          Calculator.createScrollbars();
          resolve();
        }
      }];
      var promises = [];

      // complete body
      document.body.innerHTML += body;

      Calculator.registerMneClickHandlers();

      var makeSuccessScript = function makeSuccessScript(success, resolve) {
        return function () {
          success(resolve);
        };
      };

      var makePromise = function makePromise(i) {
        return new Promise(function (resolve) {
          var element = void 0;
          if (lazyScripts[i].type === 'script') {
            element = document.createElement('script');
            element.onload = makeSuccessScript(lazyScripts[i].success, resolve);
            element.setAttribute('src', lazyScripts[i].file);
          }

          Raf.queueAppendChild(document.head, element);
        });
      };

      // inject js and html import elements
      for (var i = 0; i < lazyScripts.length; i++) {
        promises.push(makePromise(i));
      }

      // once all js files have been loaded and initialised/etc, do the rest
      Promise.all(promises).then(function () {
        Calculator.initButtons();
        Calculator.setMainEntry('');
        Calculator.setCurrentFormula('');
        Calculator.transitionToDegrees();
        Calculator.transitionToTrigonometricFunctions();
        Calculator.equalPressed = false;
        Calculator.populateMemoryPaneFromLocalStorage();
        Calculator.populateHistoryPaneFromLocalStorage();
        Calculator.registerInlineHandlers();
        var buttons = document.querySelectorAll('button');
        for (var _i3 = 0; _i3 < buttons.length; _i3++) {
          buttons[_i3].disabled = false;
        }

        Raf.maximiseBody();

        console.timeStamp('MAXMAXMAX:Buttons Enabled');
      }, function () {
        console.error('something wrong with promises');
      });
    });
  })();
})();
//# sourceMappingURL=calc.js.map
