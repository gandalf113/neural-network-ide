# Neural Network Configurer for a Car Game

## Overview
This repository provides a simple neural network editor and visualizer for configuring an agent’s behavior in a car simulation environment. You can manually adjust network weights and biases, and instantly see how these changes affect the car’s actions on the road.

The initial network configuration was trained via imitation learning: the agent’s observations (forward, right, and left rays) along with recorded actions (turn left, turn right) were collected and used to train a PyTorch model. This project allows you to load that trained network—or any other network of your choosing—and experiment with its parameters interactively.

![2025-01-01 14-55-39](https://github.com/user-attachments/assets/76f8aae1-671e-4ad5-9fd0-b79a7d625642)

## Motivation
The main goal is to help developers and researchers build an intuitive understanding of how neural networks make predictions. While demonstrated here with a car simulation, the underlying framework is flexible and can be adapted to various other scenarios where real-time interaction with a neural network is desired.

## Design Components

![image](https://github.com/user-attachments/assets/8b311d11-9a02-403d-a80c-f3d56fed4331)

### 1. SceneViewport
**Responsibilities**:
- Rendering the car environment
- Simulating physics
- Detecting collisions
- Casting rays for state observation

**Notes**:
- Exports sensor data (rays, collision states, etc.) as inputs to the neural network.
- Acts as the main “game loop,” continuously updating the environment and retrieving outputs from the network (or keyboard) to steer the car.

### 2. NeuralNetworkConfigurer
**Responsibilities**:
- Presents an interactive, node-based view of the neural network.
- Displays the forward pass in real time (showing node activations).
- Lets you manually edit weights and biases to see how changes in the network’s parameters affect the car’s behavior.

### 3. InputController
**Responsibilities**:
- Determines which player actions (forward, backward, left, right) are active at any given time.
- Operates in two modes:
  1. **Keyboard**: Actions depend on which keys are pressed.
  2. **Neural Network**: Actions are predicted by the neural network based on sensor data.  
     *(Note: In this car simulation, “forward” is always active, and “backward” is never active. The network only determines left/right turning.)*

# License
This project is licensed under the MIT License.

# Acknowledgments
- PyTorch for the training framework.
- React Flow for the interactive nodes in neural network configurer.
