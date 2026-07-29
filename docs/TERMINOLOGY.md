# Truss Terminology Reference

This document defines key concepts and terminology used in the Truss project to ensure consistent communication and mutual understanding.

---

## Core Concepts

### Universe
The top-level orchestrator and container for the entire simulation runtime. The `Universe` class manages:
- The world stack (navigation/history across different views)
- Current active world/view selection
- UI layer switching and composition
- Animation frame loop coordination via `tick()`

**Location:** `Javascript/Universe.js`

**Related:** See [World](#world), [World Stack](#world-stack)

---

### World
A complete, self-contained simulation environment containing:
- One primary **truss node** (the main interactive truss structure)
- Zero or more **governor truss nodes** (secondary trusses that influence the primary)
- A collection of **labels** defining properties and behaviors
- All associated **nodes** and **tensors** within that environment

Think of a World as a "scene" or "level" in the simulation. Multiple worlds can exist simultaneously (in the world stack), but only one is active at a time.

**Location:** `Javascript/Universe.js` (World class)

**Related:** See [Truss Node](#truss-node), [Node](#node), [Tensor](#tensor), [Governor](#governor)

---

### World Stack
A LIFO (Last-In-First-Out) data structure that maintains a history of worlds. It allows navigation between different worlds/views while preserving state.

**Operations:**
- **Push:** Add a new world to the stack
- **Pop:** Remove and return the top world
- **Peek:** View the top world without removing it

**Use Case:** Enables drill-down navigation (e.g., clicking into a sub-truss opens a new world on top of the stack).

**Location:** `Javascript/Universe.js` (Stack class)

**Related:** See [World](#world), [Universe](#universe)

---

### Truss (or Truss Structure)
The physical simulation model: a network of **nodes** (mass points) connected by **tensors** (spring-like or force-based connectors). The truss can be displayed, edited, and simulated in real-time.

A Truss is visualized as an interactive 2D node-and-connector diagram in the browser canvas.

**Related:** See [Node](#node), [Tensor](#tensor), [Truss Node](#truss-node)

---

### Truss Node
A specialized **node** that hosts an entire **Truss** (and its **World**) as a drawable object within a parent world. This enables hierarchical composition: a truss can contain another truss as a sub-component.

**Key Properties:**
- Inherits from `Node` (has position, velocity, mass, etc.)
- Contains a child world with its own truss structure
- Can be dragged, scaled, rotated, and modified like any node
- Supports drill-down editing (click to open its child world)

**Location:** `Javascript/Nodes/TrussNode.js`

**Related:** See [Node](#node), [World](#world)

---

## Physics & Simulation

### Node
A point mass in the simulation with:
- **Position:** `localPosition` (relative to parent)
- **Velocity:** speed and direction of movement
- **Mass/Inertia:** affects how forces are applied
- **Labels:** a set of named properties controlling behavior, rendering, and interactions
- **Connected Tensors:** list of connectors linked to this node

Nodes can represent physical masses, structural joints, control points, or any interactive element in a truss.

**Location:** `Javascript/Nodes/Node.js`

**Related:** See [Tensor](#tensor), [Label](#label)

---

### Tensor
A connector or relationship between two **nodes**. Tensors can exhibit different behaviors based on their **labels**:

**Common Tensor Types (by label-driven behavior):**
- **Spring:** Resists compression/extension; applies restoring force
- **Pull:** Applies attractive force between nodes
- **Push:** Applies repulsive force between nodes
- **Field:** Long-range force behavior (e.g., gravity)
- **Absorber:** Damping connector; dissipates energy

Tensors are visualized as lines or curves connecting two nodes and can be edited (resized, deleted, recolored).

**Location:** `Javascript/Tensors.js`

**Related:** See [Node](#node), [Label](#label), [Spring](#spring), [Force](#force)

---

### Governor
A secondary **truss node** or influence that constrains or modifies the behavior of the primary truss in a **world**. Governors may:
- Control external parameters (e.g., gravity, damping)
- Provide waypoint guidance
- Enforce symmetry or structural constraints

Governors are updated during the `tick()` but are not the primary interactive focus.

**Location:** `Javascript/Universe.js` (World constructor)

**Related:** See [World](#world), [Truss Node](#truss-node)

---

## Physics Properties

### Spring
A **tensor** labeled with spring behavior. Springs:
- Have a **rest length** (natural/relaxed state)
- Resist stretching or compression
- Apply a **restoring force** proportional to displacement
- Behave like ideal springs in classical mechanics

Springs are central to realistic structural simulation.

**Related:** See [Tensor](#tensor), [Force](#force)

---

### Force
A vector quantity (magnitude + direction) representing:
- Acceleration applied to a **node**
- The effect of **tensors** (springs, pulls, pushes, fields)
- Gravity, user input, or simulation effects

Forces accumulate during the `tick()` and update node velocities/positions.

**Location:** `Javascript/Primitives.js`

**Related:** See [Node](#node), [Tensor](#tensor), [Vector](#vector)

---

### Vector
A mathematical abstraction representing direction and magnitude. Vectors are used for:
- **Position:** coordinates in 2D space
- **Velocity:** direction and speed of motion
- **Force:** direction and magnitude of applied acceleration
- **Angular calculations:** angles and rotations

**Location:** `Javascript/Primitives.js`

**Related:** See [Position](#position), [Velocity](#velocity), [Force](#force)

---

### Position
A **vector** representing a location in 2D space. Nodes store:
- **localPosition:** position relative to parent/truss
- Absolute position is computed from hierarchy

**Location:** `Javascript/Primitives.js`

**Related:** See [Vector](#vector), [Velocity](#velocity)

---

### Velocity
A **vector** representing speed and direction of motion. Updated during simulation by accumulated **forces**.

**Location:** `Javascript/Primitives.js`

**Related:** See [Vector](#vector), [Force](#force), [Position](#position)

---

## Data & Properties

### Label
A named property definition that controls:
- How **nodes** and **tensors** behave (spring constant, damping, etc.)
- How they are rendered (color, size, visibility)
- How they interact with user input and events
- Enforced or default values via label rules

Labels form a key-value system where each label has:
- **Name:** identifier (e.g., `"springConstant"`)
- **Default value:** fallback if not explicitly set
- **Dependencies:** other labels it may depend on
- **Behaviors:** scripted or computed transformations

Think of labels as a flexible property system enabling complex behavior without hardcoding.

**Location:** `Javascript/Label.js`

**Related:** See [StoreableObject](#storeableobject)

---

### StoreableObject
Base class for objects that can be persisted and restored from save data. Provides:
- Dynamic property management via **labels**
- Serialization/deserialization support
- Integration with the label-based property system

**Subclasses:** `Node`, `Tensor`, any custom object with label-driven properties.

**Location:** `Javascript/StoreableObject.js`

**Related:** See [Label](#label), [Node](#node), [Tensor](#tensor)

---

## Rendering & Interaction

### View (or Truss View)
A canvas-based visualization and interaction layer for a **world**. The view:
- Renders nodes as circles/shapes and tensors as lines
- Handles mouse/touch input (pan, zoom, selection, editing)
- Manages rendering state (scale, pan offset, layer ordering)
- Coordinates with the parameter editor UI

**Location:** `Javascript/View/` (multiple files, including `TrussView.js`)

**Related:** See [World](#world), [Pan/Zoom Handler](#panzoom-handler)

---

### Pan/Zoom Handler
The interaction controller managing:
- **Pan:** moving the view around the canvas
- **Zoom:** scaling in/out
- Pointer event mapping (converting screen coordinates to canvas coordinates)

**Location:** `Javascript/View/PanZoomHandler.js`

**Known Issue:** Zoom operations can corrupt pan offsets (see [CODEBASE-STATUS.md](CODEBASE-STATUS.md))

**Related:** See [View](#view)

---

### Parameter Editor
A tabbed UI component for editing **labels** and properties of selected **nodes** or **tensors**. The editor:
- Dynamically generates input fields based on label definitions
- Updates the simulation in real-time as values change
- Provides visibility into object state and behavior

**Location:** `Javascript/ParameterEditor/` (multiple files)

**Related:** See [Label](#label), [StoreableObject](#storeableobject)

---

## File Organization

### Frontend
- **`Truss.html`:** Entry point and DOM structure
- **`Javascript/`:** Core runtime and simulation logic
  - **`Universe.js`:** World orchestration
  - **`Nodes/`:** Node implementations (Node, TrussNode, specialized nodes)
  - **`Tensors.js`:** Tensor/connector logic
  - **`Primitives.js`:** Math utilities (Vector, Position, Force, etc.)
  - **`Label.js`:** Label system
  - **`StoreableObject.js`:** Base class for persistent objects
  - **`Behaviours/`:** Physics, collision, sensor logic
  - **`View/`:** Canvas rendering and interaction
  - **`ParameterEditor/`:** Property editing UI

### Backend
- **`Node.js/app.js`:** Express server for save/load and file serving
  - REST API for persistence
  - Static file serving

### Data
- **`Saves/`:** User-created and saved worlds
- **`Resources/`:** Images and assets
- **`Stylefiles/`:** CSS and styling

---

## Common Workflows

### Creating a Node
1. Instantiate a `Node` with a world reference, labels, and initial properties
2. Add it to the parent truss's node collection
3. The node appears in the view and participates in simulation

**Related:** See [Node](#node), [World](#world)

---

### Connecting Nodes with a Tensor
1. Create a `Tensor` with references to two nodes and desired labels
2. Tensors auto-register themselves with both nodes
3. During `tick()`, the tensor calculates and applies forces based on its labels and node positions

**Related:** See [Tensor](#tensor), [Node](#node)

---

### Saving and Loading a World
1. Serialize the world state (nodes, tensors, labels) via `FileSave.js`
2. POST to `/save` endpoint with JSON payload
3. To restore: GET `/load/:fileName` and deserialize JSON back into objects

**Related:** See [World](#world), [StoreableObject](#storeableobject)

---

### Editing a Truss
1. Click on a **node** or **tensor** to select it
2. The **parameter editor** displays its **labels**
3. Modify label values in the editor UI
4. Changes are applied to the object in real-time; the simulation updates on the next `tick()`

**Related:** See [Label](#label), [Parameter Editor](#parameter-editor)

---

### Drilling Into a Sub-Truss
1. Click on a **truss node** in the view
2. Universe pushes its child **world** onto the **world stack**
3. The **view** switches to display the child world's contents
4. User can edit the sub-truss; clicking "back" or the parent world pops the stack

**Related:** See [Truss Node](#truss-node), [World Stack](#world-stack), [Universe](#universe)

---

## Summary Table

| Term | Type | Purpose | Key Properties |
|------|------|---------|-----------------|
| **Universe** | System | Orchestration | World stack, tick loop |
| **World** | Container | Simulation environment | Truss node, governors, labels |
| **Truss Node** | Node | Hierarchical composition | Hosts child world, inherits Node properties |
| **Node** | Physics | Point mass | Position, velocity, connectedTensors, labels |
| **Tensor** | Physics | Connector | node1, node2, force, labels (spring/pull/push/field/absorber) |
| **Label** | Data | Property definition | Name, default value, dependencies, behaviors |
| **View** | UI | Rendering & interaction | Canvas, pan/zoom, selection |
| **World Stack** | Data structure | Navigation history | Push/pop/peek worlds |

---

## Questions & Clarifications

If you encounter a term not in this document or need clarification on a concept, please refer to:
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Development:** [DEVELOPMENT.md](DEVELOPMENT.md)
- **Codebase Status:** [CODEBASE-STATUS.md](CODEBASE-STATUS.md)

For code-level details, start with the file references listed under each term.
