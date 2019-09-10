// Root DOM CSS classes
let style = document.createElement("style");
style.appendChild(document.createTextNode("m-table span, img { display: none; }"));
//style.appendChild(document.createTextNode("m-table :nth-child(n):nth-child(-n+13) { display:block; }"));
document.head.appendChild(style);

// Template
let mTableTemplate = document.createElement('template');
mTableTemplate.innerHTML = `
  <style>
    #buttons {
      margin-bottom:5px;
    }
    #headers {
      display:flex;
      flex-flow: row nowrap;
      flex: initial;
      overflow-x: hidden;
      overflow-y: hidden;
    }
    #columns {
      display:flex;
      flex-flow: row nowrap;
      flex: initial;
    }
    #mframe {
      overflow-x: auto;
      overflow-y: scroll;
      height:150px;
    }
    #progressbar {
      height:2px;
      border:1px solid black;
      background-color:#EFEFEF;
    }
    #progressbar div {
      width:0%;
      height:2px;
      background-color:#000000;
    }
    .header {
      border:1px solid black;
    }
    .caps {
      text-align:center;
    }
    .title {
      text-align: center;
      height:20px;
      border-top:1px solid black;
      border-bottom:1px solid black;
      padding:5px;
      background:#EEEEEE;
    }
    .column {
      display:flex;
      flex-flow: column wrap;
      flex: initial;
      border:1px solid black;
    }
    m-table span, img {
        display: none;
    }
    /*.table :nth-child(2n+1) {
        display: none;
    }*/
    ::slotted(*) {
      display:inline-flex;
      align-items:center;
      height:18px;
      border-top:1px solid black;
      border-bottom:1px solid black;
      padding:5px;
    }
    ::slotted([slot="01"]) {
      color:green;
    }
    ::slotted([slot="02"]) {
      color:blue;
    }
    ::slotted([slot="03"]) {
      color:red;
    }
  </style>
  <div id="buttons">
      <input type='button' id='switchTools' value='switchTools' />
    </div>
  <div id="headers">
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
    <div class="header">
      <div class='caps'><a href='#'><</a>||||<a href='#'>></a></div>
      <div>
        <select></select>
      </div>
      <div>v^</div>
      <div class='title'></div>
    </div>
  </div>
  <div id="mframe">
    <div id="columns">
      <div class="column">
        <slot name="01"></slot>
      </div>
      <div class="column">
        <slot name="02"></slot>
      </div>
      <div class="column" >
        <slot name="03"></slot>
      </div>
      <div class="column">
        <slot name="04"></slot>
      </div>
      <div class="column">
        <slot name="05"></slot>
      </div>
      <div class="column">
        <slot name="06"></slot>
      </div>
      <div class="column">
        <slot name="07"></slot>
      </div>
    </div>
  </div>
  <div id="progressbar">
    <div />
  </div>
`;