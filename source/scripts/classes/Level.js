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
    GameCanvas.fillStyle = Colors.green1
    GameCanvas.fillRect(0, this.floor, this.width, 9)
    for(var index in this.tiles) {
        var tile = this.tiles[index]
        GameCanvas.fillStyle = Colors.green2
        GameCanvas.fillRect(tile.x, tile.y, tile.width, tile.height)
    }
}

module.exports = Level
