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
})({"lzrsO":[function(require,module,exports) {
var global = arguments[3];
var HMR_HOST = null;
var HMR_PORT = null;
var HMR_SECURE = false;
var HMR_ENV_HASH = "d6ea1d42532a7575";
module.bundle.HMR_BUNDLE_ID = "2f0d2c2ed59795f0";
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

},{}],"a2QOe":[function(require,module,exports) {
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
        }
    ],
    [
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
        }
    ]
];
function createGrid() {
    console.log("building grid");
    return new (0, _mainJsDefault.default)({
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
    }, document.getElementById("grid"));
}
document.addEventListener("DOMContentLoaded", function() {
    (0, _eventListenersJs.attachListeners)();
    const grid = createGrid();
    console.log(grid);
});

},{"./../../dist/main.js":"lbDgN","./eventListeners.js":"bCsEQ","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"lbDgN":[function(require,module,exports) {
!function(t, e) {
    e(exports);
}(this, function(t) {
    "use strict";
    var e = function() {
        return e = Object.assign || function(t) {
            for(var e, i = 1, o = arguments.length; i < o; i++)for(var s in e = arguments[i])Object.prototype.hasOwnProperty.call(e, s) && (t[s] = e[s]);
            return t;
        }, e.apply(this, arguments);
    };
    function i(t, i) {
        window.dispatchEvent(new CustomEvent(t, {
            detail: e(e({}, i), {
                game_grid_instance: this
            }),
            bubbles: !0
        }));
    }
    "function" == typeof SuppressedError && SuppressedError;
    var o = {
        RENDERED: "gamegrid:grid:rendered",
        CREATED: "gamegrid:grid:created",
        DESTROYED: "gamegrid:grid:destroyed",
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
    }, s = {
        active_coords: [
            0,
            0
        ],
        prev_coords: [
            0,
            0
        ],
        next_coords: [],
        current_direction: "",
        rendered: !1,
        moves: [
            [
                0,
                0
            ]
        ]
    }, r = "up", n = "down", a = "left", c = "right", l = function() {
        function t(t, r) {
            void 0 === r && (r = null);
            var n = this;
            this.state = s, this.refs = {
                container: null,
                rows: [],
                cells: []
            }, this.handleKeyDown = function(t) {
                n.options.arrow_controls && ("ArrowUp" !== t.code && "ArrowRight" !== t.code && "ArrowDown" !== t.code && "ArrowLeft" !== t.code || (t.preventDefault(), n.handleDirection(t))), n.options.wasd_controls && ("KeyW" !== t.code && "KeyD" !== t.code && "KeyS" !== t.code && "KeyA" !== t.code || (t.preventDefault(), n.handleDirection(t)));
            }, this.handleCellClick = function(t) {
                try {
                    if (n.getOptions().clickable && t.target instanceof HTMLElement) {
                        var e = t.target.closest('[data-gamegrid-ref="cell"]');
                        if (e) {
                            var i = e.getAttribute("data-gamegrid-coords").split(",").map(function(t) {
                                return Number(t);
                            });
                            n.setFocusToCell.apply(n, i);
                        } else n.setFocusToCell();
                    }
                } catch (t) {
                    throw console.error(t), new Error("Error handling cell click. You possibly have missing attributes");
                }
            }, this.containerFocus = function() {
                n.options.active_class && n.refs.container.classList.add(n.options.active_class);
            }, this.containerBlur = function() {
                n.options.active_class && n.refs.container.classList.remove(n.options.active_class);
            }, this.options = e({
                active_class: "gamegrid__cell--active",
                arrow_controls: !0,
                wasd_controls: !0,
                infinite_x: !0,
                infinite_y: !0,
                clickable: !0,
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
            }, t.options), this.matrix = t.matrix, this.state = e(e({}, s), t.state), r && this.renderGrid(r), i.call(this, o.CREATED);
        }
        return t.prototype.renderGrid = function(t) {
            this.refs = {
                container: t,
                rows: [],
                cells: []
            }, this.render(), this.attachHandlers(), i.call(this, o.RENDERED);
        }, t.prototype.getOptions = function() {
            return this.options;
        }, t.prototype.setOptions = function(t) {
            this.options = e(e({}, this.options), t);
        }, t.prototype.destroy = function() {
            this.state.rendered && this.dettachHandlers();
        }, t.prototype.getState = function() {
            return this.state;
        }, t.prototype.moveLeft = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0],
                    this.state.active_coords[1] - 1
                ],
                current_direction: a
            }), i.call(this, o.MOVE_LEFT), this.finishMove();
        }, t.prototype.moveUp = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0] - 1,
                    this.state.active_coords[1]
                ],
                current_direction: r
            }), i.call(this, o.MOVE_UP), this.finishMove();
        }, t.prototype.moveRight = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0],
                    this.state.active_coords[1] + 1
                ],
                current_direction: c
            }), i.call(this, o.MOVE_RIGHT), this.finishMove();
        }, t.prototype.moveDown = function() {
            this.setStateSync({
                next_coords: [
                    this.state.active_coords[0] + 1,
                    this.state.active_coords[1]
                ],
                current_direction: n
            }), i.call(this, o.MOVE_DOWN), this.finishMove();
        }, t.prototype.setMatrix = function(t) {
            this.matrix = t;
        }, t.prototype.getMatrix = function() {
            return this.matrix;
        }, t.prototype.setStateSync = function(t) {
            var i = e(e({}, this.state), t);
            this.state = i;
        }, t.prototype.getActiveCell = function() {
            return this.refs.cells[this.state.active_coords[0]][this.state.active_coords[1]];
        }, t.prototype.render = function() {
            var t = this;
            if (!this.refs || !this.refs.container) throw new Error("No container found");
            (e = document.createElement("style")).innerHTML = '\n  .gamegrid * {\n    box-sizing: border-box;\n  }\n  .gamegrid__stage {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    flex-wrap: wrap;\n    box-sizing: border-box;\n    border: 1px solid;\n  }\n  .gamegrid__row {\n    display: flex;\n    flex-basis: 100%;\n    max-width: 100%;\n    box-sizing: border-box;\n  }\n  .gamegrid__cell {\n    flex: 1 0 auto;\n    height: auto;\n    overflow: hidden;\n    box-sizing: border-box;\n    border: 1px solid;\n  }\n  .gamegrid__cell--active {\n    outline: 4px solid red;\n  }\n  .gamegrid__cell::before {\n    content: "";\n    float: left;\n    padding-top: 100%;\n  }\n  ', document.head.appendChild(e), this.refs.container.classList.add("gamegrid"), this.refs.container.setAttribute("tabindex", "0"), this.refs.container.setAttribute("data-gamegrid-ref", "container");
            var e, i = document.createDocumentFragment();
            this.matrix.forEach(function(e, o) {
                var s, r, n = document.createElement("div");
                t.options.row_class && n.classList.add(t.options.row_class), n.setAttribute("data-gamegrid-row-index", o.toString()), n.setAttribute("data-gamegrid-ref", "row"), n.classList.add("gamegrid__row"), null === (s = t.refs) || void 0 === s || s.cells.push([]), e.forEach(function(i, s) {
                    var r, a, c, l = document.createElement("div");
                    c = l, [
                        [
                            "data-gamegrid-ref",
                            "cell"
                        ],
                        [
                            "data-gamegrid-row-index",
                            o.toString()
                        ],
                        [
                            "data-gamegrid-col-index",
                            s.toString()
                        ],
                        [
                            "data-gamegrid-coords",
                            "".concat(o, ",").concat(s)
                        ]
                    ].forEach(function(t) {
                        var e;
                        "class" === t[0] ? (e = c.classList).add.apply(e, t[1].split(" ")) : c.setAttribute(t[0], t[1]);
                    }), l.style.width = "".concat(100 / e.length, "%"), null === (r = i.cellAttributes) || void 0 === r || r.forEach(function(t) {
                        l.setAttribute(t[0], t[1]);
                    }), l.classList.add("gamegrid__cell"), l.setAttribute("tabindex", t.options.clickable ? "0" : "-1"), i.renderFunction && l.appendChild(i.renderFunction(t)), n.appendChild(l), null === (a = t.refs) || void 0 === a || a.cells[o].push(l);
                }), null === (r = t.refs) || void 0 === r || r.rows.push(n), i.appendChild(n);
            }), this.refs.container.appendChild(i), this.setStateSync({
                rendered: !0
            });
        }, t.prototype.setFocusToCell = function(t, e) {
            var i, o, s = this.refs.cells;
            if (!s) throw new Error("No cells found");
            "number" == typeof t && "number" == typeof e ? (s[t][e].focus(), this.removeActiveClasses(), s[t][e].classList.add("gamegrid__cell--active"), this.setStateSync({
                active_coords: [
                    t,
                    e
                ]
            })) : (null === (i = this.getActiveCell()) || void 0 === i || i.focus(), this.removeActiveClasses(), null === (o = this.getActiveCell()) || void 0 === o || o.classList.add("gamegrid__cell--active"));
        }, t.prototype.removeActiveClasses = function() {
            this.refs.cells.forEach(function(t) {
                t.forEach(function(t) {
                    t.classList.remove("gamegrid__cell--active");
                });
            });
        }, t.prototype.addToMoves = function() {
            var t = function(t, e, i) {
                if (i || 2 === arguments.length) for(var o, s = 0, r = e.length; s < r; s++)!o && s in e || (o || (o = Array.prototype.slice.call(e, 0, s)), o[s] = e[s]);
                return t.concat(o || Array.prototype.slice.call(e));
            }([], this.getState().moves, !0);
            t.unshift(this.state.active_coords), t.length > this.options.rewind_limit && t.shift(), this.setStateSync({
                moves: t
            });
        }, t.prototype.testLimit = function() {
            var t = this.state.next_coords[0], e = this.state.next_coords[1], s = this.matrix.length - 1, l = this.matrix[this.state.active_coords[0]].length - 1;
            switch(this.state.current_direction){
                case n:
                    this.state.next_coords[0] > s && (this.options.infinite_y ? (t = 0, i.call(this, o.WRAP_Y), i.call(this, o.WRAP)) : (t = s, i.call(this, o.LIMIT_Y), i.call(this, o.LIMIT)));
                    break;
                case a:
                    this.state.next_coords[1] < 0 && (this.options.infinite_x ? (e = l, i.call(this, o.WRAP_X), i.call(this, o.WRAP)) : (e = 0, i.call(this, o.LIMIT_X), i.call(this, o.LIMIT)));
                    break;
                case c:
                    this.state.next_coords[1] > l && (this.options.infinite_x ? (e = 0, i.call(this, o.WRAP_X), i.call(this, o.WRAP)) : (e = l, i.call(this, o.LIMIT_X), i.call(this, o.LIMIT)));
                    break;
                case r:
                    this.state.next_coords[0] < 0 && (this.options.infinite_y ? (t = s, i.call(this, o.WRAP_Y), i.call(this, o.WRAP)) : (t = 0, i.call(this, o.LIMIT_Y), i.call(this, o.LIMIT)));
            }
            this.setStateSync({
                next_coords: [
                    t,
                    e
                ],
                active_coords: [
                    t,
                    e
                ],
                prev_coords: this.state.active_coords
            });
        }, t.prototype.testInteractive = function() {
            var t, e = this.state.next_coords;
            "interactive" === (null === (t = this.matrix[e[0]][e[1]]) || void 0 === t ? void 0 : t.type) && i.call(this, o.MOVE_COLLISION);
        }, t.prototype.testBarrier = function() {
            var t, e = this.state.next_coords;
            "barrier" === (null === (t = this.matrix[e[0]][e[1]]) || void 0 === t ? void 0 : t.type) && (this.setStateSync({
                active_coords: this.state.prev_coords,
                prev_coords: this.state.active_coords
            }), i.call(this, o.MOVE_BLOCKED));
        }, t.prototype.testSpace = function() {
            var t, e = this.state.next_coords;
            "open" === (null === (t = this.matrix[e[0]][e[1]]) || void 0 === t ? void 0 : t.type) && "interactive" === this.matrix[this.state.prev_coords[0]][this.state.prev_coords[1]].type && i.call(this, o.MOVE_DETTACH);
        }, t.prototype.finishMove = function() {
            this.testLimit(), this.testSpace(), this.testInteractive(), this.testBarrier(), this.state.rendered && this.setFocusToCell(), this.addToMoves(), i.call(this, o.MOVE_LAND);
        }, t.prototype.handleDirection = function(t) {
            switch(t.code){
                case "ArrowLeft":
                case "KeyA":
                    this.moveLeft();
                    break;
                case "ArrowUp":
                case "KeyW":
                    this.moveUp();
                    break;
                case "ArrowRight":
                case "KeyD":
                    this.moveRight();
                    break;
                case "ArrowDown":
                case "KeyS":
                    this.moveDown();
            }
        }, t.prototype.attachHandlers = function() {
            var t = this.refs.container;
            t && (t.addEventListener("keydown", this.handleKeyDown), t.addEventListener("focus", this.containerFocus), t.addEventListener("blur", this.containerBlur), t.addEventListener("click", this.handleCellClick));
        }, t.prototype.dettachHandlers = function() {
            var t = this.refs.container;
            t && (t.removeEventListener("keydown", this.handleKeyDown), t.removeEventListener("focus", this.containerFocus), t.removeEventListener("blur", this.containerBlur), t.removeEventListener("click", this.handleCellClick));
        }, t;
    }(), d = o;
    t.default = l, t.gameGridEventsEnum = d, Object.defineProperty(t, "__esModule", {
        value: !0
    });
});

},{}],"bCsEQ":[function(require,module,exports) {
var parcelHelpers = require("@parcel/transformer-js/src/esmodule-helpers.js");
parcelHelpers.defineInteropFlag(exports);
parcelHelpers.export(exports, "attachListeners", ()=>attachListeners);
var _main = require("./../../dist/main");
function attachListeners() {
    Object.keys((0, _main.gameGridEventsEnum)).forEach((key)=>{
        const event = (0, _main.gameGridEventsEnum)[key];
        window.addEventListener(event, (e)=>{
            console.log("event", event, e);
            const el = document.querySelector("#move-events ul");
            const li = document.createElement("li");
            li.innerText = `${event} : ${e.timeStamp}`;
            el.insertAdjacentElement("afterbegin", li);
        });
    });
}

},{"./../../dist/main":"lbDgN","@parcel/transformer-js/src/esmodule-helpers.js":"gkKU3"}],"gkKU3":[function(require,module,exports) {
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

},{}]},["lzrsO","a2QOe"], "a2QOe", "parcelRequiredb3a")

//# sourceMappingURL=index.d59795f0.js.map
