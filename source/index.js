window.Colors = {
    red: "#C64444",
    white: "#EFF4F0",
    green1: "#96BB87",
    green2: "#79936C",
    green3: "#293833",
}

window.Controls = {
    W: 87,
    D: 68,
    A: 65,
    S: 83,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
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
    this.y = 48

    this.vx = 0
    this.vy = 0

    this.width = 4
    this.height = 6

    this.direction = +1

    this.health = 8
    this.maxhealth = 8

    this.jumping = 0
    this.damaged = 0
    this.struggling = -1

    game.hero = this
}

Hero.prototype.update = function(tick) {
    if(this.struggling > -1) {
        // input: struggling
        if(Keyboard.isJustDown(Controls.S)
        || Keyboard.isJustDown(Controls.DOWN)
        || Keyboard.isJustDown(Controls.SPACE)) {
            this.struggling += 1
        } if(Keyboard.isJustDown(Controls.W)
        || Keyboard.isJustDown(Controls.UP)) {
            this.struggling += 1
        } if(Keyboard.isJustDown(Controls.A)
        || Keyboard.isJustDown(Controls.LEFT)) {
            this.struggling += 1
        } if(Keyboard.isJustDown(Controls.D)
        || Keyboard.isJustDown(Controls.RIGHT)) {
            this.struggling += 1
        }
        if(this.struggling >= 20) {
            this.struggling = -1
            for(var id in game.zombies) {
                var zombie = game.zombies[id]
                if(zombie.state == "attacking") {
                    if(zombie.x < this.x) {
                        zombie.direction = -1
                    } else {
                        zombie.direction = +1
                    }
                    zombie.die()
                }
            }
        }
    } else {
        // input: bombing
        if(Keyboard.isJustDown(Controls.S)
        || Keyboard.isJustDown(Controls.DOWN)
        || Keyboard.isJustDown(Controls.SPACE)) {
            new Bomb({x: this.x, y: this.y})
        }
        // input: jumping/diving
        if(Keyboard.isJustDown(Controls.W)
        || Keyboard.isJustDown(Controls.UP)) {
            if(this.jumping == 0) {
                this.vy = -3
                this.jumping = 1
            } else if(this.jumping == 1) {
                this.vx = 3 * this.direction
                this.jumping = 2
            }
        }
        //input: moving
        if(Keyboard.isDown(Controls.A)
        || Keyboard.isDown(Controls.LEFT)) {
            if(this.jumping != 2) {
                this.direction = -1
                this.vx = -1
            }
        } if(Keyboard.isDown(Controls.D)
        || Keyboard.isDown(Controls.RIGHT)) {
            if(this.jumping != 2) {
                this.direction = +1
                this.vx = +1
            }
        }
    }

    // gravity
    this.vy += 8 * tick

    // collision: floor
    if(this.y + this.vy > game.level.floor) {
        this.y = game.level.floor
        this.vy = 0
        this.jumping = 0
    }

    // collision: walls
    if(this.x + this.vx < 0) {
        this.vx = 0
        this.x = 0
    } else if(this.x + this.vx > game.level.width) {
        this.x = game.level.width
        this.vx = 0
    }

    // translation
    this.x += this.vx
    this.y += this.vy

    // friction
    var friction = 0.0005
    if(this.jumping != 0) {
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
        this.damaged = 0.1
        if(this.health <= 0) {
            window.location = window.location
        }
    }
}

Hero.prototype.render = function() {
    if(this.damaged <= 0) {
        Canvas.fillStyle = Colors.white
    } else {
        Canvas.fillStyle = Colors.red
    }
    var w = this.jumping != 2 ? this.width : this.height
    var h = this.jumping != 2 ? this.height : this.width
    var x = Math.round(this.x - (w / 2))
    var y = Math.round(this.y - h)
    Canvas.fillRect(x, y, w, h)
    return
}

var Bomb = function(protobomb) {
    this.x = protobomb.x
    this.y = protobomb.y

    this.vy = 0

    this.width = 4
    this.height = 2

    this.tick = 0
    this.primed = false

    this.id = window.gid++
    game.bombs[this.id] = this
}

Bomb.prototype.update = function(tick) {
    this.tick += tick
    if(this.tick > 1.6) {
        this.tick -= 1.6
        this.primed = true
    }

    // collision: floor
    if(this.y + this.vy > game.level.floor) {
        this.y = game.level.floor
        this.vy = 0
    }

    // gravity
    this.vy += 8 * tick
    this.y += this.vy

    // collision: hero
    if(!!this.primed && this.isColliding(game.hero)) {
        this.explode()
    }

    // collision: zombies
    for(var id in game.zombies) {
        var zombie = game.zombies[id]
        if(this.isColliding(zombie)) {
            this.explode()
        }
    }
}

