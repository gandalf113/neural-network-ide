import React, {useEffect, useRef} from "react";
import {SceneViewport} from "./viewports/SceneViewport";
import NeuralNetworkConfigurer from "./components/NeuralNetworkConfigurer";
import {InputController} from "./input/InputController";

const App: React.FC = () => {
    const sceneCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const inputController = useRef<InputController | null>(null);

    useEffect(() => {
        const canvas = sceneCanvasRef.current;

        if (canvas && !inputController.current) {
            const sceneViewport = new SceneViewport(canvas);
            inputController.current = new InputController();
            canvas.addEventListener('click', (event) => sceneViewport.handleClick(event));

            let lastTime = performance.now();

            const gameLoop = (time: number) => {
                const dt = time - lastTime;
                lastTime = time;

                inputController.current?.update();
                sceneViewport.update(dt);
                sceneViewport.render();

                requestAnimationFrame(gameLoop);
            };

            requestAnimationFrame(gameLoop);
        }
    }, []);

    return (
        <div style={{display: "flex"}}>
            {/* Scene Viewport Canvas */}
            <canvas ref={sceneCanvasRef} width={window.innerWidth / 2} height={window.innerHeight}/>

            {/* Neural Network Configurer */}
            <div style={{width: "50vw", height: "100vh"}}>
                <NeuralNetworkConfigurer />
            </div>
        </div>
    );
};

export default App;