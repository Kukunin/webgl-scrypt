precision mediump float;

#define POW_2_08 256.0
#define Ox10000 65536.0

/* Common functions */
vec4 toRGBA(in vec2 arg) {
    float V = float(arg.x);
    float R = floor(V / POW_2_08);
    V -= R * POW_2_08;
    float G = V;
    V = float(arg.y);
    float B = floor(V / POW_2_08);
    V -= B * POW_2_08;
    float A = V;
    return vec4(R/255., G/255., B/255., A/255.);
}

vec2 safe_add (in vec2 a, in vec2 b)
{
    vec2 ret = a + b;
    if (ret.y >= float(Ox10000)) {
        ret += vec2(1.0, -1.*float(Ox10000));
    }
    if (ret.x >= float(Ox10000)) {
        ret.x -= float(Ox10000);
    }
    return ret;
}

uniform sampler2D uSampler;
varying vec2 vTextCoord;

uniform float source;
uniform float destination;
uniform float length;
uniform bool  sum;

float start;

vec4 _(in float offset) {
    vec2 coordinate = vec2(mod(start + offset, 1024.), floor((start + offset)/1024.));
    return texture2D(uSampler, coordinate / 1024.);
}

vec2 fromRGBA(vec4 rgba) {
    rgba *= 255.;
    float x = ((rgba.r * 256.) + rgba.g);
    float y = ((rgba.b * 256.) + rgba.a);
    return vec2(x, y);
}

vec2 e(in float offset) {
    return fromRGBA(_(offset));
}

/* Variables */

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * 1024.) + c.x;
    float offset = mod(position, 65984.);
    float block = floor(position / 65984.);

    start = (block * 65984.);

    if(offset >= destination && offset < (destination + length)) {
        float o = offset - destination;
        if ( sum ) {
            gl_FragColor = toRGBA(safe_add(e(offset), e(source + o)));
        } else {
            gl_FragColor = _(source + o);
        }
    } else {
        gl_FragColor = texture2D(uSampler, vTextCoord.st);
    }
}