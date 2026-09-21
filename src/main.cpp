#include "config.h"

void renderQuad();

// settings
struct {
    int width;
    int height;
} aspect = {800, 800};

//sphere data
struct GPUSphere { //32
    glm::vec4 centerAndRadius; 
    glm::vec4 colour; 
};

struct SphereBlockData {
    GPUSphere spheres[64];
    int numSpheres;
    int _pad[3];
};

// //light data
// enum LightType {
//     AMBIENT,
//     POINT,
//     DIRECTIONAL
// };

#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2

struct GPULight { //20
    glm::vec4 positionIntensity; //if ambient arbitrary, point -> position, directional -> direction. xyz => pos, w => intensity
    glm::vec4 type; // x => type
};

struct LightBlockData {
    GPULight lights[64];
    int numLights;
    int _pad[3];
};

//camera
Camera camera(glm::vec3(0.0f, 0.0f, 3.0f));
float lastX = aspect.width / 2.0f;
float lastY = aspect.height / 2.0f;
bool firstMouse = true;

// timing 
float deltaTime = 0.0f; // time between current frame and last frame
float lastFrame = 0.0f; // time of last frame

void mouse_callback(GLFWwindow* window, double xposin, double yposin) {
    float xpos = static_cast<float>(xposin);
    float ypos = static_cast<float>(yposin);

    if (firstMouse) {
        lastX = xpos;
        lastY = ypos;
        firstMouse = false;
    }

    float xoffset = xpos - lastX;
    float yoffset = lastY - ypos; // reversed since y-coordinates go from bottom to top

    lastX = xpos;
    lastY = ypos;

    camera.ProcessMouseMovement(xoffset, yoffset);
}

void scroll_callback(GLFWwindow* window, double xoffset, double yoffset) {
    camera.ProcessMouseScroll(static_cast<float>(yoffset));
}

//resizes the viewport to the width and height
void framebuffer_size_callback(GLFWwindow* window, int width, int height) {
    glViewport(0, 0, width, height);
    aspect.width = width;
    aspect.height = height;

}

void calculateDelta() {
    float currentFrame = glfwGetTime();
    deltaTime = currentFrame - lastFrame;
    lastFrame = currentFrame;  
}

void processInput(GLFWwindow *window) {
    if(glfwGetKey(window, GLFW_KEY_ESCAPE) == GLFW_PRESS)
        glfwSetWindowShouldClose(window, true);

    if (glfwGetKey(window, GLFW_KEY_W) == GLFW_PRESS)
        camera.ProcessKeyboard(FORWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_S) == GLFW_PRESS)
        camera.ProcessKeyboard(BACKWARD, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_A) == GLFW_PRESS)
        camera.ProcessKeyboard(LEFT, deltaTime);
    if (glfwGetKey(window, GLFW_KEY_D) == GLFW_PRESS)
        camera.ProcessKeyboard(RIGHT, deltaTime);
}

void updateSphereData(SphereBlockData* sphereData) {
    sphereData->numSpheres = 0;

    sphereData->spheres[0].centerAndRadius = glm::vec4(0, -1, 3, 2);
    sphereData->spheres[0].colour = glm::vec4(1, 0, 0, 1);
    sphereData->numSpheres += 1;

    sphereData->spheres[1].centerAndRadius = glm::vec4(2, 0, 4, 2);
    sphereData->spheres[1].colour = glm::vec4(0, 0, 1, 1);
    sphereData->numSpheres += 1;

    sphereData->spheres[2].centerAndRadius = glm::vec4(0, -100.5, 1, 100);
    sphereData->spheres[2].colour = glm::vec4(0.5, 1, 0.5, 1);
    sphereData->numSpheres += 1;

    sphereData->spheres[3].centerAndRadius = glm::vec4(-2, 0, 4, 2);
    sphereData->spheres[3].colour = glm::vec4(0, 1, 0, 1);
    sphereData->numSpheres += 1;
}

void updateLightData(LightBlockData* lightData) {
    lightData->numLights = 0;

    lightData->lights[0].type = glm::vec4(AMBIENT, 0, 0, 0);
    lightData->lights[0].positionIntensity = glm::vec4(0, 0, 0, 0.2);
    lightData->numLights += 1;

    lightData->lights[1].type = glm::vec4(POINT, 0, 0, 0);
    lightData->lights[1].positionIntensity = glm::vec4(2, 1, 0, 0.6);
    lightData->numLights += 1;

    lightData->lights[2].type = glm::vec4(DIRECTIONAL, 0, 0, 0);
    lightData->lights[2].positionIntensity = glm::vec4(1, 4, 4, 0.2);
    lightData->numLights += 1;
}

