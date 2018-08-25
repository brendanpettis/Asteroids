/** @type {HTMLCanvasElement} */
    
    // Declarations
    const canv = document.getElementById("gameWindow"); // Game Window
    const FPS = 30; // Frames Per Second;
    const FRICTION = 0.7; // Friction Coefficient of Space (0 = No Friction, 1 = Lots)
    const ctx = canv.getContext("2d");
    
    // Ship Details
    const SHIP_SIZE = 30; // Height In Pixels
    const TURN_SPEED = 360; // Turn Speed in Degrees Per Second
    const SHIP_THRUST = 5; // Acceleration of Ship in Pixels Per Second
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

      const keyDown = (/** @type {KeyboardEvent} */ ev) => {
        switch(ev.keyCode){
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
 
    const keyUp = (/** @type {KeyboardEvent} */ ev) => {
        switch(ev.keyCode){
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
        if (SHIP.thrusting){
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
        }else{
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

        // Rotates Ship
        SHIP.a += SHIP.rot;

        // Moves Ship
        SHIP.x += SHIP.thrust.x;
        SHIP.y += SHIP.thrust.y;

        // Handle Screen Boundaries
        // X Coordinates
        if(SHIP.x < 0 - SHIP.r){
            SHIP.x = canv.width + SHIP.r;
        }else if (SHIP.x > canv.width + SHIP.r){
            SHIP.x = 0 - SHIP.r;
        }
        // Y Coordinates
        if(SHIP.y < 0 - SHIP.r){
            SHIP.y = canv.height + SHIP.r;
        }else if (SHIP.y > canv.height + SHIP.r){
            SHIP.y = 0 - SHIP.r;
        }
       
       // Center Dot Commented out For Now. Use for Debugging
       // ctx.fillStyle = "red";
       // ctx.fillRect(SHIP.x - 1,SHIP.y - 1, 2, 2);
    };

    // Game Loop
    setInterval(update,1000/FPS);