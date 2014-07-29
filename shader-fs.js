#ifdef GL_ES
	precision highp float;
#endif

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
    if (x >= 32) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        return;
    }

    vec2 key_hash[16]; /* Our SHA-256 hash */

    vec2 nonced_header[20]; /* Header with nonce */
    set_nonce_to_header(nonced_header, header, base_nonce);

    vec2 P[32]; /* Padded SHA-256 message */
    pad_the_header(P, nonced_header);

    //Workaround for B[x]
    for(int i = 0; i < 32; i++) {
        if(i == x) {
            gl_FragColor = toRGBA(P[i]);
        }
    }
}
