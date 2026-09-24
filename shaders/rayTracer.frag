#version 430 core

struct Ray {
    vec3 origin;
    vec3 dir;
};

//light data
#define AMBIENT 0
#define POINT 1
#define DIRECTIONAL 2

struct Light {
    vec4 positionIntensity;
    vec4 type;
};

//sphere data
struct Sphere {
    vec4 centerRadius; // xyz centre, w radius
    vec4 colour;           // xyz color, w unused
    vec4 data; //x => specular.
};

layout(std140, binding = 0) uniform sphereBlock {
    Sphere spheres[64];
    int numSpheres;
};

layout(std140, binding = 1) uniform lightBlock {
    Light lights[64];
    int numLights;
};

uniform vec2 resolution;
out vec4 FragColor;

vec2 closest_intersection(Ray r, float t_min, float t_max);
vec4 trace_ray(Ray r, float t_min, float t_max, int recursionDept);

//returns vec3 ray direction given a ray direction R and a normal N
vec3 ReflectRay(vec3 R, vec3 N) {
    return 2 * N * dot(N, R) - R;
}

//returns the cumulative light intensity from posiiton P and normal N
//and object to camera vector V, specular  
float computeLighting(vec3 P, vec3 N, vec3 V, float s) {
    float cumIntensity = 0.0;
    float N_dot_L;

    for (int i=0; i <= numLights; i++) {
        float type = lights[i].type.x;
        vec3 posDir = vec3(lights[i].positionIntensity.x, lights[i].positionIntensity.y, lights[i].positionIntensity.z);
        float intensity = lights[i].positionIntensity.w;

        vec3 L = vec3(0, 0, 0);
        if (type == AMBIENT) {
            cumIntensity += intensity; //ambient light even intensity everywhere
        } else if (type == POINT) {
            L = posDir - P; // light vector is described by distance from position
        } else {
            L = posDir; //get light vector
        }

        // Shadow check
        Ray shadow_ray = Ray(P, L);
        vec2 closest_values = closest_intersection(shadow_ray, 0.001, 0xFFFF);
        Sphere shadow_sphere = spheres[int(closest_values.x)];
        float shadow_t = closest_values.y;

        if (shadow_t >= 0) {
                continue;
            }

        //Diffuse
        N_dot_L = dot(N, L);
        if (N_dot_L > 0) {
            //calc cosine of angle and multiply by light intensity
            cumIntensity += intensity * N_dot_L / (length(N) * length(L));
        }

        //specular
        if (s != 1) { //if non-matte
            vec3 R = ReflectRay(L, N);
            float R_dot_V = dot(R,V);
            if (R_dot_V > 0) {
                cumIntensity += intensity * pow(R_dot_V/(length(R) * length(V)), s);
            }
        }
    }
    return cumIntensity;
}

//determines whether ray hits inside or outside a surface
//returns true for outside, false for inside
bool determine_side(vec3 rayDirection, vec3 outwardNormal) {
    if (dot(rayDirection, outwardNormal) > 0) return false; //ray inside
    else return true; //ray outside
} 

//finds the position of a given ray at value t
vec3 at(Ray r, float t) {
    return r.origin + t * r.dir;
}

//DEBUG: visualises uniforms into colour
vec4 visualiseUniform(Sphere sphere, Ray r, float t) {
    vec3 sphereCentre = vec3(sphere.centerRadius.x, sphere.centerRadius.y, sphere.centerRadius.z);
    vec3 normal = normalize(at(r, t) - sphereCentre);
    return 0.5 * vec4(normal.x + 1, normal.y + 1, normal.z + 1, 2);
}

//returns the 't' value where the ray hits a sphere
//where the position P is given by P(t) = A + tb where A is the ray origin and b is the direction
float hit_sphere(Ray r, vec3 centre, float radius) {
    vec3 oc = centre - r.origin; 
    float a = pow(length(r.dir), 2); //calculate discriminant
    float h = dot(r.dir, oc);
    float c = pow(length(oc), 2) - radius*radius;
    float discriminant = h*h - a*c;

    if (discriminant >= 0) { //if collision
        return  h - sqrt(discriminant) / a;
    }
    return -1;
}


//given a ray r, returns the closest intersection that r makes to a sphere from t_min to t_max
vec2 closest_intersection(Ray r, float t_min, float t_max) {
    float closest_t = -1;
    int closest_sphere = 0;
    float t;

    for (int i=0; i <= numSpheres; i++) {
        vec3 centre;
        centre.x = spheres[i].centerRadius.x;
        centre.y = spheres[i].centerRadius.y;
        centre.z = spheres[i].centerRadius.z;
        float radius = spheres[i].centerRadius.w;

        t = hit_sphere(r, centre, radius);

        if ((t < closest_t || closest_t == -1) &&  t < t_max && t > t_min){
            closest_t = t;
            closest_sphere = i;
        }
    }

    return vec2(closest_sphere, closest_t);

}

vec4 trace_ray(Ray r, float t_min, float t_max, int recursionDepth) {
    vec4 output_colour = vec4(0,0,0,0);
    float accCoef = 1.0; //accumulation coefficient

    for (int depth=0; depth <= recursionDepth; depth++) {
        vec2 closest_values = closest_intersection(r, t_min, t_max);
        float closest_t = closest_values.y;
        Sphere closest_sphere = spheres[int(closest_values.x)];

        if (closest_t <= 0) { //if no sphere hit
            float a = 0.5 * normalize(r.dir).y + 1.0;
            vec4 background = vec4((1.0-a)*vec3(1.0, 1.0, 1.0) + a*vec3(0.5, 0.7, 1.0), 1.0); //return background colour
            background = vec4(0,0,0,1);
            return output_colour + accCoef * background;
        }

        vec3 pos = at(r, closest_t);
        vec3 sphereCentre = vec3(closest_sphere.centerRadius.x, closest_sphere.centerRadius.y, closest_sphere.centerRadius.z);
        vec3 normal = normalize(pos - sphereCentre);
        vec4 local_colour = closest_sphere.colour * computeLighting(pos, normal, -r.dir, closest_sphere.data.x);


        // If the object is not reflective, we're done
        float reflectivity = closest_sphere.data.y;
        if (reflectivity <= 0) {
            return output_colour + accCoef * local_colour;
        }

        // Compute the reflected ray
        vec3 R_dir = ReflectRay(-r.dir, normal); //get reflected ray dir
        r = Ray(pos, R_dir);
        output_colour += accCoef * local_colour * (1 - reflectivity);

        accCoef *= reflectivity;
    }
    return output_colour;

}

void main() {
    vec2 uv = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;

    vec3 cameraForward = normalize(vec3(uv, 1.0)); // simple fixed-forward camera

    Ray r = Ray(vec3(0,0,0), cameraForward);
    FragColor = trace_ray(r, 0.001, 0xFFFF, 100);
}