import{r as d}from"./index.NEDEFKed.js";var z={exports:{}},S={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var V=d,J=Symbol.for("react.element"),Y=Symbol.for("react.fragment"),q=Object.prototype.hasOwnProperty,W=V.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,Z={key:!0,ref:!0,__self:!0,__source:!0};function F(e,t,r){var o,s={},a=null,i=null;r!==void 0&&(a=""+r),t.key!==void 0&&(a=""+t.key),t.ref!==void 0&&(i=t.ref);for(o in t)q.call(t,o)&&!Z.hasOwnProperty(o)&&(s[o]=t[o]);if(e&&e.defaultProps)for(o in t=e.defaultProps,t)s[o]===void 0&&(s[o]=t[o]);return{$$typeof:J,type:e,key:a,ref:i,props:s,_owner:W.current}}S.Fragment=Y;S.jsx=F;S.jsxs=F;z.exports=S;var g=z.exports;let G={data:""},Q=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||G,X=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,ee=/\/\*[^]*?\*\/|  +/g,R=/\n+/g,v=(e,t)=>{let r="",o="",s="";for(let a in e){let i=e[a];a[0]=="@"?a[1]=="i"?r=a+" "+i+";":o+=a[1]=="f"?v(i,a):a+"{"+v(i,a[1]=="k"?"":t)+"}":typeof i=="object"?o+=v(i,t?t.replace(/([^,])+/g,n=>a.replace(/(^:.*)|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):a):i!=null&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),s+=v.p?v.p(a,i):a+":"+i+";")}return r+(t&&s?t+"{"+s+"}":s)+o},b={},M=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+M(e[r]);return t}return e},te=(e,t,r,o,s)=>{let a=M(e),i=b[a]||(b[a]=(l=>{let c=0,u=11;for(;c<l.length;)u=101*u+l.charCodeAt(c++)>>>0;return"go"+u})(a));if(!b[i]){let l=a!==e?e:(c=>{let u,p,m=[{}];for(;u=X.exec(c.replace(ee,""));)u[4]?m.shift():u[3]?(p=u[3].replace(R," ").trim(),m.unshift(m[0][p]=m[0][p]||{})):m[0][u[1]]=u[2].replace(R," ").trim();return m[0]})(e);b[i]=v(s?{["@keyframes "+i]:l}:l,r?"":"."+i)}let n=r&&b.g?b.g:null;return r&&(b.g=b[i]),((l,c,u,p)=>{p?c.data=c.data.replace(p,l):c.data.indexOf(l)===-1&&(c.data=u?l+c.data:c.data+l)})(b[i],t,o,n),i},re=(e,t,r)=>e.reduce((o,s,a)=>{let i=t[a];if(i&&i.call){let n=i(r),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;i=l?"."+l:n&&typeof n=="object"?n.props?"":v(n,""):n===!1?"":n}return o+s+(i??"")},"");function P(e){let t=this||{},r=e.call?e(t.p):e;return te(r.unshift?r.raw?re(r,[].slice.call(arguments,1),t.p):r.reduce((o,s)=>Object.assign(o,s&&s.call?s(t.p):s),{}):r,Q(t.target),t.g,t.o,t.k)}let H,U,A;P.bind({g:1});let x=P.bind({k:1});function ae(e,t,r,o){v.p=t,H=e,U=r,A=o}function w(e,t){let r=this||{};return function(){let o=arguments;function s(a,i){let n=Object.assign({},a),l=n.className||s.className;r.p=Object.assign({theme:U&&U()},n),r.o=/ *go\d+/.test(l),n.className=P.apply(r,o)+(l?" "+l:""),t&&(n.ref=i);let c=e;return e[0]&&(c=n.as||e,delete n.as),A&&c[0]&&A(n),H(c,n)}return t?t(s):s}}var oe=e=>typeof e=="function",I=(e,t)=>oe(e)?e(t):e,se=(()=>{let e=0;return()=>(++e).toString()})(),B=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),ie=20,C=new Map,ne=1e3,T=e=>{if(C.has(e))return;let t=setTimeout(()=>{C.delete(e),E({type:4,toastId:e})},ne);C.set(e,t)},le=e=>{let t=C.get(e);t&&clearTimeout(t)},D=(e,t)=>{switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,ie)};case 1:return t.toast.id&&le(t.toast.id),{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:r}=t;return e.toasts.find(a=>a.id===r.id)?D(e,{type:1,toast:r}):D(e,{type:0,toast:r});case 3:let{toastId:o}=t;return o?T(o):e.toasts.forEach(a=>{T(a.id)}),{...e,toasts:e.toasts.map(a=>a.id===o||o===void 0?{...a,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+s}))}}},O=[],_={toasts:[],pausedAt:void 0},E=e=>{_=D(_,e),O.forEach(t=>{t(_)})},ce={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},de=(e={})=>{let[t,r]=d.useState(_);d.useEffect(()=>(O.push(r),()=>{let s=O.indexOf(r);s>-1&&O.splice(s,1)}),[t]);let o=t.toasts.map(s=>{var a,i;return{...e,...e[s.type],...s,duration:s.duration||((a=e[s.type])==null?void 0:a.duration)||e?.duration||ce[s.type],style:{...e.style,...(i=e[s.type])==null?void 0:i.style,...s.style}}});return{...t,toasts:o}},ue=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||se()}),$=e=>(t,r)=>{let o=ue(t,e,r);return E({type:2,toast:o}),o.id},f=(e,t)=>$("blank")(e,t);f.error=$("error");f.success=$("success");f.loading=$("loading");f.custom=$("custom");f.dismiss=e=>{E({type:3,toastId:e})};f.remove=e=>E({type:4,toastId:e});f.promise=(e,t,r)=>{let o=f.loading(t.loading,{...r,...r?.loading});return e.then(s=>(f.success(I(t.success,s),{id:o,...r,...r?.success}),s)).catch(s=>{f.error(I(t.error,s),{id:o,...r,...r?.error})}),e};var pe=(e,t)=>{E({type:1,toast:{id:e,height:t}})},fe=()=>{E({type:5,time:Date.now()})},me=e=>{let{toasts:t,pausedAt:r}=de(e);d.useEffect(()=>{if(r)return;let a=Date.now(),i=t.map(n=>{if(n.duration===1/0)return;let l=(n.duration||0)+n.pauseDuration-(a-n.createdAt);if(l<0){n.visible&&f.dismiss(n.id);return}return setTimeout(()=>f.dismiss(n.id),l)});return()=>{i.forEach(n=>n&&clearTimeout(n))}},[t,r]);let o=d.useCallback(()=>{r&&E({type:6,time:Date.now()})},[r]),s=d.useCallback((a,i)=>{let{reverseOrder:n=!1,gutter:l=8,defaultPosition:c}=i||{},u=t.filter(h=>(h.position||c)===(a.position||c)&&h.height),p=u.findIndex(h=>h.id===a.id),m=u.filter((h,j)=>j<p&&h.visible).length;return u.filter(h=>h.visible).slice(...n?[m+1]:[0,m]).reduce((h,j)=>h+(j.height||0)+l,0)},[t]);return{toasts:t,handlers:{updateHeight:pe,startPause:fe,endPause:o,calculateOffset:s}}},ge=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,he=x`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ye=x`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,be=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ge} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${he} 0.15s ease-out forwards;
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
    animation: ${ye} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,xe=x`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,ve=w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${xe} 1s linear infinite;
`,we=x`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Ee=x`
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
}`,je=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${we} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Ee} 0.2s ease-out forwards;
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
`,$e=w("div")`
  position: absolute;
`,Ne=w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ke=x`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Ce=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ke} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Oe=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return t!==void 0?typeof t=="string"?d.createElement(Ce,null,t):t:r==="blank"?null:d.createElement(Ne,null,d.createElement(ve,{...o}),r!=="loading"&&d.createElement($e,null,r==="error"?d.createElement(be,{...o}):d.createElement(je,{...o})))},_e=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Ie=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Se="0%{opacity:0;} 100%{opacity:1;}",Pe="0%{opacity:1;} 100%{opacity:0;}",Le=w("div")`
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
`,Ue=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ae=(e,t)=>{let r=e.includes("top")?1:-1,[o,s]=B()?[Se,Pe]:[_e(r),Ie(r)];return{animation:t?`${x(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${x(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}},De=d.memo(({toast:e,position:t,style:r,children:o})=>{let s=e.height?Ae(e.position||t||"top-center",e.visible):{opacity:0},a=d.createElement(Oe,{toast:e}),i=d.createElement(Ue,{...e.ariaProps},I(e.message,e));return d.createElement(Le,{className:e.className,style:{...s,...r,...e.style}},typeof o=="function"?o({icon:a,message:i}):d.createElement(d.Fragment,null,a,i))});ae(d.createElement);var Re=({id:e,className:t,style:r,onHeightUpdate:o,children:s})=>{let a=d.useCallback(i=>{if(i){let n=()=>{let l=i.getBoundingClientRect().height;o(e,l)};n(),new MutationObserver(n).observe(i,{subtree:!0,childList:!0,characterData:!0})}},[e,o]);return d.createElement("div",{ref:a,className:t,style:r},s)},Te=(e,t)=>{let r=e.includes("top"),o=r?{top:0}:{bottom:0},s=e.includes("center")?{justifyContent:"center"}:e.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:B()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${t*(r?1:-1)}px)`,...o,...s}},ze=P`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,k=16,Fe=({reverseOrder:e,position:t="top-center",toastOptions:r,gutter:o,children:s,containerStyle:a,containerClassName:i})=>{let{toasts:n,handlers:l}=me(r);return d.createElement("div",{style:{position:"fixed",zIndex:9999,top:k,left:k,right:k,bottom:k,pointerEvents:"none",...a},className:i,onMouseEnter:l.startPause,onMouseLeave:l.endPause},n.map(c=>{let u=c.position||t,p=l.calculateOffset(c,{reverseOrder:e,gutter:o,defaultPosition:t}),m=Te(u,p);return d.createElement(Re,{id:c.id,key:c.id,onHeightUpdate:l.updateHeight,className:c.visible?ze:"",style:m},c.type==="custom"?I(c.message,c):s?s(c):d.createElement(De,{toast:c,position:u}))}))};function Be(){const[e,t]=d.useState(""),[r,o]=d.useState(!1),[s,a]=d.useState(""),[i,n]=d.useState(""),l=d.useRef(null),c=d.useRef(null);function u(){l.current?.value?t(l.current.value):t("")}function p(){c.current?.value?n(c.current.value):n("")}async function m(){const y=window.location.origin.includes(":4321")?"http://localhost:3030":window.location.origin;try{const N=btoa(JSON.stringify({url:e,base:y,posters:!1,customListName:i.length?i:void 0})),L=await fetch(`${y}/verify/${N}`,{headers:{"Cache-Control":"max-age=3600, stale-while-revalidate=600"}});if(!L.ok){const K=await L.json();f.error(K);return}return await L.json()}catch(N){f.error(`Try again in a few seconds: ${N.message}`)}return""}async function h(){o(!0),u();const y=await m();y.length&&(a(y),await navigator.clipboard.writeText(y).then(()=>f.success("Copied, paste in Stremio!")).catch(N=>{o(!1)})),o(!1)}async function j(){try{o(!0),u();const y=await m();y.length&&(a(y),window.location.href=y,o(!1))}catch{o(!1)}}return g.jsxs("div",{children:[g.jsx(Fe,{}),g.jsxs("div",{className:"grid grid-cols-1 gap-1",children:[g.jsx("div",{className:"text-base",children:"A Letterboxd URL containing a list of posters (including any sorting!):"}),g.jsx("div",{children:g.jsx("input",{type:"text",placeholder:"https://letterboxd.com/almosteffective/watchlist",className:"w-full border border-black text-tailwind rounded text-xl px-2 py-1",ref:l,onPaste:u,onKeyDown:u,onKeyUp:u,onBlur:u,onFocus:u})}),g.jsx("div",{className:"text-base",children:"Set a custom list if you'd like (leave empty to auto-generate):"}),g.jsx("div",{children:g.jsx("input",{type:"text",placeholder:"My Cool List Name",className:"w-full border border-black text-tailwind rounded text-xl px-2 py-1",ref:c,onPaste:p,onKeyDown:p,onKeyUp:p,onBlur:p,onFocus:p})}),g.jsxs("div",{className:"flex gap-1",children:[g.jsx("button",{className:"grow border border-white bg-white uppercase text-tailwind text-lg p-2 rounded font-bold hover:bg-tailwind hover:text-white hover:underline",onClick:j,disabled:r,children:r===!1?"Install":"Validating..."}),g.jsx("button",{className:"grow border border-transparent hover:border-white bg-tailwind uppercase text-white text-lg p-2 rounded font-normal",onClick:h,disabled:r,children:r===!1?"Copy":"Validating..."})]}),g.jsx("div",{className:"hidden",children:s})]})]})}export{Be as default};
