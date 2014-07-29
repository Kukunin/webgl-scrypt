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

uniform vec2 base_nonce[2];
uniform vec2 header[20];	/* Header of the block */

void main () {
    /* Chunk of debug code to ouput the full result in different pixels */
    int x = int(gl_FragCoord.x);
    if (x >= 32) {
        gl_FragColor = vec4(0., 0., 0., 1.);
        return;
    }

    vec2 H[16]; /* Our SHA-256 hash */
    vec2 P[32]; /* Padded SHA-256 message */

    vec2 B[20]; /* Header with nonce */
    /* Copy header without nonce */
    for(int i = 0; i < 19; i++) {
        B[i] = header[i];
    }
    /* Set nonce */
    B[19] = vec2(
        (base_nonce[1].y*256.) + base_nonce[1].x,
        (base_nonce[0].y*256.) + base_nonce[0].x
    );

    /* Create padded message for SHA256 */
    for(int i = 0; i < 20; i++) {
        P[i] = B[i];
    }
    // Add 1 bit to the end of the message
    P[20] = vec2(32768., 0.);
    // Add the size of the message in bits
    // Header is always 80 byte, so size is 640 bits
    P[31] = vec2(0., 640.);

    //Workaround for B[x]
    for(int i = 0; i < 32; i++) {
        if(i == x) {
            gl_FragColor = toRGBA(P[i]);
        }
    }
}
