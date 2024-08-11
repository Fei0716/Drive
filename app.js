document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const bgTrack = new Audio('./assets/sounds/nightcall.mp3');

    // Constants for FPS and timing
    const fps = 60;
    const frameInterval = 1000 / fps;

    // Car Class
    class Car {
        constructor() {
            this.src = "./assets/images/car1.png";
            this.img = new Image();
            this.img.src = this.src;
            this.width = 125;
            this.height = 75; // Updated to match the image height
            this.x = (canvas.width / 2) - (this.width / 2);
            this.y = canvas.height - this.height;
            this.speed = 0; // Start with 0 speed
            this.maxSpeed = 15; // Max speed to ensure smooth control
            this.acceleration = 15; // Acceleration rate for smooth speed change
        }

        draw() {
            if (this.img.complete) {
                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            }
        }

        update(dt) {
            // Control smooth acceleration
            if (this.speed > 0) {
                this.speed -= 0.1; // Gradually reduce speed to make it smooth
            } else {
                this.speed = 0;
            }

            if (this.direction === 'left' && this.x - 20 > 0 ) {
                this.x -= this.speed;
            }
            if (this.direction === 'right' && this.x < canvas.width - this.width - 20) {
                this.x += this.speed;
            }
        }

        accelerate(direction) {
            this.direction = direction;
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        }

        checkPointCollision(){
            let collidedPoints = points.filter((p) => p.x >= this.x && p.x <= this.x +  this.width && p.y >= this.y && p.y <= this.y +  this.height );
            collectedPoint += collidedPoints.length;
            //remove the points
            for(let p of collidedPoints){
                points.splice( points.findIndex(x => x.id === p.id) , 1);
            }
        }

        checkObstacleCollision(){
            let collidedObstacles = obstacles.filter((p) => ((p.x >= this.x && p.x <= this.x +  this.width )|| (p.x + p.width  >= this.x && p.x + p.width <= this.x + this.width ))&& (p.y >= this.y && p.y <= this.y +  this.height) );
            collectedPoint += collidedObstacles.length;

            if(collidedObstacles.length > 0 ){
                alert("Accident!");
            }
        }
    }

    // Road Class
    class Road {
        constructor() {
            this.x1 = 0;
            this.y1 = canvas.height;
            this.x2 = canvas.width;
            this.y2 = canvas.height;
            this.x3 = canvas.width - 450;
            this.y3 = 0;
            this.x4 = 450;
            this.y4 = 0;
            this.color = '#272727';


        }

        draw() {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.lineTo(this.x3, this.y3);
            ctx.lineTo(this.x4, this.y4);
            ctx.fill();
            ctx.closePath();
        }

    }

    //class Point
    class Point{
        constructor(x = 0 ,y = 0){
            this.id = ++latestPointId;
            this.img = document.createElement('img');
            this.img.src = "./assets/images/scorpion.png";

            //random generate the x
            this.x = x;
            this.dx = 2;
            this.maxX = x > canvas.width / 2 ?  canvas.width: 0;
            this.y = y;//start from the top of the canvas
            this.width = 10;//initial width
            this.maxWidth = 50;
            this.height = 5;
            this.maxHeight = 40;
            this.speed = 2;
        }
        draw(){
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
        update(){
            //update size
            if(this.width < this.maxWidth){
                this.width = Math.min(this.width + 0.25, this.maxWidth);
            }
            if(this.height < this.maxHeight){
                this.height = Math.min(this.height + 0.25, this.maxHeight);
            }
            //update position
            if(this.x < this.maxX){
                //move towards right edge
                this.x = Math.min(this.x + this.dx, this.maxX);
            }else{
                //move towards left edge
                this.x = Math.max(this.x - this.dx, this.maxX);
            }
            if(this.y < canvas.height){
                this.y += this.speed;
                return;
            }
            //remove the point from points array
            points.splice(points.findIndex(p => p.id === this.id) , 1);
        }
        static drawCollectedPoint(){
            ctx.beginPath();
            ctx.font = '40px Arial'
            ctx.fillStyle = '#e238ff';
            ctx.fillText(collectedPoint.toString() , canvas.width - 60 ,  60 );
        }
        static generatePoints(){
            if(points.length <= 0){
                //randomly generate points
                let pointCount = getRandomNumber(1,3);//randomly generate 1 - 3 points
                let defaultStartY = [];
                let y = null;
                let x = null;
                for(let i = 0 ; i  < pointCount; i++){
                    y = getRandomNumber(-30 , -10);
                    //check whether there are point start at the same y position
                    while(points.some( p => p.y === y)){
                        y = getRandomNumber(-30 , -10);
                    }

                    x = getRandomNumber(450, canvas.width  - 450);
                    //check whether there are point start at the same y position
                    while(points.some( p => p.x === x)){
                        x = getRandomNumber(450, canvas.width  - 450);
                    }

                    points.push(new Point(x,y));
                }
            }

        }
    }

    //class Tree
    class Tree{
        constructor(side) {
            this.id = ++latestTreeId;
            this.side = side
            this.img = document.createElement('img');
            this.img.src = `./assets/images/t${getRandomNumber(1, 5)}.png`;

            this.width = 5;// initial width
            this.height = 10; //initial height

            this.maxWidth = 70;
            this.maxHeight = 100;
            this.speed = 2;
            this.x = side === 'left' ? road.x4 : road.x3 ;
            this.dx = 3.5;
            this.maxX = side === 'left' ? road.x1 - this.maxWidth  : road.x2  ;
            this.y = -this.height;
        }
        draw(){
            ctx.drawImage(this.img , this.side === "left" ?  this.x - this.width : this.x , this.y , this.width , this.height);
        }
        update(){
            //update size
            if(this.width < this.maxWidth){
                this.width = Math.min(this.width + 1, this.maxWidth);
            }
            if(this.height < this.maxHeight){
                this.height = Math.min(this.height + 1, this.maxHeight);
            }
            //update position
            if(this.x < this.maxX){
                //move towards right edge
                this.x = Math.min(this.x + this.dx, this.maxX);

            }else{
                //move towards left edge
                this.x = Math.max(this.x - this.dx, this.maxX);
            }

            if(this.y < canvas.height){
                this.y += this.speed;
                return;
            }

            //remove the point from points array
            trees.splice(trees.findIndex(t => t.id === this.id) , 1);
        }

    }

    class CarObstacle{
        constructor(x = 0 , y = 0) {
            this.id = ++latestObstacleId;
            this.src = `./assets/images/car${getRandomNumber(2,3)}.png`;
            this.img = new Image();
            this.img.src = this.src;
            //initialHeight and width
            this.width = 20;
            this.height = 10;
            this.maxWidth = 125;
            this.maxHeight = 75; // Updated to match the image height
            this.x = x;
            this.dx = 2;
            this.maxX = x > canvas.width / 2 ?  canvas.width: 0;
            this.y = y ;
            this.speed = 2; // Start with 0 speed

        }

        draw() {
            if (this.img.complete) {
                ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
            }
        }
        update(dt) {
            //update size
            if(this.width < this.maxWidth){
                this.width = Math.min(this.width + 1, this.maxWidth);
            }
            if(this.height < this.maxHeight){
                this.height = Math.min(this.height + 1, this.maxHeight);
            }
            //update position
            if(this.x < this.maxX){
                //move towards right edge
                this.x = Math.min(this.x + this.dx, this.maxX);
            }else{
                //move towards left edge
                this.x = Math.max(this.x - this.dx, this.maxX);
            }
            if(this.y < canvas.height){
                this.y += this.speed;
                return;
            }
            //remove the point from points array
            obstacles.splice(obstacles.findIndex(o => o.id === this.id) , 1);
        }

        static generateObstacles(){
            if(obstacles.length <= 0){
                let obstacleCount = getRandomNumber(1,3);//randomly generate 1 - 3 obstacles
                let y = null;
                let x = null;
                for(let i = 0 ; i  < obstacleCount; i++){
                    y = getRandomNumber(-40 , 0);
                    x = getRandomNumber(450, canvas.width  - 450);
                    //check whether there are obstacle start at the same y position
                    while(obstacles.some( o => Math.abs(o.y - y) < 10)){
                        y = getRandomNumber(-40 , 0);

                    }
                    while(obstacles.some( o => Math.abs(o.x - x) < 10)){
                        x = getRandomNumber(450, canvas.width  - 450);
                    }
                    obstacles.push(new CarObstacle(x,y));
                }
            }

        }
    }
    let lastTimestamp = 0;
    let lastUpdateTreeTimestamp = 0;
    //latest id for points
    let latestPointId = 0;
    let latestTreeId = 0;
    let latestObstacleId = 0;
    let car = new Car();
    let road = new Road();
    let points = [];
    let collectedPoint = 0;
    let trees = [];
    let obstacles=  [];
    trees.push(new Tree('left') , new Tree('right'));
    requestAnimationFrame(gameLoop);

    function gameLoop(t) {
        // Calculate delta time
        let dt = t - lastTimestamp;
        let dTree = t - lastUpdateTreeTimestamp;
        if (dt >= frameInterval) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            road.draw();
            //draw new tree every 750 ms
            if(dTree >= 750){
                trees.push(new Tree('left') , new Tree('right'));
                lastUpdateTreeTimestamp = t;
            }
            for(let t of trees){
                t.draw();
                t.update();
            }
            //draw car obstacle
            CarObstacle.generateObstacles();
            for(let o of  obstacles){
                o.draw();
                o.update();
            }
            //draw each of the point
            Point.generatePoints();
            for(let p of points){
                p.draw();
                p.update();
            }
            car.update(dt);
            car.draw();
            car.checkPointCollision();
            car.checkObstacleCollision()
            Point.drawCollectedPoint();
            lastTimestamp = t ; // Maintain consistent timing
        }
        requestAnimationFrame(gameLoop);
    }
    function globalAddEventListener(selector, type, callback, scope = document) {
        scope.querySelector(selector).addEventListener(type, callback);
    }

    function handleKeydownEvent(e) {
        bgTrack.play();
        bgTrack.loop = true;
        if (e.key === 'ArrowLeft') {
            car.accelerate('left');
        } else if (e.key === 'ArrowRight') {
            car.accelerate('right');
        }
    }
    function handleKeyupEvent(e) {
        while(car.speed > 0){
            car.speed -= 2;
        }
        car.speed = 0;
    }

    function getRandomNumber(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    }


    //add event listeners
    globalAddEventListener('body', 'keydown', handleKeydownEvent);
    globalAddEventListener('body', 'keyup', handleKeyupEvent);
});
