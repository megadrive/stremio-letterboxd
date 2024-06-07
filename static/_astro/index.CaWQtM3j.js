import{r as c}from"./index.NEDEFKed.js";var T={exports:{}},j={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var M=c,H=Symbol.for("react.element"),U=Symbol.for("react.fragment"),Y=Object.prototype.hasOwnProperty,q=M.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,B={key:!0,ref:!0,__self:!0,__source:!0};function z(e,t,r){var o,s={},a=null,i=null;r!==void 0&&(a=""+r),t.key!==void 0&&(a=""+t.key),t.ref!==void 0&&(i=t.ref);for(o in t)Y.call(t,o)&&!B.hasOwnProperty(o)&&(s[o]=t[o]);if(e&&e.defaultProps)for(o in t=e.defaultProps,t)s[o]===void 0&&(s[o]=t[o]);return{$$typeof:H,type:e,key:a,ref:i,props:s,_owner:q.current}}j.Fragment=U;j.jsx=z;j.jsxs=z;T.exports=j;var ze=T.exports;let J={data:""},W=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||J,Z=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,G=/\/\*[^]*?\*\/|  +/g,D=/\n+/g,b=(e,t)=>{let r="",o="",s="";for(let a in e){let i=e[a];a[0]=="@"?a[1]=="i"?r=a+" "+i+";":o+=a[1]=="f"?b(i,a):a+"{"+b(i,a[1]=="k"?"":t)+"}":typeof i=="object"?o+=b(i,t?t.replace(/([^,])+/g,n=>a.replace(/(^:.*)|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):a):i!=null&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=b.p?b.p(a,i):a+":"+i+";")}return r+(t&&s?t+"{"+s+"}":s)+o},y={},R=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+R(e[r]);return t}return e},Q=(e,t,r,o,s)=>{let a=R(e),i=y[a]||(y[a]=(l=>{let d=0,p=11;for(;d<l.length;)p=101*p+l.charCodeAt(d++)>>>0;return"go"+p})(a));if(!y[i]){let l=a!==e?e:(d=>{let p,m,f=[{}];for(;p=Z.exec(d.replace(G,""));)p[4]?f.shift():p[3]?(m=p[3].replace(D," ").trim(),f.unshift(f[0][m]=f[0][m]||{})):f[0][p[1]]=p[2].replace(D," ").trim();return f[0]})(e);y[i]=b(s?{["@keyframes "+i]:l}:l,r?"":"."+i)}let n=r&&y.g?y.g:null;return r&&(y.g=y[i]),((l,d,p,m)=>{m?d.data=d.data.replace(m,l):d.data.indexOf(l)===-1&&(d.data=p?l+d.data:d.data+l)})(y[i],t,o,n),i},V=(e,t,r)=>e.reduce((o,s,a)=>{let i=t[a];if(i&&i.call){let n=i(r),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;i=l?"."+l:n&&typeof n=="object"?n.props?"":b(n,""):n===!1?"":n}return o+s+(i??"")},"");function I(e){let t=this||{},r=e.call?e(t.p):e;return Q(r.unshift?r.raw?V(r,[].slice.call(arguments,1),t.p):r.reduce((o,s)=>Object.assign(o,s&&s.call?s(t.p):s),{}):r,W(t.target),t.g,t.o,t.k)}let F,C,P;I.bind({g:1});let h=I.bind({k:1});function X(e,t,r,o){b.p=t,F=e,C=r,P=o}function x(e,t){let r=this||{};return function(){let o=arguments;function s(a,i){let n=Object.assign({},a),l=n.className||s.className;r.p=Object.assign({theme:C&&C()},n),r.o=/ *go\d+/.test(l),n.className=I.apply(r,o)+(l?" "+l:""),t&&(n.ref=i);let d=e;return e[0]&&(d=n.as||e,delete n.as),P&&d[0]&&P(n),F(d,n)}return t?t(s):s}}var K=e=>typeof e=="function",k=(e,t)=>K(e)?e(t):e,ee=(()=>{let e=0;return()=>(++e).toString()})(),L=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),te=20,$=new Map,re=1e3,S=e=>{if($.has(e))return;let t=setTimeout(()=>{$.delete(e),v({type:4,toastId:e})},re);$.set(e,t)},ae=e=>{let t=$.get(e);t&&clearTimeout(t)},A=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,te)};case 1:return t.toast.id&&ae(t.toast.id),{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:r}=t;return e.toasts.find(a=>a.id===r.id)?A(e,{type:1,toast:r}):A(e,{type:0,toast:r});case 3:let{toastId:o}=t;return o?S(o):e.toasts.forEach(a=>{S(a.id)}),{...e,toasts:e.toasts.map(a=>a.id===o||o===void 0?{...a,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+s}))}}},O=[],_={toasts:[],pausedAt:void 0},v=e=>{_=A(_,e),O.forEach(t=>{t(_)})},oe={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},se=(e={})=>{let[t,r]=c.useState(_);c.useEffect(()=>(O.push(r),()=>{let s=O.indexOf(r);s>-1&&O.splice(s,1)}),[t]);let o=t.toasts.map(s=>{var a,i;return{...e,...e[s.type],...s,duration:s.duration||((a=e[s.type])==null?void 0:a.duration)||e?.duration||oe[s.type],style:{...e.style,...(i=e[s.type])==null?void 0:i.style,...s.style}}});return{...t,toasts:o}},ie=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||ee()}),w=e=>(t,r)=>{let o=ie(t,e,r);return v({type:2,toast:o}),o.id},u=(e,t)=>w("blank")(e,t);u.error=w("error");u.success=w("success");u.loading=w("loading");u.custom=w("custom");u.dismiss=e=>{v({type:3,toastId:e})};u.remove=e=>v({type:4,toastId:e});u.promise=(e,t,r)=>{let o=u.loading(t.loading,{...r,...r?.loading});return e.then(s=>(u.success(k(t.success,s),{id:o,...r,...r?.success}),s)).catch(s=>{u.error(k(t.error,s),{id:o,...r,...r?.error})}),e};var ne=(e,t)=>{v({type:1,toast:{id:e,height:t}})},le=()=>{v({type:5,time:Date.now()})},de=e=>{let{toasts:t,pausedAt:r}=se(e);c.useEffect(()=>{if(r)return;let a=Date.now(),i=t.map(n=>{if(n.duration===1/0)return;let l=(n.duration||0)+n.pauseDuration-(a-n.createdAt);if(l<0){n.visible&&u.dismiss(n.id);return}return setTimeout(()=>u.dismiss(n.id),l)});return()=>{i.forEach(n=>n&&clearTimeout(n))}},[t,r]);let o=c.useCallback(()=>{r&&v({type:6,time:Date.now()})},[r]),s=c.useCallback((a,i)=>{let{reverseOrder:n=!1,gutter:l=8,defaultPosition:d}=i||{},p=t.filter(g=>(g.position||d)===(a.position||d)&&g.height),m=p.findIndex(g=>g.id===a.id),f=p.filter((g,N)=>N<m&&g.visible).length;return p.filter(g=>g.visible).slice(...n?[f+1]:[0,f]).reduce((g,N)=>g+(N.height||0)+l,0)},[t]);return{toasts:t,handlers:{updateHeight:ne,startPause:le,endPause:o,calculateOffset:s}}},ce=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,pe=h`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ue=h`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,fe=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ce} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${pe} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${ue} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,me=h`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ge=x("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${me} 1s linear infinite;
`,ye=h`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,he=h`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,be=x("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ye} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${he} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,xe=x("div")`
  position: absolute;
`,ve=x("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,we=h`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ee=x("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${we} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,$e=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return t!==void 0?typeof t=="string"?c.createElement(Ee,null,t):t:r==="blank"?null:c.createElement(ve,null,c.createElement(ge,{...o}),r!=="loading"&&c.createElement(xe,null,r==="error"?c.createElement(fe,{...o}):c.createElement(be,{...o})))},Oe=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,_e=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,ke="0%{opacity:0;} 100%{opacity:1;}",je="0%{opacity:1;} 100%{opacity:0;}",Ie=x("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Ne=x("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ce=(e,t)=>{let r=e.includes("top")?1:-1,[o,s]=L()?[ke,je]:[Oe(r),_e(r)];return{animation:t?`${h(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${h(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},Pe=c.memo(({toast:e,position:t,style:r,children:o})=>{let s=e.height?Ce(e.position||t||"top-center",e.visible):{opacity:0},a=c.createElement($e,{toast:e}),i=c.createElement(Ne,{...e.ariaProps},k(e.message,e));return c.createElement(Ie,{className:e.className,style:{...s,...r,...e.style}},typeof o=="function"?o({icon:a,message:i}):c.createElement(c.Fragment,null,a,i))});X(c.createElement);var Ae=({id:e,className:t,style:r,onHeightUpdate:o,children:s})=>{let a=c.useCallback(i=>{if(i){let n=()=>{let l=i.getBoundingClientRect().height;o(e,l)};n(),new MutationObserver(n).observe(i,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return c.createElement("div",{ref:a,className:t,style:r},s)},De=(e,t)=>{let r=e.includes("top"),o=r?{top:0}:{bottom:0},s=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:L()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...o,...s}},Se=I`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,E=16,Re=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:s,containerStyle:a,containerClassName:i})=>{let{toasts:n,handlers:l}=de(r);return c.createElement("div",{style:{position:"fixed",zIndex:9999,top:E,left:E,right:E,bottom:E,pointerEvents:"none",...a},className:i,onMouseEnter:l.startPause,onMouseLeave:l.endPause},n.map(d=>{let p=d.position||t,m=l.calculateOffset(d,{reverseOrder:e,gutter:o,defaultPosition:t}),f=De(p,m);return c.createElement(Ae,{id:d.id,key:d.id,onHeightUpdate:l.updateHeight,className:d.visible?Se:"",style:f},d.type==="custom"?k(d.message,d):s?s(d):c.createElement(Pe,{toast:d,position:p}))}))};export{Re as I,ze as j,u as n};
