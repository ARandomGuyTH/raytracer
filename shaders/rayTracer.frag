#version 430 core

struct Sphere {
    vec4 centerRadius; // xyz centre, w radius
    vec4 colour;           // xyz color, w unused
};

struct Ray {
    vec3 origin;
    vec3 dir;
};

layout(std140, binding = 0) uniform sphereBlock {
    Sphere spheres[64];
    int numSpheres;
};

uniform vec2 resolution;
out vec4 FragColor;

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

vec4 ray_color(Ray r) {
    float closest_t = -1;
    Sphere closest_sphere = spheres[0];
    float t;

    for (int i=0; i <= numSpheres; i++) {
        vec3 centre;
        centre.x = spheres[i].centerRadius.x;
        centre.y = spheres[i].centerRadius.y;
        centre.z = spheres[i].centerRadius.z;
        float radius = spheres[i].centerRadius.w;

        t = hit_sphere(r, centre, radius);

        if ((t < closest_t || closest_t == -1) && t > 0) {
            closest_t = t;
            closest_sphere = spheres[i];

        }
    }

    if (closest_t > 0) {
        vec3 sphereCentre = vec3(closest_sphere.centerRadius.x, closest_sphere.centerRadius.y, closest_sphere.centerRadius.z);
        vec3 normal = normalize(at(r, closest_t) - sphereCentre);
        return closest_sphere.colour;
    }

    float a = 0.5 * normalize(r.dir).y + 1.0;
    return vec4((1.0-a)*vec3(1.0, 1.0, 1.0) + a*vec3(0.5, 0.7, 1.0), 1.0);

}

void main() {
    vec2 uv = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;
    uv.x *= resolution.x / resolution.y;

    vec3 cameraForward = normalize(vec3(uv, 1.0)); // simple fixed-forward camera

    Ray r = Ray(vec3(0,0,0), cameraForward);
    FragColor = ray_color(r);

}