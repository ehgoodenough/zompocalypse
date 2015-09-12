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
    if(Keyboard.data[event.keyCode] == -1) {
        Keyboard.data[event.keyCode] = 0
    }
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
    this.health = 8
    this.maxhealth = 8
    this.jump = 0
    this.damaged = 0
}

Hero.prototype.update = function(tick) {
    if(Keyboard.isJustDown(Keys.S)) {
        var bomb = new Bomb({
            x: this.x, y: this.y, vy: 0
        })
    }
    if(Keyboard.isJustDown(Keys.W)) {
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

    // animation
    this.damaged -= tick
    if(this.damaged < 0) {
        this.damaged = 0
    }
}

Hero.prototype.hurt = function() {
    if(this.damaged <= 0) {
        this.health -= 1
        this.damaged = 0.25
        if(this.health <= 0) {
            window.location = window.location
        }
    }
}

Hero.prototype.render = function() {
    Canvas.strokeWidth = 1
    Canvas.strokeStyle = Colors.white
    var w = this.jump != 2 ? this.width : this.height
    var h = this.jump != 2 ? this.height : this.width
    var x = Math.round(this.x) - (w / 2)
    var y = Math.round(this.y) - h
    Canvas.strokeRect(x + 0.5, y + 0.5, w, h - 1)
    Canvas.fillStyle = Colors.white
    if(this.damaged > 0) {
        Canvas.fillStyle = Colors.red
    }
    x += 1
    y += 1
    w -= 1
    h -= 1
    Canvas.fillRect(x, y, w, h - 1)
    h = this.maxhealth - this.health
    Canvas.fillStyle = Colors.red
    Canvas.fillRect(x, y, w, h)
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
    this.vy = protobomb.vy
    this.width = 4
    this.height = 2
    this.tick = 0
    this.armed = false

    this.id = id++
    bombs[this.id] = this
}

Bomb.prototype.update = function(tick) {
    this.tick += tick
    if(this.tick > 1.6) {
        this.tick -= 1.6
        this.armed = true
    }

    // collision with level
    if(this.y + this.vy > 7*8) {
        this.vy = 0
        this.y = 7*8
    }

    // gravity
    this.vy += 8 * tick
    this.y += this.vy

    // collision with hero
    if(!!this.armed && this.isColliding(hero)) {
        this.explode()
    }

    // collision with zombies
    for(var id in zombies) {
        var zombie = zombies[id]
        if(this.isColliding(zombie)) {
            this.explode()
        }
    }
}

Bomb.prototype.explode = function() {
    delete bombs[this.id]
    var explosion = new Explosion({
        x: this.x, y: this.y
    })
    for(var i = -1; i <= 1; i++) {
        new Explosion({
            x: this.x + (Math.floor(Math.random() * 1.5*8*i) + 4*i),
            y: this.y - (Math.floor(Math.random() * 1*8) + (i == 0 ? 1*8 : 0))
        })
    }
}

Bomb.prototype.isColliding = function(object) {
    var dx = Math.abs(object.x - this.x)
    var dy = Math.abs(object.y - this.y)
    var max_dx = (object.width / 2) + (this.width / 2)
    var max_dy = (object.height / 2) + (this.height / 2)
    return dx < max_dx && dy < max_dy
}

Bomb.prototype.render = function() {
    Canvas.fillStyle = Colors.white
    if(this.tick > 1.5) {
        Canvas.fillStyle = Colors.red
    }
    var x = Math.round(this.x - (this.width / 2))
    var y = Math.round(this.y - this.height)
    Canvas.fillRect(x, y, this.width, this.height)
}

var Explosion = function(protoexplosion) {
    this.x = protoexplosion.x
    this.y = protoexplosion.y
    this.diameter = 4*8
    this.tick = 2
    this.maxtick = 2

    this.id = id++
    explosions[this.id] = this

    //BELOW CODE IS RUN TWICE OR THRICE CUZ
    //THE EXPLOSIONS ARE OVERLAPPING :(

    if(this.isColliding(hero)) {
        hero.hurt()
    }

    for(var idd in zombies) {
        var zombie = zombies[idd]
        if(this.isColliding(zombie)) {
            zombie.die()
        }
    }
}

Explosion.prototype.update = function(tick) {
    this.tick -= tick
    if(this.tick <= 0) {
        delete explosions[this.id]
    }
}

Explosion.prototype.isColliding = function(object) {
    var x = Math.abs(object.x - this.x)
    var y = Math.abs(object.y - this.y)
    var radius = this.diameter / 2
    return x < radius && y < radius
}

Explosion.prototype.render = function() {
    Canvas.fillStyle = Colors.white
    Canvas.beginPath()
    var d = this.diameter * (this.tick / this.maxtick)
    Canvas.arc(this.x, this.y, d / 2, 0, 2 * Math.PI)
    Canvas.fill()
}

var Zombie = function(protozombie) {
    this.x = protozombie.x || 0
    this.y = protozombie.y || -2
    this.width = 7
    this.height = 9
    this.direction = protozombie.direction || +1

    this.id = id++
    zombies[this.id] = this

    this.speed = 22
    this.tick = 0
    this.vx = 0
    this.vy = 0
}

Zombie.prototype.update = function(tick) {
    this.tick += tick
    if(this.tick > 0.2) {
        this.tick -= 0.2
    }
    if(this.state == undefined) {
        this.x += this.speed * this.direction * tick
        if(this.x < 0) {
            this.x = 0
            this.direction = +1
        } else if(this.x > 128) {
            this.x = 128
            this.direction = -1
        }
    } else if(this.state == "dying") {
        //gravity
        this.vy += 5 * tick

        // collision with level
        if(this.y + this.vy > 7*8) {
            this.vy = 0
            this.vx = 0
            this.y = 7*8

            delete zombies[this.id]
            for(var i = 0; i < 10; i++) {
                new Particle({
                    x: this.x,
                    y: this.y,
                    i: i
                })
            }
        }

        this.x += this.vx
        this.y += this.vy
    }
}

var explosion_direction = +1

Zombie.prototype.die = function() {
    this.state = "dying"
    this.vx = 1 * this.direction
    this.vy = -2.5
}

Zombie.prototype.render = function() {
    Canvas.fillStyle = Colors.green1
    var h = this.height// - (Math.round(this.x) % 2)
    var w = this.width

    if(this.state == "dying") {
        var t = h
        h = w
        w = t
    }
    var x = Math.round(this.x - (w / 2))
    var y = Math.round(this.y - h)
    Canvas.fillRect(x, y, w, h)
}

var Particle = function(protoparticle) {
    this.x = protoparticle.x + Math.round((Math.random() * 3) - 1.5)
    this.y = protoparticle.y
    this.id = id++
    this.vx = Math.random() * 5 - 2.5
    this.vy = -1 * Math.random() * 3
    particles[this.id] = this
}

Particle.prototype.update = function(tick) {
    this.vy += 8 * tick

    if(this.vy + this.y > 7*8) {
        this.y = 7*8
        this.vx = 0
        this.vy = 0
    }

    this.x += this.vx
    this.y += this.vy
}

Particle.prototype.render = function() {
    Canvas.fillStyle = Colors.red
    var x = Math.round(this.x)
    var y = Math.round(this.y)
    Canvas.fillRect(x, y - 1, 1, 1)
}

window.hero = new Hero()
window.level = new Level()
window.bombs = {}
window.explosions = {}
window.zombies = {}
window.particles = {}
window.id = 0

new Zombie({
    y: 7*8,
    x: Math.random() * 128,
    direction: Math.random() < 0.5 ? +1 : -1,
})

var ticker = 0
Loop(function(tick) {
    ticker += ticker
    if(ticker > 3) {
        ticker -= 3
    }

    hero.update(tick)
    for(var id in zombies) {
        zombies[id].update(tick)
    }
    for(var id in bombs) {
        bombs[id].update(tick)
    }
    for(var id in explosions) {
        explosions[id].update(tick)
    }
    for(var id in particles) {
        particles[id].update(tick)
    }

    Canvas.clearRect(0, 0, 128, 72)
    for(var id in bombs) {
        bombs[id].render()
    }
    hero.render()
    for(var id in zombies) {
        zombies[id].render()
    }
    for(var id in explosions) {
        explosions[id].render()
    }
    level.render()
    for(var id in particles) {
        particles[id].render()
    }
})
