// ==UserScript==
// @name         x
// @namespace    http://tampermonkey.net/
// @version      2024-02-22
// @description  try to take over the world!
// @author       You
// @match        https://nostarve.fun/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=nostarve.fun
// @require      https://raw.githubusercontent.com/imor/pathfinding-bower/master/pathfinding-browser.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

const script = document.createElement('script');
script.src = 'https://unpkg.com/guify@0.12.0/lib/guify.min.js';
document.head.appendChild(script);
Object.freeze(Object)
window._Proxy = Proxy;
var pathfinder;
const cheats = {
    autospike: {
        key: 'Space',
        e: false,
        t: ["REIDITE SPIKE", "AMETHYST SPIKE", "DIAMOND SPIKE", "GOLD SPIKE", "STONE SPIKE", "WOOD SPIKE"],
        tc: "REIDITE SPIKE",
        i: [52, 20, 14, 13, 12, 5]
    },
    autosteal: {
        key: 'KeyQ',
        e: false,
        r: 150
    },
    autobed: {
        hp: 20,
        e: false,
    },
    autototem: {
        e: false,
    },
    hpvisual: {
        e: true,
    },
    roof: {
        e: false,
        n: 0.4,
    },
    pathfinder: {
        e: false,
        x: 0,
        y: 0,
    },
    xray: {
        e: false,
    },
    tracers: {
        e: false,
    },
    autorespawn: {
        e: false,
    },
    autounlock: {
        key: "KeyQ",
        e: false
    }
}

const prop = Symbol();
var user;
var world;
var pid = 'у︎︅';

const old_drawimage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function () {
    if (cheats.xray.e) {
        this.globalAlpha = 0.4;
    }
    old_drawimage.apply(this, arguments);
}

