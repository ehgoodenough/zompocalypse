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
    new Explosion({x: this.x, y: this.y, bomb: this})
    for(var i = -1; i <= 1; i++) {
        new Explosion({
            x: this.x + (Math.round(Math.random() * 1.5 * 8 * i) + (4 * i)),
            y: this.y - (Math.round(Math.random() * 8) + (i == 0 ? 8 : 0)),
            bomb: this
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
        GameCanvas.fillStyle = Colors.white
    } else {
        GameCanvas.fillStyle = Colors.red
    }
    var x = Math.round(this.x - (this.width / 2))
    var y = Math.round(this.y - this.height)
    GameCanvas.fillRect(x, y, this.width, this.height)
}
