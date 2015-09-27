window.Font = require("./scripts/data/Font")
window.Colors = require("./scripts/data/Colors")
window.Controls = require("./scripts/data/Controls")

window.Hero = require("./scripts/classes/Hero")
window.Bomb = require("./scripts/classes/Bomb")
window.Level = require("./scripts/classes/Level")
window.Zombie = require("./scripts/classes/Zombie")
window.Particle = require("./scripts/classes/Particle")
window.Explosion = require("./scripts/classes/Explosion")

window.Loop = require("./scripts/utilities/Loop")
window.Keyboard = require("./scripts/utilities/Keyboard")

window.GameCanvas = document.getElementById("game").getContext("2d")
window.ScoreCanvas = document.getElementById("score").getContext("2d")

window.gid = 0

var Stats = require("stats.js")
var stats = new Stats()
stats.setMode(0)
//stats.domElement.style.position = "absolute"
document.getElementById("frame").appendChild(stats.domElement)

var Game = function() {
    this.hero = null
    this.level = null
    this.zombies = {}
    this.bombs = {}
    this.explosions = {}
    this.particles = {}

    this.maxzombies = 8
}

Game.prototype.update = function(tick) {
    this.hero.update(tick)
    for(var id in this.zombies)
        this.zombies[id].update(tick)
    for(var id in this.bombs)
        this.bombs[id].update(tick)
    for(var id in this.explosions)
        this.explosions[id].update(tick)
    for(var id in this.particles)
        this.particles[id].update(tick)

    this.maxzombies = Math.max(this.maxzombies, Math.floor(this.hero.score / 20))

    if(this.hero.hasKilledZombie == true) {
        if(Object.keys(this.zombies).length < game.maxzombies) {
            new Zombie({
                y: -2 - (Math.random() * 48),
                x: (Math.random() * (game.level.width - 16)) + 16,
                direction: Math.random() < 0.5 ? +1 : -1,
            })
        }
    }
}

Game.prototype.render = function() {
    this.hero.render()
    for(var id in this.zombies)
        this.zombies[id].render()
    for(var id in this.particles)
        this.particles[id].render()
    for(var id in this.bombs)
        this.bombs[id].render()
    for(var id in this.explosions)
        this.explosions[id].render()
    this.level.render()

    if(this.hero.hasDroppedBomb == false) {
        drawString("DROP BOMB", {cx: 38, y: 28})
        GameCanvas.fillStyle = Colors.white
        GameCanvas.beginPath()
        var x = 38 - 1
        var y1 = 28 + 8
        var y2 = y1 + 15
        GameCanvas.moveTo(x, y1)
        GameCanvas.lineTo(x - 1, y1 + 1)
        GameCanvas.lineTo(x - 1, y2 - 4)
        GameCanvas.lineTo(x - 3, y2 - 4)
        GameCanvas.lineTo(x, y2)
        GameCanvas.lineTo(x + 3, y2 - 4)
        GameCanvas.lineTo(x + 1, y2 - 4)
        GameCanvas.lineTo(x + 1, y1 + 7)
        GameCanvas.closePath()
        GameCanvas.fill()
    } if(this.hero.score > 0) {
        drawString(this.hero.score + "", {x: 2, y: 2, canvas: ScoreCanvas})
    }

    var hearts = ""
    for(var i = 0; i < game.hero.health; i++) {
        hearts += "&"
    }
    drawString(hearts, {rx: 128 - 2, y: 2, color: Colors.red, canvas: ScoreCanvas})

    if(game.hero.struggling > -1) {
        drawString("STRUGGLE", {
            cx: Math.round(game.hero.x + 1 - Math.random()),
            y: Math.round(game.hero.y - game.hero.height - 7 - Math.random()),
            color: Colors.red
        })
    }

    if(this.hero.damaged > 0.05) {
        GameCanvas.fillStyle = "rgba(198, 68, 68, 0.75)"
        GameCanvas.fillRect(0, 0, game.level.width, 72)
    }

    document.getElementById("game").style.left = -game.hero.camera + "em"
}

function drawString(string, options) {
    var canvas = options.canvas || GameCanvas
    string = string.toUpperCase()
    var sx = 0
    var sy = 0
    if(options.x) {
        sx = options.x
    } if(options.y) {
        sy = options.y
    } if(options.cx) {
        sx = options.cx - ((string.length * 4) / 2)
    } if(options.rx) {
        sx = options.rx - (string.length * 4)
    }
    canvas.fillStyle = Colors.white
    if(options.color) {
        canvas.fillStyle = options.color
    }
    for(var index in string) {
        var char = Font[string[index]]
        var stringpos = parseInt(index) * 4
        for(var cy in char) {
            for(var cx in char[cy]) {
                if(char[cy][cx] == 1) {
                    var y = parseInt(cy) + sy
                    var x = stringpos + parseInt(cx) + sx
                    canvas.fillRect(x, y, 1, 1)
                }
            }
        }
    }
}

window.game = new Game()
new Level({})
new Hero({})

Loop(function(tick) {
    stats.begin()
    game.update(tick)
    GameCanvas.clearRect(0, 0, game.level.width, 72)
    ScoreCanvas.clearRect(0, 0, 128, 72)
    game.render(tick)
    stats.end()
})
