precision mediump float;

#define POW_2_08 256.0

vec4 toRGBA(vec2 arg) {
      float V = float(arg.x);
      float R = floor(V / POW_2_08);
      V -= R * POW_2_08;
      float G = V;
      V = float(arg.y);
      float B = floor(V / POW_2_08);
      V -= B * POW_2_08;
      float A = V;
      return vec4(R/255., G/255., B/255., A/255.);
}

uniform vec2 H[8];
uniform vec2 initial[16];

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * 1024.) + c.x;
    int offset = int(mod(position, 65984.));
    float block = floor(position / 65984.);

    if ( 1048576. < (block + 1.) * 65984. ) {
        discard;
        return;
    }

    if ( offset < 8 ) {
        for(int i = 0; i < 8; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i]);
            }
        }
    } else if ( offset < 24 ) {
        for(int i = 8; i < 24; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(initial[i-8]);
            }
        }
    } else if ( offset >= 72 && offset < 80 ) {
        for(int i = 72; i < 80; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-72]);
            }
        }
    } else {
        discard;
    }
}
