# RAYTRACING RENDERER
## How it works
GLFW is used to create a window cross-platform
Shaders loaded and compiled using openGL
Uniforms such as sphere data and resolution are sent to the GPU every frame
Vertex shader draws a quad every frame that covers the whole screen so the image is displayed properly
Fragment shader sends rays through every pixel in the viewport
The rays check if they collide with a sphere and if so return the colour of the sphere

## Controls
WASD => move camera
Mouse => rotate camera

## Demo
<img width="800" height="500" alt="raytracing_demo" src="https://github.com/user-attachments/assets/faed51d0-3e2c-434f-b718-d890520d6451" />
<img width="1888" height="1110" alt="2026-09-24-141030_hyprshot" src="https://github.com/user-attachments/assets/f73cf413-4ad0-48e7-ab70-9f0d193d0ec5" />
<img width="1887" height="1111" alt="2026-09-24-132703_hyprshot" src="https://github.com/user-attachments/assets/d8fb1137-2276-4d3a-b489-5cc111990dc1" />


## How to use
### LINUX
Compile your own glfw library files (i.e - libglfw.so, libglfw.so.3, libglfw.so.3.5) and add them to the the lib directory in dependencies, then run make all

## To Add
  -Lighting
  -Support for other shapes then spheres
  -Different roughness
  -Allowing for textures
