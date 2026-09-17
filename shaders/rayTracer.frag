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

bool hit_sphere(vec3 centre, double radius, Ray r) {
    vec3 oc = centre - r.origin;
    double a = dot(r.dir, r.dir);
    double b = -2.0 * dot(r.dir, oc);
    double c = dot(oc, oc) - radius*radius;
    double discriminant = b*b - 4*a*c;
    return (discriminant >= 0);
}

vec4 ray_color(Ray r) {
    if (hit_sphere(vec3(0,0,-1), 0.5, r)) {
        return vec4(1, 0, 0, 0);
    }

    Sphere sphere1 = Sphere(vec4(0, 0, 4, 1.0), vec4(0.2,0,0,0));
    float a = 0.5 * normalize(r.dir).y + 1.0;
    return vec4((1.0-a)*vec3(1.0, 1.0, 1.0) + a*vec3(0.5, 0.7, 1.0), 1.0);

}

void main() {
    Sphere sphere1;

    vec2 uv = (gl_FragCoord.xy / resolution) * 2.0 - 1.0;
    vec3 cameraForward = normalize(vec3(uv, 1.0)); // simple fixed-forward camera

    Ray r = Ray(vec3(0,0,0), cameraForward);
    FragColor = ray_color(r);

}