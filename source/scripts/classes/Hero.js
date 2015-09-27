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

    this.hasDroppedBomb = false
    this.hasKilledZombie = false

    this.score = 0
    this.camera = 0

    game.hero = this
}

Hero.prototype.update = function(tick) {
    if(Keyboard.isJustDown(Controls.ESC)) {
        console.log("Yo")
        try {
            //require("nw.gui").App.quit()
        } catch(error) {
            //?!
        }
    }
    if(this.struggling > -1) {
        var continue_struggling = false
        for(var id in game.zombies) {
            var zombie = game.zombies[id]
            if(zombie.state == "attacking") {
                continue_struggling = true
                break
            }
        }
        if(continue_struggling == false) {
            this.struggling = -1
        }
    }
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
                    zombie.explode({
                        x: this.x,
                        y: this.y
                    })
                }
            }
        }
    } else {
        // input: bombing
        if(Keyboard.isJustDown(Controls.S)
        || Keyboard.isJustDown(Controls.DOWN)
        || Keyboard.isJustDown(Controls.SPACE)) {
            if(this.hasKilledZombie == true
            || Object.keys(game.bombs).length == 0) {
                new Bomb({x: this.x, y: this.y})
                if(this.hasDroppedBomb == false) {
                    window.setTimeout(function() {
                        game.hero.hasDroppedBomb = true
                    }, 500)
                    window.setTimeout(function() {
                        new Zombie({
                            x: -2,
                            y: 72 - 9 - 1,
                            direction: +1,
                        })
                    }, 1000)
                }
            }
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
    } if(this.hasKilledZombie == true) {
        if(this.x + this.vx > game.level.width) {
            this.x = game.level.width
            this.vx = 0
        }
    } else {
        if(this.x + this.vx > 128) {
            this.x = 128
            this.vx = 0
        }
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

    // camera
    if(this.hasKilledZombie == true) {
        var target = Math.round(game.hero.x - (16 * 8) / 2) / 8
        target = Math.max(Math.min(target, (game.level.width / 8) - 16), 0)
        if(Math.abs(this.camera - target) < 0.5) {
            this.camera = target
        } if(this.camera < target) {
            this.camera += 0.5
        } else if(this.camera > target) {
            this.camera -= 0.5
        }
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
        GameCanvas.fillStyle = Colors.white
    } else {
        GameCanvas.fillStyle = Colors.red
    }
    var w = this.jumping != 2 ? this.width : this.height
    var h = this.jumping != 2 ? this.height : this.width
    var x = Math.round(this.x - (w / 2))
    var y = Math.round(this.y - h)
    GameCanvas.fillRect(x, y, w, h)
    return
}

module.exports = Hero
