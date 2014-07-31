precision mediump float;

/* Defines */
#define Ox10000 65536.0
#define Ox8000  32768.0

#define Ox5c5c 23644.0
#define Ox3636 13878.0

#define POW_2_01 2.0
#define POW_2_02 4.0
#define POW_2_03 8.0
#define POW_2_04 16.0
#define POW_2_05 32.0
#define POW_2_06 64.0
#define POW_2_07 128.0
#define POW_2_08 256.0
#define POW_2_09 512.0
#define POW_2_10 1024.0
#define POW_2_11 2048.0
#define POW_2_12 4096.0
#define POW_2_13 8192.0

/* Common functions */
vec4 toRGBA(in vec2 arg) {
    float V = float(arg.x);
    float R = floor(V / pow(2.0, 8.0));
    V -= R * pow(2.0, 8.0);
    float G = V;
    V = float(arg.y);
    float B = floor(V / pow(2.0, 8.0));
    V -= B * pow(2.0, 8.0);
    float A = V;
    return vec4(R/255., G/255., B/255., A/255.);
}

/* Math functions */

/* Note: shift should be a power of two, e.g. to shift 3 steps, use 2^3. */
vec2 sftr (in vec2 a, in float shift)
{
    vec2 ret = a / shift;
    ret = vec2(floor (ret.x), floor(ret.y) + fract(ret.x) * float(Ox10000));
    return ret;
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

float and16 (in float a, in float b)
{
        float ret = float(0);
        float fact = float (Ox8000);
        const int maxi = 16;

        for (int i=0; i < maxi; i++)
        {
            if (min(a, b) >= fact)
                ret += fact;

            if (a >= fact)
                a -= fact;
            if (b >= fact)
                b -= fact;

            fact /= 2.0;
        }
        return ret;
}

vec2 and (in vec2 a, in vec2 b)
{
      return vec2 (and16 (a.x, b.x), and16 (a.y, b.y));
}

/* Logical complement ("not") */
vec2 cpl (in vec2 a)
{
      return vec2 (float (Ox10000), float (Ox10000)) - a - vec2(1.0, 1.0);
}

vec2 safe_add (in vec2 a, in vec2 b)
{
    vec2 ret;
    ret.x = a.x + b.x;
    ret.y = a.y + b.y;
    if (ret.y >= float(Ox10000)) {
        ret.y -= float(Ox10000);
        ret.x += 1.0;
    }
    if (ret.x >= float(Ox10000)) {
        ret.x -= float(Ox10000);
    }
    return ret;
}

vec2 blend (in vec2 m16, in vec2 m15, in vec2 m07, in vec2 m02)
{
    vec2 s0 = xor (rotr (m15   , POW_2_07), xor (rotr (m15.yx, POW_2_02), sftr (m15, POW_2_03)));
    vec2 s1 = xor (rotr (m02.yx, POW_2_01), xor (rotr (m02.yx, POW_2_03), sftr (m02, POW_2_10)));
    return safe_add (safe_add (m16, s0), safe_add (m07, s1));
}

vec2 e0 (in vec2 a)
{
        return xor (rotr (a, POW_2_02), xor (rotr (a, POW_2_13), rotr (a.yx, POW_2_06)));
}

vec2 e1 (in vec2 a)
{
        return xor (rotr (a, POW_2_06), xor (rotr (a, POW_2_11), rotr (a.yx, POW_2_09)));
}

vec2 ch (in vec2 a, in vec2 b, in vec2 c)
{
        return xor (and (a, b), and (cpl (a), c));
}

vec2 maj (in vec2 a, in vec2 b, in vec2 c)
{
        return xor (xor (and (a, b), and (a, c)), and (b, c));
}

/* Variables */
uniform sampler2D uSampler;
varying vec2 vTextCoord;

uniform float round;
uniform vec2 K[64];

//Start position for whole block
float start;

vec4 _(in float offset) {
    vec2 coordinate = vec2(mod(start + offset, 1024.), floor((start + offset)/1024.));
    return texture2D(uSampler, coordinate / 1024.);
}

vec2 _2(in float offset) {
    vec4 rgba = _(offset);
    float x = (rgba.r * 256.) + rgba.g;
    float y = (rgba.b * 256.) + rgba.a;
    return vec2(x, y)*255.;
}

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * 1024.) + c.x;
    float offset = mod(position, 65984.);
    float block = floor(position / 65984.);

    // Work position of current round
    float wp = 8. + round;
    if ( offset < 8. || (round > 15. && offset == wp)) {
        //Current work
        vec2 w;

        start = block * 65984.;

        for (int i = 0; i <= 64; i++ ) {
            if (i == int(round)) {
                if( i > 15 ) {
                    w = blend(_2(wp-16.), _2(wp-15.), _2(wp-7.), _2(wp-2.));
                    if (offset == wp) {
                        gl_FragColor = toRGBA(w);
                        return;
                    }
                } else {
                    w = _2(wp);
                }
                if( offset == 7. ) {
                    gl_FragColor = _(6.);
                } else if ( offset == 6. ) {
                    gl_FragColor = _(5.);
                } else if ( offset == 5. ) {
                    gl_FragColor = _(4.);
                } else if ( offset == 3. ) {
                    gl_FragColor = _(2.);
                } else if ( offset == 2. ) {
                    gl_FragColor = _(1.);
                } else if ( offset == 1. ) {
                    gl_FragColor = _(0.);
                } else {
                    vec2 _s1 = e1(_2(4.));
                    vec2 _ch = ch(_2(4.), _2(5.), _2(6.));
                    vec2 _t1 = safe_add(safe_add(safe_add(safe_add(_2(7.), _s1), _ch), K[i]), w);
                    if ( offset == 4. ) {
                        gl_FragColor = toRGBA(safe_add(_2(3.0), _t1));
                    } else {
                        vec2 _s0  = e0(_2(0.));
                        vec2 _maj = maj(_2(0.), _2(1.), _2(2.));
                        vec2 _t2 = safe_add(_s0, _maj);
                        gl_FragColor = toRGBA(safe_add(_t2, _t1));
                    }
                }
            }
        }
    } else {
        gl_FragColor = texture2D(uSampler, vTextCoord.st);
    }
}
