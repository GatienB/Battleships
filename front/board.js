class Board {
    binaryBoard = [];
    draggedItem = {};
    socketManager = null;
    constructor() {
        this.initBinaryBoard();
    }

    initBinaryBoard() {
        this.binaryBoard = [];
        for (let i = 0; i < 10; i++) {
            let row = []
            for (let j = 0; j < 10; j++) {
                row.push(0);
            }
            this.binaryBoard.push(row);
        }
    }

    getBinaryBoard() {
        return JSON.parse(JSON.stringify(this.binaryBoard));
    }
    getDraggedItem() {
        return this.draggedItem;
    }
    setDraggedItem(item, position, cellOffset) {
        this.draggedItem = { item, position, cellOffset };
    }

    createBoard() {
        let container = document.getElementById("board-container");
        let table = document.createElement("table");
        let tbody = document.createElement("tbody");
        table.id = "board-table";
        table.classList.add("board-table");

        for (let i = 0; i < 10; i++) {
            let row = document.createElement("tr");
            row.classList.add("board-row");
            for (let j = 0; j < 10; j++) {
                let td = document.createElement("td");
                td.classList.add("board-cell");
                let divcontent = document.createElement("div");
                divcontent.classList.add("board-cell-content");
                divcontent.addEventListener("dragover", this.onDragOver);
                divcontent.addEventListener("drop", this.onDrop);
                divcontent.setAttribute("data-x", i);
                divcontent.setAttribute("data-y", j);

                if (j == 0) {
                    let divRowNb = document.createElement("div");
                    divRowNb.innerText = i + 1;
                    divRowNb.classList.add("marker_row");
                    divRowNb.classList.add("marker");
                    divcontent.appendChild(divRowNb);
                }
                if (i == 0) {
                    let divColNb = document.createElement("div");
                    divColNb.innerText = String.fromCharCode(65 + j);
                    divColNb.classList.add("marker_col");
                    divColNb.classList.add("marker");
                    divcontent.appendChild(divColNb);
                }

                td.appendChild(divcontent);
                row.appendChild(td);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        container.appendChild(table);

        this.setDefaultBoats()
    }

    onRivalAttack = (position) => {
        console.log(position);
        let board = this.binaryBoard;
        let rivalTable = document.getElementById("rival-table");
        let selfTable = document.getElementById("board-table");
        let x = +position.x;
        let y = +position.y;

        let id = board[x][y];
        if (id != 0) {
            console.log("boom");
            let cross = document.createElement("div");
            cross.classList.add("cross");
            let cellsContent = rivalTable.getElementsByClassName("board-cell-content");
            cellsContent[(x * 10) + y].appendChild(cross);
            cellsContent[(x * 10) + y].parentElement.classList.add("board-cell__hit");

            let cellsContentSelf = selfTable.getElementsByClassName("board-cell-content");
            cellsContentSelf[(x * 10) + y].appendChild(cross.cloneNode());
            cellsContentSelf[(x * 10) + y].parentElement.classList.add("board-cell__hit");
            board[x][y] = id + "__hit";
            if (!board.some(v => v == id)) {
                let itemsToAddClass = [];
                for (let x = 0; x < board.length; x++) {
                    const row = board[x];
                    for (let y = 0; y < row.length; y++) {
                        const col = row[y];
                        if (col != 0) {
                            if (col == id) {
                                console.log("rezr");
                                return;
                            }
                            if (col.startsWith(id + "__")) {
                                itemsToAddClass.push(cellsContent[(x * 10) + y].parentElement);
                                itemsToAddClass.push(cellsContentSelf[(x * 10) + y].parentElement);
                            }
                        }
                    }
                }
                itemsToAddClass.forEach(v => {
                    v.classList.add("board-cell__done");
                });
                // document.getElementById(id).classList.add("")
            }
        } else {
            console.log("plouf");
            let cellsContent = rivalTable.getElementsByClassName("board-cell-content");
            cellsContent[(x * 10) + y].parentElement.classList.add("board-cell__miss");
            let cellsContentSelf = selfTable.getElementsByClassName("board-cell-content");
            cellsContentSelf[(x * 10) + y].parentElement.classList.add("board-cell__miss");
        }
    }

    orderByXThenY = (positions) => {
        positions.sort((a, b) => {
            if (a.x < b.x)
                return -1;
            else if (a.x == b.x)
                return 0;
            else
                return 1;
        });
        positions.sort((a, b) => {
            if (a.y < b.y)
                return -1;
            else if (a.y == b.y)
                return 0;
            else
                return 1;
        });
    }

    getOrientation = (positions) => {
        let x, y;
        let isHorizontal = false;
        let isVertical = false;
        if (positions.length <= 1) {
            return "H_V";
        } else {
            x = positions[0].x;
            y = positions[0].y;
            isHorizontal = !positions.map(v => v.x).some(_x => _x != x);
            isVertical = !positions.map(v => v.y).some(_y => _y != y);

            if (isHorizontal && isVertical) {
                return "H_V";
            } else if (isHorizontal) {
                return "H";
            } else if (isVertical) {
                return "V";
            }
        }
    }

    getPositionsFromBoxId = (boxId) => {
        let board = this.binaryBoard;
        let positions = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                if (board[i][j] == boxId) {
                    positions.push({ x: i, y: j });
                }
            }
        }
        return positions;
    }

    print = (positions, boxIds) => {
        positions.forEach((v, i) => {
            console.log(boxIds[i]);
            v.forEach(p => {
                console.log(`(${p.x}, ${p.y})`);
            })
        })
    }

    getAllPositions = () => {
        let board = this.binaryBoard;
        let idsAdded = [];
        let positions = [];
        let boxId;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                boxId = board[i][j];
                if (boxId !== 0 && !idsAdded.some(id => id === boxId)) {
                    positions.push(this.getPositionsFromBoxId(boxId));
                    idsAdded.push(boxId);
                }
            }
        }
        // Board.print(positions, idsAdded);
        return positions;
    }

    onDragEnd = (event) => {
        console.log("---onDragEnd---");
        this.setDraggedItem(null, null, null);
    }

    onDrop = (event) => {
        console.log("------- DROP -------");
        let target = event.target;
        if (target.hasAttribute("data-x") && target.hasAttribute("data-y")) {
            let draggedItem = this.getDraggedItem();
            let cellOffset = draggedItem.cellOffset;
            let x = +target.getAttribute("data-x");
            let y = +target.getAttribute("data-y");
            // target.appendChild(draggedItem.item);
            console.log(cellOffset);
            let xInitial = draggedItem.position.x;
            let yInitial = draggedItem.position.y;
            let w = +draggedItem.item.style.width.replace("em", "");
            let h = +draggedItem.item.style.height.replace("em", "");
            if (w > 0 && h > 0) {
                w = w / 2;
                h = h / 2;
                if (cellOffset > 0) {
                    if (w > h) {
                        // H
                        y = y - cellOffset;
                    } else if (w < h) {
                        // V
                        x = x - cellOffset;
                    }
                }
                console.log("w,h", w, h);
                console.log("xInit,yInit", xInitial, yInitial);
                for (let i = xInitial; i < xInitial + h; i++) {
                    for (let j = yInitial; j < yInitial + w; j++) {
                        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                            this.binaryBoard[i][j] = 0;
                        } else
                            throw new Error("Out of board range");
                    }
                }
                console.log("new x, new y", x, y);
                for (let i = x; i < x + h; i++) {
                    for (let j = y; j < y + w; j++) {
                        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                            this.binaryBoard[i][j] = draggedItem.item.id;
                        } else
                            throw new Error("Out of board range");
                    }
                }
                if (cellOffset > 0) {
                    let table = document.getElementById("board-table");
                    let cellsContent = table.getElementsByClassName("board-cell-content");
                    cellsContent[(x * 10) + y].appendChild(draggedItem.item);
                } else {
                    target.appendChild(draggedItem.item);
                }
                event.preventDefault();
            }
        }
    }

    onDragOver = (event) => {
        // console.log(event);
        let target = event.target;
        if (target.hasAttribute("data-x") && target.hasAttribute("data-y")) {
            let x = +target.getAttribute("data-x");
            let y = +target.getAttribute("data-y");
            console.log("init", x, y);
            let board = this.binaryBoard;
            let draggedElmt = this.getDraggedItem();
            let draggedItem = draggedElmt.item;
            let cellOffset = draggedElmt.cellOffset;
            // console.log(draggedItem);
            if (draggedItem) {
                let w = +draggedItem.style.width.replace("em", "");
                let h = +draggedItem.style.height.replace("em", "");
                if (w > 0 && h > 0) {
                    w = w / 2;
                    h = h / 2;
                    console.log(x, y);
                    if (cellOffset > 0) {
                        if (w > h) {
                            // H
                            y = y - cellOffset;
                        } else if (w < h) {
                            // V
                            x = x - cellOffset;
                        }
                    }
                    console.log(x, y);
                    for (let i = x; i < x + h; i++) {
                        for (let j = y; j < y + w; j++) {
                            if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                                if (board[i][j] != 0)
                                    return
                            } else
                                return
                        }
                    }
                    // for (let i = x; i < x + h; i++) {
                    //     for (let j = y; j < y + w; j++) {
                    //         if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                    //             if (board[i][j] != 0)
                    //                 return
                    //         } else
                    //             return
                    //     }
                    // }
                    event.preventDefault();
                }
            }
        }
    }

    onDragStart = (event) => {
        console.log("---onDragStart---");
        console.log(event);
        let target = event.target;
        let positions = this.getPositionsFromBoxId(target.id);
        let orientation = this.getOrientation(positions);
        this.orderByXThenY(positions);
        let cellOffset = 0;
        if (orientation == "H") {
            let cellSize = target.clientWidth / positions.length;
            cellOffset = event.offsetX / cellSize;
        } else if (orientation == "V") {
            let cellSize = target.clientHeight / positions.length;
            cellOffset = event.offsetY / cellSize;
        }
        if (cellOffset >= positions.length)
            cellOffset = positions.length - 1;
        else if (cellOffset < 0) {
            cellOffset = 0;
        }
        cellOffset = Math.trunc(cellOffset);
        console.log(target.clientWidth, target.clientHeight);
        console.log(event.offsetX, event.offsetY);
        console.log(event.offsetX / target.clientWidth, event.offsetY / target.clientHeight);
        console.log("cellOffset : ", cellOffset);
        this.setDraggedItem(target, { x: +target.parentNode.getAttribute("data-x"), y: +target.parentNode.getAttribute("data-y") }, cellOffset);

    }

    erasePosition = (board, positions) => {
        console.log("--- ErasePosition ---");
        positions.forEach(p => {
            board[p.x][p.y] = 0;
        });
    }

    setNewPositions = (board, positions, boxId) => {
        console.log("--- SetNewPositions ---");
        positions.forEach(p => {
            board[p.x][p.y] = boxId;
        });
    }

    setPaddingFromOrientationAndSize = (box, orientation, size) => {
        box.style.paddingRight = "1px";
        box.style.paddingBottom = "1px";
        if (orientation == "H") {
            if (size <= 2)
                box.style.paddingRight = "5px";
            else if (size == 3)
                box.style.paddingRight = "7px";
            else
                box.style.paddingRight = "10px";
        } else if (orientation == "V") {
            if (size <= 2)
                box.style.paddingBottom = "4px";
            else if (size == 3)
                box.style.paddingBottom = "8px";
            else
                box.style.paddingBottom = "10px";
        }
    }

    rotate = (event) => {
        // quand la partie a demarrée et qu on a hit le boat
        // positions = [] car dans boardBinary id == b-XX__hit
        console.log("--- rotate ---");
        let target = event.target;
        if (target.parentNode.hasAttribute("data-x") && target.parentNode.hasAttribute("data-y")) {
            console.warn(target.parentNode.getAttribute("data-x"), target.parentNode.getAttribute("data-y"));
            let positions = this.getPositionsFromBoxId(target.id);
            let orientation = this.getOrientation(positions);
            this.orderByXThenY(positions);
            let size = positions.length;
            let board = this.binaryBoard;
            if (orientation == "H") {
                let isFree = !board.filter((_, i) => i > positions[0].x && i < positions[0].x + size).some(v => v[positions[0].y] != 0);
                if (positions[0].x + size - 1 < 10 && isFree) {
                    this.erasePosition(board, positions);
                    let xInit = positions[0].x;
                    let yInit = positions[0].y;
                    let i = 0;
                    positions.forEach(v => {
                        v.x = xInit + i;
                        v.y = yInit;
                        i++;
                    });
                    this.setNewPositions(board, positions, target.id);
                    let h = target.style.height;
                    target.style.height = target.style.width;
                    target.style.width = h;
                    this.setPaddingFromOrientationAndSize(target, "V", size);
                } else { console.error("Can't rotate H --> V"); }
            } else if (orientation == "V") {
                let isFree = !board[positions[0].x].filter((_, i) => i > positions[0].y && i < positions[0].y + size).some(v => v != 0);
                if (positions[0].y + size - 1 < 10 && isFree) {
                    this.erasePosition(board, positions);
                    let xInit = positions[0].x;
                    let yInit = positions[0].y;
                    let i = 0;
                    positions.forEach(v => {
                        v.x = xInit;
                        v.y = yInit + i;
                        i++;
                    });
                    this.setNewPositions(board, positions, target.id);
                    let h = target.style.height;
                    target.style.height = target.style.width;
                    target.style.width = h;
                    this.setPaddingFromOrientationAndSize(target, "H", size);
                } else { console.error("Can't rotate V --> H"); }
            }
        }
    }

    setDefaultBoats(_boats = null) {
        let table = document.getElementById("board-table");
        let rows = table.getElementsByTagName("tr");
        let boats = [];
        this.initBinaryBoard();
        let boatsAlreadyHere = Array.from(table.getElementsByClassName("boat-box"));
        boatsAlreadyHere.forEach(b => {
            b.parentElement.removeChild(b);
        })

        if (_boats == null || _boats.length <= 0) {
            boats = [
                [{ "y": 5, "x": 4 }, { "y": 5, "x": 6 }, { "y": 5, "x": 7 }, { "y": 5, "x": 5 }],
                [{ "y": 1, "x": 2 }, { "y": 1, "x": 3 }, { "y": 1, "x": 4 }],
                [{ "y": 0, "x": 6 }, { "y": 1, "x": 6 }, { "y": 2, "x": 6 }],
                [{ "y": 8, "x": 6 }, { "y": 9, "x": 6 }],
                [{ "y": 5, "x": 0 }, { "y": 5, "x": 1 }],
                [{ "y": 7, "x": 1 }, { "y": 7, "x": 2 }],
                [{ "y": 7, "x": 8 }],
                [{ "y": 3, "x": 3 }],
                [{ "y": 1, "x": 0 }],
                [{ "y": 1, "x": 9 }]
            ];
        } else {
            boats = _boats;
        }

        boats.forEach(positions => {
            // console.log(JSON.stringify(positions));
            this.orderByXThenY(positions);
            console.log(JSON.stringify(positions));

            let orientation = this.getOrientation(positions);
            console.log(orientation);
            let a = document.createElement("div");
            a.classList.add("boat-box");
            a.classList.add("ui-draggable");
            a.style.height = "2em";
            a.style.width = "2em";
            a.draggable = true;
            if (orientation == "H") {
                a.style.width = `${(positions[positions.length - 1].y + 1 - positions[0].y) * 2}em`;
            }
            if (orientation == "V") {
                a.style.height = `${(positions[positions.length - 1].x + 1 - positions[0].x) * 2}em`;
            }

            this.setPaddingFromOrientationAndSize(a, orientation, positions.length);

            let x = positions[0].x;
            let y = positions[0].y;
            a.id = `b-${x}${y}`;
            // console.log(`$(${x},${y})`);
            // console.log(rows);
            rows[x].childNodes[y].childNodes[0].appendChild(a);

            a.addEventListener("dragstart", this.onDragStart);
            a.addEventListener("dragend", this.onDragEnd)
            a.addEventListener("click", this.rotate);

            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                this.binaryBoard[pos.x][pos.y] = a.id;
            }
        });
        console.log(JSON.stringify(this.binaryBoard));
    }

    createRivalBoard(withEvent = false) {
        let container = document.getElementById("rival-container");
        let table = document.createElement("table");
        let tbody = document.createElement("tbody");
        table.id = "rival-table";
        table.classList.add("board-table");

        for (let i = 0; i < 10; i++) {
            let row = document.createElement("tr");
            row.classList.add("board-row");
            for (let j = 0; j < 10; j++) {
                let td = document.createElement("td");
                td.classList.add("board-cell");
                let divcontent = document.createElement("div");
                divcontent.classList.add("board-cell-content");
                divcontent.classList.add("pointer");
                divcontent.setAttribute("data-x", i);
                divcontent.setAttribute("data-y", j);

                if (j == 0) {
                    let divRowNb = document.createElement("div");
                    divRowNb.innerText = i + 1;
                    divRowNb.classList.add("marker_row");
                    divRowNb.classList.add("marker");
                    divcontent.appendChild(divRowNb);
                }
                if (i == 0) {
                    let divColNb = document.createElement("div");
                    divColNb.innerText = String.fromCharCode(65 + j);
                    divColNb.classList.add("marker_col");
                    divColNb.classList.add("marker");
                    divcontent.appendChild(divColNb);
                }

                if (withEvent)
                    divcontent.addEventListener("click", this.onCellRivalClick);

                td.appendChild(divcontent);
                row.appendChild(td);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        container.prepend(table);
    }

    SetSocketManager(socketManager) {
        this.socketManager = socketManager;
    }

    onCellRivalClick = (event) => {
        console.log("OnCellRivalClick");
        console.log(event);
        event.target.removeEventListener("click", this.onCellRivalClick);
        let position = { x: event.target.dataset.x, y: event.target.dataset.y };
        // this.onRivalAttack(position);

        this.socketManager.sendSelfAttack(position);

    }

    removeEventsSelfTable() {
        let table = document.getElementById("board-table");
        let boats = table.getElementsByClassName("boat-box");
        // console.log(cells)
        for (let i = 0; i < boats.length; i++) {
            const boat = boats[i];
            boat.draggable = false;
            boat.classList.remove("ui-draggable");
            boat.removeEventListener("dragstart", this.onDragStart);
            boat.removeEventListener("dragend", this.onDragEnd);
            boat.removeEventListener("click", this.rotate);
        }

        let cellsContent = table.getElementsByClassName("board-cell-content");
        for (let i = 0; i < cellsContent.length; i++) {
            const cell = cellsContent[i];
            cell.removeEventListener("dragover", this.onDragOver);
            cell.removeEventListener("drop", this.onDrop);
        }
    }

    activateEventsRivalTable() {
        this.toggleEventsRivalTable();
    }
    deactivateEventsRivalTable() {
        this.toggleEventsRivalTable(true);
    }

    toggleEventsRivalTable(deactivate = false) {
        let rivalTable = document.getElementById("rival-table");
        if (rivalTable) {
            let cellsContent = rivalTable.getElementsByClassName("board-cell-content");
            for (let i = 0; i < cellsContent.length; i++) {
                const cell = cellsContent[i];
                if (deactivate) {
                    cell.removeEventListener("click", this.onCellRivalClick);
                } else {
                    let classes = cell.parentElement.classList.value.split(" ");
                    let ignored = ["board-cell__miss", "board-cell__hit"];
                    if (!classes.some(c => ignored.some(_c => _c == c))) {
                        cell.addEventListener("click", this.onCellRivalClick);
                    } else {
                        console.log(`cell[${i}], hit or miss`);
                    }
                }
            }
        }
    }

    setSelfWait(isWaiting) {
        this.setContainerWait("board-container", isWaiting);
    }
    setRivalWait(isWaiting) {
        this.setContainerWait("rival-container", isWaiting);
    }

    setContainerWait(containerId, isWaiting) {
        let container = document.getElementById(containerId);
        if (container) {
            if (isWaiting) {
                container.classList.add("board__wait");
            } else {
                container.classList.remove("board__wait");
            }
        }
    }

    // game events
    onSelfAttackHit(position, boatPositions) {
        console.log("onSelfAttackHit");
        let rivalTable = document.getElementById("rival-table");
        console.log(position);
        let x = +position.x;
        let y = +position.y;

        let cross = document.createElement("div");
        cross.classList.add("cross");
        let cellsContent = rivalTable.getElementsByClassName("board-cell-content");
        cellsContent[(x * 10) + y].appendChild(cross);
        cellsContent[(x * 10) + y].parentElement.classList.add("board-cell__hit");

        if (boatPositions && boatPositions.length > 0) {
            for (let i = 0; i < boatPositions.length; i++) {
                let pos = boatPositions[i];
                cellsContent[(pos.x * 10) + pos.y].parentElement.classList.add("board-cell__done");
            }
            this.setBoatStatsSunk("rival-container", boatPositions.length);
        }
    }

    onSelfAttackMiss(position) {
        console.log("onSelfAttackMiss");
        let rivalTable = document.getElementById("rival-table");
        console.log(position);
        let x = +position.x;
        let y = +position.y;
        let cellsContent = rivalTable.getElementsByClassName("board-cell-content");
        cellsContent[(x * 10) + y].parentElement.classList.add("board-cell__miss");
    }

    onRivalAttackHit(position, boatPositions) {
        console.log("onRivalAttackHit");
        let selfTable = document.getElementById("board-table");
        console.log(position);
        let x = +position.x;
        let y = +position.y;

        console.log("boom");
        let cross = document.createElement("div");
        cross.classList.add("cross");
        let cellsContentSelf = selfTable.getElementsByClassName("board-cell-content");
        cellsContentSelf[(x * 10) + y].appendChild(cross);
        cellsContentSelf[(x * 10) + y].parentElement.classList.add("board-cell__hit");

        if (boatPositions && boatPositions.length > 0) {
            for (let i = 0; i < boatPositions.length; i++) {
                let pos = boatPositions[i];
                cellsContentSelf[(pos.x * 10) + pos.y].parentElement.classList.add("board-cell__done");
            }
            this.setBoatStatsSunk("board-container", boatPositions.length);
        }
    }

    onRivalAttackMiss(position) {
        console.log("onRivalAttackMiss");
        let selfTable = document.getElementById("board-table");
        console.log(position);
        let x = +position.x;
        let y = +position.y;

        let cellsContentSelf = selfTable.getElementsByClassName("board-cell-content");
        cellsContentSelf[(x * 10) + y].parentElement.classList.add("board-cell__miss");
    }

    setBoatStatsSunk(containerId, boatSize) {
        let container = document.getElementById(containerId);
        if (container) {
            let boatStats = container.getElementsByClassName("boats-stats")[0];
            if (boatStats) {
                let boatTypeBySize = boatStats.getElementsByClassName(`boat-type__len${boatSize}`)[0];
                if (boatTypeBySize) {
                    let children = Array.from(boatTypeBySize.children);
                    let boats = children.filter(child => ![...child.classList].some(cl => cl == "sunk"));
                    if (boats.length > 0) {
                        boats[0].classList.add("sunk");
                    }
                }
            }
        }
    }

    randomizeBoats() {
        /*
            Number | Size
                2     4
                1     3
                3     2
                4     1   
        */
        const TOTAL_BOATS = 10;
        let BOATS_SETTINGS = [
            { boatSize: 4, count: 1 },
            { boatSize: 3, count: 2 },
            { boatSize: 2, count: 3 },
            { boatSize: 1, count: 4 },
        ]

        let _freePositions = this._initFreePositionsToPlay();
        let boatsPlayer = [];
        for (const key in BOATS_SETTINGS) {
            const setting = BOATS_SETTINGS[key];
            for (let c = 0; c < setting.count; c++) {
                let isOk = false;
                let positions = [];
                while (!isOk) {
                    let orientation = this._getRandomNumber(0, 2);
                    let initialPos = this._getRandomPositionInFreePositions(_freePositions);
                    positions = this._getFreePositionsFromPosInit(initialPos, orientation, setting.boatSize, _freePositions);
                    if (positions.length == setting.boatSize) {
                        positions.forEach(p => {
                            let index = _freePositions.indexOf(p);
                            if (index >= 0) {
                                _freePositions.splice(index, 1);
                            } else {
                                throw Error("Index < 0, pas normal");
                            }
                        });
                        isOk = true;
                    }
                }
                boatsPlayer.push(positions);
            }
        }
        console.log(boatsPlayer);
        this.setDefaultBoats(boatsPlayer);
    }

    _getFreePositionsFromPosInit(positionInit, orientation, size, freePositions) {
        let positionsList = [positionInit];
        if (orientation === 0) {
            // H
            for (let y = positionInit.y + 1; y < 10; y++) {
                let posFree = freePositions.filter(p => p.x == positionInit.x && p.y == y)[0];
                if (posFree && positionsList.length < size) {
                    positionsList.push(posFree);
                } else {
                    break;
                }
            }
            if (positionsList.length < size) {
                for (let y = positionInit.y - 1; y > 0; y--) {
                    let posFree = freePositions.filter(p => p.x == positionInit.x && p.y == y)[0];
                    if (posFree && positionsList.length < size) {
                        positionsList.push(posFree);
                    } else {
                        break;
                    }
                }
            }
        } else {
            // V
            for (let x = positionInit.x + 1; x < 10; x++) {
                let posFree = freePositions.filter(p => p.x == x && p.y == positionInit.y)[0];
                if (posFree && positionsList.length < size) {
                    positionsList.push(posFree);
                } else {
                    break;
                }
            }
            if (positionsList.length < size) {
                for (let x = positionInit.x - 1; x > 0; x--) {
                    let posFree = freePositions.filter(p => p.x == x && p.y == positionInit.y)[0];
                    if (posFree && positionsList.length < size) {
                        positionsList.push(posFree);
                    } else {
                        break;
                    }
                }
            }
        }

        return positionsList;
    }

    _getRandomPositionInFreePositions(_freePositions, removeFromList = false) {
        let maxId = _freePositions.length;
        let index = this._getRandomNumber(0, maxId);
        let pos = _freePositions[index];
        if (removeFromList && index >= 0) {
            _freePositions.splice(index, 1);
        }
        return pos;
    }
    _initFreePositionsToPlay() {
        let freePositions = [];
        for (let l = 0; l < 10; l++) {
            for (let c = 0; c < 10; c++) {
                freePositions.push({ x: l, y: c });
            }
        }
        return freePositions;
    }
    _getRandomNumber(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    }
}