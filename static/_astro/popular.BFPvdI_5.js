import{j as e}from"./jsx-runtime.K1e75nIr.js";import"./index.NEDEFKed.js";function t({id:s,name:i,url:l}){const r=`stremio://${new URL(window.location.href).host}/${s}/manifest.json`;return e.jsxs("div",{className:"grid gap-2 grid-cols-2",children:[e.jsx("div",{className:"text-right",children:e.jsx("a",{href:l,className:"italic hover:underline",children:i})}),e.jsxs("div",{className:"grid grid-flow-col grid-cols-2 gap-1",children:[e.jsx("button",{className:"border border-white rounded hover:bg-white hover:text-tailwind",onClick:()=>window.location.href=r,children:"Install"}),e.jsx("button",{className:"border border-transparent hover:border-white",onClick:()=>navigator.clipboard.writeText(r).then(()=>alert("Copied!")),children:"Copy"})]})]})}function a(){return e.jsxs("div",{children:[e.jsxs("h2",{className:"text-center font-semibold text-xl mb-2",children:["Popular lists",e.jsx("br",{}),e.jsx("div",{className:"text-sm",children:"(first page only)"})]}),e.jsxs("div",{className:"grid gap-1",children:[e.jsx(t,{id:"_internal_|weekly",name:"Weekly",url:"https://letterboxd.com/films/popular/this/week/"}),e.jsx(t,{id:"_internal_|monthly",name:"Monthly",url:"https://letterboxd.com/films/popular/this/monthly/"})]})]})}export{a as default};