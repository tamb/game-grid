// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

(function (modules, entry, mainEntry, parcelRequireName, globalName) {
  /* eslint-disable no-undef */
  var globalObject =
    typeof globalThis !== 'undefined'
      ? globalThis
      : typeof self !== 'undefined'
      ? self
      : typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined'
      ? global
      : {};
  /* eslint-enable no-undef */

  // Save the require from previous bundle to this closure if any
  var previousRequire =
    typeof globalObject[parcelRequireName] === 'function' &&
    globalObject[parcelRequireName];

  var cache = previousRequire.cache || {};
  // Do not use `require` to prevent Webpack from trying to bundle this call
  var nodeRequire =
    typeof module !== 'undefined' &&
    typeof module.require === 'function' &&
    module.require.bind(module);

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire =
          typeof globalObject[parcelRequireName] === 'function' &&
          globalObject[parcelRequireName];
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error("Cannot find module '" + name + "'");
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = (cache[name] = new newRequire.Module(name));

      modules[name][0].call(
        module.exports,
        localRequire,
        module,
        module.exports,
        this
      );
    }

    return cache[name].exports;

    function localRequire(x) {
      var res = localRequire.resolve(x);
      return res === false ? {} : newRequire(res);
    }

    function resolve(x) {
      var id = modules[name][1][x];
      return id != null ? id : x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [
      function (require, module) {
        module.exports = exports;
      },
      {},
    ];
  };

  Object.defineProperty(newRequire, 'root', {
    get: function () {
      return globalObject[parcelRequireName];
    },
  });

  globalObject[parcelRequireName] = newRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (mainEntry) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(mainEntry);

    // CommonJS
    if (typeof exports === 'object' && typeof module !== 'undefined') {
      module.exports = mainExports;

      // RequireJS
    } else if (typeof define === 'function' && define.amd) {
      define(function () {
        return mainExports;
      });

      // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }
})({"cbjdT":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "26170a8763aff760";
"use strict";
/* global HMR_HOST, HMR_PORT, HMR_ENV_HASH, HMR_SECURE, chrome, browser, __parcel__import__, __parcel__importScripts__, ServiceWorkerGlobalScope */ /*::
import type {
  HMRAsset,
  HMRMessage,
} from '@parcel/reporter-dev-server/src/HMRServer.js';
interface ParcelRequire {
  (string): mixed;
  cache: {|[string]: ParcelModule|};
  hotData: {|[string]: mixed|};
  Module: any;
  parent: ?ParcelRequire;
  isParcelRequire: true;
  modules: {|[string]: [Function, {|[string]: string|}]|};
  HMR_BUNDLE_ID: string;
  root: ParcelRequire;
}
interface ParcelModule {
  hot: {|
    data: mixed,
    accept(cb: (Function) => void): void,
    dispose(cb: (mixed) => void): void,
    // accept(deps: Array<string> | string, cb: (Function) => void): void,
    // decline(): void,
    _acceptCallbacks: Array<(Function) => void>,
    _disposeCallbacks: Array<(mixed) => void>,
  |};
}
interface ExtensionContext {
  runtime: {|
    reload(): void,
    getURL(url: string): string;
    getManifest(): {manifest_version: number, ...};
  |};
}
declare var module: {bundle: ParcelRequire, ...};
declare var HMR_HOST: string;
declare var HMR_PORT: string;
declare var HMR_ENV_HASH: string;
declare var HMR_SECURE: boolean;
declare var chrome: ExtensionContext;
declare var browser: ExtensionContext;
declare var __parcel__import__: (string) => Promise<void>;
declare var __parcel__importScripts__: (string) => Promise<void>;
declare var globalThis: typeof self;
declare var ServiceWorkerGlobalScope: Object;
*/ var OVERLAY_ID = "__parcel__error__overlay__";
var OldModule = module.bundle.Module;
function Module(moduleName) {
    OldModule.call(this, moduleName);
    this.hot = {
        data: module.bundle.hotData[moduleName],
        _acceptCallbacks: [],
        _disposeCallbacks: [],
        accept: function(fn) {
            this._acceptCallbacks.push(fn || function() {});
        },
        dispose: function(fn) {
            this._disposeCallbacks.push(fn);
        }
    };
    module.bundle.hotData[moduleName] = undefined;
}
module.bundle.Module = Module;
module.bundle.hotData = {};
var checkedAssets /*: {|[string]: boolean|} */ , assetsToDispose /*: Array<[ParcelRequire, string]> */ , assetsToAccept /*: Array<[ParcelRequire, string]> */ ;
function getHostname() {
    return HMR_HOST || (location.protocol.indexOf("http") === 0 ? location.hostname : "localhost");
}
function getPort() {
    return HMR_PORT || location.port;
}
// eslint-disable-next-line no-redeclare
var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== "undefined") {
    var hostname = getHostname();
    var port = getPort();
    var protocol = HMR_SECURE || location.protocol == "https:" && !/localhost|127.0.0.1|0.0.0.0/.test(hostname) ? "wss" : "ws";
    var ws;
    try {
        ws = new WebSocket(protocol + "://" + hostname + (port ? ":" + port : "") + "/");
    } catch (err) {
        if (err.message) console.error(err.message);
        ws = {};
    }
    // Web extension context
    var extCtx = typeof browser === "undefined" ? typeof chrome === "undefined" ? null : chrome : browser;
    // Safari doesn't support sourceURL in error stacks.
    // eval may also be disabled via CSP, so do a quick check.
    var supportsSourceURL = false;
    try {
        (0, eval)('throw new Error("test"); //# sourceURL=test.js');
    } catch (err) {
        supportsSourceURL = err.stack.includes("test.js");
    }
    // $FlowFixMe
    ws.onmessage = async function(event /*: {data: string, ...} */ ) {
        checkedAssets = {} /*: {|[string]: boolean|} */ ;
        assetsToAccept = [];
        assetsToDispose = [];
        var data /*: HMRMessage */  = JSON.parse(event.data);
        if (data.type === "update") {
            // Remove error overlay if there is one
            if (typeof document !== "undefined") removeErrorOverlay();
            let assets = data.assets.filter((asset)=>asset.envHash === HMR_ENV_HASH);
            // Handle HMR Update
            let handled = assets.every((asset)=>{
                return asset.type === "css" || asset.type === "js" && hmrAcceptCheck(module.bundle.root, asset.id, asset.depsByBundle);
            });
            if (handled) {
                console.clear();
                // Dispatch custom event so other runtimes (e.g React Refresh) are aware.
                if (typeof window !== "undefined" && typeof CustomEvent !== "undefined") window.dispatchEvent(new CustomEvent("parcelhmraccept"));
                await hmrApplyUpdates(assets);
                // Dispose all old assets.
                let processedAssets = {} /*: {|[string]: boolean|} */ ;
                for(let i = 0; i < assetsToDispose.length; i++){
                    let id = assetsToDispose[i][1];
                    if (!processedAssets[id]) {
                        hmrDispose(assetsToDispose[i][0], id);
                        processedAssets[id] = true;
                    }
                }
                // Run accept callbacks. This will also re-execute other disposed assets in topological order.
                processedAssets = {};
                for(let i = 0; i < assetsToAccept.length; i++){
                    let id = assetsToAccept[i][1];
                    if (!processedAssets[id]) {
                        hmrAccept(assetsToAccept[i][0], id);
                        processedAssets[id] = true;
                    }
                }
            } else fullReload();
        }
        if (data.type === "error") {
            // Log parcel errors to console
            for (let ansiDiagnostic of data.diagnostics.ansi){
                let stack = ansiDiagnostic.codeframe ? ansiDiagnostic.codeframe : ansiDiagnostic.stack;
                console.error("\uD83D\uDEA8 [parcel]: " + ansiDiagnostic.message + "\n" + stack + "\n\n" + ansiDiagnostic.hints.join("\n"));
            }
            if (typeof document !== "undefined") {
                // Render the fancy html overlay
                removeErrorOverlay();
                var overlay = createErrorOverlay(data.diagnostics.html);
                // $FlowFixMe
                document.body.appendChild(overlay);
            }
        }
    };
    ws.onerror = function(e) {
        if (e.message) console.error(e.message);
    };
    ws.onclose = function() {
        console.warn("[parcel] \uD83D\uDEA8 Connection to the HMR server was lost");
    };
}
function removeErrorOverlay() {
    var overlay = document.getElementById(OVERLAY_ID);
    if (overlay) {
        overlay.remove();
        console.log("[parcel] \u2728 Error resolved");
    }
}
function createErrorOverlay(diagnostics) {
    var overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    let errorHTML = '<div style="background: black; opacity: 0.85; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; font-family: Menlo, Consolas, monospace; z-index: 9999;">';
    for (let diagnostic of diagnostics){
        let stack = diagnostic.frames.length ? diagnostic.frames.reduce((p, frame)=>{
            return `${p}
<a href="/__parcel_launch_editor?file=${encodeURIComponent(frame.location)}" style="text-decoration: underline; color: #888" onclick="fetch(this.href); return false">${frame.location}</a>
${frame.code}`;
        }, "") : diagnostic.stack;
        errorHTML += `
      <div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 20px;">
          \u{1F6A8} ${diagnostic.message}
        </div>
        <pre>${stack}</pre>
        <div>
          ${diagnostic.hints.map((hint)=>"<div>\uD83D\uDCA1 " + hint + "</div>").join("")}
        </div>
        ${diagnostic.documentation ? `<div>\u{1F4DD} <a style="color: violet" href="${diagnostic.documentation}" target="_blank">Learn more</a></div>` : ""}
      </div>
    `;
    }
    errorHTML += "</div>";
    overlay.innerHTML = errorHTML;
    return overlay;
}
function fullReload() {
    if ("reload" in location) location.reload();
    else if (extCtx && extCtx.runtime && extCtx.runtime.reload) extCtx.runtime.reload();
}
function getParents(bundle, id) /*: Array<[ParcelRequire, string]> */ {
    var modules = bundle.modules;
    if (!modules) return [];
    var parents = [];
    var k, d, dep;
    for(k in modules)for(d in modules[k][1]){
        dep = modules[k][1][d];
        if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) parents.push([
            bundle,
            k
        ]);
    }
    if (bundle.parent) parents = parents.concat(getParents(bundle.parent, id));
    return parents;
}
function updateLink(link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var newLink = link.cloneNode();
    newLink.onload = function() {
        if (link.parentNode !== null) // $FlowFixMe
        link.parentNode.removeChild(link);
    };
    newLink.setAttribute("href", // $FlowFixMe
    href.split("?")[0] + "?" + Date.now());
    // $FlowFixMe
    link.parentNode.insertBefore(newLink, link.nextSibling);
}
var cssTimeout = null;
function reloadCSS() {
    if (cssTimeout) return;
    cssTimeout = setTimeout(function() {
        var links = document.querySelectorAll('link[rel="stylesheet"]');
        for(var i = 0; i < links.length; i++){
            // $FlowFixMe[incompatible-type]
            var href /*: string */  = links[i].getAttribute("href");
            var hostname = getHostname();
            var servedFromHMRServer = hostname === "localhost" ? new RegExp("^(https?:\\/\\/(0.0.0.0|127.0.0.1)|localhost):" + getPort()).test(href) : href.indexOf(hostname + ":" + getPort());
            var absolute = /^https?:\/\//i.test(href) && href.indexOf(location.origin) !== 0 && !servedFromHMRServer;
            if (!absolute) updateLink(links[i]);
        }
        cssTimeout = null;
    }, 50);
}
function hmrDownload(asset) {
    if (asset.type === "js") {
        if (typeof document !== "undefined") {
            let script = document.createElement("script");
            script.src = asset.url + "?t=" + Date.now();
            if (asset.outputFormat === "esmodule") script.type = "module";
            return new Promise((resolve, reject)=>{
                var _document$head;
                script.onload = ()=>resolve(script);
                script.onerror = reject;
                (_document$head = document.head) === null || _document$head === void 0 || _document$head.appendChild(script);
            });
        } else if (typeof importScripts === "function") {
            // Worker scripts
            if (asset.outputFormat === "esmodule") return import(asset.url + "?t=" + Date.now());
            else return new Promise((resolve, reject)=>{
                try {
                    importScripts(asset.url + "?t=" + Date.now());
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        }
    }
}
async function hmrApplyUpdates(assets) {
    global.parcelHotUpdate = Object.create(null);
    let scriptsToRemove;
    try {
        // If sourceURL comments aren't supported in eval, we need to load
        // the update from the dev server over HTTP so that stack traces
        // are correct in errors/logs. This is much slower than eval, so
        // we only do it if needed (currently just Safari).
        // https://bugs.webkit.org/show_bug.cgi?id=137297
        // This path is also taken if a CSP disallows eval.
        if (!supportsSourceURL) {
            let promises = assets.map((asset)=>{
                var _hmrDownload;
                return (_hmrDownload = hmrDownload(asset)) === null || _hmrDownload === void 0 ? void 0 : _hmrDownload.catch((err)=>{
                    // Web extension fix
                    if (extCtx && extCtx.runtime && extCtx.runtime.getManifest().manifest_version == 3 && typeof ServiceWorkerGlobalScope != "undefined" && global instanceof ServiceWorkerGlobalScope) {
                        extCtx.runtime.reload();
                        return;
                    }
                    throw err;
                });
            });
            scriptsToRemove = await Promise.all(promises);
        }
        assets.forEach(function(asset) {
            hmrApply(module.bundle.root, asset);
        });
    } finally{
        delete global.parcelHotUpdate;
        if (scriptsToRemove) scriptsToRemove.forEach((script)=>{
            if (script) {
                var _document$head2;
                (_document$head2 = document.head) === null || _document$head2 === void 0 || _document$head2.removeChild(script);
            }
        });
    }
}
function hmrApply(bundle /*: ParcelRequire */ , asset /*:  HMRAsset */ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (asset.type === "css") reloadCSS();
    else if (asset.type === "js") {
        let deps = asset.depsByBundle[bundle.HMR_BUNDLE_ID];
        if (deps) {
            if (modules[asset.id]) {
                // Remove dependencies that are removed and will become orphaned.
                // This is necessary so that if the asset is added back again, the cache is gone, and we prevent a full page reload.
                let oldDeps = modules[asset.id][1];
                for(let dep in oldDeps)if (!deps[dep] || deps[dep] !== oldDeps[dep]) {
                    let id = oldDeps[dep];
                    let parents = getParents(module.bundle.root, id);
                    if (parents.length === 1) hmrDelete(module.bundle.root, id);
                }
            }
            if (supportsSourceURL) // Global eval. We would use `new Function` here but browser
            // support for source maps is better with eval.
            (0, eval)(asset.output);
            // $FlowFixMe
            let fn = global.parcelHotUpdate[asset.id];
            modules[asset.id] = [
                fn,
                deps
            ];
        } else if (bundle.parent) hmrApply(bundle.parent, asset);
    }
}
function hmrDelete(bundle, id) {
    let modules = bundle.modules;
    if (!modules) return;
    if (modules[id]) {
        // Collect dependencies that will become orphaned when this module is deleted.
        let deps = modules[id][1];
        let orphans = [];
        for(let dep in deps){
            let parents = getParents(module.bundle.root, deps[dep]);
            if (parents.length === 1) orphans.push(deps[dep]);
        }
        // Delete the module. This must be done before deleting dependencies in case of circular dependencies.
        delete modules[id];
        delete bundle.cache[id];
        // Now delete the orphans.
        orphans.forEach((id)=>{
            hmrDelete(module.bundle.root, id);
        });
    } else if (bundle.parent) hmrDelete(bundle.parent, id);
}
function hmrAcceptCheck(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    if (hmrAcceptCheckOne(bundle, id, depsByBundle)) return true;
    // Traverse parents breadth first. All possible ancestries must accept the HMR update, or we'll reload.
    let parents = getParents(module.bundle.root, id);
    let accepted = false;
    while(parents.length > 0){
        let v = parents.shift();
        let a = hmrAcceptCheckOne(v[0], v[1], null);
        if (a) // If this parent accepts, stop traversing upward, but still consider siblings.
        accepted = true;
        else {
            // Otherwise, queue the parents in the next level upward.
            let p = getParents(module.bundle.root, v[1]);
            if (p.length === 0) {
                // If there are no parents, then we've reached an entry without accepting. Reload.
                accepted = false;
                break;
            }
            parents.push(...p);
        }
    }
    return accepted;
}
function hmrAcceptCheckOne(bundle /*: ParcelRequire */ , id /*: string */ , depsByBundle /*: ?{ [string]: { [string]: string } }*/ ) {
    var modules = bundle.modules;
    if (!modules) return;
    if (depsByBundle && !depsByBundle[bundle.HMR_BUNDLE_ID]) {
        // If we reached the root bundle without finding where the asset should go,
        // there's nothing to do. Mark as "accepted" so we don't reload the page.
        if (!bundle.parent) return true;
        return hmrAcceptCheck(bundle.parent, id, depsByBundle);
    }
    if (checkedAssets[id]) return true;
    checkedAssets[id] = true;
    var cached = bundle.cache[id];
    assetsToDispose.push([
        bundle,
        id
    ]);
    if (!cached || cached.hot && cached.hot._acceptCallbacks.length) {
        assetsToAccept.push([
            bundle,
            id
        ]);
        return true;
    }
}
function hmrDispose(bundle /*: ParcelRequire */ , id /*: string */ ) {
    var cached = bundle.cache[id];
    bundle.hotData[id] = {};
    if (cached && cached.hot) cached.hot.data = bundle.hotData[id];
    if (cached && cached.hot && cached.hot._disposeCallbacks.length) cached.hot._disposeCallbacks.forEach(function(cb) {
        cb(bundle.hotData[id]);
    });
    delete bundle.cache[id];
}
function hmrAccept(bundle /*: ParcelRequire */ , id /*: string */ ) {
    // Execute the module.
    bundle(id);
    // Run the accept callbacks in the new version of the module.
    var cached = bundle.cache[id];
    if (cached && cached.hot && cached.hot._acceptCallbacks.length) cached.hot._acceptCallbacks.forEach(function(cb) {
        var assetsToAlsoAccept = cb(function() {
            return getParents(module.bundle.root, id);
        });
        if (assetsToAlsoAccept && assetsToAccept.length) {
            assetsToAlsoAccept.forEach(function(a) {
                hmrDispose(a[0], a[1]);
            });
            // $FlowFixMe[method-unbinding]
            assetsToAccept.push.apply(assetsToAccept, assetsToAlsoAccept);
        }
    });
}

},{}],"adjPd":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
var _mainJs = require("./../../dist/main.js");
var _mainJsDefault = parcelHelpers.interopDefault(_mainJs);
var _eventListenersJs = require("./eventListeners.js");
const tileTypeEnum = {
    OPEN: "open",
    INTERACTIVE: "interactive",
    BARRIER: "barrier"
};
const matrix = [
    [
        {
            type: tileTypeEnum.OPEN,
            cellAttributes: [
                [
                    "data-butt",
                    "sauce"
                ],
                [
                    "class",
                    "butt booty butty"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.INTERACTIVE,
            cellAttributes: [
                [
                    "data-cell-type",
                    "interactive"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        }
    ],
    [
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.BARRIER,
            cellAttributes: [
                [
                    "data-cell-type",
                    "barrier"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        }
    ],
    [
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.BARRIER,
            cellAttributes: [
                [
                    "data-cell-type",
                    "barrier"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        }
    ],
    [
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.BARRIER,
            cellAttributes: [
                [
                    "data-cell-type",
                    "barrier"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        }
    ],
    [
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.BARRIER,
            cellAttributes: [
                [
                    "data-cell-type",
                    "barrier"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        }
    ],
    [
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.BARRIER,
            cellAttributes: [
                [
                    "data-cell-type",
                    "barrier"
                ]
            ]
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        },
        {
            type: tileTypeEnum.OPEN
        }
    ]
];
function createGrid() {
    console.log("building grid");
    return new (0, _mainJsDefault.default)("#grid", {
        matrix,
        options: {
            infinite_y: true,
            infinite_x: true,
            clickable: true,
            arrow_controls: true,
            wasd_controls: true,
            callbacks: {
                LIMIT: function(x) {
                    console.log("callback for LIMIT", x);
                },
                WRAP_Y: function(x) {
                    console.log("callback WRAP_Y", x);
                }
            }
        }
    });
}
document.addEventListener("DOMContentLoaded", function() {
    const grid = createGrid();
    console.log(grid);
    grid.render();
    (0, _eventListenersJs.attachListeners)();
});

},{"./../../dist/main.js":"lYAoy","./eventListeners.js":"dUFOH","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lYAoy":[function(require,module,exports) {
(function(global, factory) {
    factory(exports);
})(this, function(exports1) {
    "use strict";
    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol */ var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for(var s, i = 1, n = arguments.length; i < n; i++){
                s = arguments[i];
                for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) {
            for(var i = 0, l = from.length, ar; i < l; i++)if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }
    typeof SuppressedError === "function" && SuppressedError;
    function styleInject(css, ref) {
        if (ref === void 0) ref = {};
        var insertAt = ref.insertAt;
        if (!css || typeof document === "undefined") return;
        var head = document.head || document.getElementsByTagName("head")[0];
        var style = document.createElement("style");
        style.type = "text/css";
        if (insertAt === "top") {
            if (head.firstChild) head.insertBefore(style, head.firstChild);
            else head.appendChild(style);
        } else head.appendChild(style);
        if (style.styleSheet) style.styleSheet.cssText = css;
        else style.appendChild(document.createTextNode(css));
    }
    var css_248z = '.gamegrid * {\n  box-sizing: border-box;\n}\n.gamegrid__stage {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  flex-wrap: wrap;\n  box-sizing: border-box;\n  border: 1px solid;\n}\n.gamegrid__row {\n  display: flex;\n  flex-basis: 100%;\n  max-width: 100%;\n  box-sizing: border-box;\n}\n.gamegrid__cell {\n  flex: 1 0 auto;\n  height: auto;\n  overflow: hidden;\n  box-sizing: border-box;\n  border: 1px solid;\n}\n.gamegrid__cell--active {\n  outline: 4px solid red;\n}\n.gamegrid__cell::before {\n  content: "";\n  float: left;\n  padding-top: 100%;\n}';
    styleInject(css_248z);
    const gridEventsEnum = {
        RENDERED: "gamegrid:grid:rendered",
        STATE_UPDATED: "gamegrid:state:updated",
        MOVE_LEFT: "gamegrid:move:left",
        MOVE_RIGHT: "gamegrid:move:right",
        MOVE_UP: "gamegrid:move:up",
        MOVE_DOWN: "gamegrid:move:down",
        MOVE_BLOCKED: "gamegrid:move:blocked",
        MOVE_COLLISION: "gamegrid:move:collide",
        MOVE_DETTACH: "gamegrid:move:dettach",
        MOVE_LAND: "gamegrid:move:land",
        LIMIT: "gamegrid:move:limit",
        LIMIT_X: "gamegrid:move:limit:x",
        LIMIT_Y: "gamegrid:move:limit:y",
        WRAP: "gamegrid:move:wrap",
        WRAP_X: "gamegrid:move:wrap:x",
        WRAP_Y: "gamegrid:move:wrap:y"
    };
    function getKeyByValue(object, value) {
        return Object.keys(object).find(function(key) {
            return object[key] === value;
        });
    }
    function renderAttributes(el, tuples) {
        tuples.forEach(function(tuple) {
            var _a;
            if (tuple[0] === "class") (_a = el.classList).add.apply(_a, tuple[1].split(" "));
            else el.setAttribute(tuple[0], tuple[1]);
        });
    }
    function fireCustomEvent(eventName, data) {
        window.dispatchEvent(new CustomEvent(eventName, {
            detail: __assign(__assign({}, data), {
                game_grid_instance: this
            }),
            bubbles: true
        }));
        if (this.options.callbacks) this.options.callbacks[getKeyByValue(gridEventsEnum, eventName)] && this.options.callbacks[getKeyByValue(gridEventsEnum, eventName)](this);
    }
    var INITIAL_STATE = {
        active_coords: [
            0,
            0
        ],
        prev_coords: [
            0,
            0
        ],
        current_direction: "",
        rendered: false,
        moves: [
            [
                0,
                0
            ]
        ]
    };
    var DIRECTIONS = {
        UP: "up",
        DOWN: "down",
        LEFT: "left",
        RIGHT: "right"
    };
    var HtmlGameGrid = /** @class */ function() {
        function HtmlGameGrid(query, config) {
            this.options = __assign({
                active_class: "gamegrid__cell--active",
                arrow_controls: true,
                wasd_controls: true,
                infinite_x: true,
                infinite_y: true,
                clickable: true,
                rewind_limit: 20,
                block_on_type: [
                    "barrier"
                ],
                collide_on_type: [
                    "interactive"
                ],
                move_on_type: [
                    "open"
                ]
            }, config.options);
            this.refs = {
                container: document.querySelector(query),
                rows: [],
                cells: []
            };
            this.matrix = config.matrix;
            this.state = __assign(__assign({}, INITIAL_STATE), config.state);
            this.containerFocus = this.containerFocus.bind(this);
            this.containerBlur = this.containerBlur.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleCellClick = this.handleCellClick.bind(this);
            this.render = this.render.bind(this);
            this.attachHandlers = this.attachHandlers.bind(this);
        }
        // API
        HtmlGameGrid.prototype.getOptions = function() {
            return this.options;
        };
        HtmlGameGrid.prototype.setOptions = function(newOptions) {
            this.options = __assign(__assign({}, this.options), newOptions);
        };
        HtmlGameGrid.prototype.getRefs = function() {
            return this.refs;
        };
        HtmlGameGrid.prototype.destroy = function() {
            this.state.rendered && this.dettachHandlers();
            this.refs = __assign(__assign({}, this.refs), {
                rows: [],
                cells: []
            });
        };
        HtmlGameGrid.prototype.getState = function() {
            return this.state;
        };
        HtmlGameGrid.prototype.moveLeft = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0],
                    this.state.active_coords[1] - 1
                ],
                current_direction: DIRECTIONS.LEFT
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_LEFT);
            this.finishMove();
        };
        HtmlGameGrid.prototype.moveUp = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0] - 1,
                    this.state.active_coords[1]
                ],
                current_direction: DIRECTIONS.UP
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_UP);
            this.finishMove();
        };
        HtmlGameGrid.prototype.moveRight = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0],
                    this.state.active_coords[1] + 1
                ],
                current_direction: DIRECTIONS.RIGHT
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_RIGHT);
            this.finishMove();
        };
        HtmlGameGrid.prototype.moveDown = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0] + 1,
                    this.state.active_coords[1]
                ],
                current_direction: DIRECTIONS.DOWN
            });
            fireCustomEvent.call(this, gridEventsEnum.MOVE_DOWN);
            this.finishMove();
        };
        HtmlGameGrid.prototype.setMatrix = function(m) {
            this.matrix = m;
        };
        HtmlGameGrid.prototype.getMatrix = function() {
            return this.matrix;
        };
        HtmlGameGrid.prototype.setStateSync = function(obj) {
            var newState = __assign(__assign({}, this.state), obj);
            this.state = newState;
            fireCustomEvent.call(this, gridEventsEnum.STATE_UPDATED);
        };
        HtmlGameGrid.prototype.render = function() {
            var _this = this;
            this.refs.container.classList.add("gamegrid");
            this.refs.container.setAttribute("tabindex", "0");
            this.refs.container.setAttribute("data-gamegrid-ref", "container");
            var grid = document.createDocumentFragment();
            this.matrix.forEach(function(rowData, rI) {
                var row = document.createElement("div");
                _this.options.row_class && row.classList.add(_this.options.row_class);
                row.setAttribute("data-gamegrid-row-index", rI.toString());
                row.setAttribute("data-gamegrid-ref", "row");
                row.classList.add("gamegrid__row");
                _this.refs.cells.push([]);
                rowData.forEach(function(cellData, cI) {
                    var _a;
                    var cell = document.createElement("div");
                    renderAttributes(cell, [
                        [
                            "data-gamegrid-ref",
                            "cell"
                        ],
                        [
                            "data-gamegrid-row-index",
                            rI.toString()
                        ],
                        [
                            "data-gamegrid-col-index",
                            cI.toString()
                        ],
                        [
                            "data-gamegrid-coords",
                            "".concat(rI, ",").concat(cI)
                        ]
                    ]);
                    cell.style.width = "".concat(100 / rowData.length, "%");
                    (_a = cellData.cellAttributes) === null || _a === void 0 || _a.forEach(function(attr) {
                        cell.setAttribute(attr[0], attr[1]);
                    });
                    cell.classList.add("gamegrid__cell");
                    cell.setAttribute("tabindex", _this.options.clickable ? "0" : "-1");
                    if (cellData.renderFunction) cell.appendChild(cellData.renderFunction());
                    row.appendChild(cell);
                    _this.refs.cells[rI].push(cell);
                });
                _this.refs.rows.push(row);
                grid.appendChild(row);
            });
            this.refs.container.appendChild(grid);
            this.setStateSync({
                rendered: true
            });
            this.attachHandlers();
            fireCustomEvent.call(this, gridEventsEnum.RENDERED);
        };
        HtmlGameGrid.prototype.setFocusToCell = function(row, col) {
            var _a, _b;
            var cells = this.getRefs().cells;
            if (typeof row === "number" && typeof col === "number") {
                cells[row][col].focus();
                this.removeActiveClasses();
                cells[row][col].classList.add("gamegrid__cell--active");
                this.setStateSync({
                    active_coords: [
                        row,
                        col
                    ]
                });
            } else {
                (_a = this.getActiveCell()) === null || _a === void 0 || _a.focus();
                this.removeActiveClasses();
                (_b = this.getActiveCell()) === null || _b === void 0 || _b.classList.add("gamegrid__cell--active");
            }
        };
        HtmlGameGrid.prototype.setFocusToContainer = function() {
            this.getRefs().container.focus();
        };
        HtmlGameGrid.prototype.getActiveCell = function() {
            return this.getRefs().cells[this.state.active_coords[0]][this.state.active_coords[1]];
        };
        HtmlGameGrid.prototype.removeActiveClasses = function() {
            this.getRefs().cells.forEach(function(cellRow) {
                cellRow.forEach(function(cell) {
                    cell.classList.remove("gamegrid__cell--active");
                });
            });
        };
        HtmlGameGrid.prototype.addToMoves = function() {
            var clonedMoves = __spreadArray([], this.getState().moves, true);
            clonedMoves.unshift(this.state.active_coords);
            if (clonedMoves.length > this.options.rewind_limit) clonedMoves.shift();
            this.setStateSync({
                moves: clonedMoves
            });
        };
        HtmlGameGrid.prototype.testLimit = function() {
            // use state direction, and state active coords
            var row = this.state.next_coords[0];
            var col = this.state.next_coords[1];
            var rowFinalIndex = this.matrix.length - 1;
            var colFinalIndex = this.matrix[this.state.active_coords[0]].length - 1; // todo: test for variable col length
            switch(this.state.current_direction){
                case DIRECTIONS.DOWN:
                    if (this.state.next_coords[0] > rowFinalIndex) {
                        if (!this.options.infinite_y) {
                            row = rowFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_Y);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        } else {
                            row = 0;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        }
                    }
                    break;
                case DIRECTIONS.LEFT:
                    if (this.state.next_coords[1] < 0) {
                        if (this.options.infinite_x) {
                            col = colFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        } else {
                            col = 0;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_X);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        }
                    }
                    break;
                case DIRECTIONS.RIGHT:
                    if (this.state.next_coords[1] > colFinalIndex) {
                        if (!this.options.infinite_x) {
                            col = colFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_X);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        } else {
                            col = 0;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_X);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        }
                    }
                    break;
                case DIRECTIONS.UP:
                    if (this.state.next_coords[0] < 0) {
                        if (this.options.infinite_y) {
                            row = rowFinalIndex;
                            fireCustomEvent.call(this, gridEventsEnum.WRAP_Y);
                            fireCustomEvent.call(this, gridEventsEnum.WRAP);
                        } else {
                            row = 0;
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT_Y);
                            fireCustomEvent.call(this, gridEventsEnum.LIMIT);
                        }
                    }
                    break;
            }
            this.setStateSync({
                next_coords: [
                    row,
                    col
                ],
                active_coords: [
                    row,
                    col
                ],
                prev_coords: this.state.active_coords
            });
        };
        HtmlGameGrid.prototype.testInteractive = function() {
            var _a;
            var coords = this.state.next_coords;
            if (((_a = this.matrix[coords[0]][coords[1]]) === null || _a === void 0 ? void 0 : _a.type) === "interactive") fireCustomEvent.call(this, gridEventsEnum.MOVE_COLLISION);
        };
        HtmlGameGrid.prototype.testBarrier = function() {
            var _a;
            var coords = this.state.next_coords;
            if (((_a = this.matrix[coords[0]][coords[1]]) === null || _a === void 0 ? void 0 : _a.type) === "barrier") {
                this.setStateSync({
                    active_coords: this.state.prev_coords,
                    prev_coords: this.state.active_coords
                });
                fireCustomEvent.call(this, gridEventsEnum.MOVE_BLOCKED);
            }
        };
        HtmlGameGrid.prototype.testSpace = function() {
            var _a;
            var coords = this.state.next_coords;
            if (((_a = this.matrix[coords[0]][coords[1]]) === null || _a === void 0 ? void 0 : _a.type) === "open") {
                if (this.matrix[this.state.prev_coords[0]][this.state.prev_coords[1]].type === "interactive") fireCustomEvent.call(this, gridEventsEnum.MOVE_DETTACH);
                fireCustomEvent.call(this, gridEventsEnum.MOVE_LAND);
            }
        };
        HtmlGameGrid.prototype.finishMove = function() {
            this.testLimit();
            this.testSpace();
            this.testInteractive();
            this.testBarrier();
            this.state.rendered && this.setFocusToCell();
            this.addToMoves();
        };
        HtmlGameGrid.prototype.handleDirection = function(event) {
            switch(event.code){
                case "ArrowLeft":
                    //left
                    this.moveLeft();
                    break;
                case "KeyA":
                    //left
                    this.moveLeft();
                    break;
                case "ArrowUp":
                    //up
                    this.moveUp();
                    break;
                case "KeyW":
                    //up
                    this.moveUp();
                    break;
                case "ArrowRight":
                    //right
                    this.moveRight();
                    break;
                case "KeyD":
                    //right
                    this.moveRight();
                    break;
                case "ArrowDown":
                    //down
                    this.moveDown();
                    break;
                case "KeyS":
                    //down
                    this.moveDown();
                    break;
            }
        };
        HtmlGameGrid.prototype.handleKeyDown = function(event) {
            if (this.options.arrow_controls) {
                if (event.code === "ArrowUp" || event.code === "ArrowRight" || event.code === "ArrowDown" || event.code === "ArrowLeft") {
                    event.preventDefault();
                    this.handleDirection(event);
                }
            }
            if (this.options.wasd_controls) {
                if (event.code === "KeyW" || event.code === "KeyD" || event.code === "KeyS" || event.code === "KeyA") {
                    event.preventDefault();
                    this.handleDirection(event);
                }
            }
        };
        HtmlGameGrid.prototype.handleCellClick = function(event) {
            if (this.getOptions().clickable) {
                if (event.target instanceof HTMLElement) {
                    var cellEl = event.target.closest('[data-gamegrid-ref="cell"]');
                    if (cellEl) {
                        var coords = cellEl.getAttribute("data-gamegrid-coords").split(",").map(function(n) {
                            return Number(n);
                        });
                        this.setFocusToCell.apply(this, coords);
                    } else this.setFocusToCell();
                }
            }
        };
        HtmlGameGrid.prototype.containerFocus = function() {
            this.getRefs().container.classList.add(this.options.active_class);
        };
        HtmlGameGrid.prototype.containerBlur = function() {
            this.getRefs().container.classList.remove(this.options.active_class);
        };
        // SET UP
        HtmlGameGrid.prototype.attachHandlers = function() {
            this.getRefs().container.addEventListener("keydown", this.handleKeyDown);
            this.getRefs().container.addEventListener("focus", this.containerFocus);
            this.getRefs().container.addEventListener("blur", this.containerBlur);
            this.getRefs().container.addEventListener("click", this.handleCellClick);
        };
        HtmlGameGrid.prototype.dettachHandlers = function() {
            this.getRefs().container.removeEventListener("keydown", this.handleKeyDown);
            this.getRefs().container.removeEventListener("focus", this.containerFocus);
            this.getRefs().container.removeEventListener("blur", this.containerBlur);
            this.getRefs().container.removeEventListener("click", this.handleCellClick);
        };
        return HtmlGameGrid;
    }();
    var gameGridEventsEnum = gridEventsEnum;
    exports1.default = HtmlGameGrid;
    exports1.gameGridEventsEnum = gameGridEventsEnum;
    Object.defineProperty(exports1, "__esModule", {
        value: true
    });
});

},{}],"dUFOH":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "attachListeners", ()=>attachListeners);
var _main = require("./../../dist/main");
function attachListeners() {
    Object.keys((0, _main.gameGridEventsEnum)).forEach((key)=>{
        const event = (0, _main.gameGridEventsEnum)[key];
        window.addEventListener(event, (e)=>{
            console.log("event", event, e);
            const eventSplit = event.split(":");
            const el = eventSplit[1] === "move" ? document.querySelector("#move-events ol") : document.querySelector("#state-events ol");
            const li = document.createElement("li");
            li.innerText = `${event} : ${e.timeStamp}`;
            el.appendChild(li);
        });
    });
}

},{"./../../dist/main":"lYAoy","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports) {
exports.interopDefault = function(a) {
    return a && a.__esModule ? a : {
        default: a
    };
};
exports.defineInteropFlag = function(a) {
    Object.defineProperty(a, "__esModule", {
        value: true
    });
};
exports.exportAll = function(source, dest) {
    Object.keys(source).forEach(function(key) {
        if (key === "default" || key === "__esModule" || Object.prototype.hasOwnProperty.call(dest, key)) return;
        Object.defineProperty(dest, key, {
            enumerable: true,
            get: function() {
                return source[key];
            }
        });
    });
    return dest;
};
exports.export = function(dest, destName, get) {
    Object.defineProperty(dest, destName, {
        enumerable: true,
        get: get
    });
};

},{}]},["cbjdT","adjPd"], "adjPd", "parcelRequiref536")

//# sourceMappingURL=index.63aff760.js.map
