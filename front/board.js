class Board {
    static binaryBoard = [];
    static draggedItem = {};
    constructor() {
        for (let i = 0; i < 10; i++) {
            let row = []
            for (let j = 0; j < 10; j++) {
                row.push(0);
            }
            Board.binaryBoard.push(row);
        }
    }

    static GetBinaryBoard() {
        return Board.binaryBoard;
    }
    static GetDraggedItem() {
        return Board.draggedItem;
    }
    static SetDraggedItem(item, position, cellOffset) {
        Board.draggedItem = { item, position, cellOffset };
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
                divcontent.addEventListener("dragover", Board.OnDragOver);
                divcontent.addEventListener("drop", Board.OnDrop);
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

    static OnRivalAttack(position) {
        console.log(position);
        let board = Board.GetBinaryBoard();
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

    static OrderByXThenY(positions) {
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

    static GetOrientation(positions) {
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

    static GetPositionsFromBoxId(boxId) {
        let board = Board.GetBinaryBoard();
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

    static OnDragEnd(event) {
        console.log("---OnDragEnd---");
        Board.SetDraggedItem(null, null, null);
    }

    static OnDrop(event) {
        console.log("------- DROP -------");
        let target = event.target;
        if (target.hasAttribute("data-x") && target.hasAttribute("data-y")) {
            let draggedItem = Board.GetDraggedItem();
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
                            Board.GetBinaryBoard()[i][j] = 0;
                        } else
                            throw new Error("Out of board range");
                    }
                }
                console.log("new x, new y", x, y);
                for (let i = x; i < x + h; i++) {
                    for (let j = y; j < y + w; j++) {
                        if (i >= 0 && i < 10 && j >= 0 && j < 10) {
                            Board.GetBinaryBoard()[i][j] = draggedItem.item.id;
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

    static OnDragOver(event) {
        // console.log(event);
        let target = event.target;
        if (target.hasAttribute("data-x") && target.hasAttribute("data-y")) {
            let x = +target.getAttribute("data-x");
            let y = +target.getAttribute("data-y");
            console.log("init", x, y);
            let board = Board.GetBinaryBoard();
            let draggedElmt = Board.GetDraggedItem();
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

    static OnDragStart(event) {
        console.log("---OnDragStart---");
        console.log(event);
        let target = event.target;
        let positions = Board.GetPositionsFromBoxId(target.id);
        let orientation = Board.GetOrientation(positions);
        Board.OrderByXThenY(positions);
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
        Board.SetDraggedItem(target, { x: +target.parentNode.getAttribute("data-x"), y: +target.parentNode.getAttribute("data-y") }, cellOffset);

    }

    static ErasePosition(board, positions) {
        console.log("--- ErasePosition ---");
        positions.forEach(p => {
            board[p.x][p.y] = 0;
        });
    }

    static SetNewPositions(board, positions, boxId) {
        console.log("--- SetNewPositions ---");
        positions.forEach(p => {
            board[p.x][p.y] = boxId;
        });
    }

    static SetPaddingFromOrientationAndSize(box, orientation, size) {
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

    static Rotate(event) {
        // quand la partie a demarrée et qu on a hit le boat
        // positions = [] car dans boardBinary id == b-XX__hit
        console.log("--- Rotate ---");
        let target = event.target;
        if (target.parentNode.hasAttribute("data-x") && target.parentNode.hasAttribute("data-y")) {
            console.warn(target.parentNode.getAttribute("data-x"), target.parentNode.getAttribute("data-y"));
            let positions = Board.GetPositionsFromBoxId(target.id);
            let orientation = Board.GetOrientation(positions);
            Board.OrderByXThenY(positions);
            let size = positions.length;
            let board = Board.GetBinaryBoard();
            if (orientation == "H") {
                let isFree = !board.filter((_, i) => i > positions[0].x && i < positions[0].x + size).some(v => v[positions[0].y] != 0);
                if (positions[0].x + size - 1 < 10 && isFree) {
                    Board.ErasePosition(board, positions);
                    let xInit = positions[0].x;
                    let yInit = positions[0].y;
                    let i = 0;
                    positions.forEach(v => {
                        v.x = xInit + i;
                        v.y = yInit;
                        i++;
                    });
                    Board.SetNewPositions(board, positions, target.id);
                    let h = target.style.height;
                    target.style.height = target.style.width;
                    target.style.width = h;
                    Board.SetPaddingFromOrientationAndSize(target, "V", size);
                } else { console.error("Can't rotate H --> V"); }
            } else if (orientation == "V") {
                let isFree = !board[positions[0].x].filter((_, i) => i > positions[0].y && i < positions[0].y + size).some(v => v != 0);
                if (positions[0].y + size - 1 < 10 && isFree) {
                    Board.ErasePosition(board, positions);
                    let xInit = positions[0].x;
                    let yInit = positions[0].y;
                    let i = 0;
                    positions.forEach(v => {
                        v.x = xInit;
                        v.y = yInit + i;
                        i++;
                    });
                    Board.SetNewPositions(board, positions, target.id);
                    let h = target.style.height;
                    target.style.height = target.style.width;
                    target.style.width = h;
                    Board.SetPaddingFromOrientationAndSize(target, "H", size);
                } else { console.error("Can't rotate V --> H"); }
            }
        }
    }

    setDefaultBoats() {
        let table = document.getElementById("board-table");
        let rows = table.getElementsByTagName("tr");

        let boats = [
            [{ "y": 5, "x": 4 }, { "y": 5, "x": 6 }, { "y": 5, "x": 7 }, { "y": 5, "x": 5 }],
            [{ "y": 1, "x": 2 }, { "y": 1, "x": 3 }, { "y": 1, "x": 4 }],
            [{ "y": 0, "x": 6 }, { "y": 1, "x": 6 }, { "y": 2, "x": 6 }, { "y": 3, "x": 6 }],
            [{ "y": 8, "x": 6 }, { "y": 9, "x": 6 }],
            [{ "y": 5, "x": 0 }, { "y": 5, "x": 1 }],
            [{ "y": 7, "x": 1 }, { "y": 7, "x": 2 }],
            [{ "y": 7, "x": 8 }],
            [{ "y": 3, "x": 3 }],
            [{ "y": 1, "x": 0 }],
            [{ "y": 1, "x": 9 }]
        ];

        boats.forEach(positions => {
            // console.log(JSON.stringify(positions));
            Board.OrderByXThenY(positions);
            console.log(JSON.stringify(positions));

            let orientation = Board.GetOrientation(positions);
            console.log(orientation);
            let a = document.createElement("div");
            a.classList.add("boat-box");
            a.classList.add("ui-draggable");
            a.style.height = "2em";
            a.style.width = "2em";
            a.draggable = true;
            if (orientation == "H") {
                a.style.width = `${(positions[positions.length - 1].y+1 - positions[0].y) * 2}em`;
            }
            if (orientation == "V") {
                a.style.height = `${(positions[positions.length - 1].x+1 - positions[0].x) * 2}em`;
            }

            Board.SetPaddingFromOrientationAndSize(a, orientation, positions.length);

            let x = positions[0].x;
            let y = positions[0].y;
            a.id = `b-${x}${y}`;
            // console.log(`$(${x},${y})`);
            // console.log(rows);
            rows[x].childNodes[y].childNodes[0].appendChild(a);

            a.addEventListener("dragstart", Board.OnDragStart);
            a.addEventListener("dragend", Board.OnDragEnd)
            a.addEventListener("click", Board.Rotate);

            for (let i = 0; i < positions.length; i++) {
                const pos = positions[i];
                Board.binaryBoard[pos.x][pos.y] = a.id;
            }
        });
        console.log(JSON.stringify(Board.binaryBoard));
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
                    divcontent.addEventListener("click", Board.OnCellRivalClick);

                td.appendChild(divcontent);
                row.appendChild(td);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        container.appendChild(table);
    }

    static OnCellRivalClick(event) {
        console.log("OnCellRivalClick");
        console.log(event);
        event.target.removeEventListener("click", Board.OnCellRivalClick);
        let position = { x: event.target.dataset.x, y: event.target.dataset.y };
        Board.OnRivalAttack(position);
    }

    removeEventsSelfTable() {
        let table = document.getElementById("board-table");
        let boats = table.getElementsByClassName("boat-box");
        // console.log(cells)
        for (let i = 0; i < boats.length; i++) {
            const boat = boats[i];
            boat.draggable = false;
            boat.classList.remove("ui-draggable");
            boat.removeEventListener("dragstart", Board.OnDragStart);
            boat.removeEventListener("dragend", Board.OnDragEnd);
            boat.removeEventListener("click", Board.Rotate);
        }

        let cellsContent = table.getElementsByClassName("board-cell-content");
        for (let i = 0; i < cellsContent.length; i++) {
            const cell = cellsContent[i];
            cell.removeEventListener("dragover", Board.OnDragOver);
            cell.removeEventListener("drop", Board.OnDrop);
        }
    }
}