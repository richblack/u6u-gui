class s extends HTMLElement{static get observedAttributes(){return["label","color","tooltip","workflow","disabled"]}constructor(){super(),this._shadow=this.attachShadow({mode:"open"})}connectedCallback(){var t;this._render(),(t=this._shadow.querySelector("button"))==null||t.addEventListener("click",this._handleClick.bind(this))}disconnectedCallback(){var t;(t=this._shadow.querySelector("button"))==null||t.removeEventListener("click",this._handleClick.bind(this))}attributeChangedCallback(){this._render()}_handleClick(){const t=this.getAttribute("workflow");if(!t){console.warn("[u6u-btn] workflow attribute is not set, click event ignored");return}const e=t.replace("workflow://","");this.dispatchEvent(new CustomEvent("u6u:trigger",{bubbles:!0,composed:!0,detail:{workflowId:e,payload:{}}}))}_render(){var i;const t=this.getAttribute("label")??"Button",e=this.getAttribute("color")??"#3b82f6",n=this.getAttribute("tooltip")??"",o=this.hasAttribute("disabled");this._shadow.innerHTML=`
      <style>
        button {
          background: ${e};
          color: white;
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          font-size: 14px;
          cursor: ${o?"not-allowed":"pointer"};
          opacity: ${o?"0.5":"1"};
          transition: opacity 0.2s;
        }
        button:hover:not(:disabled) {
          opacity: 0.85;
        }
      </style>
      <button
        ${o?"disabled":""}
        title="${n}"
        part="button"
      >${t}</button>
    `,(i=this._shadow.querySelector("button"))==null||i.addEventListener("click",this._handleClick.bind(this))}}customElements.define("u6u-btn",s);export{s as U6uBtn};
