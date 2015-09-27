var Keyboard = {
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

module.exports = Keyboard
