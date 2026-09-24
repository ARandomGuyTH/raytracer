# RAYTRACING RENDERER
## How it works
<<<<<<< HEAD
GLFW is used to create a window cross-platform
Shaders loaded and compiled using openGL
Uniforms such as sphere data, light data and resolution are sent to the GPU every frame
Vertex shader draws a quad every frame that covers the whole screen so the image is displayed properly
Fragment shader sends rays through every pixel in the viewport
The rays check if they collide with a sphere and if so:
  -Shader calculates the accumulated light on the sphere
  -shader checks if light is blocked by another sphere, if so resulting in a shadow
  -If the sphere is reflective, the ray is iteratively reflected accumulating colour with every sphere hit
=======
GLFW is used to create a window cross-platform  
Shaders loaded and compiled using openGL  
Uniforms such as sphere data and resolution are sent to the GPU every frame  
Vertex shader draws a quad every frame that covers the whole screen so the image is displayed properly  
Fragment shader sends rays through every pixel in the viewport  
The rays check if they collide with a sphere and if so calculates the lighting of that sphere  
We then check if any Spheres are blocking the light, if so resulting in a shadow  
Finally if the sphere is not completely matte we iteratively reflect the ray off the sphere accumulating light at each collision  


## Controls
WASD => move camera  
Mouse => rotate camera

## Demo
<img width="800" height="500" alt="raytracing_demo" src="https://github.com/user-attachments/assets/faed51d0-3e2c-434f-b718-d890520d6451" />  
<img width="1888" height="1110" alt="2026-09-24-141030_hyprshot" src="https://github.com/user-attachments/assets/f73cf413-4ad0-48e7-ab70-9f0d193d0ec5" />  
<img width="1887" height="1111" alt="2026-09-24-132703_hyprshot" src="https://github.com/user-attachments/assets/d8fb1137-2276-4d3a-b489-5cc111990dc1" />

>>>>>>> 1bc163b1a70cda73539dabe84321f86148e5eaab

## How to use
### LINUX
Compile your own glfw library files (i.e - libglfw.so, libglfw.so.3, libglfw.so.3.5) and add them to the the lib directory in dependencies, then run make all

## Examples
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/c9f538d8-f89d-4d9d-9157-d3f8fc3d4c98" />

<img width="1888" height="1110" alt="image" src="https://github.com/user-attachments/assets/317d9558-36e0-4860-b3df-a78c0a560729" />

## To Add
<<<<<<< HEAD
  -Support for other shapes then spheres
  -Allowing for textures
=======
  -Support for other shapes then spheres  
  -Allowing for textures  
  -Optimisations
>>>>>>> 1bc163b1a70cda73539dabe84321f86148e5eaab
