/** @type {HTMLCanvasElement} */

// Canvas Details
const canv = document.getElementById("gameWindow"); // Game Window
const ctx = canv.getContext("2d");
const FPS = 30; // Frames Per Second;
const FRICTION = 0.7; // Friction Coefficient of Space (0 = No Friction, 1 = Lots)

// Testing Features
const SHOW_BOUNDING = false; // Show or Hide Collision Bounding
const SHOW_CENTERDOT = false; // Show or Hide Center Dot

// Ship Details
const SHIP_SIZE = 30; // Height In Pixels
const TURN_SPEED = 360; // Turn Speed in Degrees Per Second
const SHIP_THRUST = 5; // Acceleration of Ship in Pixels Per Second
const SHIP_EXPLODE_DUR = 0.3; // Duration of Ships Explosion
const SHIP_INVISIBILITY_DUR = 3; // Duration of Ships Invisibility
const SHIP_BLINK_DUR = 0.1; // Duration of Ships Blinking During Invisibility

// Laser Details
const LASER_MAX = 10; // Max Number of laser beams on screen at once
const LASER_SPD = 500; // Speed of Lasers
const LASER_DIST = 0.4; // Max Distance Laser Can Travel as Fraction of Screen
const LASER_EXPLODE_DUR = 0.1; // Duration of a Laser Exploding an Asteroid

// Astroid Details
const NUM_ROIDS = 3; // Starting number of astroids
const ROIDS_SIZE = 100; // Starting size of astroids in Pixels
const ROIDS_SPD = 50; // Starting Speed in Pixels Per Second
const ROIDS_VERT = 10; // Average Number of Vertices on Each Asteroid
const ROIDS_JAG = 0.4; // Jaggedness of Asteroids (0 = none, 1 = Lots)

