# RAYTRACING RENDERER
## How it works
GLFW is used to create a window cross-platform
Shaders loaded and compiled using openGL
Uniforms such as sphere data, light data and resolution are sent to the GPU every frame
Vertex shader draws a quad every frame that covers the whole screen so the image is displayed properly
Fragment shader sends rays through every pixel in the viewport
The rays check if they collide with a sphere and if so:
  -Shader calculates the accumulated light on the sphere
  -shader checks if light is blocked by another sphere, if so resulting in a shadow
  -If the sphere is reflective, the ray is iteratively reflected accumulating colour with every sphere hit

## How to use
### LINUX
Compile your own glfw library files (i.e - libglfw.so, libglfw.so.3, libglfw.so.3.5) and add them to the the lib directory in dependencies, then run make all

## Examples
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/c9f538d8-f89d-4d9d-9157-d3f8fc3d4c98" />

<img width="1888" height="1110" alt="image" src="https://github.com/user-attachments/assets/317d9558-36e0-4860-b3df-a78c0a560729" />

## To Add
  -Support for other shapes then spheres
  -Allowing for textures
