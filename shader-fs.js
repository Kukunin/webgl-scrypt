precision mediump float;

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * 1024.) + c.x;
    float offset = mod(position, 65984.);
    float block = floor(position / 65984.);

    if ( 1048576. < (block + 1.) * 65984. ) {
        discard;
        return;
    }


    if ( offset <= 66. ) {
        gl_FragColor = vec4(0., 1., 0., 1.);
    } else if ( offset <= 130. ) {
        gl_FragColor = vec4(1., 0., 0., 1.);
    } else if ( offset < 65666. ) {
        gl_FragColor = vec4(1., 0., 1., 1.);
    } else {
    // if ( c.y == 1. ) {
    //     gl_FragColor = vec4(0., 1., 0., 1.);
    // } else {
        gl_FragColor = vec4(0., 0., 0., 1.);
    }
}
