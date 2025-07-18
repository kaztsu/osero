const GLOBAL_height = 8
const GLOBAL_width = 8
let GLOBAL_turn = -1
let GLOBAL_preturn = 1
let GLOBAL_black_number = 0
let GLOBAL_white_number = 0
let GLOBAL_bord = []
const GLOBAL_first_black = [[4, 3], [3, 4]]
const GLOBAL_first_white = [[4, 4], [3, 3]]
let GLOBAL_canputlist = []
let GLOBAL_nextturn_map = new Map()
let GLOBAL_room_set = new Set()
let GLOBAL_stopper = false
let GLOBAL_AIturn = 1
let GLOBAL_syori = false
setup()
function y_split(n) {
    return Math.floor(n / GLOBAL_width)
}
function x_split(n) {
    return Math.floor(n % GLOBAL_width)
}
function assyuku(y, x) {
    return y * GLOBAL_width + x
}
function setup() {
    for (let i = 0; i < GLOBAL_height; i++) {
        GLOBAL_bord.push(new Array(GLOBAL_width).fill(0))
        for (let j = 0; j < GLOBAL_width; j++) {
            let squer = document.createElement('div');
            squer.id = assyuku(i, j)
            let container = document.getElementById('container');
            container.appendChild(squer);
            squer.addEventListener('click', clickHandler)
            GLOBAL_room_set.add(assyuku(i, j))
        }
    }
    for (let i = 0; i < GLOBAL_first_black.length; i++) {
        GLOBAL_bord[GLOBAL_first_black[i][0]][GLOBAL_first_black[i][1]] = -1
        GLOBAL_room_set.delete(assyuku(GLOBAL_first_black[i][0], GLOBAL_first_black[i][1]))
        GLOBAL_black_number++
    }
    for (let i = 0; i < GLOBAL_first_white.length; i++) {
        GLOBAL_bord[GLOBAL_first_white[i][0]][GLOBAL_first_white[i][1]] = 1
        GLOBAL_room_set.delete(assyuku(GLOBAL_first_white[i][0], GLOBAL_first_white[i][1]))
        GLOBAL_white_number++
    }
    [GLOBAL_canputlist, GLOBAL_nextturn_map] = canput(GLOBAL_bord, GLOBAL_room_set, GLOBAL_turn)
    display()
    yobidasuka()
}
function display() {
    return new Promise((resolve) => {

        for (let i = 0; i < GLOBAL_height; i++) {
            for (let j = 0; j < GLOBAL_width; j++) {
                if (GLOBAL_bord[i][j] == -1) {
                    document.getElementById(assyuku(i, j)).className = "K masu"
                }
                if (GLOBAL_bord[i][j] == 1) {
                    document.getElementById(assyuku(i, j)).className = "W masu"
                }
                if (GLOBAL_bord[i][j] == 0) {
                    document.getElementById(assyuku(i, j)).className = "masu"
                }
            }
        }
        [GLOBAL_canputlist, GLOBAL_nextturn_map] = canput(GLOBAL_bord, GLOBAL_room_set, GLOBAL_turn)
        for (let i = 0; i < GLOBAL_canputlist.length; i++) {
            document.getElementById(assyuku(GLOBAL_canputlist[i][0], GLOBAL_canputlist[i][1])).className = "ten"
        }
        document.getElementById("K").textContent = GLOBAL_black_number
        document.getElementById("W").textContent = GLOBAL_white_number
        if (GLOBAL_turn == 1) {
            document.getElementById("think").textContent = "白"
        } else {
            document.getElementById("think").textContent = "黒"
        }
        GLOBAL_stopper = false

        setTimeout(() => {
            resolve('resolved');
        }, 500);
    });
}
async function clickHandler(e) {
    let y = y_split(e.target.id)
    let x = x_split(e.target.id)
    if (!GLOBAL_nextturn_map.has(assyuku(y, x)) || GLOBAL_syori) {
        return
    }
    GLOBAL_syori = true
    if (GLOBAL_turn == -1) {
        GLOBAL_black_number++
    }
    if (GLOBAL_turn == 1) {
        GLOBAL_white_number++
    }
    GLOBAL_bord[y][x] = GLOBAL_turn
    GLOBAL_room_set.delete(assyuku(y, x))
    let turnbacklist = GLOBAL_nextturn_map.get(assyuku(y, x))
    for (let i = 0; i < turnbacklist.length; i++) {
        GLOBAL_bord[turnbacklist[i][0]][turnbacklist[i][1]] = GLOBAL_turn
    }
    if (GLOBAL_turn == -1) {
        GLOBAL_black_number += turnbacklist.length
        GLOBAL_white_number -= turnbacklist.length
    }
    if (GLOBAL_turn == 1) {
        GLOBAL_black_number -= turnbacklist.length
        GLOBAL_white_number += turnbacklist.length
    }
    //console.log(GLOBAL_turn,GLOBAL_canputlist,GLOBAL_nextturn_map)
    [GLOBAL_turn, GLOBAL_canputlist, GLOBAL_nextturn_map] = changeturn(GLOBAL_turn, GLOBAL_bord, GLOBAL_room_set)
    GLOBAL_stopper = true

    await display()

    yobidasuka()

}
function changeturn(turn, bord, room) {
    turn = turn * -1
    let canputlist
    let next_map
    [canputlist, next_map] = canput(bord, room, turn)
    if (canputlist.length == 0) {
        turn = turn * -1
        let [canputlist, next_map] = canput(bord, room, turn)
        if (canputlist.length == 0) {
            return [-1, -1, -1, -1]
        } else {
            GLOBAL_preturn = turn
            return [turn, canputlist, next_map, 1]
        }
    }
    GLOBAL_preturn = turn * -1
    return [turn, canputlist, next_map, 1]
}
function canput(bord, room, turn) {
    let list = [...room]
    let result = []
    let map = new Map()
    for (let i = 0; i < list.length; i++) {
        let y = y_split(list[i])
        let x = x_split(list[i])
        let tasikameru = search(y, x, bord, turn)
        if (tasikameru.length != 0) {
            result.push([y, x])
            map.set(assyuku(y, x), tasikameru)
        }
    }
    return [result, map]
}
function search(y, x, bord, turn) {
    let turnback = []
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (i == 0 && j == 0) {
                continue
            }
            let uraninaru = []
            count = 0
            a = true
            let ny
            let nx
            do {
                if (count != 0) {
                    uraninaru.push([ny, nx])
                }
                count++
                ny = y + i * count
                nx = x + j * count
            } while (ny >= 0 && ny < GLOBAL_height && nx >= 0 && nx < GLOBAL_width && bord[ny][nx] == turn * -1)
            if (!(ny >= 0 && ny < GLOBAL_height && nx >= 0 && nx < GLOBAL_width) || bord[ny][nx] == 0) {
                uraninaru.splice(0)
            }
            for (let k = 0; k < uraninaru.length; k++) {
                turnback.push(uraninaru[k])
            }
        }
    }
    return turnback
}
async function ai() {
    let a = sort(GLOBAL_bord, GLOBAL_room_set, GLOBAL_turn, GLOBAL_canputlist, GLOBAL_nextturn_map, GLOBAL_black_number, GLOBAL_white_number, GLOBAL_AIturn * -1, 0)
    let y = a[0]
    let x = a[1]
    if (!GLOBAL_nextturn_map.has(assyuku(y, x))) {
        return
    }
    GLOBAL_bord[y][x] = GLOBAL_turn
    if (GLOBAL_turn == -1) {
        GLOBAL_black_number++
    }
    if (GLOBAL_turn == 1) {
        GLOBAL_white_number++
    }
    GLOBAL_room_set.delete(assyuku(y, x))
    let turnbacklist = GLOBAL_nextturn_map.get(assyuku(y, x))
    for (let i = 0; i < turnbacklist.length; i++) {
        GLOBAL_bord[turnbacklist[i][0]][turnbacklist[i][1]] = GLOBAL_turn
    }
    if (GLOBAL_turn == -1) {
        GLOBAL_black_number += turnbacklist.length
        GLOBAL_white_number -= turnbacklist.length
    }
    if (GLOBAL_turn == 1) {
        GLOBAL_black_number -= turnbacklist.length
        GLOBAL_white_number += turnbacklist.length
    }
    [GLOBAL_turn, GLOBAL_canputlist, GLOBAL_nextturn_map] = changeturn(GLOBAL_turn, GLOBAL_bord, GLOBAL_room_set)

    await display()
    if (GLOBAL_preturn == GLOBAL_turn) {
        window.alert("おけないからパスだよ(煽)")
    }
    yobidasuka()

}
function yobidasuka() {

    if (GLOBAL_turn == GLOBAL_AIturn) {
        ai()
    }
    GLOBAL_syori = false
}
function sort(bord, room, turn, canputlist, turnmap, bnum, wnum, preturn, depth) {
    let scorelist = []
    let hukasa
    if (room.size < 8) {
        hukasa = 13
    } else {
        hukasa = 5
    }
    if (depth >= hukasa || room.size == 0 || canputlist == -1) {
        return hyouka(bord, turn, canputlist, room.size, bnum, wnum) * turn * preturn
    }

    for (let i = 0; i < canputlist.length; i++) {
        let copybord = JSON.parse(JSON.stringify(bord));
        let turnback = turnmap.get(assyuku(canputlist[i][0], canputlist[i][1]))
        let nextroom = new Set(room)
        let nbnum = bnum
        let nwnum = wnum
        copybord[canputlist[i][0]][canputlist[i][1]] = turn
        if (turn == -1) {
            nbnum++
        } else {
            nwnum++
        }
        nextroom.delete(assyuku(canputlist[i][0], canputlist[i][1]))
        for (let j = 0; j < turnback.length; j++) {
            let y = turnback[j][0]
            let x = turnback[j][1]
            if (turn == -1) {
                nbnum++
                nwnum--
            } else {
                nbnum--
                nwnum++
            }
            copybord[y][x] = turn

        }
        let [nextturn, nextcanputlist, nextturnmap] = changeturn(turn, copybord, nextroom)
        if (nextroom.size != 0 && nextcanputlist != -1) {
            scorelist.push(sort(copybord, nextroom, nextturn, nextcanputlist, nextturnmap, nbnum, nwnum, turn, depth + 1))

        } else {

            scorelist.push(sort(copybord, nextroom, turn, nextcanputlist, nextturnmap, nbnum, nwnum, turn, depth + 1))

        }
    }
    if (depth == 0) {
        console.log(turn)
        console.log((Math.max(...scorelist)))
        console.log(scorelist)
        if (Math.max(...scorelist) == Infinity) {
            console.log(scorelist)
        }
        return canputlist[scorelist.indexOf(Math.max(...scorelist))]
    }
    let a = Math.max(...scorelist) * turn * preturn
    return a
}
function hyouka(bord, turn, canputlist, size, bnum, wnum) {
    let score = 0
    if (size == 0 || canputlist == -1) {
        if ((bnum - wnum) == Infinity) {
            console.log("bbb")
        }
        if (turn == -1) {
            return (bnum - wnum) * 100
        } else {
            return (wnum - bnum) * 100
        }

    }
    let kado = [[0, 0], [0, GLOBAL_width - 1], [GLOBAL_height - 1, 0], [GLOBAL_height - 1, GLOBAL_width - 1]]
    let ekkusu = [[1, 1], [1, GLOBAL_width - 2], [GLOBAL_height - 2, 1], [GLOBAL_height - 2, GLOBAL_width - 2]]
    let kadomawari = [[1, 0], [0, 1], [0, GLOBAL_width - 2], [1, GLOBAL_width - 1], [GLOBAL_height - 2, 0], [GLOBAL_height - 1, 1], [GLOBAL_height - 1, GLOBAL_width - 2], [GLOBAL_height - 2, GLOBAL_width - 1]]
    for (let i = 0; i < kado.length; i++) {
        if (bord[kado[i][0]][kado[i][1]] == turn) {
            score += 10
        } else {
            if (bord[kado[i][0]][kado[i][1]] == turn * -1) {
                score -= 15
            }
        }
    }
    for (let i = 0; i < ekkusu.length; i++) {
        if (bord[kado[i][0]][kado[i][1]] != 0) {
            continue
        }
        if (bord[ekkusu[i][0]][ekkusu[i][1]] == turn) {
            score -= 3
        } else {
            if (bord[ekkusu[i][0]][ekkusu[i][1]] == -1 * turn) {
                score += 3
            }
        }
    }
    for (let i = 0; i < kadomawari.length; i++) {
        let a = Math.floor((i) / 2)
        if (bord[kado[a][0]][kado[a][1]] != 0) {
            continue
        }
        if (bord[kadomawari[i][0]][kadomawari[i][1]] == turn) {
            score -= 2
        } else {
            if (bord[kadomawari[i][0]][kadomawari[i][1]] == -1 * turn) {
                score += 2
            }
        }
    }
    score += canputlist.length * 0.1
    return score
}


