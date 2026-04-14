class l extends HTMLElement{constructor(){super(),this._value="",this._shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["name","placeholder","value","label"]}connectedCallback(){var t;this._value=this.getAttribute("value")??"",this._render(),(t=this._shadow.querySelector("input"))==null||t.addEventListener("input",this._handleInput.bind(this))}attributeChangedCallback(t,e,i){t==="value"&&(this._value=i??""),this._render()}get value(){return this._value}set value(t){this._value=t;const e=this._shadow.querySelector("input");e&&(e.value=t)}_handleInput(t){this._value=t.target.value}_render(){var i;const t=this.getAttribute("label")??"",e=this.getAttribute("placeholder")??"";this._shadow.innerHTML=`
      <style>
        :host { display: block; }
        label { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
        input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        input:focus { border-color: #3b82f6; }
      </style>
      ${t?`<label>${t}</label>`:""}
      <input
        type="text"
        placeholder="${e}"
        value="${this._value}"
        part="input"
      />
    `,(i=this._shadow.querySelector("input"))==null||i.addEventListener("input",this._handleInput.bind(this))}}customElements.define("u6u-text-input",l);export{l as U6uTextInput};
