import {useGameStore} from "../store/gameStore.tsx";
import {BaseViewport} from "./BaseViewport.ts";

type RoadSegment = {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
};

type RoadArc = {
    type: 'arc';
    centerX: number;
    centerY: number;
    radius: number;
    startAngle: number;
    endAngle: number;
    width: number;
};

type AnyRoadShape = RoadSegment | RoadArc;

const roadShapes: AnyRoadShape[] = [
    {type: 'rect', x: -49, y: 349, width: 300, height: 610},
    {
        type: 'arc',
        centerX: 401,
        centerY: 350,
        radius: 300,
        startAngle: Math.PI,
        endAngle: Math.PI + Math.PI / 2,
        width: 300
    },
    {
        type: 'arc',
        centerX: 399,
        centerY: -250,
        radius: 300,
        startAngle: 0,
        endAngle: Math.PI / 2,
        width: 300
    },
    {type: 'rect', x: 549, y: -744, width: 300, height: 500},
    {
        type: 'arc',
        centerX: 399,
        centerY: -740,
        radius: 300,
        startAngle: Math.PI,
        endAngle: 0,
        width: 300
    },
    {
        type: 'arc',
        centerX: -201,
        centerY: -741,
        radius: 300,
        startAngle: 0,
        endAngle: Math.PI / 2,
        width: 300
    },
    {
        type: 'arc',
        centerX: -199,
        centerY: -141,
        radius: 300,
        startAngle: Math.PI,
        endAngle: Math.PI + Math.PI / 2,
        width: 300
    },
    {type: 'rect', x: -649, y: -142, width: 300, height: 1102},
    {
        type: 'arc',
        centerX: -199,
        centerY: 958,
        radius: 300,
        startAngle: 0,
        endAngle: Math.PI,
        width: 300
    }


]

class Car {
    private carX: number;
    private carY: number;
    private carAngle;
    private carSpeed = 0;
    private carWidth: number = 20;
    private carHeight: number = 40;
    private carAcceleration: number;
    private carBrakeForce: number;
    private carFriction: number;
    private carTurnSpeed: number;
    private maxSpeed: number;
    private maxReverseSpeed: number;

    constructor(carX: number, carY: number, carAngle: number, maxSpeed: number = 150, acceleration: number = 100, brakeForce: number = 400, friction: number = 70, turnSpeed: number = 1.1) {
        this.carX = carX;
        this.carY = carY;
        this.carAngle = carAngle;
        this.maxSpeed = maxSpeed;
        this.carAcceleration = acceleration;
        this.carBrakeForce = brakeForce;
        this.carFriction = friction;
        this.carTurnSpeed = turnSpeed;
        this.maxReverseSpeed = -maxSpeed;
        this.carSpeed = 0;
    }


    update(dt: number, actions: { forward: boolean, backward: boolean, left: boolean, right: boolean }) {
        const dtSec = dt / 1000;

        // Forward/backward acceleration
        if (actions.forward) {
            if (this.carSpeed < 0) {
                this.carSpeed += this.carBrakeForce * dtSec;
                if (this.carSpeed > 0) this.carSpeed = 0;
            } else {
                this.carSpeed += this.carAcceleration * dtSec;
            }
        } else if (actions.backward) {
            if (this.carSpeed > 0) {
                this.carSpeed -= this.carBrakeForce * dtSec;
                if (this.carSpeed < 0) this.carSpeed = 0;
            } else {
                this.carSpeed -= this.carAcceleration * dtSec;
            }
        } else {
            // Apply friction when no acceleration keys are pressed
            if (this.carSpeed > 0) {
                this.carSpeed -= this.carFriction * dtSec;
                if (this.carSpeed < 0) this.carSpeed = 0;
            } else if (this.carSpeed < 0) {
                this.carSpeed += this.carFriction * dtSec;
                if (this.carSpeed > 0) this.carSpeed = 0;
            }
        }

        // Clamp speed
        if (this.carSpeed > this.maxSpeed) this.carSpeed = this.maxSpeed;
        if (this.carSpeed < this.maxReverseSpeed) this.carSpeed = this.maxReverseSpeed;

        // Steering
        if (actions.left && this.carSpeed !== 0) {
            this.carAngle -= this.carTurnSpeed * dtSec * (this.carSpeed / 100);
        }
        if (actions.right && this.carSpeed !== 0) {
            this.carAngle += this.carTurnSpeed * dtSec * (this.carSpeed / 100);
        }

        // Update player position
        this.carX += Math.sin(this.carAngle) * this.carSpeed * dtSec;
        this.carY -= Math.cos(this.carAngle) * this.carSpeed * dtSec;
    }

