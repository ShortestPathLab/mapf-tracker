The classic MAPF problem involves multiple agents that must navigate from their respective start positions to assigned goal positions on a shared, discrete 2D grid colliding with each other.

#### Problem Definition

##### Environment

- The environment is modelled as a **static 2D grid map**.
- Each **cell** in the grid is either **traversable** (free) or **blocked** (obstacle).
- Time is **discretised** into time steps or ticks.

##### Agents

- There are $k$ agents, denoted $a_1, a_2, \ldots, a_k$.
- Each agent $a_i$ is given a:
  - **Start position** $s_i \in V$
  - **Goal position** $g_i \in V$
    where $V$ is the set of traversable cells.

##### Movement Rules

- At each time step, an agent can:
  - Move to one of the four adjacent cells (up, down, left, right) if the cell is traversable.
  - Wait in place (i.e. perform a no-op).
- Agents cannot move into or through blocked cells.

##### Collision Constraints

A valid MAPF solution must avoid the following types of collisions:

1. **Vertex collision**: Two or more agents occupying the same cell at the same time.
2. **Edge collision**: Two agents swapping positions simultaneously (e.g., one moves from A to B while the other moves from B to A in the same time step).

##### Goals

- Each agent must reach its respective goal and stay there (or optionally remain idle upon arrival).
- The objective is to find a set of collision-free paths for all agents from their start to goal positions.

#### Solution Metrics

##### Makespan

- The **makespan** is the total number of time steps until the last agent reaches its goal.
- Formally:

  $$
  \text{makespan} = \max_{i=1}^k t_i
  $$

  where $t_i$ is the arrival time of agent $a_i$.

##### Sum of Costs (SOC)

- The **sum of costs** is the sum of each agent’s individual path cost, typically the number of time steps until they reach their goal.
- Formally:

  $$
    \text{SOC} = \sum\_{i=1}^k t_i
  $$

  where $t_i$ is the arrival time of agent $a_i$ at its goal (including wait actions).

- This is the **standard optimisation objective** for the classic MAPF problem model. The MAPF Tracker uses **sum of costs** as the solution cost.

#### Formal Model

Given:

- A graph $G = (V, E)$, typically a grid.
- A set of agents $A = \{a_1, a_2, \ldots, a_k\}$
- For each agent $a_i$, a start node $s_i \in V$ and a goal node $g_i \in V$

Find:

- A path $\pi_i: \mathbb{N} \rightarrow V$ for each agent $a_i$, such that:
  - $\pi_i(0) = s_i$
  - There exists $T_i$ such that $\forall t \geq T_i, \pi_i(t) = g_i$
  - $\pi_i(t+1) = \pi_i(t)$ or a neighbour of $\pi_i(t)$
  - No two agents collide (vertex or edge collisions) at any $t \in \mathbb{N}$

Minimise:

- $\sum_{i=1}^k T_i$ (sum of individual arrival times)
