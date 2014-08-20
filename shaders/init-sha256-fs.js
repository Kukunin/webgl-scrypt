uniform vec2 H[8];
uniform vec2 header[19];
uniform vec2 base_nonce;

void main () {
    vec4 c = gl_FragCoord - 0.5;
    float position = (c.y * TEXTURE_SIZE) + c.x;
    int offset = int(mod(position, BLOCK_SIZE));
    float block = floor(position / BLOCK_SIZE);

    if ( TEXTURE_SIZE * TEXTURE_SIZE < (block + 1.) * BLOCK_SIZE ) {
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
    } else if ( offset >= NONCED_HEADER_OFFSET && offset < NONCED_HEADER_OFFSET_END ) {
        if ( offset < NONCED_HEADER_OFFSET_END - 1 ) {
            //Copy whole header without last word
            for(int i = NONCED_HEADER_OFFSET; i < NONCED_HEADER_OFFSET_END - 1; i++) {
                if ( i == offset ) {
                    gl_FragColor = toRGBA(header[i-NONCED_HEADER_OFFSET]);
                }
            }
        } else  {
            //Set the nonce
            gl_FragColor = toRGBA(safe_add(base_nonce, vec2(0., block))).abgr;
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
    } else if ( offset >= INITIAL_HASH_OFFSET && offset < INITIAL_HASH_OFFSET_END ) {
        for(int i = INITIAL_HASH_OFFSET; i < INITIAL_HASH_OFFSET_END; i++) {
            if ( i == offset ) {
                gl_FragColor = toRGBA(H[i-INITIAL_HASH_OFFSET]);
            }
        }
    } else {
        discard;
    }
}
