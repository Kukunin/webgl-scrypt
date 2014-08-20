#define COPY_MODE   1
#define SUM_MODE    2
#define XOR_MODE    3
#define VALUE_MODE  4
#define HWORK_MODE  5
#define REVERT_MODE 6
#define SCRYPT_MODE 7

vec2 fromRGBA(in vec4 rgba) {
    rgba *= 255.;
    float x = ((rgba.r * 256.) + rgba.g);
    float y = ((rgba.b * 256.) + rgba.a);
    return vec2(x, y);
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

#define PREDEFINED_BLOCKS 16.
#define F_SCRYPT_V_OFFSET float(SCRYPT_V_OFFSET)

/* Variables */
uniform sampler2D uSampler;
varying vec2 vTextCoord;

uniform float source;
uniform float destination;
uniform float length;
uniform int   mode;
uniform vec2 value;

float start;

vec4 _(in float offset) {
    vec2 coordinate = vec2(mod(start + offset, TEXTURE_SIZE), floor((start + offset)/TEXTURE_SIZE));
    return texture2D(uSampler, coordinate / TEXTURE_SIZE);
}

vec2 e(in float offset) {
    return fromRGBA(_(offset));
}

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * TEXTURE_SIZE) + c.x;
    float offset = mod(position, BLOCK_SIZE);
    float block = floor(position / BLOCK_SIZE);

    start = (block * BLOCK_SIZE);
    float o = offset - destination;

    if (offset >= destination && offset < (destination + length)) {
        if ( mode == SUM_MODE ) {
            gl_FragColor = toRGBA(safe_add(e(offset), e(source + o)));
        } else if ( mode == XOR_MODE ) {
            gl_FragColor = toRGBA(xor(e(offset), e(source + o)));
        } else if ( mode == VALUE_MODE ) {
            gl_FragColor = toRGBA(value);
        } else if ( mode == REVERT_MODE ) {
            gl_FragColor = _(source + o).abgr;
        } else if ( mode == SCRYPT_MODE ) {
            float k = floor(and16(e(destination + 16.).y, 1023.) * 32.);

            gl_FragColor = toRGBA(xor(e(offset), e(F_SCRYPT_V_OFFSET + k + o)));
        } else {
            gl_FragColor = _(source + o);
        }
    } else if (mode == HWORK_MODE && offset < destination + 16.) {
        if (offset == destination + length) {
            gl_FragColor = toRGBA(vec2(32768., 0.)); //last bit
        } else if ( offset == destination + 15. ) {
            gl_FragColor = toRGBA(value); //bits length
        } else {
            gl_FragColor = vec4(0.);
        }
    } else {
        gl_FragColor = texture2D(uSampler, vTextCoord.st);
    }
}
