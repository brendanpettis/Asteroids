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
const NUM_ROIDS = 1; // Starting number of astroids
const ROIDS_SIZE = 100; // Starting size of astroids in Pixels
const ROIDS_SPD = 50; // Starting Speed in Pixels Per Second
const ROIDS_VERT = 10; // Average Number of Vertices on Each Asteroid
const ROIDS_JAG = 0.4; // Jaggedness of Asteroids (0 = none, 1 = Lots)

// Game Parameters
let level, ship, text, textAlpha;
let asteroids = [];

newGame();

function createAsteroidBelt() {
    astroids = [];
    let x, y;
    for (let i = 0; i < NUM_ROIDS + level; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
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

    // If there are no more asteroids level advances
    if(asteroids.length === 0){
        level++;
        newLevel();
    }
}
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function createAsteroid(x, y, r) {
    let lvlMultiplier = 1 + 0.1 * level;
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD * lvlMultiplier / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD * lvlMultiplier / FPS * (Math.random() < 0.5 ? 1 : -1),
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

function newGame() {
    level = 0;
    ship = newShip();
    newLevel();
}

function newLevel() {
    createAsteroidBelt();
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
    if(ship.canShoot && ship.lasers.length < LASER_MAX){
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        });
    }
    ship.canShoot = false;
}

const keyDown = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) { 
        case 32: // Space Bar (Shoots Laser)
            shootLaser();
            break;
        case 37: // Left Arrow (Rotates Ship Left)
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: // Up Arrow  (Thrusts Ship Forward)
            ship.thrusting = true;
            break;
        case 39: // Right Arrow (Rotates Ship Right)
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

const keyUp = ( /** @type {KeyboardEvent} */ ev) => {
    switch (ev.keyCode) {
        case 32: // Space Bar (Shoots Laser)
            ship.canShoot = true;
            break;
        case 37: // Left Arrow (Stops Left Rotation)
            ship.rot = 0;
            break;
        case 38: // Up Arrow  (Stops Forward Thrust)
            ship.thrusting = false;
            break;
        case 39: // Right Arrow (Stops Right Rotation)
            ship.rot = 0;
            break;
    }
}

// Sets Up Event Listeners
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

// Sets Up the Game Loop
const update = () => {
    let blinkOn = ship.blinkNum % 2 === 0;
    let exploding = ship.explodeTime > 0;

    // Draws Space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height);

    // Draws Ship if it isn't exploding
    if(!exploding){   
            // Thrusts Ship
            if (ship.thrusting) {
                ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
                ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
                if(blinkOn){
                    // Thrust Details
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "yellow";
                    ctx.lineWidth = SHIP_SIZE / 20;
                    ctx.beginPath();

                    // Left Thrust
                    ctx.moveTo(
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a)),
                    );
                    // Center Thrust
                    ctx.lineTo(
                        ship.x - ship.r * 6 / 3 * Math.cos(ship.a),
                        ship.y + ship.r * 6 / 3 * Math.sin(ship.a),
                    );
                    // Right Thrust
                    ctx.lineTo(
                        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
                        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a)),
                    );
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
            } else {
                ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
                ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            }
        if(blinkOn){
            ctx.strokeStyle = "white",
                ctx.lineWidth = SHIP_SIZE / 20;
            ctx.beginPath();
            // Nose of Ship
            ctx.moveTo(
                ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
                ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            );
            // Rear Left
            ctx.lineTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a)),
            );
            // Rear Right
            ctx.lineTo(
                ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
                ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a)),
            );
            ctx.closePath();
            ctx.stroke();
        }
        // Handles Blinking
        if (ship.blinkNum > 0){
            ship.blinkTime--;
            if(ship.blinkTime === 0){
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }
    }else{
        // Draws Explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }
    // Shows Hitbox Around Ship 
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
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
        if (ship.blinkNum === 0){
            // Checks for Asteroid Collisions
            for(let i = 0; i < asteroids.length; i++){
                if(distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r){
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        // Rotates Ship
        ship.a += ship.rot;
        // Moves Ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    }else {
        ship.explodeTime--;
        if(ship.explodeTime === 0){
            ship = newShip();
        }
    }

    // Handle Screen Boundaries
    // X Coordinates
    if (ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r;
    } else if (ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r;
    }
    // Y Coordinates
    if (ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r;
    } else if (ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r;
    }

    // Moves Lasers
    for (let i = ship.lasers.length - 1; i >= 0; i--){
        // Checks Distance Travelled    
        if(ship.lasers[i].dist > LASER_DIST * canv.width){
            ship.lasers.splice(i, 1);
            continue;
        }

        // Handle Explosion
        if(ship.lasers[i].explodeTime > 0){
            ship.lasers[i].explodeTime--;
             
            if(ship.lasers[i].explodeTime === 0){
                ship.lasers.splice(i,1);
                continue;
            }
        }
        // Moves the Laser
        ship.lasers[i].x += ship.lasers[i].xv;
        ship.lasers[i].y += ship.lasers[i].yv;

        // Calculate Laser Distance Traveled
        ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv,2) + Math.pow(ship.lasers[i].yv, 2));
        
        // Handle Edge of Screen
        // X Coords
        if(ship.lasers[i].x < 0){
            ship.lasers[i].x = canv.width;
        }else if(ship.lasers[i].x > canv.width){
            ship.lasers[i].x = 0;
        }
        // Y Coords
        if(ship.lasers[i].y < 0){
            ship.lasers[i].y = canv.height;
        }else if(ship.lasers[i].y > canv.height){
            ship.lasers[i].y = 0;
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
        ctx.fillRect(ship.x - 1, ship.y - 1, 2, 2);
    }

    // Draws Lasers
    for (let i = 0; i < ship.lasers.length; i++){
        if(ship.lasers[i].explodeTime === 0){
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x,ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        }
        else{
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x,ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x,ship.lasers[i].y, ship.r * 0.50, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x,ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
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
        for(let j = ship.lasers.length - 1; j >= 0; j--){
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            // Detect Hits
            if(ship.lasers[j].explodeTime === 0 && distBetweenPoints(ax,ay,lx,ly) < ar){ 
                // Destroy Asteroid
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;
            }
        }
    }
};// End update 

// Game Loop
setInterval(update, 1000 / FPS);