class Pathfinder {
    constructor(nw, nh, custom_map) {
        this.nw = nw;
        this.nh = nh;
        this.map = custom_map;
        this.objects = [];
    }
    FindPath(player, end, bot) {
        this.grid = new PF.Grid(this.nw, this.nh)
        this.setupMap()
        this.initializeBoundaries()
        this.PathFinder = new PF.AStarFinder({ allowDiagonal: true, dontCrossCorners: true });
        const Path = this.PathFinder.findPath(player.x, player.y, end.x, end.y, this.grid);
        const SOCKET = window.socket;

        if (Path.length < 1) {
            SOCKET.send(encoder([2, Math.random() > 0.5 ? 6 : 9]));
        } else if (Path.length < 2) {
            SOCKET.send(encoder([2, 0]));
        } else {
            const dx = Path[1][0] - player.x
            const dy = Path[1][1] - player.y

            if (dx === 0 && dy === 1) SOCKET.send(encoder([2, 4]));
            else if (dx === 0 && dy === -1) SOCKET.send(encoder([2, 8]));
            else if (dx === -1 && dy === 0) SOCKET.send(encoder([2, 1]));
            else if (dx === 1 && dy === 0) SOCKET.send(encoder([2, 2]));
            else if (dx === -1 && dy === -1) SOCKET.send(encoder([2, 9]));
            else if (dx === -1 && dy === 1) SOCKET.send(encoder([2, 5]));
            else if (dx === 1 && dy === -1) SOCKET.send(encoder([2, 10]));
            else if (dx === 1 && dy === 1) SOCKET.send(encoder([2, 6]));

        }
    }
    checkBoundary(x, y) {
        return x + 1 >= this.nw || x - 1 < 0 || y + 1 >= this.nh || y - 1 < 0;
    }
    initializeBoundaries() {
        for (let object of this.objects) {
            const x = Math.floor(object[2].x);
            const y = Math.floor(object[2].y);

            if (x + 1 < this.nw) this.grid.setWalkableAt(x + 1, y, false);
            if (x - 1 >= 0) this.grid.setWalkableAt(x - 1, y, false);
            if (y + 1 < this.nh) this.grid.setWalkableAt(x, y + 1, false);
            if (y - 1 >= 0) this.grid.setWalkableAt(x, y - 1, false);
        }
    }
    setupMap() {
        for (let i = 0; i < this.map.length; i++) {
            const _map = this.map[i]
            switch(_map[1]) {
                case "b":
                case "f":
                case "s":
                case "g":
                case "d":
                case "a":
                case "re":
                case "m":
                case "plm":
                case "p":
                case "c":
                case "gw":
                case "dw":
                case "cs":
                    const position = {x: _map[3], y: _map[4]}
                    this.objects.push([_map[1], _map[2], position])
                    break;
            }
        }
    }
}
window.UtilsUI = {
    initUI: () => {
        let container = document.body;
        let gui = new guify({
            title: 'x',
            align: "right",
            width: 550,
            barMode: "none",
            panelMode: "none",
            xopacity: .6,
            root: document.body,
            open: !1
        });

        gui.Register({type: 'folder',label: 'Visuals',open: false});
        gui.Register({type: 'folder',label: 'Misc',open: false});
        gui.Register({type: 'folder',label: 'AutoSteal',open: false});
        gui.Register({type: 'folder',label: 'AutoSpike',open: false});
        gui.Register({type: 'folder',label: 'Pathfinder',open: false});

        gui.Register([
            {type: 'checkbox',label: 'Show Timer And Health',object: cheats.hpvisual,property: 'e',onChange: data => {UtilsUI.saveSettings();}},
            {type: 'checkbox',label: 'Roofs Xray',object: cheats.roof,property: 'e',onChange: data => {UtilsUI.saveSettings();}},
            {type: 'checkbox',label: 'Xray',object: cheats.xray,property: 'e',onChange: data => {UtilsUI.saveSettings();}},
            {type: 'checkbox',label: 'Tracers',object: cheats.tracers,property: 'e',onChange: data => {UtilsUI.saveSettings();}},
        ],{folder: "Visuals"});

        gui.Register([
            {type: "button",label: "Set AutoSteal Key",action(t) {UtilsUI.controls.setKeyBind("autosteal");} },
            {type: "button",label: "Set AutoUnlock Key",action(t) {UtilsUI.controls.setKeyBind("autounlock");} },
            {type: "display",label: "AutoSteal Key:",object: cheats.autosteal,property: "key"},
            {type: "display",label: "AutoUnlock Key:",object: cheats.autounlock,property: "key"},
            {type: "checkbox",label: "AutoSteal",object: cheats.autosteal,property: "e",onChange(t) {UtilsUI.saveSettings();} },
            {type: "checkbox",label: "Auto Unlock",object: cheats.autounlock,property: "e",onChange(t) {UtilsUI.saveSettings();} },
            {type: "range",label: "Range",min: 0,max: 300,step: 1,object: cheats.autosteal,property: "r",onChange(t) {UtilsUI.saveSettings();} },
        ],{folder: "AutoSteal"});

        gui.Register([
            {type: "checkbox",label: "Auto Totem",object: cheats.autototem,property: "e",onChange(e) {UtilsUI.saveSettings()}},
            {type: "checkbox",label: "Auto Bed",object: cheats.autobed,property: "e",onChange(t) {UtilsUI.saveSettings();} },
            {type: "checkbox",label: "Auto Respawn",object: cheats.autorespawn,property: "e",onChange(t) {UtilsUI.saveSettings();} },
            {type: "range",label: "AutoBed on HP",min: 0,max: 200,step: 1,object: cheats.autobed,property: "hp",onChange(t) {UtilsUI.saveSettings();} },
        ],{folder: "Misc"});

        gui.Register([
            {type: "button",label: "Set AutoSpike Key",action() {UtilsUI.controls.setKeyBind('autospike')}},
            {type: "display", label: "AutoSpike Key", object: cheats.autospike, property: "key"},
            {type: "select",label: "Top Priority Spike", options: cheats.autospike.t, object: cheats.autospike, property: 'tc'}
        ], {folder: "AutoSpike"})

         gui.Register([
             {type: 'checkbox',label: 'Activate Pathfinder',object: cheats.pathfinder,property: 'e',onChange: data => {UtilsUI.saveSettings();}},
             {type: 'text',label: 'Pathfinder X',object: cheats.pathfinder,property: 'x'},
             {type: 'text',label: 'Pathfinder Y',object: cheats.pathfinder,property: 'y'},
             {type: 'button',label: 'Set Pathfinder Location',action: data => {
                var player;
                if (!world.units)
                    return;
                for (let i = 0; i < world.units[0].length; i++) {
                    if (world.units[0][i][pid] == user.id)
                        player = world.units[0][i];
                }
                if (player) {
                    cheats.pathfinder.x = Math.round(player.x / 100);
                    cheats.pathfinder.y = Math.round(player.y / 100);
                }
            }
            },
         ],{folder: "Pathfinder"});

    },
    controls: null,
    controller: class {
        setKeyBind(callback) {
            cheats[callback].key = 'Press any key';
            let click = 0;
            document.addEventListener('keydown',function abc(event) {
                click++;
                if (click >= 1) {
                    if (event.code == "Escape") {
                        cheats[callback].key = "NONE";
                    } else {
                        cheats[callback].key = event.code;
                    };
                    document.removeEventListener('keydown',abc);
                    UtilsUI.saveSettings();
                };
            });
        }
    },
    saveSettings: () => {
        for (let HACK in cheats) {
            localStorage.setItem(HACK + "ZMX",JSON.stringify(cheats[HACK]));
        };
    },
    loadSettings: () => {
        for (let HACK in cheats) {
            let data = localStorage.getItem(HACK);
            if (data) Settings[HACK] = JSON.parse(data);
        };
    },
    LoadHack: () => {
        UtilsUI.loadSettings();
        UtilsUI.controls = new UtilsUI.controller();
        UtilsUI.initUI();
        UtilsUI.saveSettings();
    },
    LoadClient: () => {

    }
};
window.addEventListener("DOMContentLoaded", () => {
   const b = setInterval(() => {
        if (window.guify && window.bbc_13) {
            clearInterval(b);
            UtilsUI.LoadHack()
        }
   }, 1000)
})

