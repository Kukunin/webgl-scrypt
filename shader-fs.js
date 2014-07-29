#ifdef GL_ES
	precision highp float;
#endif

uniform vec2 header[40];	/* Header of the block */

void main () {
    int x = int(gl_FragCoord.x);
    if (x < 40) {
        for(int i = 0; i < 40; i++) {
            if(i == x) {
                gl_FragColor = vec4(header[i].x/255., header[i].y/255., 0., 0.);
            }
        }
    } else {
        gl_FragColor = vec4(0., 0., 0., 1.);
    }
}
