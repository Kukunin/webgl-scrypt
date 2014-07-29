#ifdef GL_ES
	precision highp float;
#endif

uniform vec2 base_nonce[2];
uniform vec2 header[40];	/* Header of the block */

void main () {
    vec2 B[66];
    for(int i = 0; i < 38; i++) {
        B[i] = header[i];
    }
    B[38] = base_nonce[0];
    B[39] = base_nonce[1];

    int x = int(gl_FragCoord.x);
    if (x < 40) {
        for(int i = 0; i < 40; i++) {
            if(i == x) {
                gl_FragColor = vec4(B[i].x/255., B[i].y/255., 0., 0.);
            }
        }
    } else {
        gl_FragColor = vec4(0., 0., 0., 1.);
    }
}
