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

#define TMP_HASH_OFFSET          0
#define TMP_HASH_OFFSET_END      8
#define TMP_WORK_OFFSET          8
#define TMP_WORK_OFFSET_END      24
#define HEADER_HASH1_OFFSET      72
#define HEADER_HASH1_OFFSET_END  80
#define PADDED_HEADER_OFFSET     80
#define PADDED_HEADER_OFFSET_END 96
#define IKEY_OFFSET              96
#define IKEY_OFFSET_END          112
#define OKEY_OFFSET              112
#define OKEY_OFFSET_END          128
#define HMAC_KEY_HASH_OFFSET     128
#define HMAC_KEY_HASH_OFFSET_END 136
#define IKEY_HASH1_OFFSET        136
#define IKEY_HASH1_OFFSET_END    144
#define OKEY_HASH1_OFFSET        144
#define OKEY_HASH1_OFFSET_END    152
#define INITIAL_HASH_OFFSET      152
#define INITIAL_HASH_OFFSET_END  160

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

    if ( offset >= TMP_HASH_OFFSET && offset < TMP_HASH_OFFSET_END ) {
        for(int i = TMP_HASH_OFFSET; i < TMP_HASH_OFFSET_END; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-TMP_HASH_OFFSET]);
            }
        }
    } else if ( offset >= TMP_WORK_OFFSET && offset < TMP_WORK_OFFSET_END ) {
        for(int i = TMP_WORK_OFFSET; i < TMP_WORK_OFFSET_END; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(header[i-TMP_WORK_OFFSET]);
            }
        }
    } else if ( offset >= HEADER_HASH1_OFFSET && offset < HEADER_HASH1_OFFSET_END ) {
        for(int i = HEADER_HASH1_OFFSET; i < HEADER_HASH1_OFFSET_END; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-HEADER_HASH1_OFFSET]);
            }
        }
    } else if ( offset >= PADDED_HEADER_OFFSET && offset < PADDED_HEADER_OFFSET_END ) {
        if ( offset < PADDED_HEADER_OFFSET + 3 ) {
            //Copy rest three words
            for(int i = PADDED_HEADER_OFFSET; i < PADDED_HEADER_OFFSET + 3; i++) {
                if ( i == offset ) {
                    gl_FragColor = toRGBA(header[i+16-PADDED_HEADER_OFFSET]);
                }
            }
        } else if ( offset == PADDED_HEADER_OFFSET + 3 ) {
            //Set the nonce
            gl_FragColor = toRGBA(safe_add(base_nonce, vec2(0., block))).abgr;
        } else if ( offset == PADDED_HEADER_OFFSET + 4 ) {
            //last 1bit
            gl_FragColor = toRGBA(vec2(32768., 0.));
        } else if ( offset == PADDED_HEADER_OFFSET_END - 1 ) {
            //length of header in bits
            gl_FragColor = toRGBA(vec2(0., 640.));
        } else {
            gl_FragColor = vec4(0.);
        }
    } else if ( offset >= IKEY_OFFSET && offset < IKEY_OFFSET_END ) {
        gl_FragColor = toRGBA(vec2(Ox3636));
    } else if ( offset >= OKEY_OFFSET && offset < OKEY_OFFSET_END ) {
        gl_FragColor = toRGBA(vec2(Ox5c5c));
    } else if ( offset >= IKEY_HASH1_OFFSET && offset < IKEY_HASH1_OFFSET_END ) {
        for(int i = IKEY_HASH1_OFFSET; i < IKEY_HASH1_OFFSET_END; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-IKEY_HASH1_OFFSET]);
            }
        }
    //oKey hash initial values
    } else if ( offset >= OKEY_HASH1_OFFSET && offset < OKEY_HASH1_OFFSET_END ) {
        for(int i = OKEY_HASH1_OFFSET; i < OKEY_HASH1_OFFSET_END; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-OKEY_HASH1_OFFSET]);
            }
        }
    } else {
        discard;
    }
}
