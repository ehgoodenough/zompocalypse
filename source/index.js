window.Colors = {
    red: "#C64444",
    white: "#EFF4F0",
    green1: "#96BB87",
    green2: "#79936C",
    green3: "#293833",
}

window.Keys = {
    W: 87,
    D: 68,
    A: 65,
    S: 83,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
}

window.Loop = function(func) {
    return (function loop(time) {
        func(Math.min((Date.now() - time) / 1000, 1))
        window.requestAnimationFrame(loop.bind(null, Date.now()))
    })(Date.now())
}

window.Keyboard = {
    isDown: function(key) {
        if(this.data[key] == undefined) {
            this.data[key] = -1
        }
        return this.data[key] >= 0
    },
    isJustDown: function(key) {
        if(this.data[key] == undefined) {
            this.data[key] = -1
        }
        if(this.data[key] == 0) {
            this.data[key] += 1
            return true
        } else {
            return false
        }
    },
    data: {}
}

document.addEventListener("keydown", function(event) {
    Keyboard.data[event.keyCode] = 0
})

document.addEventListener("keyup", function(event) {
    Keyboard.data[event.keyCode] = -1
})

window.Canvas = document.getElementById("canvas").getContext("2d")

var Hero = function() {
    this.x = 16
    this.y = 7*8
    this.vx = 0
    this.vy = 0
    this.width = 6
    this.height = 9
    this.direction = +1
    this.color = Colors.white
    this.jump = 0
}

Hero.prototype.update = function(tick) {
    if(Keyboard.isJustDown(Keys.W)
    || Keyboard.isJustDown(Keys.UP)) {
        if(this.jump == 0) {
            this.vy = -3
            this.jump = 1
        } else if(this.jump == 1) {
            this.vx = 3 * this.direction
            this.jump = 2
        }
    }
    if(Keyboard.isDown(Keys.A)) {
        if(this.jump != 2) {
            this.direction = -1
            this.vx = -1
        }
    } if(Keyboard.isDown(Keys.D)) {
        if(this.jump != 2) {
            this.direction = +1
            this.vx = +1
        }
    }

    // gravity
    this.vy += 8 * tick

    // collision
    if(this.y + this.vy > 7*8) {
        this.vy = 0
        this.y = 7*8
        this.jump = 0
    }

    // translation
    this.x += this.vx
    this.y += this.vy

    // friction
    var friction = 0.0005
    if(this.jump != 0) {
        var friction = 0.5
    }

    // deceleration
    if(this.vx < 0) {
        this.vx *= Math.pow(friction, tick)
        if(this.vx > -0.001) {this.vx = 0}
    } else if(this.vx > 0) {
        this.vx *= Math.pow(friction, tick)
        if(this.vx < +0.001) {this.vx = 0}
    }
}

Hero.prototype.render = function() {
    Canvas.strokeWidth = 1
    Canvas.strokeStyle = this.color
    var w = this.jump != 2 ? this.width : this.height
    var h = this.jump != 2 ? this.height : this.width
    var x = Math.round(this.x) - (w / 2)
    var y = Math.round(this.y) - h
    Canvas.strokeRect(x + 0.5, y + 0.5, w, h - 1)
}

var Level = function() {
}

Level.prototype.render = function() {
    Canvas.fillStyle = Colors.green2
    Canvas.fillRect(0, 7*8, 16*8, 2*8)
}

var Bomb = function(protobomb) {
    this.x = protobomb.x
    this.y = protobomb.y
    this.width = 4
    this.height = 2

    this.id = id++
    bombs[this.id] = this
}

Bomb.prototype.update = function(tick) {
    //
}

Bomb.prototype.render = function() {
    Canvas.fillStyle = Colors.white
    var x = this.x - (this.width / 2)
    var y = this.y - this.height
    Canvas.fillRect(x, y, this.width, this.height)
}

var hero = new Hero()
var level = new Level()
window.bombs = {}
window.id = 0

new Bomb({
    x: 4*8, y: 7*8
})

Loop(function(tick) {
    hero.update(tick)
    for(var id in bombs) {
        bombs[id].update(tick)
    }

    Canvas.clearRect(0, 0, 128, 72)
    for(var id in bombs) {
        bombs[id].render()
    }
    hero.render()
    level.render()
})
