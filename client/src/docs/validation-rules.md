##### Plan correctness

###### Agent-to-agent vertex collision

Agents must not move into the same tile at the same time. That is, at timestep `t`, there must not exist a pair of agents `a` and `b` where the position of `a` and `b` are equal.

###### Agent-to-agent edge collision

Agents must not move through each other. That is, at timestep `t`, there must not exist a pair of agents `a` and `b` where the position of `a` is equal to the position of `b` at timestep `t-1` and the position of `b` is equal to the position of `a` at timestep `t-1`.

###### Agent-to-environment collision

Agents must not move through the environment. At any timestep `t`, the position of an agent `a` must not be equal to the position of an environment tile.

###### Agent out of bounds

Agents must not move out of bounds. At any timestep `t`, the position of an agent `a` must be contained in the domain.

###### Agent reaches goal

The final position of each agent must be its goal position.

##### Cost correctness

###### Solution cost

If you define a solution cost in your submission, it'll be checked against our simulation. If there's a mismatch, your submission will be rejected.

###### Lower-bound cost

If you define a lower-bound, it should be less than or equal to the solution cost. Your submission will still be accepted if there are any problems with your lower-bound, but if it's higher than the best-known solution, your lower-bound will be ignored.
