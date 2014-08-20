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

#define F_TMP_SCRYPT_X_OFFSET float(TMP_SCRYPT_X_OFFSET)

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * TEXTURE_SIZE) + c.x;
    float offset = mod(position, BLOCK_SIZE);

    if (offset >= F_TMP_SCRYPT_X_OFFSET && offset < F_TMP_SCRYPT_X_OFFSET + 16.) {
        float block = floor(position / BLOCK_SIZE);
        start = (block * BLOCK_SIZE) + float(F_TMP_SCRYPT_X_OFFSET);
        float o = offset - F_TMP_SCRYPT_X_OFFSET;

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
