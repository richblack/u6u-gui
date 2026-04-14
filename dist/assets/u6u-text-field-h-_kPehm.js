class l extends HTMLElement{constructor(){super(),this._value="",this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["name","placeholder","value","label","rows"]}connectedCallback(){this._value=this.getAttribute("value")??"",this._render()}attributeChangedCallback(e,t,a){e==="value"&&(this._value=a??""),this._render()}get value(){return this._value}set value(e){this._value=e;const t=this._shadow.querySelector("textarea");t&&(t.value=e)}_handleInput(e){this._value=e.target.value}_render(){var r;const e=this.getAttribute("label")??"",t=this.getAttribute("placeholder")??"",a=this.getAttribute("rows")??"3";this._shadow.innerHTML=`
      <style>
        :host { display: block; }
        label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          resize: vertical;
          transition: border-color 0.2s;
        }
        textarea:focus { border-color: #3b82f6; }
      </style>
      ${e?`<label>${e}</label>`:""}
      <textarea
        placeholder="${t}"
        rows="${a}"
        part="textarea"
      >${this._value}</textarea>
    `,(r=this._shadow.querySelector("textarea"))==null||r.addEventListener("input",this._handleInput.bind(this))}}customElements.define("u6u-text-field",l);export{l as U6uTextField};