Object.defineProperty(Object.prototype, 'opacity', {
    get() {
        if(cheats.roof.e)
            this[prop] = cheats.roof.n;
        return this[prop];
    },
    set(data) {
        this[prop] = data;
    }
})
Object.defineProperty(Object.prototype, 'control', {
    get() {
        return this[prop];
    },
    set(data) {
        this[prop] = data;
        if(!user){
            user = this;
            window.user = user;
            Check()
        }
    }
})
Object.defineProperty(Object.prototype, 'mode', {
    get() {
        return this[prop];
    },
    set(data) {
        this[prop] = data;
        if(!world) {
            world = this;
            window.world = this;
            Check()
        }
    }
})
var playerStatus = {
    hp: 100,
    temp: 0,
    heat: 0,
    food: 100,
    water: 100,
    air: 100
}
var TimersInt = Date.now()
window.WebSocket = new _Proxy(window.WebSocket, {
    construct(target, args) {
        const socket = new target(...args)
        window.socket = socket;
        const message = function (e) {
            if ("string" === typeof e.data) {
                e = JSON.parse(e.data);
                switch (e[0]) {
                    case 3:
                        TimersInt = Date.now();
                        pathfinder = new Pathfinder(e[18], e[19], e[21])
                        playerStatus = {
                            hp: 100,
                            temp: 0,
                            heat: 0,
                            food: 100,
                            water: 100,
                            air: 100
                        }
                        break;
                }
            } else {
                var d = new Uint8Array(e.data);
                switch (d[0]) {
                    case 25:
                        break;
                    case 16:
                        TimersInt = Date.now();
                        playerStatus = {
                            hp: d[1],
                            food: d[2],
                            temp: d[3],
                            water: d[4],
                            air: d[5],
                            heat: d[6],
                        };
                    break;
                    case 37:
                        if (playerStatus) playerStatus.hp = d[1];
                        break;
                    case 38:
                        if (playerStatus) playerStatus.food = d[1];
                        break;
                    case 39:
                        if (playerStatus) playerStatus.water = d[1];
                        break;
                    case 55:
                        if (playerStatus) playerStatus.heat = d[1];
                        break;
                    case 56:
                        if (playerStatus) playerStatus.temp = d[1];
                        break;
                }
            }
        }
        socket.addEventListener('message', message);
        return socket;
    }
})

