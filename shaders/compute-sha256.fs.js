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

/* Logical complement ("not") */
vec2 cpl (in vec2 a)
{
      return vec2 (float (Ox10000), float (Ox10000)) - a - vec2(1.0, 1.0);
}

vec2 and (in vec2 a, in vec2 b)
{
      return vec2 (and16 (a.x, b.x), and16 (a.y, b.y));
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
uniform sampler2D kSampler;
varying vec2 vTextCoord;

uniform float round;

//Start position for hash block in texture
float start;

vec4 _(in float offset) {
    vec2 coordinate = vec2(mod(start + offset, TEXTURE_SIZE), floor((start + offset)/TEXTURE_SIZE));
    return texture2D(uSampler, coordinate / TEXTURE_SIZE);
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

vec2 K(in float offset) {
    return fromRGBA(texture2D(kSampler, vec2(offset/64., 0.)));
}

#define TMP_BLOCK_OFFSET 8.
#define WORKS_PER_ROUND 2.
#define F_TMP_HASH_OFFSET float(TMP_HASH_OFFSET)

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * TEXTURE_SIZE) + c.x;
    float offset = mod(position, BLOCK_SIZE);
    float block = floor(position / BLOCK_SIZE);

    if ( offset >= F_TMP_HASH_OFFSET && offset < (F_TMP_HASH_OFFSET + 8.)) {
        start = (block * BLOCK_SIZE) + F_TMP_HASH_OFFSET;
        float rOffset = (round*WORKS_PER_ROUND) + F_TMP_HASH_OFFSET;

        vec2 t[8]; //Work array
        vec2 t1, t2;
        vec2 _s0,_maj,_t2,_s1,_ch, _t1;
        for(int i = 0; i < 8; i++) { t[i] = e(float(i)); }

        for(int i = 0; i < int(WORKS_PER_ROUND); i++) {
            _s0 = e0(t[0]);
            _maj = maj(t[0],t[1],t[2]);
            _t2 = safe_add(_s0, _maj);
            _s1 = e1(t[4]);
            _ch = ch(t[4], t[5], t[6]);
            _t1 = safe_add(safe_add(safe_add(safe_add(t[7], _s1), _ch), K(float(i)+rOffset)), e(float(i) + TMP_BLOCK_OFFSET + rOffset));

            t[7] = t[6]; t[6] = t[5]; t[5] = t[4];
            t[4] = safe_add(t[3], _t1);
            t[3] = t[2]; t[2] = t[1]; t[1] = t[0];
            t[0] = safe_add(_t1, _t2);
        }

        for (int i = 0; i < 8; i++ ) {
            if ( offset == (F_TMP_HASH_OFFSET + float(i))) {
                gl_FragColor = toRGBA(t[i]);
                break;
            }
        }
    } else {
        gl_FragColor = texture2D(uSampler, vTextCoord.st);
    }
}
