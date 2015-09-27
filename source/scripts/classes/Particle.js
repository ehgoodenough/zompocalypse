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
        GameCanvas.fillStyle = Colors.red
    } else {
        GameCanvas.fillStyle = Colors.green1
    }
    var x = Math.round(this.x)
    var y = Math.round(this.y)
    GameCanvas.fillRect(x, y - 1, 1, 1)
}

module.exports = Particle