int main(int argc, char* argv[]) {
	// initialize and configure glfw
	// ------------------------------
	glfwInit();
	glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 4);
	glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 6);
	glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

	// glfw window creation
	// --------------------
	GLFWwindow* window = glfwCreateWindow(aspect.width, aspect.height, "raytracer", NULL, NULL);
	if (window == NULL) {
		std::cout << "Failed to create GLFW window" << std::endl;
		glfwTerminate();
		return -1;
	}

	glfwMakeContextCurrent(window);
	glfwSetFramebufferSizeCallback(window, framebuffer_size_callback);
    
    glfwSetInputMode(window, GLFW_CURSOR, GLFW_CURSOR_DISABLED); //lock mouse and allow for mouse movement
    glfwSetCursorPosCallback(window, mouse_callback);
    glfwSetScrollCallback(window, scroll_callback); 

	glfwSwapInterval(0);

	// load all OpenGL function pointers
	// ---------------------------------------
	if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
		std::cout << "Failed to initialize GLAD" << std::endl;
		return -1;
	}

    //create UBOSpheres to send sphere data to GPU
    unsigned int UBOSpheres;
    glGenBuffers(1, &UBOSpheres);
    glBindBuffer(GL_UNIFORM_BUFFER, UBOSpheres);
    glBufferData(GL_UNIFORM_BUFFER, sizeof(SphereBlockData), NULL, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_UNIFORM_BUFFER, 0);

    //create UBOLights to send light data to GPU
    unsigned int UBOLights;
    glGenBuffers(1, &UBOLights);
    glBindBuffer(GL_UNIFORM_BUFFER, UBOLights);
    glBufferData(GL_UNIFORM_BUFFER, sizeof(LightBlockData), NULL, GL_DYNAMIC_DRAW);
    glBindBuffer(GL_UNIFORM_BUFFER, 0);

	// build and compile shaders
	// -------------------------
	Shader shaders("shaders/screenQuad.vert", "shaders/rayTracer.frag");

	shaders.use();
    shaders.setVec2("resolution", glm::vec2(aspect.width, aspect.height));

	// render loop
	// -----------
	int fCounter = 0;
	while (!glfwWindowShouldClose(window)) {
        calculateDelta();

        //pass camera matrix into compute shader
        glm::mat4 view = camera.GetViewMatrix();

		// make sure writing to image has finished before read
		glMemoryBarrier(GL_SHADER_IMAGE_ACCESS_BARRIER_BIT);

        //pass in aspect ratio
        shaders.setVec2("resolution", glm::vec2(aspect.width, aspect.height));

        //update and send sphereBlock data to shader
        SphereBlockData sphereData{};
        updateSphereData(&sphereData);

        glBindBuffer(GL_UNIFORM_BUFFER, UBOSpheres);
        glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(SphereBlockData), &sphereData); //bind data to UBO
        glBindBuffer(GL_UNIFORM_BUFFER, 0);

        const GLuint SPHERE_BLOCK_BINDING = 0;
        glBindBufferBase(GL_UNIFORM_BUFFER, SPHERE_BLOCK_BINDING, UBOSpheres);

        //update and send lightBlock data to shader
        LightBlockData lightData{};
        updateLightData(&lightData);

        glBindBuffer(GL_UNIFORM_BUFFER, UBOLights);
        glBufferSubData(GL_UNIFORM_BUFFER, 0, sizeof(LightBlockData), &lightData); //bind data to UBO
        glBindBuffer(GL_UNIFORM_BUFFER, 0);

        const GLuint LIGHT_BLOCK_BINDING = 1;
        glBindBufferBase(GL_UNIFORM_BUFFER, LIGHT_BLOCK_BINDING, UBOLights);

        // render image to quad
		glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
		shaders.use();
		
		renderQuad();

		// swap buffers and poll IO events
		glfwSwapBuffers(window);
		glfwPollEvents();
	}

	// de-allocate all resources
	glDeleteProgram(shaders.ID);

	glfwTerminate();

	return 0;
}

// renders a 1x1 XY quad in NDC
unsigned int quadVAO = 0;
unsigned int quadVBO;
void renderQuad() {
	if (quadVAO == 0) {
		float quadVertices[] = {
			// positions        // texture Coords
			-1.0f,  1.0f, 0.0f,
			-1.0f, -1.0f, 0.0f,
			 1.0f,  1.0f, 0.0f,
			 1.0f, -1.0f, 0.0f,
		};
		// setup plane VAO
		glGenVertexArrays(1, &quadVAO);
		glGenBuffers(1, &quadVBO);
		glBindVertexArray(quadVAO);
		glBindBuffer(GL_ARRAY_BUFFER, quadVBO);
		glBufferData(GL_ARRAY_BUFFER, sizeof(quadVertices), &quadVertices, GL_STATIC_DRAW);
		glEnableVertexAttribArray(0);
		glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
	}

	glBindVertexArray(quadVAO);
	glDrawArrays(GL_TRIANGLE_STRIP, 0, 4);
	glBindVertexArray(0);
}