    render(ctx: CanvasRenderingContext2D, carImage: HTMLImageElement) {
        ctx.save();
        ctx.translate(this.carX + this.carWidth / 2, this.carY + this.carHeight / 2);
        ctx.rotate(this.carAngle);
        ctx.drawImage(
            carImage,
            -this.carWidth / 2,
            -this.carHeight / 2,
            this.carWidth,
            this.carHeight
        );
        ctx.restore();
    }

    getCorners(): { x: number, y: number }[] {
        const centerX = this.carX + this.carWidth / 2;
        const centerY = this.carY + this.carHeight / 2;
        const halfWidth = this.carWidth / 2;
        const halfHeight = this.carHeight / 2;
        const cosAngle = Math.cos(this.carAngle);
        const sinAngle = Math.sin(this.carAngle);

        return [
            {
                x: centerX - cosAngle * halfWidth + sinAngle * halfHeight,
                y: centerY - sinAngle * halfWidth - cosAngle * halfHeight,
            },
            {
                x: centerX + cosAngle * halfWidth + sinAngle * halfHeight,
                y: centerY + sinAngle * halfWidth - cosAngle * halfHeight,
            },
            {
                x: centerX - cosAngle * halfWidth - sinAngle * halfHeight,
                y: centerY - sinAngle * halfWidth + cosAngle * halfHeight,
            },
            {
                x: centerX + cosAngle * halfWidth - sinAngle * halfHeight,
                y: centerY + sinAngle * halfWidth + cosAngle * halfHeight,
            }
        ];
    }

    setX(x: number) {
        this.carX = x;
    }

    setY(y: number) {
        this.carY = y;
    }

    setAngle(angle: number) {
        this.carAngle = angle;
    }

    setSpeed(speed: number) {
        this.carSpeed = speed;
    }

    getX() {
        return this.carX;
    }

    getY() {
        return this.carY;
    }

    getAngle() {
        return this.carAngle;
    }

    getWith() {
        return this.carWidth;
    }

    getHeight() {
        return this.carHeight;
    }
}

export class SceneViewport extends BaseViewport {
    initialCarX: number = 180;
    initialCarY: number = 850;
    forwardRayDistance: number = 300;
    sideRayDistance: number = 250;

    private playerCar: Car = new Car(this.initialCarX, this.initialCarY, 0, 200, 200);

    // Resources
    private carImage: HTMLImageElement;
    private resourcesLoaded: boolean = false;

    // Camera properties
    private camera = {
        x: this.initialCarX,
        y: this.initialCarY,
    };
    private cameraLerpFactor = 0.1;

    constructor(canvas: HTMLCanvasElement) {
        super(canvas);

        // Preload the car image
        this.carImage = new Image();
        this.carImage.src = './car.png';
        this.carImage.onload = () => {
            this.resourcesLoaded = true;
        };
    }

    public update(dt: number): void {
        if (!this.resourcesLoaded) return;

        const gameState = useGameStore.getState().gameState;

        if (gameState.isOver) {
            this.playerCar.setX(this.initialCarX);
            this.playerCar.setY(this.initialCarY);
            this.playerCar.setAngle(0);
            this.playerCar.setSpeed(0);
            gameState.isOver = false;
        }

        const actions = gameState.playerActions;

        this.playerCar.update(dt, actions);

        gameState.isOver = this.checkCollision();

        useGameStore.getState().updateObservation({
            "ForwardHit": 1 - this.getSensorsData().forwardHit.distance / this.forwardRayDistance,
            "RightHit": 1 - this.getSensorsData().rightHit.distance / this.sideRayDistance,
            "LeftHit": 1 - this.getSensorsData().leftHit.distance / this.sideRayDistance
        });


        // Update camera position
        this.updateCamera();
    }

