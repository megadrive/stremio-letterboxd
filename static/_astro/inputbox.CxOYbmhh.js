import{r as p}from"./index.NEDEFKed.js";var x={exports:{}},c={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var v=p,_=Symbol.for("react.element"),g=Symbol.for("react.fragment"),y=Object.prototype.hasOwnProperty,j=v.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,R={key:!0,ref:!0,__self:!0,__source:!0};function h(r,e,l){var t,s={},i=null,a=null;l!==void 0&&(i=""+l),e.key!==void 0&&(i=""+e.key),e.ref!==void 0&&(a=e.ref);for(t in e)y.call(e,t)&&!R.hasOwnProperty(t)&&(s[t]=e[t]);if(r&&r.defaultProps)for(t in e=r.defaultProps,e)s[t]===void 0&&(s[t]=e[t]);return{$$typeof:_,type:r,key:i,ref:a,props:s,_owner:j.current}}c.Fragment=g;c.jsx=h;c.jsxs=h;x.exports=c;var o=x.exports;function I(){const[r,e]=p.useState(""),l=p.useRef(null);function t(){l.current?.value?e(l.current.value):e("")}function s(n){const d=/https:\/\/(www\.)?letterboxd\.com\/([A-Za-z0-9-_]+)(\/([A-Za-z0-9-_]+)\/([A-Za-z0-9-_]+))?/gi,b=[...n.matchAll(d)];let[,,w,,u,f]=b[0];return u||(u="watchlist"),`${w}|${f||u}`}function i(){const n=s(r);return`stremio://${new URL(window.location.href).host}/${n}/manifest.json`}function a(){if(r.length){const n=i();navigator.clipboard.writeText(n).catch(d=>{})}}function m(){if(r.length){const n=i();window.location.href=n}}return o.jsxs("div",{className:"grid grid-cols-1 gap-1",children:[o.jsx("div",{className:"text-base",children:"A user's Letterboxd URL or a List URL:"}),o.jsx("div",{children:o.jsx("input",{type:"text",placeholder:"https://letterboxd.com/almosteffective",className:"w-full border border-black text-tailwind rounded text-xl px-2 py-1",ref:l,onChange:t,onBlur:t})}),o.jsxs("div",{className:"flex gap-1",children:[o.jsx("button",{className:"grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline",onClick:m,children:"Install"}),o.jsx("button",{className:"grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal",onClick:a,children:"Copy"})]})]})}export{I as default};