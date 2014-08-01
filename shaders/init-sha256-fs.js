precision mediump float;

#define POW_2_08 256.0
#define Ox10000 65536.0

#define Ox5c5c 23644.0
#define Ox3636 13878.0

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


uniform vec2 H[8];
uniform vec2 header[19];
uniform vec2 base_nonce;

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * 1024.) + c.x;
    int offset = int(mod(position, 65984.));
    float block = floor(position / 65984.);

    if ( 1048576. < (block + 1.) * 65984. ) {
        discard;
        return;
    }

    //work SHA256 hash area
    if ( offset < 8 ) {
        for(int i = 0; i < 8; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i]);
            }
        }
    //SHA256 work elements
    } else if ( offset < 24 ) {
        for(int i = 8; i < 24; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(header[i-8]);
            }
        }
    //Header hash round 1
    } else if ( offset >= 72 && offset < 80 ) {
        for(int i = 72; i < 80; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-72]);
            }
        }
    //Padded and nonced header second part
    } else if ( offset >= 80 && offset < 96 ) {
        if ( offset < 83 ) {
            //Copy rest three words
            for(int i = 80; i < 83; i++) {
                if ( i == offset ) {
                    gl_FragColor = toRGBA(header[i-64]);
                }
            }
        } else if ( offset == 83 ) {
            //Set the nonce
            gl_FragColor = toRGBA(safe_add(base_nonce, vec2(0., block))).abgr;
        } else if ( offset == 84 ) {
            //last 1bit
            gl_FragColor = toRGBA(vec2(32768., 0.));
        } else if ( offset == 95 ) {
            //length of header in bits
            gl_FragColor = toRGBA(vec2(0., 640.));
        } else {
            gl_FragColor = vec4(0.);
        }
    //Mask for iKey
    } else if ( offset >= 96 && offset < 112 ) {
        gl_FragColor = toRGBA(vec2(Ox3636));
    //Mask for iKey
    } else if ( offset >= 112 && offset < 128 ) {
        gl_FragColor = toRGBA(vec2(Ox5c5c));
    //iKey hash initial values
    } else if ( offset >= 136 && offset < 144 ) {
        for(int i = 136; i < 144; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-136]);
            }
        }
    //oKey hash initial values
    } else if ( offset >= 144 && offset < 152 ) {
        for(int i = 144; i < 152; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-144]);
            }
        }
    } else {
        discard;
    }
}
