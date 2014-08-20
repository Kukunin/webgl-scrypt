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

vec2 blend (in vec2 m16, in vec2 m15, in vec2 m07, in vec2 m02)
{
    vec2 s0 = xor (rotr (m15   , POW_2_07), xor (rotr (m15.yx, POW_2_02), sftr (m15, POW_2_03)));
    vec2 s1 = xor (rotr (m02.yx, POW_2_01), xor (rotr (m02.yx, POW_2_03), sftr (m02, POW_2_10)));
    return safe_add (safe_add (m16, s0), safe_add (m07, s1));
}

/* Variables */
uniform sampler2D uSampler;
varying vec2 vTextCoord;

uniform float round;

//Start position for work block in texture
float start;
// Round offset related to the block offset
float inBlockOffset;
//Work array
vec2 w[8];

vec4 _(in float offset) {
    vec2 coordinate = vec2(mod(start + offset, TEXTURE_SIZE), floor((start + offset)/TEXTURE_SIZE));
    return texture2D(uSampler, coordinate / TEXTURE_SIZE);
}

vec2 e(in float offset) {
    vec4 rgba = _(offset + inBlockOffset)*255.;

    float x = ((rgba.r * 256.) + rgba.g);
    float y = ((rgba.b * 256.) + rgba.a);
    return vec2(x, y);
}

#define PREDEFINED_BLOCKS 16.
#define WORKS_PER_ROUND 2.
#define F_TMP_WORK_OFFSET float(TMP_WORK_OFFSET)

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * TEXTURE_SIZE) + c.x;
    float offset = mod(position, BLOCK_SIZE);
    float block = floor(position / BLOCK_SIZE);

    inBlockOffset = PREDEFINED_BLOCKS + (round * WORKS_PER_ROUND);
    if ( offset >= (F_TMP_WORK_OFFSET + inBlockOffset) && offset < (F_TMP_WORK_OFFSET + inBlockOffset + WORKS_PER_ROUND)) {
        start = (block * BLOCK_SIZE) + F_TMP_WORK_OFFSET;

        w[0] = blend(e(-16.), e(-15.), e(-7.), e(-2.));
        w[1] = blend(e(-15.), e(-14.), e(-6.), e(-1.));

        for (int i = 0; i < int(WORKS_PER_ROUND); i++ ) {
            if ( offset == (F_TMP_WORK_OFFSET + inBlockOffset + float(i))) {
                gl_FragColor = toRGBA(w[i]);
                break;
            }
        }
    } else {
        gl_FragColor = texture2D(uSampler, vTextCoord.st);
    }
}