    public render(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();

        const offsetX = this.canvas.width / 2 - this.camera.x;
        const offsetY = this.canvas.height / 2 - this.camera.y;

        this.ctx.translate(offsetX, offsetY);

        this.renderEnvironment();
        this.drawCarCorners()
        if (this.resourcesLoaded) {
            this.playerCar.render(this.ctx, this.carImage);
            this.renderSensors();
        }

        this.ctx.restore();

        this.renderToggleButton();
    }

    private renderToggleButton() {
        const padding = 20;
        const buttonWidth = 150;
        const buttonHeight = 50;

        const x = this.canvas.width - buttonWidth - padding;
        const y = padding;

        const controlMode = useGameStore.getState().gameState.controlMode;

        // Draw button background
        this.ctx.fillStyle = controlMode == "neural-network" ? "#4CAF50" : "#f44336";
        this.ctx.fillRect(x, y, buttonWidth, buttonHeight);

        // Draw button border
        this.ctx.strokeStyle = "#000000";
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, buttonWidth, buttonHeight);

        // Add button text
        this.ctx.fillStyle = "#FFFFFF";
        this.ctx.font = "16px Arial";
        const modeText = controlMode == "neural-network" ? "Neural Network" : "Keyboard";
        const textWidth = this.ctx.measureText(modeText).width;
        this.ctx.fillText(modeText, x + (buttonWidth - textWidth) / 2, y + buttonHeight / 2 + 5);

