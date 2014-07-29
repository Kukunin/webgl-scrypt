#ifdef GL_ES
	precision highp float;
#endif

uniform vec2 base_nonce[2];
uniform vec2 header[40];	/* Header of the block */

void main () {
    /* Chunk of debug code to ouput the full result in different pixels */
    int x = int(gl_FragCoord.x);
    if (x >= 64) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        return;
    }

    vec2 H[16]; /* Our SHA-256 hash */
    vec2 P[64]; /* Padded SHA-256 message */

    vec2 B[40]; /* Header with nonce */
    /* Copy header without nonce */
    for(int i = 0; i < 38; i++) {
        B[i] = header[i];
    }
    /* Set nonce */
    B[38] = base_nonce[1].yx;
    B[39] = base_nonce[0].yx;

    /* Create padded message for SHA256 */
    for(int i = 0; i < 40; i++) {
        P[i] = B[i];
    }
    // Add 1 bit to the end of the message
    P[40] = vec2(128., 0.);
    // Add the size of the message in bits
    // Header is always 80 byte, so size is 640 bits
    P[63] = vec2(2., 128.);

    //Workaround for B[x]
    for(int i = 0; i < 64; i++) {
        if(i == x) {
            gl_FragColor = vec4(P[i].x/255., P[i].y/255., 0., 0.);
        }
    }
}