CanvasRenderingContext2D.prototype.fillRect = new _Proxy(CanvasRenderingContext2D.prototype.fillRect,{
    apply: function (target,ctx,_arguments) {
        if (ctx.fillStyle === "#69a148") {
            if (cheats.hpvisual.e) {
                ctx.save();
                ctx.font = '32px Baloo Paaji';
                ctx.strokeStyle = "black";
                ctx.lineWidth = 5;
                ctx.strokeText(`${playerStatus ? playerStatus.hp * 2 : "200"}hp`,_arguments[0] - 110,_arguments[1] + 20);
                ctx.fillStyle = "red";
                ctx.fillText(`${playerStatus ? playerStatus.hp * 2 : "200"}hp`,_arguments[0] - 110,_arguments[1] + 20);
                ctx.restore();
                let OverallHeat = playerStatus.temp + (100 - playerStatus.heat);
                ctx.save();
                ctx.font = '34px Baloo Paaji';
                ctx.strokeStyle = "#c12819";
                ctx.lineWidth = 5;
                ctx.strokeText(`${playerStatus.food}%`,345,_arguments[1] - 10);
                ctx.fillStyle = "white";
                ctx.fillText(`${playerStatus.food}%`,345,_arguments[1] - 10);
                ctx.font = '34px Baloo Paaji';
                ctx.strokeStyle = OverallHeat <= 100 ? "#4f9db2" : "#9c4036";
                ctx.lineWidth = 5;
                ctx.strokeText(`${OverallHeat}%`,575,_arguments[1] - 10);
                ctx.fillStyle = "white";
                ctx.fillText(`${OverallHeat}%`,575,_arguments[1] - 10);
                ctx.font = '34px Baloo Paaji';
                ctx.strokeStyle = "#004b87";
                ctx.lineWidth = 5;
                ctx.strokeText(`${playerStatus.water}%`,805,_arguments[1] - 10);
                ctx.fillStyle = "white";
                ctx.fillText(`${playerStatus.water}%`,805,_arguments[1] - 10);
                ctx.font = '34px Baloo Paaji';
                ctx.strokeStyle = "#54a34e";
                ctx.lineWidth = 5;
                ctx.strokeText(`${playerStatus.hp}%`,95,_arguments[1] - 10);
                ctx.fillStyle = "white";
                ctx.fillText(`${playerStatus.hp}%`,95,_arguments[1] - 10);
                if (playerStatus.air != 100) {
                    ctx.font = '34px Baloo Paaji';
                    ctx.strokeStyle = "#004b87";
                    ctx.lineWidth = 5;
                    ctx.strokeText(`${playerStatus.air}%`,465,_arguments[1] - 60);
                    ctx.fillStyle = "white";
                    ctx.fillText(`${playerStatus.air}%`,465,_arguments[1] - 60);
                };
                ctx.restore();
            }
        }
        return Function.prototype.apply.apply(target,[ctx,_arguments]);
    }
});
function Check() {
    if (user && world) {
        console.log("Ready")
        window.addEventListener('keydown', (e) => {
        if ((document.getElementById("chat_block").style.display !== 'none' && document.getElementById("chat_block").style.display !== '') &&
            (document.getElementById("commandMainBox").style.display !== 'none' && document.getElementById("commandMainBox").style.display !== '')
        ) {
            return;
        }
            if (cheats.autosteal.key == e.code) 
                cheats.autosteal.e = true;
            if (cheats.autospike.key == e.code)
                cheats.autospike.e = true;
        })
        window.addEventListener('keyup', (e) => {
            if (cheats.autosteal.key == e.code)
                cheats.autosteal.e = false;
            if (cheats.autospike.key == e.code)
                cheats.autospike.e = false;
        })
        Cheats()
    }
}
function distanceBetween(d1, d2) {
    const x1 = d1.x;
    const y1 = d1.y;
    const x2 = d2.x;
    const y2 = d2.y;
  
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance;
}
function encode(data){
    const randomKey = Math.floor(Math.random() * 256);
    const encrypted = data.map((v, i) => v ^ randomKey ^ (user.id || 48));
    encrypted[encrypted.length] = randomKey;

    return encrypted;
}
function encoder(data) {
    if (!window.ev_c12) {
        data = [Math.random() * 15, Math.floor(Math.random() + 2)]
    }
    return window.msgpack.encode(data)
}
function JoinTotem(totem) {
    window.socket.send(encoder([18, user.totem.pid, user.totem.id]))
}
function TakeChest(chest) {
    window.socket.send(encoder([9, chest.id]))
}
function UnlockChest(chest) {
    window.socket.send(encoder([15, chest.id]))
}
function Craft(id) {
    window.socket.send(encoder([7, id]))
}
function PlaceSpike(id, player, t = 0) {
    const e = 2 * Math.PI;
    const o = Math.floor((player.angle + e) % e * 255 / e);
    window.socket.send(encoder([10, id, o, 0]))
    
    for (let r = 1; r < t; r++) {
        window.socket.send(encoder([102, id, ((r * 8) + o) % 255, 0]));
        window.socket.send(encoder([102, id, (o - (r * 8) + 255) % 255, 0]));
    }
}
function inventoryHas(id) {
    if (user.inv.n[id] !== 0 && user.inv.n[id] !== undefined) {
        return user.inv.n[id]
    } else {
        return undefined;
    }
}
function GetIdFromSpike(spike) {
    var id;
    for (let i = 0; i < cheats.autospike.t.length; i++) {
        if (cheats.autospike.t[i] == cheats.autospike.tc) {
            for (let e = 0; e < cheats.autospike.i.length; e++) {
                if (e == i) {
                    id = cheats.autospike.i[e]
                }
            }
        }
    }
    return id;
}
var lastHp;
var pathfind = Date.now();
var autospike = Date.now();
var hooked_re = false;
var autosteal = Date.now();
const old_rect = CanvasRenderingContext2D.prototype.fillRect;

