quadruped-spring-gaitgenerator
==============================

Visualization aid for quadruped gaitgeneration prototypes

index.html
----------
- You can pick up and drop the (blue and black) squares. 
They represent the position of the feet and the center of mass (projected) on the ground.
- the orange squares near the center of mass represent the starting points for the legs.
(the position of the orange squares is relative to the center of mass (unlike the feet)
- The limited leg reach is not modeled into this script.
- The WASD buttons move the field of view.
- other keys:
 * V: move the center of mass forwards
 * B: try to do a leg transfer that would help in forwards locomotion (one of the 'cycle' functions)

goal
----
The general idea is to move the center of mass forwards (to the right) without loosing static stability. When transferring a foot,
the center of mass has to be inside the triangle formed by the still supporting feet (support pattern) for the robot to
be considere stable.