        // Instructions
        this.ctx.font = "12px Arial";
        const hint = "Click to toggle";
        const hintWidth = this.ctx.measureText(hint).width;
        this.ctx.fillText(hint, x + (buttonWidth - hintWidth) / 2, y + buttonHeight + 15);
    }

    public handleClick(event: MouseEvent) {
        const padding = 20;
        const buttonWidth = 150;
        const buttonHeight = 50;
        const x = this.canvas.width - buttonWidth - padding;
        const y = padding;

        // Check if click is within button bounds
        const mouseX = event.clientX;
        const mouseY = event.clientY;

        if (mouseX >= x && mouseX <= x + buttonWidth && mouseY >= y && mouseY <= y + buttonHeight) {
            const controlMode = useGameStore.getState().gameState.controlMode;
            useGameStore.setState((state) => ({
                ...state,
                gameState: {
                    ...state.gameState,
                    playerActions: {forward: false, backward: false, left: false, right: false},
                    controlMode: controlMode == "neural-network" ? "keyboard" : "neural-network"
                },
            }));
        }
    }

    private updateCamera() {
        const targetX = this.playerCar.getX();
        const targetY = this.playerCar.getY();

        this.camera.x += (targetX - this.camera.x) * this.cameraLerpFactor;
        this.camera.y += (targetY - this.camera.y) * this.cameraLerpFactor;
    }

    private renderEnvironment(): void {
        // Fill the background
        this.ctx.fillStyle = "#739f5b";
        this.ctx.fillRect(-10000, -10000, 20000, 20000);

        // Fill the road surfaces
        this.ctx.fillStyle = '#3c3636';
        roadShapes.forEach((shape) => {
            if (shape.type === 'rect') {
                // Draw the road rectangle
                this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);

                // Now draw the stripe
                this.drawRectStripes(shape);
            } else if (shape.type === 'arc') {
                // Draw the road arc
                this.drawArcRoad(shape);

                // Draw the stripe arc
                this.drawArcStripes(shape);
            }
        });
    }

    private drawArcRoad(arcDef: RoadArc) {
        const {centerX, centerY, radius, startAngle, endAngle, width} = arcDef;

        const outerRadius = radius + width / 2;
        const innerRadius = radius - width / 2;

        this.ctx.beginPath();

        this.ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle, false);
        this.ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);

        this.ctx.closePath();
        this.ctx.fill();
    }

    private renderSensors() {
        const {forwardHit, rightHit, leftHit, noseX, noseY, forwardAngle, rightAngle} = this.getSensorsData();

        // Draw forward sensor
        if (forwardHit.hit) {
            this.ctx.beginPath();
            this.ctx.moveTo(noseX, noseY);
            this.ctx.lineTo(
                noseX + Math.sin(forwardAngle) * forwardHit.distance,
                noseY - Math.cos(forwardAngle) * forwardHit.distance
            );
            this.ctx.strokeStyle = '#da7d30';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw right sensor
        if (rightHit.hit) {
            this.ctx.beginPath();
            this.ctx.moveTo(noseX, noseY);
            this.ctx.lineTo(
                noseX + Math.sin(rightAngle) * rightHit.distance,
                noseY - Math.cos(rightAngle) * rightHit.distance
            );
            this.ctx.strokeStyle = '#da7d30';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }

        // Draw left sensor
        if (leftHit.hit) {
            this.ctx.beginPath();
            this.ctx.moveTo(noseX, noseY);
            this.ctx.lineTo(
                noseX + Math.sin(rightAngle - Math.PI / 3) * leftHit.distance,
                noseY - Math.cos(rightAngle - Math.PI / 3) * leftHit.distance
            );
            this.ctx.strokeStyle = '#da7d30';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    private getSensorsData() {
        const centerX = this.playerCar.getX() + this.playerCar.getWith() / 2;
        const centerY = this.playerCar.getY() + this.playerCar.getHeight() / 2;
        const halfHeight = this.playerCar.getHeight() / 2;
        const cosA = Math.cos(this.playerCar.getAngle());
        const sinA = Math.sin(this.playerCar.getAngle());

        // Front of the car
        const noseX = centerX + sinA * halfHeight;
        const noseY = centerY - cosA * halfHeight;

        const forwardAngle = this.playerCar.getAngle();
        const rightAngle = this.playerCar.getAngle() + Math.PI / 6;

        const forwardHit = this.castSensorRay(noseX, noseY, forwardAngle, this.forwardRayDistance);
        const rightHit = this.castSensorRay(noseX, noseY, rightAngle, this.sideRayDistance);
        const leftHit = this.castSensorRay(noseX, noseY, rightAngle - Math.PI / 3, this.sideRayDistance);

        return {forwardHit, rightHit, leftHit, noseX, noseY, forwardAngle, rightAngle};
    }

    private castSensorRay(
        startX: number,
        startY: number,
        angle: number,
        maxDist: number
    ): { hit: boolean; distance: number } {
        const step = 5;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);

        for (let dist = 0; dist <= maxDist; dist += step) {
            const x = startX + sinA * dist;
            const y = startY - cosA * dist;

            if (!this.isPointOnRoad(x, y) || this.isPointOnDivider(x, y)
            ) {
                return {hit: true, distance: dist};
            }
        }

        return {hit: false, distance: maxDist};
    }

    private isPointOnRoad(x: number, y: number): boolean {
        for (const shape of roadShapes) {
            if (shape.type === 'rect') {
                if (
                    x >= shape.x &&
                    x <= shape.x + shape.width &&
                    y >= shape.y &&
                    y <= shape.y + shape.height
                ) {
                    return true;
                }
            } else if (shape.type === 'arc') {
                if (this.isPointOnArc(x, y, shape)) {
                    return true;
                }
            }
        }
        return false;
    }

    private isPointOnArc(px: number, py: number, arc: RoadArc): boolean {
        const {centerX, centerY, radius, width, startAngle, endAngle} = arc;

        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const minRadius = radius - width / 2;
        const maxRadius = radius + width / 2;

        if (dist < minRadius || dist > maxRadius) {
            return false;
        }

        let angle = Math.atan2(dy, dx);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        if (startAngle < endAngle) {
            return angle >= startAngle && angle <= endAngle;
        } else {
            return angle >= startAngle || angle <= endAngle;
        }
    }

    private isPointOnDivider(x: number, y: number): boolean {
        const THRESHOLD = 2;

        for (const shape of roadShapes) {
            if (shape.type === 'rect') {
                if (this.isPointOnRectDivider(x, y, shape, THRESHOLD)) {
                    return true;
                }
            } else if (shape.type === 'arc') {
                if (this.isPointOnArcDivider(x, y, shape, THRESHOLD)) {
                    return true;
                }
            }
        }

        return false;
    }

    private isPointOnRectDivider(
        px: number,
        py: number,
        rectDef: RoadSegment,
        threshold: number
    ): boolean {
        const centerY = rectDef.y + rectDef.height / 2;
        const centerX = rectDef.x + rectDef.width / 2;

        const isHorizontal = rectDef.width > rectDef.height;
        if (isHorizontal) {
            if (px >= rectDef.x && px <= rectDef.x + rectDef.width) {
                if (Math.abs(py - centerY) <= threshold) {
                    return true;
                }
            }
        } else {
            if (py >= rectDef.y && py <= rectDef.y + rectDef.height) {
                if (Math.abs(px - centerX) <= threshold) {
                    return true;
                }
            }
        }

        return false;
    }


    private isPointOnArcDivider(
        px: number,
        py: number,
        arcDef: RoadArc,
        threshold: number
    ): boolean {
        const {centerX, centerY, radius, startAngle, endAngle} = arcDef;
        const dx = px - centerX;
        const dy = py - centerY;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius - threshold || dist > radius + threshold) {
            return false;
        }

        if (startAngle < endAngle) {
            return angle >= startAngle && angle <= endAngle;
        } else {
            return angle >= startAngle || angle <= endAngle;
        }
    }

    private checkCollision(): boolean {
        const carCorners = this.playerCar.getCorners();

        for (const corner of carCorners) {
            let insideAnyRoad = false;

            for (const shape of roadShapes) {
                if (shape.type == 'rect') {
                    if (
                        corner.x >= shape.x &&
                        corner.x <= shape.x + shape.width &&
                        corner.y >= shape.y &&
                        corner.y <= shape.y + shape.height
                    ) {
                        insideAnyRoad = true;
                        break;
                    }
                } else {
                    if (this.isPointOnArc(corner.x, corner.y, shape)) {
                        insideAnyRoad = true;
                        break;
                    }
                }

            }

            if (!insideAnyRoad) {
                return true;
            }
        }

        return false;
    }

    private drawCarCorners() {
        const carCorners = this.playerCar.getCorners();
        this.ctx.fillStyle = '#ff0000';
        carCorners.forEach((corner) => {
            this.ctx.fillRect(corner.x - 2, corner.y - 2, 4, 4);
        });
    }

    private drawRectStripes(rectDef: RoadSegment) {
        const isHorizontal = rectDef.width > rectDef.height;

        this.ctx.save();
        this.ctx.strokeStyle = '#cfcfcf';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([20, 10]);

        this.ctx.beginPath();

        if (isHorizontal) {
            const centerY = rectDef.y + rectDef.height / 2;
            this.ctx.moveTo(rectDef.x, centerY);
            this.ctx.lineTo(rectDef.x + rectDef.width, centerY);
        } else {
            const centerX = rectDef.x + rectDef.width / 2;
            this.ctx.moveTo(centerX, rectDef.y);
            this.ctx.lineTo(centerX, rectDef.y + rectDef.height);
        }

        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }

    private drawArcStripes(arcDef: RoadArc) {
        const {centerX, centerY, radius, startAngle, endAngle} = arcDef;

        const centerRadius = radius

        this.ctx.save();
        this.ctx.strokeStyle = '#cfcfcf';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([20, 10]);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, centerRadius, startAngle, endAngle, false);
        this.ctx.stroke();

        // Clean up
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }
}
