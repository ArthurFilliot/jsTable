// Class
customElements.define('m-table', class extends HTMLElement {

    id;
    sroot;
    nbcols;
    headers;
    width;
    headerIndex         = new Map();
    headerIndexInvert    = new Map();
    columnIndex         = new Map();
    columnFiltersInit   = new Map();
    cellsIndex          = new Map();
    models              = new Array();
    rowHeight;
    maxScrollTop;
    firstHiddenCell;

    // Owner's
    init() {
        this.id       = this.getAttribute('id');
        this.headers  = JSON.parse(this.getAttribute('headers'));
        this.nbcols   = this.headers.length;
        this.width    = this.getAttribute('width');
        this.paginationStep = parseInt(this.getAttribute('pagination-step'));

        // Init buttons
        let switchTools = this.sroot.getElementById("switchTools");
        switchTools.onclick = this.getSwitchTools();

        // Init columns frame
        let mframe = this.selectFrame();
        mframe.style.width  = this.width;
        mframe.onscroll = this.getFrameScroll();

        // Init headers and columns
        let headerscontainer         = this.selectHeaders();
        headerscontainer.style.width = this.width;
        let colscontainer            = this.selectColumns();
        for (let i=0;i<this.nbcols;i++) {
            let header = headerscontainer.children[i];
            header.id               = 'header' + i; 
            header.style.order      = i;
            this.headerIndex.set(header,i);
            this.headerIndexInvert.set(i,header);

            let caps            = this.selectHeaderCaps(header);
            caps.id             = "caps" + i;
            caps.style.display  = 'none';
            caps.draggable      = true;
            caps.ondragstart    = this.columnDragstart; // Makes it draggable
            caps.ondragover     = this.columnDragOver;
            caps.ondrop         = this.getColumnDrop(); // Makes it able to receive drop
            let capsPrevious    = this.selectHeaderCapsPrevious(header);
            capsPrevious.onclick = this.getColumnSweepPrevious();
            let capsNext        = this.selectHeaderCapsNext(header);
            capsNext.onclick    = this.getColumnSweepNext();

            let filters             = this.selectHeaderFilters(header);
            filters.style.display   = 'none';
            filters.onclick         = this.getInitFilters();
            this.columnFiltersInit.set(filters,false);

            let sorts           = this.selectHeaderSorts(header);
            sorts.style.display = 'none';
            sorts.onclick       = this.getColumnSort(); // Makes it clickable

            let headertitle       = this.selectHeaderTitle(header);
            headertitle.innerHTML = this.headers[i];

            let column = colscontainer.children[i];
            column.id               = 'column' + i; 
            column.style.order      = i;
            this.columnIndex.set(header,column);
        }

        // Remove unused headers and columns
        for (let i=this.nbcols;i<7;i++) {
            colscontainer.removeChild(colscontainer.children[i]);
            headerscontainer.removeChild(headerscontainer.children[i]);
        }
        console.log("Init done!");
    }

    init2() {
        // In height
        let firstelement            = this.selectFirstSlotted();
        let doPagination            = this.getDoPagination();
        doPagination(this.paginationStep*2);
        this.rowHeight              = firstelement.offsetHeight;
        
        this.selectFrame().onscroll = this.getFrameScroll();

        // In width
        let headerscontainer = this.selectHeaders();
        let columnscontainer = this.selectColumns();
        for (let i=0;i<this.nbcols;i++) {
            let header = headerscontainer.children[i];
            let column = columnscontainer.children[i];
            if (header.offsetWidth<column.offsetWidth) {
                header.style.width=column.offsetWidth-2;
            }else{
                column.style.width=header.offsetWidth-2;
            }
        }
        console.log("Init2 done!");
    }  

    getInitFilters() {
        let id        = this.id;
        let sroot     = this.sroot;
        let container = this;
        return function initFilters(ev) {
            let headerfilterscontainer = ev.srcElement;
            if (container.columnFiltersInit.get(headerfilterscontainer)) {
                return;
            }
            let slotName = headerfilterscontainer.parentNode.lastElementChild.name;
            let elements = document.querySelectorAll('#'+id+' > [slot="'+slotName+'"]');
            let values = new Map();
            for(let i=0;i<elements.length;i++) {
                values.set(elements[i].innerHTML,1);
            }
            for (let value of values.keys()) {
                let opt = document.createElement('option');
                opt.appendChild(document.createTextNode(value));
                ev.srcElement.firstElementChild.appendChild(opt);
            }
            container.columnFiltersInit.set(headerfilterscontainer, true);
        }
    }

    getSwitchTools() {
        let nbcols      = this.nbcols;
        let models      = this.models;
        let cellsIndex  = this.cellsIndex;
        let id          = this.id;
        let firstheader = this.selectHeaders().firstElementChild;
        let firstcolumn = this.selectColumns().firstElementChild;
        return function switchTools(ev) {
            // Init models
            if (models.length==0) {
                let element     = document.querySelector('#'+id+' > [slot]');
                let i=0;
                let model = new Array();
                models.push(model);
                do {
                    if (i%nbcols==0) {
                        model = new Array();
                        models.push(model);
                    }
                    model.push(element);
                    cellsIndex.set(element,model);
                    element = element.nextElementSibling;
                    i++;
                }while(element!=null);
            }

            // Show each column headers
            let newval;
            let header = firstheader;
            let column  = firstcolumn;
            do {
                let headercaps    = header.firstElementChild;
                newval = (newval==null) ? ((headercaps.style.display == 'none') ? 'block' : 'none') : newval;
                let headerfilters = headercaps.nextElementSibling;
                let headersorts   = headerfilters.nextElementSibling;

                headercaps.style.display    = newval;
                headerfilters.style.display = newval;
                let slotName = column.lastElementChild.name;
                let elements = document.querySelectorAll('#'+id+' > [slot="'+slotName+'"]');
                let values = new Map();
                for(let i=0;i<elements.length;i++) {
                    values.set(elements[i].innerHTML,1);
                }
                for (let value of values.keys()) {
                    let opt = document.createElement('option');
                    opt.appendChild(document.createTextNode(value));
                    headerfilters.firstElementChild.appendChild(opt);
                }
                headersorts.style.display   = newval;

                if (header.offsetWidth<column.offsetWidth) {
                    header.style.width=column.offsetWidth-2;
                }else{
                    column.style.width=header.offsetWidth-2;
                }
                if (headerfilters.firstElementChild.offsetWidth>header.offsetWidth) {
                    header.style.width=headerfilters.firstElementChild.offsetWidth-2;
                    column.style.width=headerfilters.firstElementChild.offsetWidth-2;
                }

                header = header.nextElementSibling;
                column = column.nextElementSibling;
            }while(header!=null && column!=null);
        };
    }

    selectFirstSlotted() {
        return document.querySelector('#'+this.id+' > [slot]')
    }

    selectFirstSlottedIn(slotname) {
        return document.querySelector('#'+this.id+' > [slot"'+slotName+'"]');
    }

    selectElementChild(element, index) {
        return this.sroot.querySelectorAll("#"+element.id+" > div")[index];
    }

    selectHeaders() {
        return this.sroot.getElementById("headers");
    }

    selectColumns() {
        return this.sroot.getElementById("columns");
    }

    selectFrame() {
        return this.sroot.getElementById("mframe");
    }

    selectHeaderCaps(header) {
        return header.firstElementChild;
    }

    selectHeaderCapsPrevious(header) {
        return header.firstElementChild.firstElementChild;
    }

    selectHeaderCapsNext(header) {
        return header.firstElementChild.lastElementChild;
    }

    selectHeaderFilters(header) {
        return this.selectElementChild(header, 1);
    }

    selectHeaderSorts(header) {
        return this.selectElementChild(header, 2);
    }

    selectHeaderTitle(header) {
        return this.selectElementChild(header, 3);
    }

    selectColumnSlot(column) {
        return column.firstElementChild;
    }

    selectHeaderColumn(header) {
        let suffix = header.id.replace('header','');
        return this.sroot.getElementById('column'+suffix);
    }

    getFrameScroll() {
        let container       = this;
        let doPagination    = this.getDoPagination();
        let nbcols          = this.nbcols;
        let paginationstep  = this.paginationStep;
        return function frameScroll(ev) {
             ev.preventDefault();
            let mframe = ev.srcElement;            
            if (mframe.scrollTop==container.maxScrollTop) {
                doPagination(paginationstep);
            }
        };
    }

    getDoPagination() {
        let floor       = Math.floor;
        let container   = this;
        let columns     = container.selectColumns();
        let frame       = container.selectFrame();
        let nbcols      = this.nbcols;
        return function doPagination(paginationstep) {
            let elementnum=0;
            let element = container.firstHiddenCell==null ? container.selectFirstSlotted() : container.firstHiddenCell;
            let lastelement;
            do {
                let linenum = floor(elementnum / nbcols); 
                if (linenum<paginationstep) {
                    element.style.display='block';
                    elementnum++;
                    element = element.nextElementSibling;
                }else{
                    lastelement = element.nextElementSibling;
                    element=null;
                }
            }while(element!=null)
            container.firstHiddenCell = lastelement;
            container.maxScrollTop      = columns.offsetHeight - frame.offsetHeight;
        }
    }

    constructor() {
        super();
        this.sroot  = this.attachShadow({mode: 'open'});
        let tmpl    = mTableTemplate.content.cloneNode(true);
        this.sroot.appendChild(tmpl);
    }

    static get observedAttributes() {
        return ['nbcols','types', 'colsorder', 'rowsorder', 'categories'];
    }

    connectedCallback() {
        console.log('connectedCallback() : m-table');
        this.init();
    }

    disconnectedCallback() {
        console.warn('disconnectedCallback()');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log('attributeChangedCallback()', name, oldValue, newValue);
    }

    // DOM handlers 

    getColumnDrop() {
        let container = this.sroot;
        let columnSweep = this.getColumnSweep();
        return function columnDrop(ev) {
            let source  = container.getElementById(ev.dataTransfer.getData("sourceid")).parentNode;
            let dest    = ev.srcElement.parentNode;
            columnSweep(source, dest);
        };
    }

    getColumnSweepPrevious() {
        let headerIndex = this.headerIndex;
        let headerIndexInvert = this.headerIndexInvert;
        let columnSweep = this.getColumnSweep();
        return function sweepPrevious(ev) {
            let source  = ev.srcElement.parentNode.parentNode;
            let pos     = headerIndex.get(source);
            if (pos>0) {
                let dest    = headerIndexInvert.get(pos-1);
                columnSweep(source,dest);
            }
        }
    }

    getColumnSweepNext() {
        let nbcols              = this.nbcols;
        let headerIndex         = this.headerIndex;
        let headerIndexInvert   = this.headerIndexInvert;
        let columnSweep         = this.getColumnSweep();
        return function sweepPrevious(ev) {
            let source  = ev.srcElement.parentNode.parentNode;
            let pos     = headerIndex.get(source);
            if (pos<nbcols-1) {
                let dest    = headerIndexInvert.get(pos+1);
                columnSweep(source,dest);
            }
        }
    }

    getColumnSweep() {
        let headerIndex = this.headerIndex;
        let headerIndexInvert = this.headerIndexInvert;
        let columnIndex = this.columnIndex;
        let firstheader = this.selectHeaders().children[0];
        return function columnSweep(srcHeader, dstHeader) {
            let pos     = headerIndex.get(srcHeader)
            let dest    = dstHeader;
            let destpos = headerIndex.get(dest);

            // Update index
            let curr = firstheader;
            do {
                let currpos = headerIndex.get(curr);
                if (destpos<pos) {
                    if(currpos>=destpos && currpos<pos) {
                        headerIndex.set(curr, ++currpos);
                    }
                }else{
                    if(currpos<=destpos && currpos>pos) {
                        headerIndex.set(curr, --currpos); 
                    }
                }
                curr = curr.nextElementSibling;
            }while(curr!=null);
            headerIndex.set(srcHeader, destpos);

            // Refresh styles
            for (var [key, value] of headerIndex.entries()) {
                key.style.order=value;
                columnIndex.get(key).style.order=value;
                headerIndexInvert.set(value,key);
            }  
        };
    }

    columnDragOver = function columnDragOver(ev) {
        ev.preventDefault(); // Allow drop    
    };

    columnDragstart = function columnDragstart(ev) {
        ev.dataTransfer.setData("sourceid", ev.srcElement.id);
    };

    getColumnSort() {
        let id = this.id;
        return function columnSort(ev) {
            let slotName = ev.srcElement.parentNode.lastElementChild.name;
            let elements = document.querySelectorAll('#'+id+' > [slot="'+slotName+'"]');
            for(let i=0;i<elements.length;i++) {
                let element = elements[i];
                console.log(element.innerHTML);
            }
        }
    }
    
});
