class a extends HTMLElement{constructor(){super(),this._triggerHandler=null,this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["title","padding"]}connectedCallback(){this._render(),this._triggerHandler=this._handleTrigger.bind(this),this.addEventListener("u6u:trigger",this._triggerHandler)}disconnectedCallback(){this._triggerHandler&&this.removeEventListener("u6u:trigger",this._triggerHandler)}attributeChangedCallback(){this._render()}_handleTrigger(t){const e=t;t.stopPropagation();const r={};this.querySelectorAll("u6u-text-input, u6u-text-field").forEach(i=>{const d=i.getAttribute("name"),s=i.value;d&&s!==void 0&&(r[d]=s)}),this.dispatchEvent(new CustomEvent("u6u:trigger",{bubbles:!0,composed:!0,detail:{workflowId:e.detail.workflowId,payload:{...e.detail.payload,...r}}}))}_render(){const t=this.getAttribute("title")??"",e=this.getAttribute("padding")??"16px";this._shadow.innerHTML=`
      <style>
        :host { display: block; }
        .card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: ${e};
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .card-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }
        ::slotted(*) { margin-bottom: 8px; }
        ::slotted(*:last-child) { margin-bottom: 0; }
      </style>
      <div class="card" part="card">
        ${t?`<div class="card-title">${t}</div>`:""}
        <slot></slot>
      </div>
    `}}customElements.define("u6u-card",a);export{a as U6uCard};