CanvasRenderingContext2D.prototype.fillRect = function() {
    old_rect.apply(this, arguments);
}

function Cheats() {
    var player;
    var pid = 'у︎︅';
    user.team = (function() {
        for (let object in user) {
            if (Array.isArray(user[object])) {
                var n = true;
                for (let i = 0; i < user[object].length; i++) {
                    if (typeof user[object][i] == 'object')
                        n = false;
                }
                if(n)
                    return user[object];
            }
        }
    })();
    world.units = (function() {
        for (let object in world){
            if (Array.isArray(world[object]) && world[object].length == 101){
                return world[object];
            }
        };
    })()
    user.inv = (function() {
        for (let object in user){
            if (typeof user[object] == 'object'){
                for (let obj in user[object]) {
                    if(user[object][obj] == 16){
                        return user[object];
                    }
                }
            }
        };
    })(); 
    if(user.inv) {
        user.inv.n = (function () {
            for (let object in user.inv) {
                if (Array.isArray(user.inv[object])) {
                    for (let i = 0; i < user.inv[object].length; i++) {
                        if (typeof user.inv[object][i] == 'object')
                            continue;
                        return user.inv[object];
                    }
                }
            }
        })();
    }
    user.totem = (function () {
        for (let c in user){
            if (typeof user[c] == 'object') {
                var n = 0;
                var f = false;
                for (let b in user[c]) {
                    if (b == 'wait')
                        continue;
                    if (typeof user[c][b] == 'object') {
                        if(user[c][b]?.canvas){
                            n++
                        }
                    } else {
                        if (typeof user[c][b] == 'boolean'){
                            f = true;
                        }
                        n++
                    }
                }
                if (n == 4 && f) {
                    return user[c];
                }
            }
        }
    })();
    if (user.totem) {
        user.totem.wait = (function () {
            for (let c in user.totem) {
                if (typeof user.totem[c] == 'boolean') {
                    return user.totem[c];
                }
            }
        })()
    }
    if (world.units && user.inv && user.team && user.inv.n && user.totem && typeof user.totem.wait != 'undefined') {
    var player = (function () {
        for (let i = 0; i < world.units[0].length; i++) {
            if (user.id == world.units[0][i][pid]) {
                return world.units[0][i]
            }
        }
    })();
    if (!window.vex_c1) {
        player = undefined;   
    }
    if (!hooked_re) {
        client.к︆︆ = new _Proxy(client.к︆︆, {
            apply: function(target, _this, args) {
                if (cheats.autorespawn.e) {
                    window.socket.close();
                    window.arInterval = setInterval(() => {
                        client.connect();
                    }, 1000)
                } else {
                    target.apply(_this, args)
                }
            }
        })
        hooked_re = true;
    }
    window.socket.onopen = new _Proxy(window.socket.onopen, {
        apply: function(target, _this, args) {
            if (window.arInterval) {
                clearInterval(window.arInterval);
                delete window.arInterval;
            } 
            return target.apply(_this, args)
        }
    })
    if (cheats.autospike.e && player && Date.now() - autospike > 500) {
        var c;
        var tc = GetIdFromSpike(cheats.autospike.tc)
        if (inventoryHas(tc) && cheats.autospike.i.includes(tc)) {
            c = tc;
        }
        if (!c) {
            for (let i = 0; i < cheats.autospike.i.length; i++) {
                const b = cheats.autospike.i[i];
                if (inventoryHas(b)) {
                    c = b;
                }
            }
        }
        if (c) {
            PlaceSpike(c, player, 4)
        }
    }
    if (player && cheats.tracers.e) {
        for (let i = 0; i < world.units[0].length; i++) {
            const ctx = document.getElementById("game_canvas").getContext("2d")
            const enemy = world.units[0][i];
            let r = user.ц︎︅.x + player.x,
            a = user.ц︎︅.y + player.y,
            n = user.ц︎︅.x + enemy.x,
            s = user.ц︎︅.y + enemy.y;
            ctx.save(),
            (ctx.lineWidth = 2.6),
            ctx.beginPath(),
            ctx.moveTo(r,a),
            ctx.lineTo(n,s),
            (ctx.strokeStyle = "red"),
            ctx.stroke(),
            ctx.restore()
        }
    }
    if (cheats.pathfinder.e && player && Date.now() - pathfind > 500) {
        if (pathfinder.FindPath){
            pathfinder.FindPath({x: Math.round(player.x / 100),y: Math.round(player.y / 100)}, {x: cheats.pathfinder.x, y: cheats.pathfinder.y});
            pathfind = Date.now();
        } 
    }
    if (player && cheats.autobed.e && (playerStatus.hp * 2) <= cheats.autobed.hp) {
        if (user.inv.n.includes(41)) {
            Craft(id)
            cheats.autobed.e  = false;
            //client.Х︉︄("Auto-Bed Has been deactivated.",'#27ba36');
        }
    }
    if ((cheats.autosteal.e || cheats.autounlock.e) && player && Date.now() - autosteal > 400) {
        for (let i = 0; i < world.units[11].length; i++) {    
            const chest = world.units[11][i];
            if (distanceBetween(chest, player) <= cheats.autosteal.r) {
                if (cheats.autounlock.e && (user.id != chest[pid]) && !user.team.includes(chest[pid]) && chest.action != 0) {
                    UnlockChest(chest)
                }
                if (cheats.autosteal.e && (user.id == chest[pid] || user.team.includes(chest[pid]) || chest.action == 0) && chest.info != 0) {
                    TakeChest(chest)
                }
            } 
        }
    }
    if (cheats.autototem.e && !user.in_team() && !user.totem.wait && player) {
        for (let i = 0; i < world.units[29].length; i++) {
            if (distanceBetween(world.units[29][i], player) <= 150) {
                if (world.units[29][i].info == 0) {
                    JoinTotem(world.units[29][i]);
                }
            }
        }
    }
}
    requestAnimationFrame(Cheats)
}