let SHIP = newShip();

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
        asteroids.push(createAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function destroyAsteroid(index) {
    let x = asteroids[index].x;
    let y = asteroids[index].y;
    let r = asteroids[index].r;

    // Split the asteroid in half if necessary
    if(r === Math.ceil(ROIDS_SIZE / 2)){
        asteroids.push(createAsteroid(x,y,Math.ceil(ROIDS_SIZE / 4)));
        asteroids.push(createAsteroid(x,y,Math.ceil(ROIDS_SIZE / 4)));
    }else if (r === Math.ceil(ROIDS_SIZE / 4)){
        asteroids.push(createAsteroid(x,y,Math.ceil(ROIDS_SIZE / 8)));
        asteroids.push(createAsteroid(x,y,Math.ceil(ROIDS_SIZE / 8))); 
    }
    asteroids.splice(index, 1);
}
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    SHIP.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function createAsteroid(x, y, r) {
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
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

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI, // Convert to Radians
        blinkNum: Math.ceil(SHIP_INVISIBILITY_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        lasers: [],
        rot: 0,
        explodeTime: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    if(SHIP.canShoot && SHIP.lasers.length < LASER_MAX){
        SHIP.lasers.push({
            x: SHIP.x + 4 / 3 * SHIP.r * Math.cos(SHIP.a),
            y: SHIP.y - 4 / 3 * SHIP.r * Math.sin(SHIP.a),
            xv: LASER_SPD * Math.cos(SHIP.a) / FPS,
            yv: -LASER_SPD * Math.sin(SHIP.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    SHIP.canShoot = false;
}

const keyDown = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) { 
        case 32: // Space Bar (Shoots Laser)
            shootLaser();
            break;
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
        case 32: // Space Bar (Shoots Laser)
            SHIP.canShoot = true;
            break;
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
    let blinkOn = SHIP.blinkNum % 2 === 0;
    let exploding = SHIP.explodeTime > 0;

    // Draws Space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // Draws Ship if it isn't exploding
    if(!exploding){   
            // Thrusts Ship
            if (SHIP.thrusting) {
                SHIP.thrust.x += SHIP_THRUST * Math.cos(SHIP.a) / FPS;
                SHIP.thrust.y -= SHIP_THRUST * Math.sin(SHIP.a) / FPS;
                if(blinkOn){
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
                }
            } else {
                SHIP.thrust.x -= FRICTION * SHIP.thrust.x / FPS;
                SHIP.thrust.y -= FRICTION * SHIP.thrust.y / FPS;
            }
        if(blinkOn){
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
        }
        // Handles Blinking
        if (SHIP.blinkNum > 0){
            SHIP.blinkTime--;
            if(SHIP.blinkTime === 0){
                SHIP.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                SHIP.blinkNum--;
            }
        }
    }else{
        // Draws Explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(SHIP.x, SHIP.y, SHIP.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(SHIP.x, SHIP.y, SHIP.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(SHIP.x, SHIP.y, SHIP.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(SHIP.x, SHIP.y, SHIP.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(SHIP.x, SHIP.y, SHIP.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }
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

    if(!exploding){
        if (SHIP.blinkNum === 0){
            // Checks for Asteroid Collisions
            for(let i = 0; i < asteroids.length; i++){
                if(distBetweenPoints(SHIP.x, SHIP.y, asteroids[i].x, asteroids[i].y) < SHIP.r + asteroids[i].r){
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        // Rotates Ship
        SHIP.a += SHIP.rot;
        // Moves Ship
        SHIP.x += SHIP.thrust.x;
        SHIP.y += SHIP.thrust.y;
    }else {
        SHIP.explodeTime--;
        if(SHIP.explodeTime === 0){
            SHIP = newShip();
        }
    }

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

    // Moves Lasers
    for (let i = SHIP.lasers.length - 1; i >= 0; i--){
        // Checks Distance Travelled    
        if(SHIP.lasers[i].dist > LASER_DIST * canv.width){
            SHIP.lasers.splice(i, 1);
            continue;
        }

        // Handle Explosion
        if(SHIP.lasers[i].explodeTime > 0){
            SHIP.lasers[i].explodeTime--;
             
            if(SHIP.lasers[i].explodeTime === 0){
                SHIP.lasers.splice(i,1);
                continue;
            }
        }
        // Moves the Laser
        SHIP.lasers[i].x += SHIP.lasers[i].xv;
        SHIP.lasers[i].y += SHIP.lasers[i].yv;

        // Calculate Laser Distance Traveled
        SHIP.lasers[i].dist += Math.sqrt(Math.pow(SHIP.lasers[i].xv,2) + Math.pow(SHIP.lasers[i].yv, 2));
        
        // Handle Edge of Screen
        // X Coords
        if(SHIP.lasers[i].x < 0){
            SHIP.lasers[i].x = canv.width;
        }else if(SHIP.lasers[i].x > canv.width){
            SHIP.lasers[i].x = 0;
        }
        // Y Coords
        if(SHIP.lasers[i].y < 0){
            SHIP.lasers[i].y = canv.height;
        }else if(SHIP.lasers[i].y > canv.height){
            SHIP.lasers[i].y = 0;
        }
    }

    // Move Asteroids
    for(let i = 0; i < asteroids.length; i++){
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

    // Draws Lasers
    for (let i = 0; i < SHIP.lasers.length; i++){
        if(SHIP.lasers[i].explodeTime === 0){
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(SHIP.lasers[i].x,SHIP.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        }
        else{
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(SHIP.lasers[i].x,SHIP.lasers[i].y, SHIP.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(SHIP.lasers[i].x,SHIP.lasers[i].y, SHIP.r * 0.50, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(SHIP.lasers[i].x,SHIP.lasers[i].y, SHIP.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }

    // Detect Laser Hits on Asteroids
    let ax,ay,ar,lx,ly;
    for(let i = asteroids.length -1; i >= 0; i--){
        // Get Asteroid Properties
        ax = asteroids[i].x;
        ay = asteroids[i].y;
        ar = asteroids[i].r;

        // Loop over the lasers
        for(let j = SHIP.lasers.length - 1; j >= 0; j--){
            lx = SHIP.lasers[j].x;
            ly = SHIP.lasers[j].y;

            // Detect Hits
            if(SHIP.lasers[j].explodeTime === 0 && distBetweenPoints(ax,ay,lx,ly) < ar){ 
                // Destroy Asteroid
                destroyAsteroid(i);
                SHIP.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;
            }
        }
    }
};// End update 

// Game Loop
setInterval(update, 1000 / FPS);