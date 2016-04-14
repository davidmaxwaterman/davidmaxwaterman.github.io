"use strict";var Calculator={};!function(){var a=new function(){var a=[],b=function(a,b){var c=[];"string"==typeof a?c=document.querySelectorAll(a):c.push(a);for(var d=0;d<c.length;d++){var e=c[d];e.className="",e.classList.add(b)}},c=function(a,b,c){for(var d=document.querySelectorAll(a),e=0;e<d.length;e++){var f=d[e];f.style[b]=c}},d=function(a,b){a.appendChild(b)},e=function(){for(var e=a.length,f=0;e>f;f++){var g=a.pop();switch(g.type){case"class":b(g.selectorOrElement,g.classToSet);break;case"style":c(g.selector,g.property,g.value);break;case"child":d(g.parentElement,g.child);break;default:console&&console.error&&console.error("Unknown dom change type")}}};this.queueClassChange=function(b,c){var d={type:"class",selectorOrElement:b,classToSet:c};a.push(d),1===a.length&&window.requestAnimFrame(e)},this.queueStyleChange=function(b,c,d){var f={type:"style",selector:b,property:c,value:d};a.push(f),1===a.length&&window.requestAnimFrame(e)},this.queueAppendChild=function(b,c){var d={type:"child",parentElement:b,child:c};a.push(d),1===a.length&&window.requestAnimFrame(e)},this.maximiseBody=function(){window.requestAnimFrame(doMaximiseBody)}};Calculator=new function(){this.localizer=null,this.parser="",this.currentKey="",this.cssAppendix="_portrait.css",this.currentFormula="",this.mainEntryStack=[],this.currentFormulaStack=[],this.currentPage="calculationpane",this.trigPrecision=1e10,this.transitionToDegrees=function(){var b={"#degradswitch":"switchleftactive","#buttondeg":"buttontogglebackgroundB","#buttonrad":"buttontogglebackgroundA"};Object.keys(b).forEach(function(c){return a.queueClassChange(c,b[c])}),Calculator.angleDivisor=180/Math.PI},this.transitionToRadians=function(){var b={"#degradswitch":"switchrightactive","#buttondeg":"buttontogglebackgroundA","#buttonrad":"buttontogglebackgroundB"};Object.keys(b).forEach(function(c){return a.queueClassChange(c,b[c])}),Calculator.angleDivisor=1},this.transitionToTrigonometricFunctions=function(){var b={"#traghypswitch":"switchleftactive","#buttontrig":"buttontogglebackgroundB","#buttonhyp":"buttontogglebackgroundA"};Object.keys(b).forEach(function(c){return a.queueClassChange(c,b[c])}),a.queueStyleChange("#trigonometric","display","inherit"),a.queueStyleChange("#hyperbolic","display","none")},this.transitionToHyperbolicFunctions=function(){var b={"#traghypswitch":"switchrightactive","#buttontrig":"buttontogglebackgroundA","#buttonhyp":"buttontogglebackgroundB"};Object.keys(b).forEach(function(c){return a.queueClassChange(c,b[c])}),a.queueStyleChange("#trigonometric","display","none"),a.queueStyleChange("#hyperbolic","display","inherit")},this.handleClearOnNumberButtonClick=function(){Calculator.clearMainEntryOnNextNumberButton&&(Calculator.setMainEntry(""),Calculator.mainEntryStack.splice(0,Calculator.mainEntryStack.length)),Calculator.clearCurrentFormulaOnNextNumberButton&&(Calculator.setCurrentFormula(""),Calculator.currentFormulaStack.splice(0,Calculator.currentFormulaStack.length))},this.handleClearOnFunctionButtonClick=function(){Calculator.clearMainEntryOnNextFunctionButton&&(Calculator.setMainEntry(""),Calculator.mainEntryStack.splice(0,Calculator.mainEntryStack.length)),Calculator.clearCurrentFormulaOnNextFunctionButton&&(Calculator.setCurrentFormula(""),Calculator.mainEntryStack.splice(0,Calculator.currentFormulaStack.length))},this.onFunctionButtonClick=function(){Calculator.buttonClickAudio.play(),Calculator.handleClearOnFunctionButtonClick();var a=this.getAttribute("data-operator");a||(a=this.innerHTML);for(var b=0;b<Calculator.mainEntryStack.length;b++)Calculator.currentFormulaStack.push(Calculator.mainEntryStack[b]);Calculator.mainEntryStack.splice(0,Calculator.mainEntryStack.length),document.getElementById("currentformula").innerHTML+=Calculator.getMainEntry()+a,Calculator.setMainEntry(""),Calculator.currentFormulaStack.push(a),Calculator.clearMainEntryOnNextNumberButton=!1,Calculator.clearMainEntryOnNextFunctionButton=!1,Calculator.clearCurrentFormulaOnNextNumberButton=!1},this.onNumericalButtonClick=function(){Calculator.buttonClickAudio.play(),Calculator.handleClearOnNumberButtonClick();var a=this.innerHTML,b=Calculator.getMainEntry();if(!(b.length>=22)){if("0"===a){if("0"===b)return}else if("00"===a){if("0"===b||""===b)return}else if("."===a){if(""===b)Calculator.appendToMainEntry("0"),Calculator.mainEntryStack.push("0");else if(-1!==b.indexOf(a))return}else if("+/–"===a){if(""===b||"0"===b)return;Calculator.setMainEntry(""),"-"===b.charAt(0)?Calculator.appendToMainEntry(b.substring(1)):Calculator.appendToMainEntry("-"+b),a=""}Calculator.mainEntryStack.push(a),Calculator.appendToMainEntry(a),Calculator.setClearButtonMode("C"),Calculator.clearMainEntryOnNextNumberButton=!1,Calculator.clearMainEntryOnNextFunctionButton=!1,Calculator.clearCurrentFormulaOnNextNumberButton=!1}},this.onClearButtonClick=function(){Calculator.buttonClickAudio.play();var a=document.getElementById("buttonclear").innerHTML;"C"===a?Calculator.setMainEntry(""):"AC"===a&&(Calculator.setCurrentFormula(""),Calculator.currentFormula="");var b=Calculator.mainEntryStack.length;Calculator.mainEntryStack.splice(0,b),b=Calculator.currentFormulaStack.length,Calculator.currentFormulaStack.splice(0,b),document.getElementById("currentformula").innerHTML=Calculator.currentFormula},this.onDeleteButtonClick=function(){Calculator.buttonClickAudio.play();var a=Calculator.getMainEntry();if(!(Calculator.currentFormulaStack.length<=0&&Calculator.mainEntryStack.length<=0)){var b=Calculator.localizer.getTranslation("malformedExpressionText");if(b===a)return void Calculator.setMainEntry("");var c=0;if(Calculator.mainEntryStack.length>0){c=Calculator.mainEntryStack.length,Calculator.mainEntryStack.splice(c-1,1),a="";for(var d=0;d<Calculator.mainEntryStack.length;d++)a+=Calculator.mainEntryStack[d];Calculator.setMainEntry(a)}else{c=Calculator.currentFormulaStack.length,Calculator.currentFormulaStack.splice(c-1,1);for(var e="",f=0;f<Calculator.currentFormulaStack.length;f++)e+=Calculator.currentFormulaStack[f];document.getElementById("currentformula").innerHTML=Calculator.currentFormula+e}}},this.onEqualButtonClick=function(){Calculator.equalClickAudio.play(),Calculator.handleClearOnFunctionButtonClick();var a=Calculator.getMainEntry(),b=Calculator.currentFormula;Calculator.currentFormulaStack.push(a),Calculator.appendToCurrentFormula(a);var c=Calculator.getCurrentFormula();c=c.replace("e<sup>^</sup>","e<sup>x</sup>");var d="";if(""!==c){try{d=Calculator.parser.parse(c),isNaN(d)?d=Calculator.localizer.getTranslation("malformedExpressionText"):""!==a&&(Calculator.appendEntryToCalculationHistory(Calculator.formHistoryEntry(c,d)),Calculator.createHistoryEntryInLocalStorage(c,d))}catch(e){d=Calculator.localizer.getTranslation("malformedExpressionText")}Calculator.setMainEntry(d)}Calculator.clearMainEntryOnNextNumberButton=!0,Calculator.clearMainEntryOnNextFunctionButton=!0,Calculator.clearCurrentFormulaOnNextNumberButton=!0;var f=0,g=Calculator.localizer.getTranslation("malformedExpressionText");d===g?(Calculator.currentFormula=b,Calculator.clearCurrentFormulaOnNextNumberButton=!1):(f=Calculator.currentFormulaStack.length,Calculator.currentFormulaStack.splice(0,f),Calculator.setCurrentFormula(d)),f=Calculator.mainEntryStack.length,Calculator.mainEntryStack.splice(0,f)},this.setClearButtonMode=function(a){document.getElementById("buttonclear").innerHTML=a},this.formHistoryEntry=function(a,b){var c='<div class="thickdivisor"></div><div class="calculationpane">  <div class="calculation">    <div class="calculationtext">'+a+'</div>  </div></div><div class="thindivisor"></div><div class="resultpane">  <div class="result">    <div class="resulttext">'+b+"</div>  </div></div>";return c},this.setCalculationHistoryEntries=function(a){document.getElementById("calculationhistory").innerHTML=a},this.appendEntryToCalculationHistory=function(a){var b=document.getElementById("calculationhistory");b.innerHTML+=a},this.createHistoryEntryInLocalStorage=function(a,b){var c={formula:a,result:b,timestamp:(new Date).getTime()};localStorage.setItem("history"+Calculator.nexthistoryindex,JSON.stringify(c)),Calculator.nexthistoryindex++},this.populateHistoryPaneFromLocalStorage=function(){var a=localStorage.getItem("firsthistoryindex");if(null===a)Calculator.nexthistoryindex=0,localStorage.setItem("firsthistoryindex",0);else{for(var b=(new Date).getTime(),c="",d=a,e=localStorage.getItem("history"+d);null!==e;){try{var f=JSON.parse(e),g=6048e5;b-f.timestamp>g?(localStorage.removeItem("history"+d),a=d+1):c+=Calculator.formHistoryEntry(f.formula,f.result)}catch(h){localStorage.removeItem("history"+d)}d++,e=localStorage.getItem("history"+d)}Calculator.setCalculationHistoryEntries(c),localStorage.setItem("firsthistoryindex",a)}},this.getMainEntry=function(){return document.getElementById("mainentry").innerHTML},this.setMainEntry=function(b){var c=document.getElementById("mainentry");c.innerHTML=b,document.getElementById("mpmainentry").innerHTML=b,""===b?document.getElementById("buttonclear").innerHTML="AC":document.getElementById("buttonclear").innerHTML="C",a.queueClassChange(c,"mainentryshort"),c.offsetWidth<c.scrollWidth&&a.queueClassChange(c,"mainentrylong")},this.appendToMainEntry=function(a){Calculator.setMainEntry(document.getElementById("mainentry").innerHTML+a)},this.getCurrentFormula=function(){return document.getElementById("currentformula").innerHTML},this.setCurrentFormula=function(b){var c=document.getElementById("currentformula");c.innerHTML=b,a.queueClassChange(c,"currentformulashort");var d=c.offsetWidth,e=c.scrollWidth;e>d&&a.queueClassChange(c,"currentformulalong"),Calculator.currentFormula=b},this.appendToCurrentFormula=function(a){var b=document.getElementById("currentformula").innerHTML+a;Calculator.currentFormula=b,Calculator.setCurrentFormula(b)},this.onButtonMainEntryToMemoryClick=function(){var a=Calculator.getMainEntry();Calculator.addValueToEmptyMemoryEntry(a),Calculator.setFreeMemorySlot()},this.onButtonHistoryResultToMemoryClick=function(a){Calculator.addValueToEmptyMemoryEntry(a)},this.onButtonHistoryResultToMainEntryClick=function(a){Calculator.handleClearOnNumberButtonClick(),Calculator.setMainEntry(a),Calculator.clearMainEntryOnNextNumberButton=!0,Calculator.clearMainEntryOnNextFunctionButton=!1},this.addValueToEmptyMemoryEntry=function(b){if(""!==b){var c=Calculator.getNextEmptyMemorySlot();if(8>=c){var d="M"+c;localStorage.setItem(d,b+"##"),Calculator.setMemoryEntry(d,b,""),a.queueStyleChange("#button"+d,"color","#d9e2d0")}}},this.getNextEmptyMemorySlot=function(){for(var a=1;8>=a&&null!==localStorage.getItem("M"+a);)a++;return a},this.setMemoryEntry=function(b,c,d){var e="#button"+b,f="#"+b,g=document.querySelector(e).children;g[0].setAttribute("src","images/ico_arrow_white.png"),a.queueClassChange(e+"edit","buttonmemoryeditenabled"),a.queueClassChange(e+"close","buttonmemorycloseenabled"),document.querySelector(f+"text").innerHTML=c,document.querySelector(f+"description").textContent=d,a.queueStyleChange(e,"color","#d9e2d0")},this.setMemoryDescription=function(a,b){var c=localStorage.getItem(a);if(null!==c){var d=c.split("##");Calculator.setMemoryEntry(a,d[0],b),localStorage.setItem(a,d[0]+"##"+b)}},this.onButtonMemoryEditClick=function(b){var c=document.querySelector("#button"+b+"edit");if(c.classList.contains("buttonmemoryeditenabled")){Calculator.currentKey=b,a.queueStyleChange("#memorynoteeditor","display","block");var d="#"+b,e=document.querySelector(d+"text").textContent,f=document.querySelector(d+"description").textContent;document.getElementById("mnebutton").textContent=b,document.getElementById("mnetext").textContent=e;var g=document.getElementById("mnedescriptioninput"),h=document.getElementById("mnedescription");""===g.style.display||"none"===g.style.display||"visible"!==g.style.visibility?(g.style.display="inline",h.style.display="",document.getElementById("mnedescriptioninput").focus()):(g.style.display="",h.style.display="inline"),g.value=f}},this.onMemoryDescriptionInputFocusOut=function(b){var c="#"+b,d=document.querySelector(c+"input"),e=d.value,f=document.querySelector(c);f.textContent=e,Calculator.setMemoryDescription(b,e),d.style.display="",a.queueStyleChange(f,"display","inline")},this.onButtonMemoryClick=function(a){Calculator.handleClearOnNumberButtonClick();var b=document.querySelector("#"+a+"text").textContent;null!==b&&(Calculator.setMainEntry(b),Calculator.clearMainEntryOnNextNumberButton=!0,Calculator.clearMainEntryOnNextFunctionButton=!1)},this.onButtonMemoryCloseClick=function(b){var c="#"+b,d="#button"+b,e=document.querySelector(d).children;e[0].setAttribute("src","images/ico_arrow_black.png"),a.queueClassChange(d+"edit","buttonmemoryedit"),a.queueClassChange(d+"close","buttonmemoryclose"),a.queueClassChange(d+"close","buttonmemoryclose"),localStorage.removeItem(b),document.querySelector(c+"descriptioninput").value="",document.querySelector(c+"text").textContent="",a.queueStyleChange(d,"color","#727272"),document.querySelector(c+"description").textContent=""},this.populateMemoryPaneFromLocalStorage=function(){for(var a=0;9>a;a++){var b=localStorage.getItem("M"+a);if(null!==b){var c=b.split("##");Calculator.setMemoryEntry("M"+a,c[0],c[1])}}},this.onButtonMemoryListClick=function(){a.queueStyleChange("#memorypage","display","block"),Calculator.currentPage="memorypage",document.getElementById("mpmainentry").innerHTML=Calculator.getMainEntry()},this.onButtonMemoryClearAll=function(){a.queueStyleChange("#clearconfirmationdialog","visibility","visible")},this.clearAllMemorySlots=function(){a.queueStyleChange("#clearconfirmationdialog","visibility","hidden");for(var b=1;8>=b;b++)Calculator.onButtonMemoryCloseClick("M"+b);Calculator.setFreeMemorySlot()},this.cancelClearAllDialog=function(){a.queueStyleChange("#clearconfirmationdialog","visibility","hidden")},this.onButtonMemoryClose=function(){Calculator.setFreeMemorySlot(),a.queueStyleChange("#memorypage","display",""),Calculator.currentPage="calculationpane"},this.initButtons=function(){for(var a=document.querySelectorAll(".buttonblackshort,.buttonyellow,.buttonblack,.buttonblue:not(#buttondot)"),b=0;b<a.length;b++){var c=a[b];c.addEventListener("mousedown",Calculator.onFunctionButtonClick,!1)}a=document.querySelectorAll(".buttonwhite");for(var d=0;d<a.length;d++){var e=a[d];e.addEventListener("mousedown",Calculator.onNumericalButtonClick,!1)}Calculator.setFreeMemorySlot();for(var f={"#buttonclear":Calculator.onClearButtonClick,"#buttondelete":Calculator.onDeleteButtonClick,"#buttondot":Calculator.onNumericalButtonClick,"#buttonplusminus":Calculator.onNumericalButtonClick,"#buttonequal":Calculator.onEqualButtonClick},g=Object.keys(f),h=0;h<g.length;h++){var i=g[h],j=document.querySelector(i);j.addEventListener("mousedown",f[i],!1)}Calculator.initAudio()},this.initAudio=function(){Calculator.buttonClickAudio=new Audio,Calculator.buttonClickAudio.src="./audio/GeneralButtonPress_R2.ogg",Calculator.equalClickAudio=new Audio,Calculator.equalClickAudio.src="./audio/EqualitySign_R2.ogg";for(var a=document.querySelectorAll("#closehistorybutton,.historybutton,.buttonclose,.switchleftactive,.buttonpurple,.dialogAbuttonPurple,.dialogAbuttonBlack,.dialogBpurplebutton,.dialogBblackbutton,.buttonmemory,.buttonmemoryedit,.buttonmemoryclose"),b=function(a){a.addEventListener("mousedown",function(){return Calculator.buttonClickAudio.play()})},c=0;c<a.length;c++){var d=a[c];b(d)}},this.openHistory=function(){a.queueStyleChange("#LCD_Upper","display","block"),a.queueStyleChange("#licensebtnl","display","")},this.closeHistory=function(){return a.queueStyleChange("#LCD_Upper","display",""),a.queueStyleChange("#licensebtnl","display","block"),a.queueStyleChange("#"+Calculator.currentPage,"display","block"),Calculator.historyScrollbar.refresh(),!1},this.setFreeMemorySlot=function(){var a=Calculator.getNextEmptyMemorySlot();8>=a?document.getElementById("buttonmemorizetext").innerHTML="M"+a:document.getElementById("buttonmemorizetext").innerHTML="Mx"},this.registerInlineHandlers=function(){var a={click:{"#closehistorybutton":Calculator.closeHistory,"#openhistorybutton":Calculator.openHistory,"#buttondeg":Calculator.transitionToDegrees,"#buttonrad":Calculator.transitionToRadians,"#buttontrig":Calculator.transitionToTrigonometricFunctions,"#buttonhyp":Calculator.transitionToHyperbolicFunctions,"#buttonmemorylist":Calculator.onButtonMemoryListClick,"#buttonmemorize":Calculator.onButtonMainEntryToMemoryClick,"#memoryclearall":Calculator.onButtonMemoryClearAll,"#memoryClose":Calculator.onButtonMemoryClose,"#dialogokbutton":Calculator.clearAllMemorySlots,"#dialogcancelbutton":Calculator.cancelClearAllDialog,"#mpopenhistorybutton":Calculator.openHistory,"#buttonclosecurrentformula":function(){Calculator.setCurrentFormula("")},"#buttonclosemainentry, #mplcdbuttonclose":function(){Calculator.setMainEntry("")},"#buttonM1":function(){Calculator.onButtonMemoryClick("M1")},"#buttonM1edit":function(){Calculator.onButtonMemoryEditClick("M1")},"#buttonM1close":function(){Calculator.onButtonMemoryCloseClick("M1")},"#buttonM2":function(){Calculator.onButtonMemoryClick("M2")},"#buttonM2edit":function(){Calculator.onButtonMemoryEditClick("M2")},"#buttonM2close":function(){Calculator.onButtonMemoryCloseClick("M2")},"#buttonM3":function(){Calculator.onButtonMemoryClick("M3")},"#buttonM3edit":function(){Calculator.onButtonMemoryEditClick("M3")},"#buttonM3close":function(){Calculator.onButtonMemoryCloseClick("M3")},"#buttonM4":function(){Calculator.onButtonMemoryClick("M4")},"#buttonM4edit":function(){Calculator.onButtonMemoryEditClick("M4")},"#buttonM4close":function(){Calculator.onButtonMemoryCloseClick("M4")},"#buttonM5":function(){Calculator.onButtonMemoryClick("M5")},"#buttonM5edit":function(){Calculator.onButtonMemoryEditClick("M5")},"#buttonM5close":function(){Calculator.onButtonMemoryCloseClick("M5")},"#buttonM6":function(){Calculator.onButtonMemoryClick("M6")},"#buttonM6edit":function(){Calculator.onButtonMemoryEditClick("M6")},"#buttonM6close":function(){Calculator.onButtonMemoryCloseClick("M6")},"#buttonM7":function(){Calculator.onButtonMemoryClick("M7")},"#buttonM7edit":function(){Calculator.onButtonMemoryEditClick("M7")},"#buttonM7close":function(){Calculator.onButtonMemoryCloseClick("M7")},"#buttonM8":function(){Calculator.onButtonMemoryClick("M8")},"#buttonM8edit":function(){Calculator.onButtonMemoryEditClick("M8")},"#buttonM8close":function(){Calculator.onButtonMemoryCloseClick("M8")}},focusout:{"#M1descriptioninput":function(){Calculator.onMemoryDescriptionInputFocusOut("M1")},"#M2descriptioninput":function(){Calculator.onMemoryDescriptionInputFocusOut("M2")},"#M3descriptioninput":function(){Calculator.onMemoryDescriptionInputFocusOut("M3")},"#M4descriptioninput":function(){Calculator.onMemoryDescriptionInputFocusOut("M4")},"#M5descriptioninput":function(){Calculator.onMemoryDescriptionInputFocusOut("M5")},"#M6descriptioninput":function(){Calculator.saveMemoryDescription("M6")},"#M7descriptioninput":function(){Calculator.onMemoryDescriptionInputFocusOut("M7")},"#M8descriptioninput":function(){Calculator.saveMemoryDescription("M8")}}},b=Object.keys(a);b.forEach(function(b){var c=Object.keys(a[b]);c.forEach(function(c){for(var d=a[b][c],e=document.querySelectorAll(c),f=0;f<e.length;f++){var g=e[f];g.addEventListener(b,d)}})})},this.registerMneClickHandlers=function(){document.getElementById("mnecancel").addEventListener("click",function(){a.queueStyleChange("#memorynoteeditor","display","none")}),document.getElementById("mnesave").addEventListener("click",function(){a.queueStyleChange("#memorynoteeditor","display","");var b=document.getElementById("mnedescriptioninput").value;document.getElementById(Calculator.currentKey+"description").textContent=b,Calculator.setMemoryDescription(Calculator.currentKey,b)}),document.getElementById("mnedescriptiondelete").addEventListener("click",function(){document.getElementById("mnedescriptioninput").value=""})},this.registerOrientationChange=function(){document.addEventListener("pagecreate",function(){a.maximiseBody()}),document.addEventListener("create",function(){a.maximiseBody()}),"onorientationchange"in window?(window.onorientationchange=function(){a.maximiseBody()},window.onresize=function(){a.maximiseBody()}):window.onresize=function(){window.innerHeight>window.innerWidth?window.orientation=0:window.orientation=90,a.maximiseBody()}},this.createScrollbars=function(){Calculator.historyScrollbar=new IScroll("#wrapper",{scrollbarClass:"customScrollbar",hScrollbar:!0,vScrollbar:!0,hideScrollbar:!0,checkDOMChanges:!0})},this.fillServiceWorkerCache=function(){var a=["/css/calc_common.css","/css/calc_landscape.css","/css/calc_portrait.css","/css/lazy_landscape.css","/css/lazy_portrait.css","/css/jquery.jscrollpane.css","/sw-import.js","/manifest.json","/locales/fi/messages.json","/locales/en_US/messages.json","/locales/locales.json","/audio/GeneralButtonPress_R2.ogg","/audio/EqualitySign_R2.ogg","/index.html","/js/localizer.js","/js/license.js","/js/help.js","/js/calc.js","/data/peg-code.txt","/lib/open-sans/index.woff","/lib/polymer/polymer-micro.html","/lib/polymer/polymer.html","/lib/polymer/polymer-mini.html","/lib/fetch/fetch.js","/lib/webcomponentsjs/MutationObserver.js","/lib/webcomponentsjs/ShadowDOM.js","/lib/webcomponentsjs/HTMLImports.js","/lib/webcomponentsjs/webcomponents-lite.min.js","/lib/webcomponentsjs/webcomponents.min.js","/lib/webcomponentsjs/MutationObserver.min.js","/lib/webcomponentsjs/ShadowDOM.min.js","/lib/webcomponentsjs/CustomElements.min.js","/lib/webcomponentsjs/HTMLImports.min.js","/lib/webcomponentsjs/CustomElements.js","/lib/webcomponentsjs/webcomponents.js","/lib/webcomponentsjs/webcomponents-lite.js","/lib/sw-toolbox/sw-toolbox.map.json","/lib/sw-toolbox/recipes/common.css","/lib/sw-toolbox/recipes/cache-expiration-options/service-worker.js","/lib/sw-toolbox/recipes/cache-expiration-options/styles.css","/lib/sw-toolbox/recipes/cache-expiration-options/app.js","/lib/sw-toolbox/recipes/cache-expiration-options/index.html","/lib/sw-toolbox/recipes/index.html","/lib/sw-toolbox/companion.js","/lib/sw-toolbox/sw-toolbox.js","/lib/open-sans-light/index.woff","/lib/platinum-sw/service-worker.js","/lib/platinum-sw/bootstrap/sw-toolbox-setup.js","/lib/platinum-sw/bootstrap/offline-analytics.js","/lib/platinum-sw/bootstrap/simple-db.js","/lib/platinum-sw/platinum-sw-fetch.html","/lib/platinum-sw/platinum-sw-import-script.html","/lib/platinum-sw/platinum-sw-elements.html","/lib/platinum-sw/platinum-sw-register.html","/lib/platinum-sw/platinum-sw-cache.html","/lib/platinum-sw/index.html","/lib/platinum-sw/platinum-sw-offline-analytics.html","/lib/iscroll/dist/iscroll-zoom-min.js","/lib/iscroll/dist/iscroll-min.js","/lib/iscroll/dist/iscroll-lite-min.js","/lib/iscroll/dist/iscroll-probe-min.js","/lib/es6-promise/es6-promise.js","/lib/es6-promise/promise.js","/lib/es6-promise/es6-promise.min.js","/lib/es6-promise/promise.min.js","/lib/open-sans-semibold/index.woff","/lib/pegjs/peg-0.9.0.js","/lib/pegjs/peg-0.9.0.min.js","/images/switch_science_land_press.png","/images/bt_yellow_port.png","/images/switch_science_port_press.png","/images/bg_memory_list_port.png","/images/scrollbar_bottom.png","/images/line_history_hor2px_land.png","/images/switch_single_land.png","/images/icon_300.png","/images/bt_blue_land_press.png","/images/bt_equals_port_press.png","/images/bt_dialogB_purple.png","/images/bt_white_port_press.png","/images/LineHorizontalBlackThick.png","/images/bt_black_port_press.png","/images/bg_display_memory_land.png","/images/bt_dialogB_purple_press.png","/images/bt_dialogA_purple.png","/images/bg_keyboard_port.png","/images/bt_history_exp_land_press.png","/images/bt_whiteA_land.png","/images/bg_display_land.png","/images/bt_blue_land.png","/images/bt_dialogA_purple_press.png","/images/bt_white_port.png","/images/switch_single_port_press.png","/images/bt_purple_land.png","/images/bt_blackSmall_land_press.png","/images/bt_blue_port.png","/images/bt_whiteA_port_press.png","/images/bg_land.png","/images/bt_purple_port.png","/images/bt_white_land_press.png","/images/ico_arrow_black.png","/images/switch_land_left_act.png","/images/bt_red_land_press.png","/images/bt_yellow_port_press.png","/images/bg_memory_slot_land.png","/images/bt_yellow_land.png","/images/switch_science_port.png","/images/bt_blackSmall_port_press.png","/images/bt_history_contr_port_press.png","/images/LineVertical19Black.png","/images/bt_whiteA_land_press.png","/images/ico_mem_list.png","/images/clear_memory.png","/images/bt_equals_port.png","/images/switch_science_land.png","/images/bt_grey_port.png","/images/bt_history_exp_land.png","/images/pencil_disable.png","/images/bg_history_land.png","/images/bt_red_port.png","/images/bg_port.png","/images/bt_whiteB_port.png","/images/bt_whiteB_land.png","/images/bt_history_contr_port.png","/images/switch_single_land_act.png","/images/line_history_hor4px_port.png","/images/line_display_land.png","/images/bt_purple_land_press.png","/images/ico_back.png","/images/bt_yellow_land_press.png","/images/clear_memory_press.png","/images/line_history_hor4px_land.png","/images/LineHorizontalBlack.png","/images/bg_memory_note.png","/images/bt_whiteB_land_press.png","/images/bt_purple_port_press.png","/images/bt_red_land.png","/images/switch_single_land_press.png","/images/ico_arrow_grey.png","/images/switch_port_right_act.png","/images/bt_grey_land.png","/images/bt_bin_press.png","/images/LineVertical38Black.png","/images/pencil_press.png","/images/switch_science_land_act.png","/images/bt_whiteB_port_press.png","/images/bt_history_contr_land.png","/images/bt_dialogA_black_press.png","/images/bg_keyboard_land.png","/images/bt_black_land.png","/images/bt_history_exp_port.png","/images/bt_whiteA_port.png","/images/clear_memory_disable.png","/images/bg_history_port.png","/images/clear_text_press.png","/images/bt_history_exp_port_press.png","/images/bt_dialogB_blacks.png","/images/bt_red_port_press.png","/images/switch_single_port.png","/images/bg_memory_list_land.png","/images/bt_equals_land.png","/images/switch_port_press.png","/images/bg_display_port.png","/images/bg_dialog.png","/images/ico_arrow_white.png","/images/switch_land_right_act.png","/images/bt_equals_land_press.png","/images/clear_text.png","/images/bt_blue_port_press.png","/images/bg_display_memory_port.png","/images/bt_blackSmall_port.png","/images/bt_black_port.png","/images/switch_science_port_act.png","/images/switch_single_port_act.png","/images/bt_mem_list_land.png","/images/line_history_vert_land.png","/images/bt_blackSmall_land.png","/images/bt_dialogB_black_press.png","/images/bt_bin.png","/images/bt_dialogA_black.png","/images/line_history_hor2px_port.png","/images/bt_mem_list_land_press.png","/images/line_display_port.png","/images/switch_land_press.png","/images/switch_port_left_act.png","/images/line_keyboard_land.png","/images/line_keyboard_port.png","/images/line_history_vert_port.png","/images/scrollbar_top.png","/images/bg_memory_slot_port.png","/images/scrollbar_middle.png","/images/bt_black_land_press.png","/images/pencil.png","/images/bt_white_land.png","/images/bt_history_contr_land_press.png","/lazy.html"];document.addEventListener("WebComponentsReady",function(){document.querySelector("platinum-sw-cache").precache=a})}},function(){var b=document.createElement("link");b.setAttribute("rel","stylesheet"),b.setAttribute("media","all and (orientation:landscape)"),b.setAttribute("href","css/lazy_landscape.css"),a.queueAppendChild(document.head,b),b=document.createElement("link"),b.setAttribute("rel","stylesheet"),b.setAttribute("media","all and (orientation:portrait)"),b.setAttribute("href","css/lazy_portrait.css"),a.queueAppendChild(document.head,b),Calculator.registerOrientationChange(),fetch("lazy.html").then(function(a){return a.text()}).then(function(b){var c=[{type:"script",file:"lib/webcomponentsjs/webcomponents-lite.min.js",success:function(b){var c=["lib/platinum-sw/platinum-sw-register.html","lib/platinum-sw/platinum-sw-cache.html"],d=[];c.forEach(function(a){var b=document.createElement("link");b.setAttribute("rel","import"),b.setAttribute("href",a),d.push(b)}),d.forEach(function(b){a.queueAppendChild(document.head,b)}),Calculator.fillServiceWorkerCache(),b()}},{type:"script",file:"lib/pegjs/peg-0.9.0.min.js",success:function(a){fetch("data/peg-code.txt").then(function(a){return a.text()}).then(function(b){try{Calculator.parser=PEG.buildParser(b),a()}catch(c){console&&console.log&&console.log(c.message)}})}},{type:"script",file:"js/license.js",success:function(a){licenseInit("license","background"),document.getElementById("licensebtnl").addEventListener("mousedown",function(){Calculator.buttonClickAudio.play()}),document.getElementById("licensebtnq").addEventListener("mousedown",function(){Calculator.buttonClickAudio.play()}),a()}},{type:"script",file:"js/help.js",success:function(a){helpInit("home_help","help_"),document.getElementById("home_help").addEventListener("mousedown",function(){Calculator.buttonClickAudio.play()}),document.getElementById("help_close").addEventListener("mousedown",function(){Calculator.buttonClickAudio.play()}),a()}},{type:"script",file:"js/localizer.js",success:function(a){Calculator.localizer=new Localizer,Calculator.localizer.localizeHtmlElements(),a()}},{type:"script",file:"lib/iscroll/dist/iscroll-lite-min.js",success:function(a){Calculator.createScrollbars(),a()}}],d=[];document.body.innerHTML+=b,Calculator.registerMneClickHandlers();for(var e=function(a,b){return function(){a(b)}},f=function(b){return new Promise(function(d){var f=void 0;"script"===c[b].type&&(f=document.createElement("script"),f.onload=e(c[b].success,d),f.setAttribute("src",c[b].file)),a.queueAppendChild(document.head,f)})},g=0;g<c.length;g++)d.push(f(g));Promise.all(d).then(function(){Calculator.initButtons(),Calculator.setMainEntry(""),Calculator.setCurrentFormula(""),Calculator.transitionToDegrees(),Calculator.transitionToTrigonometricFunctions(),Calculator.equalPressed=!1,Calculator.populateMemoryPaneFromLocalStorage(),Calculator.populateHistoryPaneFromLocalStorage(),Calculator.registerInlineHandlers();for(var b=document.querySelectorAll("button"),c=0;c<b.length;c++)b[c].disabled=!1;a.maximiseBody()},function(){console&&console.error&&console.error("something wrong with promises")})})}()}();
//# sourceMappingURL=calc.js.map