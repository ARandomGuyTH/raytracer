#version 430 core

struct Sphere {
    vec4 centerRadius; // xyz centre, w radius
    vec4 colour;           // xyz color, w unused
};

struct Ray {
    vec3 origin;
    vec3 dir;
};

layout(std140) uniform SphereBlock {
    Sphere spheres[64];
    int numSpheres;
};

uniform vec2 resolution;
//uniform vec3 uCamPos;

out vec4 FragColor;

//finds the position of a given ray at value t
vec3 at(Ray r, float t) {
    return r.origin + t * r.dir;
}

//returns the 't' value where the ray hits the sphere
//where the position P is given by P(t) = A + tb where A is the ray origin and b is the direction
float hit_sphere(vec3 centre, float radius, Ray r) {
    vec3 oc = centre - r.origin;
    float a = dot(r.dir, r.dir);
    float b = -2.0 * dot(r.dir, oc);
    float c = dot(oc, oc) - radius*radius;
    float discriminant = b*b - 4*a*c;

    if (discriminant < 0) {
        return -1.0;
    } else {
        return (-b - sqrt(discriminant));
    }
}

vec4 ray_color(Ray r) {
    float t = hit_sphere(vec3(0,0,1), 0.5, r);
    if (t > 0) {
        vec3 normal = normalize(at(r, t) - vec3(0, 0, -1));
        return vec4(0.5*(normal + vec3(1,1,1)), 1);
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