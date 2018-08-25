/** @type {HTMLCanvasElement} */

// Declarations
const FPS = 30; // Frames Per Second;
const FRICTION = 0.7; // Friction Coefficient of Space (0 = No Friction, 1 = Lots)
const SHOW_BOUNDING = true; // Show or Hide Collision Bounding
const SHOW_CENTERDOT = false; // Show or Hide Center Dot

// Ship Details
const SHIP_SIZE = 30; // Height In Pixels
const TURN_SPEED = 360; // Turn Speed in Degrees Per Second
const SHIP_THRUST = 5; // Acceleration of Ship in Pixels Per Second

// Astroid Details
const NUM_ROIDS = 3; // Starting number of astroids
const ROIDS_SIZE = 100; // Starting size of astroids in Pixels
const ROIDS_SPD = 50; // Starting Speed in Pixels Per Second
const ROIDS_VERT = 10; // Average Number of Vertices on Each Asteroid
const ROIDS_JAG = 0.4; // Jaggedness of Asteroids (0 = none, 1 = Lots)

// Canvas Details
const canv = document.getElementById("gameWindow"); // Game Window
const ctx = canv.getContext("2d");

const SHIP = {
    x: canv.width / 2,
    y: canv.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // Convert to Radians
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

let asteroids = [];
createAsteroidBelt();

function createAsteroidBelt() {
    astroids = [];
    let x, y;
    for (let i = 0; i < NUM_ROIDS; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(SHIP.x, SHIP.y, x, y) < ROIDS_SIZE * 2 + SHIP.r);
        asteroids.push(createAsteroid(x, y));
    }
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function createAsteroid(x, y) {
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: ROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: []
    };

    // Creates vertex offsets array
    for (let i = 0; i < ROIDS_VERT; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
}

const keyDown = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) {
        case 37: // Left Arrow (Rotates Ship Left)
            SHIP.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // Up Arrow  (Thrusts Ship Forward)
            SHIP.thrusting = true;
            break;
        case 39: // Right Arrow (Rotates Ship Right)
            SHIP.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

const keyUp = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) {
        case 37: // Left Arrow (Stops Left Rotation)
            SHIP.rot = 0;
            break;
        case 38: // Up Arrow  (Stops Forward Thrust)
            SHIP.thrusting = false;
            break;
        case 39: // Right Arrow (Stops Right Rotation)
            SHIP.rot = 0;
            break;
    }
}

// Sets Up Event Listeners
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Sets Up the Game Loop
const update = () => {
    // Draws Space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // Thrusts Ship
    if (SHIP.thrusting) {
        SHIP.thrust.x += SHIP_THRUST * Math.cos(SHIP.a) / FPS;
        SHIP.thrust.y -= SHIP_THRUST * Math.sin(SHIP.a) / FPS;

        // Thrust Details
        ctx.fillStyle = "red";
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = SHIP_SIZE / 20;
        ctx.beginPath();

        // Left Thrust
        ctx.moveTo(
            SHIP.x - SHIP.r * (2 / 3 * Math.cos(SHIP.a) + 0.5 * Math.sin(SHIP.a)),
            SHIP.y + SHIP.r * (2 / 3 * Math.sin(SHIP.a) - 0.5 * Math.cos(SHIP.a)),
        );
        // Center Thrust
        ctx.lineTo(
            SHIP.x - SHIP.r * 6 / 3 * Math.cos(SHIP.a),
            SHIP.y + SHIP.r * 6 / 3 * Math.sin(SHIP.a),
        );
        // Right Thrust
        ctx.lineTo(
            SHIP.x - SHIP.r * (2 / 3 * Math.cos(SHIP.a) - 0.5 * Math.sin(SHIP.a)),
            SHIP.y + SHIP.r * (2 / 3 * Math.sin(SHIP.a) + 0.5 * Math.cos(SHIP.a)),
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        SHIP.thrust.x -= FRICTION * SHIP.thrust.x / FPS;
        SHIP.thrust.y -= FRICTION * SHIP.thrust.y / FPS;
    }

    // Draws Ship
    ctx.strokeStyle = "white",
        ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    // Nose of Ship
    ctx.moveTo(
        SHIP.x + 4 / 3 * SHIP.r * Math.cos(SHIP.a),
        SHIP.y - 4 / 3 * SHIP.r * Math.sin(SHIP.a),
    );
    // Rear Left
    ctx.lineTo(
        SHIP.x - SHIP.r * (2 / 3 * Math.cos(SHIP.a) + Math.sin(SHIP.a)),
        SHIP.y + SHIP.r * (2 / 3 * Math.sin(SHIP.a) - Math.cos(SHIP.a)),
    );
    // Rear Right
    ctx.lineTo(
        SHIP.x - SHIP.r * (2 / 3 * Math.cos(SHIP.a) - Math.sin(SHIP.a)),
        SHIP.y + SHIP.r * (2 / 3 * Math.sin(SHIP.a) + Math.cos(SHIP.a)),
    );
    ctx.closePath();
    ctx.stroke();

    // Shows Hitbox Around Ship 
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(SHIP.x, SHIP.y, SHIP.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    // Draws Asteroids
    ctx.lineWidth = SHIP_SIZE / 20;
    let x, y, r, a, vert;

    for (let i = 0; i < asteroids.length; i++) {
        ctx.strokeStyle = "slategrey";

        x = asteroids[i].x;
        y = asteroids[i].y;
        r = asteroids[i].r;
        a = asteroids[i].a;
        vert = asteroids[i].vert;
        offs = asteroids[i].offs;

        // Draw a Path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a),
        );
        // Draw a PolyGon
        for (let i = 0; i < vert; i++) {
            ctx.lineTo(
                x + r * offs[i] * Math.cos(a + i * Math.PI * 2 / vert),
                y + r * offs[i] * Math.sin(a + i * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();

        // Shows Hitbox Around Asteroids 
        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }

    // Rotates Ship
    SHIP.a += SHIP.rot;

    // Moves Ship
    SHIP.x += SHIP.thrust.x;
    SHIP.y += SHIP.thrust.y;

    // Handle Screen Boundaries
    // X Coordinates
    if (SHIP.x < 0 - SHIP.r) {
        SHIP.x = canv.width + SHIP.r;
    } else if (SHIP.x > canv.width + SHIP.r) {
        SHIP.x = 0 - SHIP.r;
    }
    // Y Coordinates
    if (SHIP.y < 0 - SHIP.r) {
        SHIP.y = canv.height + SHIP.r;
    } else if (SHIP.y > canv.height + SHIP.r) {
        SHIP.y = 0 - SHIP.r;
    }

    for(let i = 0; i < asteroids.length; i++){
        // Move Asteroid
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        // Handle Edge of Screen
        // X Coords
        if (asteroids[i].x < 0 - asteroids[i].r) {
            asteroids[i].x = canv.width + asteroids[i].r;
        } else if (asteroids[i].x > canv.width + asteroids[i].r) {
            asteroids[i].x = 0 - asteroids[i].r;
        }
        // Y Coords
        if (asteroids[i].y < 0 - asteroids[i].r) {
            asteroids[i].y = canv.height + asteroids[i].r;
        } else if (asteroids[i].y > canv.height + asteroids[i].r) {
            asteroids[i].y = 0 - asteroids[i].r;
        }

    }
    
    // Displays Centerdot when needed for Testing
    if (SHOW_CENTERDOT) {
        ctx.fillStyle = "red";
        ctx.fillRect(SHIP.x - 1, SHIP.y - 1, 2, 2);
    }

};

// Game Loop
setInterval(update, 1000 / FPS);