Bomb.prototype.explode = function() {
    delete game.bombs[this.id]
    new Explosion({x: this.x, y: this.y})
    for(var i = -1; i <= 1; i++) {
        new Explosion({
            x: this.x + (Math.round(Math.random() * 1.5 * 8 * i) + (4 * i)),
            y: this.y - (Math.round(Math.random() * 8) + (i == 0 ? 8 : 0)),
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
    if(this.tick < 1.5) {
        Canvas.fillStyle = Colors.white
    } else {
        Canvas.fillStyle = Colors.red
    }
    var x = Math.round(this.x - (this.width / 2))
    var y = Math.round(this.y - this.height)
    Canvas.fillRect(x, y, this.width, this.height)
}

var Explosion = function(protoexplosion) {
    this.x = protoexplosion.x
    this.y = protoexplosion.y
    this.diameter = 32

    this.tick = 2

    this.id = window.gid++
    game.explosions[this.id] = this

    // FOLLOWING CODE IS RUN TWO OR MORE TIMES
    // BECAUSE THE EXPLOSIONS ARE OVERLAPPING

    if(this.isColliding(game.hero)) {
        game.hero.hurt()
    }

    for(var id in game.zombies) {
        var zombie = game.zombies[id]
        if(this.isColliding(zombie)) {
            zombie.die()
        }
    }
}

Explosion.prototype.update = function(tick) {
    this.tick -= tick
    if(this.tick <= 0) {
        delete game.explosions[this.id]
    }
}

Explosion.prototype.isColliding = function(object) {
    var x = Math.abs(object.x - this.x)
    var y = Math.abs(object.y - this.y - (object.height / 2))
    var radius = this.diameter / 2
    return x < radius && y < radius
}

Explosion.prototype.render = function() {
    Canvas.fillStyle = Colors.white
    Canvas.beginPath()
    var diameter = this.diameter * (this.tick / 2)
    Canvas.arc(this.x, this.y, diameter / 2, 0, 2 * Math.PI)
    Canvas.fill()
}

var Zombie = function(protozombie) {
    this.x = protozombie.x
    this.y = protozombie.y || -2

    this.vx = 0
    this.vy = 0

    this.width = 6
    this.height = 8

    this.direction = protozombie.direction || +1

    this.id = window.gid++
    game.zombies[this.id] = this

    this.tick = 0

    if(this.y < game.level.floor) {
        this.state = "falling"
    }
}

Zombie.prototype.update = function(tick) {
    if(this.state == "falling") {
        this.y += 8 * tick
        if(this.y > game.level.floor) {
            this.y = game.level.floor
            this.state = "moving"
        }
    } else if(this.state == "moving") {
        this.x += 22 * this.direction * tick
        if(this.x < 0) {
            this.x = 0
            this.direction = +1
        } else if(this.x > game.level.width) {
            this.x = game.level.width
            this.direction = -1
        }
        if(this.isColliding(game.hero)) {
            this.state = "attacking"
            game.hero.struggling = 0
            game.hero.vx = 0
        }
    } else if(this.state == "attacking") {
        this.tick += tick
        if(this.tick > 1.5) {
            this.tick -= 1.5
            game.hero.hurt()
        }
    } else if(this.state == "dying") {
        //gravity
        this.vy += 5 * tick

        // collision: floor
        if(this.y + this.vy > game.level.floor) {
            this.y = game.level.floor
            delete game.zombies[this.id]
            for(var i = 0; i < 15; i++) {
                new Particle({
                    x: this.x + Math.round((Math.random() * 3) - 1.5),
                    y: this.y,
                    vx: Math.random() * 1 - 0.5,
                    vy: -1 * Math.random() * 2.5,
                    type: i % 2
                })
            }
            return
        }

        // collision: walls
        if(this.x + this.vx < 0) {
            this.x = 0
            delete game.zombies[this.id]
            for(var i = 0; i < 15; i++) {
                new Particle({
                    x: this.x,
                    y: this.y + Math.round((Math.random() * 3) - 1.5),
                    vx: Math.random() * 1,
                    vy: -1 * Math.random() * 2.5,
                    type: i % 2
                })
            }
            return
        } if(this.x + this.vx > game.level.width) {
            this.x = game.level.width
            delete game.zombies[this.id]
            for(var i = 0; i < 15; i++) {
                new Particle({
                    x: this.x,
                    y: this.y + Math.round((Math.random() * 3) - 1.5),
                    vx: Math.random() * -1,
                    vy: -1 * Math.random() * 2.5,
                    type: i % 2
                })
            }
            return
        }

        // translation
        this.x += this.vx
        this.y += this.vy
    }
}

Zombie.prototype.die = function() {
    this.state = "dying"
    this.vx = this.direction
    this.vy = -3
}

Zombie.prototype.isColliding = function(object) {
    var dx = Math.abs(object.x - this.x)
    var dy = Math.abs(object.y - this.y)
    var max_dx = (object.width / 2) + (this.width / 2)
    var max_dy = (object.height / 2) + (this.height / 2)
    return dx < max_dx && dy < max_dy
}

Zombie.prototype.render = function() {
    Canvas.fillStyle = Colors.green1
    var h = this.state != "dying" ? this.height : this.width
    var w = this.state != "dying" ? this.width : this.height
    if(this.state == "attacking") {
        //if(this.tick % 0.5 == 0) {
            h -= 1
        //}
    }
    var x = Math.round(this.x - (w / 2))
    var y = Math.round(this.y - h)
    Canvas.fillRect(x, y, w, h)
}

var Particle = function(protoparticle) {
    this.x = protoparticle.x
    this.y = protoparticle.y

    this.vx = protoparticle.vx
    this.vy = protoparticle.vy

    this.type = protoparticle.type

    this.id = window.gid++
    game.particles[this.id] = this
}

Particle.prototype.update = function(tick) {
    // gravity
    this.vy += 8 * tick

    // collision: floor
    if(this.y + this.vy > game.level.floor) {
        this.y = game.level.floor
        this.vx = 0
        this.vy = 0
    }

    // collision: walls
    if(this.x + this.vx < 0) {
        this.x = 0
        this.vx = 0
    } if(this.x + this.vx > game.level.width) {
        this.x = game.level.width
        this.vx = 0
    }

    // translation
    this.x += this.vx
    this.y += this.vy
}

Particle.prototype.render = function() {
    if(this.type == 0) {
        Canvas.fillStyle = Colors.red
    } else {
        Canvas.fillStyle = Colors.green1
    }
    var x = Math.round(this.x)
    var y = Math.round(this.y)
    Canvas.fillRect(x, y - 1, 1, 1)
}

var Level = function() {
    this.width = 256
    this.height = 72
    this.floor = this.height - 9

    game.level = this

    this.tiles = []
    var iterator = 0
    while(iterator < this.width / 8) {
        var random = Math.floor(Math.random() * 5)
        if(random == 0) {
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1,
                width: 7,
                height: 7,
            })
            iterator++
        } else if(random == 1) {
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1,
                width: 7,
                height: 3,
            })
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1 + 4,
                width: 7,
                height: 3,
            })
            iterator++
        } else if(random == 2) {
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1,
                width: 3,
                height: 7,
            })
            this.tiles.push({
                x: iterator * 8 + 4,
                y: this.floor + 1,
                width: 3,
                height: 7,
            })
            iterator++
        } else if(random == 3) {
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1,
                width: 3, height: 3,
            })
            this.tiles.push({
                x: iterator * 8 + 4,
                y: this.floor + 1,
                width: 3, height: 3,
            })
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1 + 4,
                width: 3, height: 3,
            })
            this.tiles.push({
                x: iterator * 8 + 4,
                y: this.floor + 1 + 4,
                width: 3, height: 3,
            })
            iterator++
        } else if(random == 4) {
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1,
                width: 3,
                height: 7,
            })
            this.tiles.push({
                x: iterator * 8,
                y: this.floor + 1 + 4,
                width: 7,
                height: 3,
            })
            this.tiles.push({
                x: (iterator + 0.5) * 8,
                y: this.floor + 1,
                width: 7,
                height: 3,
            })
            this.tiles.push({
                x: (iterator + 1) * 8,
                y: this.floor + 1 + 4,
                width: 7,
                height: 3,
            })
            this.tiles.push({
                x: (iterator + 2) * 8,
                y: this.floor + 1,
                width: 3,
                height: 7,
            })
            this.tiles.push({
                x: (iterator + 1.5) * 8,
                y: this.floor + 1,
                width: 7,
                height: 3,
            })
            iterator += 2.5
        }
    }
}

Level.prototype.render = function() {
    Canvas.fillStyle = Colors.green1
    Canvas.fillRect(0, this.floor, this.width, 9)
    for(var index in this.tiles) {
        var tile = this.tiles[index]
        Canvas.fillStyle = Colors.green2
        Canvas.fillRect(tile.x, tile.y, tile.width, tile.height)
    }
}

window.gid = 0

var Game = function() {
    this.hero = null
    this.level = null
    this.zombies = {}
    this.bombs = {}
    this.explosions = {}
    this.particles = {}
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

    var x = Math.round(game.hero.x - (16 * 8) / 2) / 8
    x = Math.max(Math.min(x, (game.level.width / 8) - 16), 0)
    document.getElementById("canvas").style.left = -x + "em"
}

window.game = new Game()
new Level({})
new Hero({})
new Zombie({
    x: 48,
    y: game.level.floor - 1,
    direction: -1,
    //x: Math.random() * game.level.width,
    //direction: Math.random() < 0.5 ? +1 : -1,
})

Loop(function(tick) {
    game.update(tick)

    Canvas.clearRect(0, 0, game.level.width, 72)

    game.render(tick)
})
