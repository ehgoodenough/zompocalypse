
var Zombie = function(protozombie) {
    this.x = protozombie.x
    this.y = protozombie.y || -2

    this.vx = 0
    this.vy = 0

    this.width = 4
    this.height = 6

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
            game.hero.vy = +1
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
            for(var i = 0; i < 15; i++) {
                new Particle({
                    x: this.x + Math.round((Math.random() * 3) - 1.5),
                    y: this.y,
                    vx: Math.random() * 1 - 0.5,
                    vy: -1 * Math.random() * 2.5,
                    type: i % 2
                })
            }
            delete game.zombies[this.id]
            game.hero.score += 10
            if(game.hero.hasKilledZombie == false) {
                window.setTimeout(function() {
                    game.hero.hasKilledZombie = true
                    for(var i = 1; i < 15; i++) {
                        new Zombie({
                            y: -2 - (Math.random() * 48),
                            x: (i * 2 * 8) + (Math.random() * 2 - 1),
                            direction: Math.random() < 0.5 ? +1 : -1,
                        })
                    }
                }, 1000)
            }
            return
        }

        // collision: walls
        if(this.x + this.vx < 0) {
            this.x = 0
            for(var i = 0; i < 15; i++) {
                new Particle({
                    x: this.x,
                    y: this.y + Math.round((Math.random() * 3) - 1.5),
                    vx: Math.random() * 1,
                    vy: -1 * Math.random() * 2.5,
                    type: i % 2
                })
            }
            delete game.zombies[this.id]
            game.hero.score += 10
            if(game.hero.hasKilledZombie == false) {
                window.setTimeout(function() {
                    game.hero.hasKilledZombie = true
                }, 1000)
            }
            return
        } if(this.x + this.vx > game.level.width) {
            this.x = game.level.width
            for(var i = 0; i < 15; i++) {
                new Particle({
                    x: this.x,
                    y: this.y + Math.round((Math.random() * 3) - 1.5),
                    vx: Math.random() * -1,
                    vy: -1 * Math.random() * 2.5,
                    type: i % 2
                })
            }
            delete game.zombies[this.id]
            game.hero.score += 10
            if(game.hero.hasKilledZombie == false) {
                window.setTimeout(function() {
                    game.hero.hasKilledZombie = true
                }, 1000)
            }
            return
        }

        // translation
        this.x += this.vx
        this.y += this.vy
    }
}

Zombie.prototype.explode = function(blast) {
    this.state = "dying"
    if(this.x < blast.x) {
        this.direction = -1
        this.vx = -((Math.random() * 0.5) + 1)
    } else {
        this.direction = +1
        this.vx = +((Math.random() * 0.5) + 1)
    }
    this.vy = -((Math.random() * 0.5) + 2.75)
}

Zombie.prototype.isColliding = function(object) {
    var dx = Math.abs(object.x - this.x)
    var dy = Math.abs(object.y - this.y)
    var max_dx = (object.width / 2) + (this.width / 2)
    var max_dy = (object.height / 2) + (this.height / 2)
    return dx < max_dx && dy < max_dy
}

Zombie.prototype.render = function() {
    GameCanvas.fillStyle = Colors.green1
    var h = this.state != "dying" ? this.height : this.width
    var w = this.state != "dying" ? this.width : this.height
    if(this.state == "attacking") {
        h -= 1
    }
    var x = Math.round(this.x - (w / 2))
    var y = Math.round(this.y - h)
    GameCanvas.fillRect(x, y, w, h)
}
