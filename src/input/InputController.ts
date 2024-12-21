import {useGameStore} from "../store/gameStore";

export class InputController {
    private currentActions = {forward: false, backward: false, left: false, right: false};

    constructor() {
        this.currentActions = {forward: false, backward: false, left: false, right: false};
        this.attachKeyboardListeners();
    }

    private attachKeyboardListeners(): void {
        document.addEventListener("keydown", (e) => this.handleKeyChange(e, true));
        document.addEventListener("keyup", (e) => this.handleKeyChange(e, false));
    }

    private handleKeyChange(event: KeyboardEvent, isPressed: boolean): void {
        const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"];

        if (arrowKeys.includes(event.key)) {
            event.preventDefault();
        }

        const {controlMode} = useGameStore.getState().gameState;

        if (controlMode === "keyboard") {
            switch (event.key) {
                case "ArrowUp":
                case "w":
                    this.currentActions.forward = isPressed;
                    break;
                case "ArrowDown":
                case "s":
                    this.currentActions.backward = isPressed;
                    break;
                case "ArrowLeft":
                case "a":
                    this.currentActions.left = isPressed;
                    break;
                case "ArrowRight":
                case "d":
                    this.currentActions.right = isPressed;
                    break;
            }

            useGameStore.setState((state) => ({
                gameState: {...state.gameState, playerActions: {...this.currentActions}},
            }));
        }
    }

    update(): void {
        const {controlMode} = useGameStore.getState().gameState;
        if (controlMode === "neural-network") {
            const nodeOutputs = useGameStore.getState().nodeStates;

            this.currentActions.forward = true;
            this.currentActions.backward = false;
            this.currentActions.left = nodeOutputs["Left"]?.outputValue > 0.5;
            this.currentActions.right = nodeOutputs["Right"]?.outputValue > 0.5;

            useGameStore.setState((state) => ({
                gameState: {...state.gameState, playerActions: this.currentActions},
            }));
        }
    }
}
