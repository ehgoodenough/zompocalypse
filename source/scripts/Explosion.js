
var Explosion = function(protoexplosion) {
    this.x = protoexplosion.x
    this.y = protoexplosion.y

    this.bx = protoexplosion.bomb.x
    this.by = protoexplosion.bomb.y

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
            zombie.explode({
                x: this.bx,
                y: this.by,
            })
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
    GameCanvas.fillStyle = Colors.white
    GameCanvas.beginPath()
    var diameter = this.diameter * (this.tick / 2)
    GameCanvas.arc(this.x, this.y, diameter / 2, 0, 2 * Math.PI)
    GameCanvas.fill()
}
