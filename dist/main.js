!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).GameGrid={})}(this,(function(t){"use strict";var e=function(){return e=Object.assign||function(t){for(var e,i=1,o=arguments.length;i<o;i++)for(var s in e=arguments[i])Object.prototype.hasOwnProperty.call(e,s)&&(t[s]=e[s]);return t},e.apply(this,arguments)};function i(t,i){window.dispatchEvent(new CustomEvent(t,{detail:e(e({},i),{game_grid_instance:this}),bubbles:!0}))}"function"==typeof SuppressedError&&SuppressedError;var o={RENDERED:"gamegrid:grid:rendered",CREATED:"gamegrid:grid:created",DESTROYED:"gamegrid:grid:destroyed",MOVE_LEFT:"gamegrid:move:left",MOVE_RIGHT:"gamegrid:move:right",MOVE_UP:"gamegrid:move:up",MOVE_DOWN:"gamegrid:move:down",MOVE_BLOCKED:"gamegrid:move:blocked",MOVE_COLLISION:"gamegrid:move:collide",MOVE_DETTACH:"gamegrid:move:dettach",MOVE_LAND:"gamegrid:move:land",LIMIT:"gamegrid:move:limit",LIMIT_X:"gamegrid:move:limit:x",LIMIT_Y:"gamegrid:move:limit:y",WRAP:"gamegrid:move:wrap",WRAP_X:"gamegrid:move:wrap:x",WRAP_Y:"gamegrid:move:wrap:y"},s={active_coords:[0,0],prev_coords:[0,0],next_coords:[],current_direction:"",rendered:!1,moves:[[0,0]]},r="up",n="down",a="left",c="right",d=function(){function t(t,r){void 0===r&&(r=null);var n=this;this.state=s,this.refs={container:null,rows:[],cells:[]},this.handleKeyDown=function(t){n.options.arrow_controls&&("ArrowUp"!==t.code&&"ArrowRight"!==t.code&&"ArrowDown"!==t.code&&"ArrowLeft"!==t.code||(t.preventDefault(),n.handleDirection(t))),n.options.wasd_controls&&("KeyW"!==t.code&&"KeyD"!==t.code&&"KeyS"!==t.code&&"KeyA"!==t.code||(t.preventDefault(),n.handleDirection(t)))},this.handleCellClick=function(t){try{if(n.getOptions().clickable&&t.target instanceof HTMLElement){var e=t.target.closest('[data-gamegrid-ref="cell"]');if(e){var i=e.getAttribute("data-gamegrid-coords").split(",").map((function(t){return Number(t)}));n.setFocusToCell.apply(n,i)}else n.setFocusToCell()}}catch(t){throw console.error(t),new Error("Error handling cell click. You possibly have missing attributes")}},this.containerFocus=function(){n.options.active_class&&n.refs.container.classList.add(n.options.active_class)},this.containerBlur=function(){n.options.active_class&&n.refs.container.classList.remove(n.options.active_class)},this.options=e({active_class:"gamegrid__cell--active",arrow_controls:!0,wasd_controls:!0,infinite_x:!0,infinite_y:!0,clickable:!0,rewind_limit:20,block_on_type:["barrier"],collide_on_type:["interactive"],move_on_type:["open"]},t.options),this.matrix=t.matrix,this.state=e(e({},s),t.state),r&&this.renderGrid(r),i.call(this,o.CREATED)}return t.prototype.renderGrid=function(t){this.refs={container:t,rows:[],cells:[]},this.render(),this.attachHandlers(),i.call(this,o.RENDERED)},t.prototype.getOptions=function(){return this.options},t.prototype.setOptions=function(t){this.options=e(e({},this.options),t)},t.prototype.destroy=function(){this.state.rendered&&this.dettachHandlers()},t.prototype.getState=function(){return this.state},t.prototype.moveLeft=function(){this.setStateSync({next_coords:[this.state.active_coords[0],this.state.active_coords[1]-1],current_direction:a}),i.call(this,o.MOVE_LEFT),this.finishMove()},t.prototype.moveUp=function(){this.setStateSync({next_coords:[this.state.active_coords[0]-1,this.state.active_coords[1]],current_direction:r}),i.call(this,o.MOVE_UP),this.finishMove()},t.prototype.moveRight=function(){this.setStateSync({next_coords:[this.state.active_coords[0],this.state.active_coords[1]+1],current_direction:c}),i.call(this,o.MOVE_RIGHT),this.finishMove()},t.prototype.moveDown=function(){this.setStateSync({next_coords:[this.state.active_coords[0]+1,this.state.active_coords[1]],current_direction:n}),i.call(this,o.MOVE_DOWN),this.finishMove()},t.prototype.setMatrix=function(t){this.matrix=t},t.prototype.getMatrix=function(){return this.matrix},t.prototype.setStateSync=function(t){var e,i,o=this;this.options.middlewares?(null===(e=this.options.middlewares.pre)||void 0===e||e.forEach((function(e){e(o,t)})),this.updateState(t),null===(i=this.options.middlewares.post)||void 0===i||i.forEach((function(e){e(o,t)}))):this.updateState(t)},t.prototype.getActiveCell=function(){return this.refs.cells[this.state.active_coords[0]][this.state.active_coords[1]]},t.prototype.updateState=function(t){var i=e(e({},this.state),t);this.state=i},t.prototype.render=function(){var t=this;if(!this.refs||!this.refs.container)throw new Error("No container found");(e=document.createElement("style")).innerHTML='\n  .gamegrid * {\n    box-sizing: border-box;\n  }\n  .gamegrid__stage {\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    flex-wrap: wrap;\n    box-sizing: border-box;\n    border: 1px solid;\n  }\n  .gamegrid__row {\n    display: flex;\n    flex-basis: 100%;\n    max-width: 100%;\n    box-sizing: border-box;\n  }\n  .gamegrid__cell {\n    flex: 1 0 auto;\n    height: auto;\n    overflow: hidden;\n    box-sizing: border-box;\n    border: 1px solid;\n  }\n  .gamegrid__cell--active {\n    outline: 4px solid red;\n  }\n  .gamegrid__cell::before {\n    content: "";\n    float: left;\n    padding-top: 100%;\n  }\n  ',document.head.appendChild(e),this.refs.container.classList.add("gamegrid"),this.refs.container.setAttribute("tabindex","0"),this.refs.container.setAttribute("data-gamegrid-ref","container");var e,i=document.createDocumentFragment();this.matrix.forEach((function(e,o){var s,r=document.createElement("div");t.options.row_class&&r.classList.add(t.options.row_class),r.setAttribute("data-gamegrid-row-index",o.toString()),r.setAttribute("data-gamegrid-ref","row"),r.classList.add("gamegrid__row"),null===(s=t.refs)||void 0===s||s.cells.push([]),e.forEach((function(i,s){var n,a,c=document.createElement("div");a=c,[["data-gamegrid-ref","cell"],["data-gamegrid-row-index",o.toString()],["data-gamegrid-col-index",s.toString()],["data-gamegrid-coords","".concat(o,",").concat(s)]].forEach((function(t){var e;"class"===t[0]?(e=a.classList).add.apply(e,t[1].split(" ")):a.setAttribute(t[0],t[1])})),c.style.width="".concat(100/e.length,"%"),null===(n=i.cellAttributes)||void 0===n||n.forEach((function(t){c.setAttribute(t[0],t[1])})),c.classList.add("gamegrid__cell"),c.setAttribute("tabindex",t.options.clickable?"0":"-1"),i.renderFunction&&c.appendChild(i.renderFunction(t)),r.appendChild(c),t.refs.cells[o].push(c)})),t.refs.rows.push(r),i.appendChild(r)})),this.refs.container.appendChild(i),this.setStateSync({rendered:!0})},t.prototype.setFocusToCell=function(t,e){var i,o,s=this.refs.cells;if(!s)throw new Error("No cells found");"number"==typeof t&&"number"==typeof e?(s[t][e].focus(),this.removeActiveClasses(),s[t][e].classList.add("gamegrid__cell--active"),this.setStateSync({active_coords:[t,e]})):(null===(i=this.getActiveCell())||void 0===i||i.focus(),this.removeActiveClasses(),null===(o=this.getActiveCell())||void 0===o||o.classList.add("gamegrid__cell--active"))},t.prototype.removeActiveClasses=function(){this.refs.cells.forEach((function(t){t.forEach((function(t){t.classList.remove("gamegrid__cell--active")}))}))},t.prototype.addToMoves=function(){var t=function(t,e,i){if(i||2===arguments.length)for(var o,s=0,r=e.length;s<r;s++)!o&&s in e||(o||(o=Array.prototype.slice.call(e,0,s)),o[s]=e[s]);return t.concat(o||Array.prototype.slice.call(e))}([],this.getState().moves,!0);t.unshift(this.state.active_coords),t.length>this.options.rewind_limit&&t.shift(),this.setStateSync({moves:t})},t.prototype.testLimit=function(){var t=this.state.next_coords[0],e=this.state.next_coords[1],s=this.matrix.length-1,d=this.matrix[this.state.active_coords[0]].length-1;switch(this.state.current_direction){case n:this.state.next_coords[0]>s&&(this.options.infinite_y?(t=0,i.call(this,o.WRAP_Y),i.call(this,o.WRAP)):(t=s,i.call(this,o.LIMIT_Y),i.call(this,o.LIMIT)));break;case a:this.state.next_coords[1]<0&&(this.options.infinite_x?(e=d,i.call(this,o.WRAP_X),i.call(this,o.WRAP)):(e=0,i.call(this,o.LIMIT_X),i.call(this,o.LIMIT)));break;case c:this.state.next_coords[1]>d&&(this.options.infinite_x?(e=0,i.call(this,o.WRAP_X),i.call(this,o.WRAP)):(e=d,i.call(this,o.LIMIT_X),i.call(this,o.LIMIT)));break;case r:this.state.next_coords[0]<0&&(this.options.infinite_y?(t=s,i.call(this,o.WRAP_Y),i.call(this,o.WRAP)):(t=0,i.call(this,o.LIMIT_Y),i.call(this,o.LIMIT)))}this.setStateSync({next_coords:[t,e],active_coords:[t,e],prev_coords:this.state.active_coords})},t.prototype.testInteractive=function(){var t,e=this.state.next_coords;"interactive"===(null===(t=this.matrix[e[0]][e[1]])||void 0===t?void 0:t.type)&&i.call(this,o.MOVE_COLLISION)},t.prototype.testBarrier=function(){var t,e=this.state.next_coords;"barrier"===(null===(t=this.matrix[e[0]][e[1]])||void 0===t?void 0:t.type)&&(this.setStateSync({active_coords:this.state.prev_coords,prev_coords:this.state.active_coords}),i.call(this,o.MOVE_BLOCKED))},t.prototype.testSpace=function(){var t,e=this.state.next_coords;"open"===(null===(t=this.matrix[e[0]][e[1]])||void 0===t?void 0:t.type)&&"interactive"===this.matrix[this.state.prev_coords[0]][this.state.prev_coords[1]].type&&i.call(this,o.MOVE_DETTACH)},t.prototype.finishMove=function(){this.testLimit(),this.testSpace(),this.testInteractive(),this.testBarrier(),this.state.rendered&&this.setFocusToCell(),this.addToMoves(),i.call(this,o.MOVE_LAND)},t.prototype.handleDirection=function(t){switch(t.code){case"ArrowLeft":case"KeyA":this.moveLeft();break;case"ArrowUp":case"KeyW":this.moveUp();break;case"ArrowRight":case"KeyD":this.moveRight();break;case"ArrowDown":case"KeyS":this.moveDown()}},t.prototype.attachHandlers=function(){var t=this.refs.container;t&&(t.addEventListener("keydown",this.handleKeyDown),t.addEventListener("focus",this.containerFocus),t.addEventListener("blur",this.containerBlur),t.addEventListener("click",this.handleCellClick))},t.prototype.dettachHandlers=function(){var t=this.refs.container;t&&(t.removeEventListener("keydown",this.handleKeyDown),t.removeEventListener("focus",this.containerFocus),t.removeEventListener("blur",this.containerBlur),t.removeEventListener("click",this.handleCellClick))},t}(),l=o;t.default=d,t.gameGridEventsEnum=l,Object.defineProperty(t,"__esModule",{value:!0})}));
//# sourceMappingURL=main.js.map
