precision mediump float;

#define Ox10000 65536.0
#define Ox8000  32768.0

#define POW_2_03 8.0
#define POW_2_07 128.0
#define POW_2_08 256.0
#define POW_2_09 512.0
#define POW_2_14 16384.0

#define TMP_SCRYPT_X_OFFSET      228.
#define TMP_SCRYPT_X_OFFSET_END  244.

#define BLOCK_SIZE 33012.
#define TEXTURE_SIZE 1024.

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

/* Note: shift should be a power of two, e.g. to rotate 3 steps, use 2^3. */
vec2 rotr (in vec2 a, in float shift)
{
    vec2 ret = a / shift;
    ret = floor(ret) + fract(ret.yx) * float(Ox10000);
    return ret;
}

float xor16 (in float a, in float b)
{
    float ret = float(0);
    float fact = float(Ox8000);
    const int maxi = 16;

    for (int i=0; i < maxi; i++)
    {
        if ((max(a,b) >= fact) && (min(a,b) < fact))
            ret += fact;

        if (a >= fact) a -= fact;
            if (b >= fact) b -= fact;

                fact /= 2.0;
    }
    return ret;
}

vec2 xor (in vec2 a, in vec2 b)
{
        return vec2 (xor16 (a.x, b.x), xor16 (a.y, b.y));
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

/* Variables */
uniform sampler2D uSampler;
uniform sampler2D kSampler;
uniform float round;
uniform float part;
varying vec2 vTextCoord;
float start;

vec4 _(in float offset) {
    vec2 coordinate = vec2(mod(start + offset, TEXTURE_SIZE), floor((start + offset)/TEXTURE_SIZE));
    return texture2D(uSampler, coordinate / TEXTURE_SIZE);
}

vec2 e(in float offset) {
    vec4 rgba = _(offset)*255.;
    float x = ((rgba.r * 256.) + rgba.g);
    float y = ((rgba.b * 256.) + rgba.a);
    return vec2(x, y);
}

vec2 f(float me, float one, float two, float pow, bool flip) {
    vec2 sum = safe_add(e(one), e(two));
    if( flip ) {
        sum = sum.yx;
    }
    return xor(e(me), rotr(sum, pow));
}

vec2 f(float me, float one, float two, float pow) {
    return f(me, one, two, pow, true);
}

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * TEXTURE_SIZE) + c.x;
    float offset = mod(position, BLOCK_SIZE);

    if (offset >= TMP_SCRYPT_X_OFFSET && offset < TMP_SCRYPT_X_OFFSET + 16.) {
        float block = floor(position / BLOCK_SIZE);
        start = (block * BLOCK_SIZE) + float(TMP_SCRYPT_X_OFFSET);
        float o = offset - TMP_SCRYPT_X_OFFSET;

        vec4 point = floor(texture2D(kSampler, vec2(o/16., part/2.))*255.);
        if (point.g == round && round == 1.) {
            gl_FragColor = toRGBA(f(o, point.b, point.a, POW_2_09));
        } else if (point.g == round && round == 2.) {
            gl_FragColor = toRGBA(f(o, point.b, point.a, POW_2_07));
        } else if (point.g == round && round == 3.) {
            gl_FragColor = toRGBA(f(o, point.b, point.a, POW_2_03));
        } else if (point.g == round && round == 4.) {
            gl_FragColor = toRGBA(f(o, point.b, point.a, POW_2_14, false));
        } else {
            gl_FragColor = texture2D(uSampler, vTextCoord.st);
        }
    } else {
        gl_FragColor = texture2D(uSampler, vTextCoord.st);
    }
}
