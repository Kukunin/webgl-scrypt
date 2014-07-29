precision mediump float;

/* Defines */
#define Ox10000 65536.0
#define Ox8000  32768.0

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
vec4 toRGBA(vec2 arg) {
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
vec2 sftr (vec2 a, float shift)
{
    vec2 ret = a / shift;
    ret = vec2(floor (ret.x), floor(ret.y) + fract(ret.x) * float(Ox10000));
    return ret;
}

/* Note: shift should be a power of two, e.g. to rotate 3 steps, use 2^3. */
vec2 rotr (vec2 a, float shift)
{
    vec2 ret = a / shift;
    ret = floor(ret) + fract(ret.yx) * float(Ox10000);
    return ret;
}

float xor16 (float a, float b)
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

vec2 xor (vec2 a, vec2 b)
{
	return vec2 (xor16 (a.x, b.x), xor16 (a.y, b.y));
}

float and16 (float a, float b)
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

vec2 and (vec2 a, vec2 b)
{
      return vec2 (and16 (a.x, b.x), and16 (a.y, b.y));
}

/* Logical complement ("not") */
vec2 cpl (vec2 a)
{
      return vec2 (float (Ox10000), float (Ox10000)) - a - vec2(1.0, 1.0);
}

vec2 safe_add (vec2 a, vec2 b)
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

vec2 blend (vec2 m16, vec2 m15, vec2 m07, vec2 m02)
{
    vec2 s0 = xor (rotr (m15   , POW_2_07), xor (rotr (m15.yx, POW_2_02), sftr (m15, POW_2_03)));
    vec2 s1 = xor (rotr (m02.yx, POW_2_01), xor (rotr (m02.yx, POW_2_03), sftr (m02, POW_2_10)));
    return safe_add (safe_add (m16, s0), safe_add (m07, s1));
}

vec2 e0 (vec2 a)
{
	return xor (rotr (a, POW_2_02), xor (rotr (a, POW_2_13), rotr (a.yx, POW_2_06)));
}

vec2 e1 (vec2 a)
{
	return xor (rotr (a, POW_2_06), xor (rotr (a, POW_2_11), rotr (a.yx, POW_2_09)));
}

vec2 ch (vec2 a, vec2 b, vec2 c)
{
	return xor (and (a, b), and (cpl (a), c));
}

vec2 maj (vec2 a, vec2 b, vec2 c)
{
	return xor (xor (and (a, b), and (a, c)), and (b, c));
}

/* User defined function */
void set_nonce_to_header(out vec2 nonced_header[20], vec2 header[20], vec2 nonce[2]) {
    /* Copy header without nonce */
    for(int i = 0; i < 19; i++) {
        nonced_header[i] = header[i];
    }
    /* Set nonce */
    nonced_header[19] = vec2(
        (nonce[1].y*256.) + nonce[1].x,
        (nonce[0].y*256.) + nonce[0].x
    );
}

void pad_the_header(out vec2 P[32], vec2 header[20]) {
    /* Create padded message for SHA256 */
    for(int i = 0; i < 20; i++) {
        P[i] = header[i];
    }
    // Add 1 bit to the end of the message
    P[20] = vec2(32768., 0.);
    // Add the size of the message in bits
    // Header is always 80 byte, so size is 640 bits
    P[31] = vec2(0., 640.);
}

uniform vec2 base_nonce[2];
uniform vec2 header[20];	/* Header of the block */
uniform vec2 H[8];
uniform vec2 K[64];

void main () {
    /* Chunk of debug code to ouput the full result in different pixels */
    int x = int(gl_FragCoord.x);
    if (x >= 8) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        return;
    }

    vec2 key_hash[8]; /* Our SHA-256 hash */

    vec2 nonced_header[20]; /* Header with nonce */
    set_nonce_to_header(nonced_header, header, base_nonce);

    vec2 P[32]; /* Padded SHA-256 message */
    pad_the_header(P, nonced_header);

    vec2 tmp[8];   //state
    vec2 w[64]; //work
    /* Temporary variables */
    vec2 a, b, c, d, e, f, g, h;
    vec2 t1, t2;
    vec2 _s0,_maj,_t2,_s1,_ch, _t1;

    for (int i = 0; i < 8; i++) {
        tmp[i] = H[i];
    }

    /* Start first round */
    /* Fill the work array */
    for (int i = 0; i < 16; i++) {
        w[i] = P[i];
    }
    for (int i = 16; i < 64; ++i) {
        w[i] = blend(w[i-16], w[i-15], w[i-7], w[i-2]);
    }

    a = tmp[0];
    b = tmp[1];
    c = tmp[2];
    d = tmp[3];
    e = tmp[4];
    f = tmp[5];
    g = tmp[6];
    h = tmp[7];

    for (int i = 0; i < 64; i++) {
        _s0 = e0(a);
        _maj = maj(a,b,c);
        _t2 = safe_add(_s0, _maj);
        _s1 = e1(e);
        _ch = ch(e, f, g);
        _t1 = safe_add(safe_add(safe_add(safe_add(h, _s1), _ch), K[i]), w[i]);

        h = g; g = f; f = e;
        e = safe_add(d, _t1);
        d = c; c = b; b = a;
        a = safe_add(_t1, _t2);
    }

    tmp[0] = safe_add(a, tmp[0]);
    tmp[1] = safe_add(b, tmp[1]);
    tmp[2] = safe_add(c, tmp[2]);
    tmp[3] = safe_add(d, tmp[3]);
    tmp[4] = safe_add(e, tmp[4]);
    tmp[5] = safe_add(f, tmp[5]);
    tmp[6] = safe_add(g, tmp[6]);
    tmp[7] = safe_add(h, tmp[7]);

//     /* Second round */
//     /* Fill the work array */
    for (int i = 0; i < 16; i++) {
        w[i] = P[16+i];
    }
    for (int i = 16; i < 64; ++i) {
        w[i] = blend(w[i-16], w[i-15], w[i-7], w[i-2]);
    }

    a = tmp[0];
    b = tmp[1];
    c = tmp[2];
    d = tmp[3];
    e = tmp[4];
    f = tmp[5];
    g = tmp[6];
    h = tmp[7];

    for (int i = 0; i < 64; i++) {
        _s0 = e0(a);
        _maj = maj(a,b,c);
        _t2 = safe_add(_s0, _maj);
        _s1 = e1(e);
        _ch = ch(e, f, g);
        _t1 = safe_add(safe_add(safe_add(safe_add(h, _s1), _ch), K[i]), w[i]);

        h = g; g = f; f = e;
        e = safe_add(d, _t1);
        d = c; c = b; b = a;
        a = safe_add(_t1, _t2);
    }

    tmp[0] = safe_add(a, tmp[0]);
    tmp[1] = safe_add(b, tmp[1]);
    tmp[2] = safe_add(c, tmp[2]);
    tmp[3] = safe_add(d, tmp[3]);
    tmp[4] = safe_add(e, tmp[4]);
    tmp[5] = safe_add(f, tmp[5]);
    tmp[6] = safe_add(g, tmp[6]);
    tmp[7] = safe_add(h, tmp[7]);

    for (int i = 0; i < 8; i++) {
        key_hash[i] = tmp[i];
    }

    //Workaround for B[x]
    for(int i = 0; i < 8; i++) {
        if(i == x) {
            gl_FragColor = toRGBA(tmp[i]);
        }
    }
}
