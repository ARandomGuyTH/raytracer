# RAYTRACING RENDERER
## How it works
GLFW is used to create a window cross-platform
Shaders loaded and compiled using openGL
Uniforms such as sphere data and resolution are sent to the GPU every frame
Vertex shader draws a quad every frame that covers the whole screen so the image is displayed properly
Fragment shader sends rays through every pixel in the viewport
The rays check if they collide with a sphere and if so return the colour of the sphere

## How to use
### LINUX
Compile your own glfw library files (i.e - libglfw.so, libglfw.so.3, libglfw.so.3.5) and add them to the the lib folder in dependencies, then run make all

## To Add
  -Lighting
  -Support for other shapes then spheres
  -Different roughness
  -Allowing for textures
