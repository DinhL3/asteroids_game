const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreCurrent = document.getElementById('scoreCurrent')
const startGameBtn = document.getElementById('btn-start')
const containerModal = document.getElementById('containerModal')
const finalScore = document.getElementById('finalScore')

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = { x: 0, y: 0 }
        this.friction = .80
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction

        if (this.x - this.radius + this.velocity.x > 0 &&
            this.x + this.radius + this.velocity.x < canvas.width) {
            this.x = this.x + this.velocity.x

        } else {
            this.velocity.x = 0
        }

        if (this.y - this.radius + this.velocity.y > 0 &&
            this.y + this.radius + this.velocity.y < canvas.height) {

            this.y = this.y + this.velocity.y
        } else {
            this.velocity.y = 0
        }


    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.type = 'linear'

        if (Math.random() < (1 / 4)) { this.type = 'homing' }
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()

        if (this.type === 'linear') {
            this.x = this.x + this.velocity.x
            this.y = this.y + this.velocity.y

        } else if (this.type === 'homing') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x)
            this.velocity = {
                x: Math.cos(angle) * 4,
                y: Math.sin(angle) * 4
            }

            this.x = this.x + this.velocity.x
            this.y = this.y + this.velocity.y
        }
        // // to center
        // this.x = this.x + this.velocity.x
        // this.y = this.y + this.velocity.y
    }
}



const centerX = canvas.width / 2
const centerY = canvas.height / 2


let player = new Player(centerX, centerY, 10, 'white')
let projectiles = []
let enemies = []

function init() {
    player = new Player(centerX, centerY, 10, 'white')
    projectiles = []
    enemies = []
    score = 0
    scoreCurrent.innerHTML = score
    finalScore.innerHTML = score
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (60 - 15) + 15

        let x
        let y

        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height

        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl(${Math.random() * 360},50%, 50%)`
        const angle = Math.atan2(
            centerY - y,
            centerX - x
        )
        const velocity = {
            x: Math.cos(angle) * 3,
            y: Math.sin(angle) * 3
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))

    }, 1000)
}

let animationID
let score = 0
function animate() {
    animationId = requestAnimationFrame(animate)
    // maybe change background to gradient
    c.fillStyle = '#06071f'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()

        // remove projectiles from edges
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.heightth) {
            setTimeout(() => {
                projectiles.splice(projectileIndex, 1)
            }, 0)
        }
    })

    enemies.forEach((enemy, index) => {
        enemy.update()

        // end game condition
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 0) {
            cancelAnimationFrame(animationId)
            containerModal.style.display = 'flex'
            finalScore.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

            // projectile touch enemy
            if (dist - enemy.radius - projectile.radius < 0) {

                // increase score when shrink
                score += 64
                scoreCurrent.innerHTML = score


                if (enemy.radius - 10 > 15) {
                    enemy.radius -= 10
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    // bigger score when kill
                    score += 128
                    scoreCurrent.innerHTML = score
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }


            }
        })
    })
}

addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    )
    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }
    projectiles.push(
        new Projectile(
            player.x, player.y, 3, 'white', velocity
        )
    )
})


startGameBtn.addEventListener('click', () => {
    init()
    animate()
    spawnEnemies()
    containerModal.style.display = 'none'
})



addEventListener('keydown', ({ keyCode }) => {
    if (keyCode === 87) {
        console.log('up')
        player.velocity.y -= 8
    }
    else if
        (keyCode === 83) {
        console.log('down')
        player.velocity.y += 8
    }
    else if
        (keyCode === 65) {
        console.log('left')
        player.velocity.x -= 8
    }
    else if
        (keyCode === 68) {
        console.log('right')
        player.velocity.x += 8
    }



    // switch (keyCode) {
    //     case 38:
    //         console.log('up')
    //         player.velocity.y -= 1
    //         break

    //     case 40:
    //         console.log('down')
    //         player.velocity.y += 1
    //         break

    //     case 37:
    //         console.log('left')
    //         player.velocity.x -= 1
    //         break

    //     case 39:
    //         console.log('right')
    //         player.velocity.x += 1
    //         break
    // }
}
)