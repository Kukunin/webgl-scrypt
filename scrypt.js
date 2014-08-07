/* SHA-256 related stuff */
var h =  [0x6a09, 0xe667, 0xbb67, 0xae85,
          0x3c6e, 0xf372, 0xa54f, 0xf53a,
          0x510e, 0x527f, 0x9b05, 0x688c,
          0x1f83, 0xd9ab, 0x5be0, 0xcd19];

var k = new Uint8Array([
          0x42, 0x8a, 0x2f, 0x98, 0x71, 0x37, 0x44, 0x91,
          0xb5, 0xc0, 0xfb, 0xcf, 0xe9, 0xb5, 0xdb, 0xa5,
          0x39, 0x56, 0xc2, 0x5b, 0x59, 0xf1, 0x11, 0xf1,
          0x92, 0x3f, 0x82, 0xa4, 0xab, 0x1c, 0x5e, 0xd5,
          0xd8, 0x07, 0xaa, 0x98, 0x12, 0x83, 0x5b, 0x01,
          0x24, 0x31, 0x85, 0xbe, 0x55, 0x0c, 0x7d, 0xc3,
          0x72, 0xbe, 0x5d, 0x74, 0x80, 0xde, 0xb1, 0xfe,
          0x9b, 0xdc, 0x06, 0xa7, 0xc1, 0x9b, 0xf1, 0x74,
          0xe4, 0x9b, 0x69, 0xc1, 0xef, 0xbe, 0x47, 0x86,
          0x0f, 0xc1, 0x9d, 0xc6, 0x24, 0x0c, 0xa1, 0xcc,
          0x2d, 0xe9, 0x2c, 0x6f, 0x4a, 0x74, 0x84, 0xaa,
          0x5c, 0xb0, 0xa9, 0xdc, 0x76, 0xf9, 0x88, 0xda,
          0x98, 0x3e, 0x51, 0x52, 0xa8, 0x31, 0xc6, 0x6d,
          0xb0, 0x03, 0x27, 0xc8, 0xbf, 0x59, 0x7f, 0xc7,
          0xc6, 0xe0, 0x0b, 0xf3, 0xd5, 0xa7, 0x91, 0x47,
          0x06, 0xca, 0x63, 0x51, 0x14, 0x29, 0x29, 0x67,
          0x27, 0xb7, 0x0a, 0x85, 0x2e, 0x1b, 0x21, 0x38,
          0x4d, 0x2c, 0x6d, 0xfc, 0x53, 0x38, 0x0d, 0x13,
          0x65, 0x0a, 0x73, 0x54, 0x76, 0x6a, 0x0a, 0xbb,
          0x81, 0xc2, 0xc9, 0x2e, 0x92, 0x72, 0x2c, 0x85,
          0xa2, 0xbf, 0xe8, 0xa1, 0xa8, 0x1a, 0x66, 0x4b,
          0xc2, 0x4b, 0x8b, 0x70, 0xc7, 0x6c, 0x51, 0xa3,
          0xd1, 0x92, 0xe8, 0x19, 0xd6, 0x99, 0x06, 0x24,
          0xf4, 0x0e, 0x35, 0x85, 0x10, 0x6a, 0xa0, 0x70,
          0x19, 0xa4, 0xc1, 0x16, 0x1e, 0x37, 0x6c, 0x08,
          0x27, 0x48, 0x77, 0x4c, 0x34, 0xb0, 0xbc, 0xb5,
          0x39, 0x1c, 0x0c, 0xb3, 0x4e, 0xd8, 0xaa, 0x4a,
          0x5b, 0x9c, 0xca, 0x4f, 0x68, 0x2e, 0x6f, 0xf3,
          0x74, 0x8f, 0x82, 0xee, 0x78, 0xa5, 0x63, 0x6f,
          0x84, 0xc8, 0x78, 0x14, 0x8c, 0xc7, 0x02, 0x08,
          0x90, 0xbe, 0xff, 0xfa, 0xa4, 0x50, 0x6c, 0xeb,
          0xbe, 0xf9, 0xa3, 0xf7, 0xc6, 0x71, 0x78, 0xf2
]);

//Pixels
var salsa = new Uint8Array([
        //First part
        0, 4, 12, 8,     0, 3, 13, 9,
        0, 2, 14, 10,    0, 1, 15, 11,
        0, 1, 0,  12,    0, 4, 1,  13,
        0, 3, 2,  14,    0, 2, 3,  15,
        0, 2, 4,  0,     0, 1, 5,  1,
        0, 4, 6,  2,     0, 3, 7,  3,
        0, 3, 8,  4,     0, 2, 9,  5,
        0, 1, 10, 6,     0, 4, 11, 7,
        //Second part
        0, 4, 3,  2,     0, 1, 0,  3,
        0, 2, 1,  0,     0, 3, 2,  1,
        0, 3, 7,  6,     0, 4, 4,  7,
        0, 1, 5,  4,     0, 2, 6,  5,
        0, 2, 11, 10,    0, 3, 8,  11,
        0, 4, 9,  8,     0, 1, 10, 9,
        0, 1, 15, 14,    0, 2, 12, 15,
        0, 3, 13, 12,    0, 4, 14, 13
]);

var gl;
var _ = {
    buffers: {},
    framebuffers: {},
    textures: {},
    programs: {},

    COPY_MODE:   1,
    SUM_MODE:    2,
    XOR_MODE:    3,
    VALUE_MODE:  4,
    HWORK_MODE:  5,
    REVERT_MODE: 6,
    SCRYPT_MODE: 7,

    BLOCK_SIZE: 33012,
    TEXTURE_SIZE: 1024,

    TMP_HASH_OFFSET:        0,
    TMP_WORK_OFFSET:        8,
    NONCED_HEADER_OFFSET:   72,
    HEADER_HASH1_OFFSET:    92,
    PADDED_HEADER_OFFSET:   100,
    IKEY_OFFSET:            116,
    OKEY_OFFSET:            132,
    HMAC_KEY_HASH_OFFSET:   148,
    IKEY_HASH1_OFFSET:      156,
    OKEY_HASH1_OFFSET:      164,
    INITIAL_HASH_OFFSET:    172,
    TEMP_HASH_OFFSET:       180,
    FINAL_SCRYPT_OFFSET:    188,
    SCRYPT_X_OFFSET:        196,
    TMP_SCRYPT_X_OFFSET:    228,
    SCRYPT_V_OFFSET:        244
}
_.BLOCKS_PER_TEXTURE = Math.floor(_.TEXTURE_SIZE*_.TEXTURE_SIZE/_.BLOCK_SIZE);
_.SUBPIXEL = 1 / _.TEXTURE_SIZE; //Size of 0.5 pixel in float

function loadResource(n) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", n, false);
    xhr.send(null);
    var x = xhr.responseText;
    return x;
};

function initGL() {
    canvas = document.createElement('canvas');
    if (debug || true) document.body.appendChild(canvas)
    canvas.height = textureSize;
    canvas.width = textureSize;

    var names = [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ];

    for(var i in names) {
        try {
            gl = canvas.getContext(names[i], {
                preserveDrawingBuffer: true,
                antialias            : false,
            });
            if (gl) { break; }
        } catch (e) { }
    }

    if (!gl) {
        throw "Your browser doesn't support WebGL";
    }

    gl.clearColor ( 1.0, 1.0, 1.0, 1.0 );
    gl.clear ( gl.COLOR_BUFFER_BIT );
    gl.viewport(0, 0, canvas.width, canvas.height);

    _.context = gl;
}

function establishProgram(vertex_shader, fragment_shader) {
    var program = gl.createProgram(),
        vShader = gl.createShader(gl.VERTEX_SHADER),
        vShaderSource = loadResource(vertex_shader),
        fShader = gl.createShader(gl.FRAGMENT_SHADER),
        fShaderSource = loadResource(fragment_shader);

    gl.shaderSource(vShader, vShaderSource);
    gl.compileShader(vShader);
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(vShader);
    }
    gl.attachShader(program, vShader);

    gl.shaderSource(fShader, fShaderSource);
    gl.compileShader(fShader);
    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(fShader);
    }
    gl.attachShader(program, fShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }

    return program;
}

function initFramebuffers() {
    _.framebuffers.primary   = gl.createFramebuffer();
    _.framebuffers.secondary = gl.createFramebuffer();
}

function initTextures() {
    _.textures.salsa = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, _.textures.salsa);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    console.log(salsa.length);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, salsa);

    _.textures.K = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, _.textures.K);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, k);

    //Init two texture for ping ponging
    /* First texture */
    _.textures.primary = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, _.textures.primary);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, _.framebuffers.primary);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _.textures.primary, 0);

    /* Second texture */
    _.textures.secondary = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, _.textures.secondary);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, _.framebuffers.secondary);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, _.textures.secondary, 0);

    (function() {
        var pingpong = false;
        _.textures.swap = function() {
            if ( pingpong ) {
                _.textures.setPrimary();
            } else {
                _.textures.setSecondary();
            }
        }
        _.textures.setPrimary = function() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, _.framebuffers.secondary);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, _.textures.primary);

            pingpong = false;
        }

        _.textures.setSecondary = function() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, _.framebuffers.primary);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, _.textures.secondary);

            pingpong = true;
        }
    })();

    /* revert all to default */
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

/* Normalize function
* Converts from pixels to normalized float from -1 to 1
*/
function _n(points) {
    for(var i in points) {
        var x = points[i],
            nX = x / (_.TEXTURE_SIZE - 1),
            normalized = (nX * 2) - 1;

        //Add pixel correction for height coordinate
        if (i % 2 != 0) {
            var pixelCorrection = -1 * _.SUBPIXEL * normalized;
            normalized += pixelCorrection;
        }

        points[i] = normalized;
    }
    return new Float32Array(points);
}

function whatToRender(offset, length) {
    if(offset == "whole") {
        _.buffers.mode = gl.TRIANGLE_STRIP;
        _.buffers.size = 4;

        gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            1,  1,
           -1,  1,
            1, -1,
           -1, -1
        ]), gl.STATIC_DRAW);
    } else {
        var points = [];
        for(var i = 0; i < _.BLOCKS_PER_TEXTURE; i++) {
        // for(var i = 0; i < 2; i++) {
            var total = (i*_.BLOCK_SIZE)+offset;

            var start_height = Math.floor(total / _.TEXTURE_SIZE),
                start_width  = total % _.TEXTURE_SIZE,
                end_height   = Math.floor((total + length) / _.TEXTURE_SIZE);
                end_width    = (total + length) % _.TEXTURE_SIZE;

            //Start line point
            points.push(start_width);
            points.push(start_height);

            //If the end point on the same height
            if (start_height == end_height) {
                points.push(end_width);
                points.push(start_height);
            } else {
                //Add start height to the end of texture
                points.push(_.TEXTURE_SIZE - 1);
                points.push(start_height);

                start_height++;

                //Fill all lines before end_height
                while(start_height < end_height) {
                    points.push(0);
                    points.push(start_height);
                    points.push(_.TEXTURE_SIZE - 1);
                    points.push(start_height);

                    start_height++;
                }

                //Fill the line until end_with and end_height
                points.push(0);
                points.push(start_height);
                points.push(end_width);
                points.push(start_height);
            }
        }

        _.buffers.size = points.length / 2;
        _.buffers.mode = gl.LINES;

        gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, _n(points), gl.STATIC_DRAW);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initBuffers() {
    _.buffers.vertices = gl.createBuffer();
}

function initPrograms() {
    _.programs["init-sha256"] = initSHA256Program();
    _.programs["fill-sha256-work"] = fillSHA256workProgram();
    _.programs["compute-sha256"] = computeSHA256Program();
    _.programs["copier"] = copierProgram();
    _.programs["salsa"] = salsaProgram();
    _.programs["texture-copy"] = textureCopyProgram();
}

/**
* Shader fills 8 initial hash words (32 bytes) with initial values from H array
* And fills 16 predefined work elements
*/
function initSHA256Program () {
    var locations = {};
    return program("shaders/init-sha256-fs.js", function(program) {
        locations = {
            H:       gl.getUniformLocation(program, "H"),
            header:  gl.getUniformLocation(program, "header"),
            nonce:   gl.getUniformLocation(program, "base_nonce")
        };
        return locations;
    }, function(once, header, nonce) {
        gl.uniform2fv(locations.header, header);
        gl.uniform2f(locations.nonce, nonce[0], nonce[1]);
        gl.uniform2fv(locations.H, h);

        gl.drawArrays(_.buffers.mode, 0, _.buffers.size);
    });
}

/**
* Shader uses 2 rounds to fill 64*4 bytes array with work.
* Call this shader 24 times (24*2 = 48 without 16 predefined elements) with rounds 0..24
*/
function fillSHA256workProgram() {
    var locations = {};
    return program("shaders/fill-sha256-work.fs.js", function(program) {
        locations = {
            round: gl.getUniformLocation(program, "round"),
            sampler: gl.getUniformLocation(program, "uSampler")
        };
        return locations;
    }, function(once, round) {
        gl.uniform1f(locations.round, round);
        gl.uniform1i(locations.sampler, 0);

        gl.drawArrays(_.buffers.mode, 0, _.buffers.size);

    });
}
/**
* Shader uses 2 rounds to execute main SHA256 computation
* Call this shader 32 times (32*2 = 64 total rounds) with rounds 0..31
*/
function computeSHA256Program() {
    var locations = {};
    return program("shaders/compute-sha256.fs.js", function(program) {
        locations = {
            round: gl.getUniformLocation(program, "round"),
            sampler: gl.getUniformLocation(program, "uSampler"),
            kSampler: gl.getUniformLocation(program, "kSampler")
        };
        return locations;
    }, function(once, round) {
        gl.uniform1f(locations.round, round);
        gl.uniform1i(locations.sampler, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, _.textures.K);
        gl.uniform1i(locations.kSampler, 1);

        gl.drawArrays(_.buffers.mode, 0, _.buffers.size);
    });
}

/**
* Shader copies N pixels from one source to the destination
*
* @arg source      Source offset
* @arg destination Destination offset
* @arg length      Length of pixels to copy
* @arg mode        Copy mode:
*       COPY_MODE  - Just copy pixels from src to dst
*       SUM_MODE   - Sum src and dst pixel and write to dst
*       XOR_MODE   - xor src and dst pixel and write to dst
*       VALUE_MODE - Set dst pixel with passed value
*       HWORK_MODE - hash finalization mode
*                       Copies length pixels from source, adds last bit
*                       and bits length in the end.
*                       Set bits length in VALUE uniform
*       REVERT_MODE  The same mode as COPY_MODE, but result value will convert
*                       Biggest byte becomes littest and vice versa
*       SCRYPT_MODE  Specific for scrypt mode. Find the correct offset in V array
*                       and xor it with X array
* @arg value       Value used in VALUE_MODE
* src_offset, dst_offset, length and mode flag
*/
function copierProgram() {
    var locations = {};
    return program("shaders/copier.fs.js", function(program) {
        locations = {
            source:      gl.getUniformLocation(program, "source"),
            destination: gl.getUniformLocation(program, "destination"),
            length:      gl.getUniformLocation(program, "length"),
            mode:        gl.getUniformLocation(program, "mode"),
            value:       gl.getUniformLocation(program, "value"),
            sampler:     gl.getUniformLocation(program, "uSampler"),
        };
        return locations;
    }, function(once, src, dst, length, mode, value) {
        gl.uniform1f(locations.source, src);
        gl.uniform1f(locations.destination, dst);
        gl.uniform1f(locations.length, length);
        gl.uniform1i(locations.mode, mode);
        gl.uniform1i(locations.sampler, 0);
        if( mode == _.VALUE_MODE ) {
            gl.uniform2f(locations.value, value[0], value[1]);
        }
        if( mode == _.HWORK_MODE ) {
            gl.uniform2f(locations.value, 0, value);
        }

        gl.drawArrays(_.buffers.mode, 0, _.buffers.size);
    });
}

/**
* Easiest shader that copies input texture to framebuffer
*/
function textureCopyProgram() {
    var locations = {};
    return program("shaders/texture-copy.fs.js", function(program) {
        locations = {
            sampler:     gl.getUniformLocation(program, "uSampler")
        };
        return locations;
    }, function(once) {
        gl.uniform1i(locations.sampler, 0);

        gl.drawArrays(_.buffers.mode, 0, _.buffers.size);
    });
}

/*
* Salsa shader to compute the salsa
* Due the complexity and unposibility to parallelism
* You have to call it 8 times per round. 4 rounds at all
*
* @arg part    Should be 0 or 1
* @arg round   Round from 0 to 3
*/
function salsaProgram() {
    var locations = {};
    return program("shaders/salsa.fs.js", function(program) {
        locations = {
            round:       gl.getUniformLocation(program, "round"),
            part:        gl.getUniformLocation(program, "part"),
            sampler:     gl.getUniformLocation(program, "uSampler"),
            kSampler:    gl.getUniformLocation(program, "kSampler")
        };
        return locations;
    }, function(once, part, round) {
        gl.uniform1i(locations.sampler, 0);
        gl.uniform1f(locations.part, part);
        gl.uniform1f(locations.round, round+1);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, _.textures.salsa);
        gl.uniform1i(locations.kSampler, 1);

        gl.drawArrays(_.buffers.mode, 0, _.buffers.size);
    });
}

function program(fragment_code, locations, render) {
    var program = establishProgram("shaders/default-vs.js", fragment_code);

    var locations = locations(program);
    var attributes = {
        position: gl.getAttribLocation(program, "aPosition")
    }

    var once = false;

    var ret = {
        P: program,
        L: locations,
        A: attributes,
        use: function() {
            gl.useProgram(program);
            once = false;
            return ret;
        },
        render: function() {
            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            render.apply(this, [once].concat(Array.prototype.slice.call(arguments, 0)));

            gl.disableVertexAttribArray(attributes.position);
        }
    };
    return ret;
}

function printBuffer(buf, length) {
    var result = [];
    for(var i = 0; i < length*4; i+=2) {
        result.push((buf[i]*256) + buf[i+1]);
    }
    return ___.uint16_array_to_hex(result);
}

function match(name, expected, actual) {
    if ( expected == actual) {
        console.log(name + " match");
    } else {
        console.log(name + " dismatch");
        console.log("Actual: ");
        console.log(actual);
        console.log("Expected: ");
        console.log(expected);
    }
}

/*
* Function to calculate sha256
* @target      Target offset. Computed hash will be copied there
* @dont_copy   Flag to set initial hash copying.
*               Set to true if initial hash is already set
*
* First 16 words should be already copied into sha256 work array
*/
function sha256_round(target, dont_copy) {
    /* Compute and fill work elements */
    _.programs['fill-sha256-work'].use();

    /* Fill work arrays */
    whatToRender(_.TMP_WORK_OFFSET + 16, 48);
    for(var i = 0; i < 24; i++) {
        _.textures.swap();
        _.programs['fill-sha256-work'].render(i);
    }
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    /* Compute the hash */
    whatToRender(_.TMP_HASH_OFFSET, 8);
    if (!dont_copy) {
        //Copy initial hash
        _.programs['copier'].use();
        _.textures.swap();
        _.programs['copier'].render(target, _.TMP_HASH_OFFSET, 8, _.COPY_MODE);
    }
    _.programs['compute-sha256'].use();
    for(var i = 0; i < 32; i++) {
        _.textures.swap();
        _.programs['compute-sha256'].render(i);
    }

    /* Copy the result to target block */
    _.programs['copier'].use();

    whatToRender(target, 8);
    _.textures.swap();
    _.programs['copier'].render(_.TMP_HASH_OFFSET, target, 8, _.SUM_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    _.programs['copier'].use();
}

function fillScryptX() {
    for( var i = 0; i < 4; i++ ) {
        /* TODO: iKey || Header round 1 is always the same */
        whatToRender(_.TMP_WORK_OFFSET, 16);
        _.textures.swap();
        _.programs['copier'].use().render(_.NONCED_HEADER_OFFSET, _.TMP_WORK_OFFSET, 16);
        _.textures.swap();
        _.programs['texture-copy'].use().render();

        whatToRender(_.TEMP_HASH_OFFSET, 8);
        _.textures.swap();
        _.programs['copier'].use().render(_.IKEY_HASH1_OFFSET, _.TEMP_HASH_OFFSET, 8);
        _.textures.swap();
        _.programs['texture-copy'].use().render();
        sha256_round(_.TEMP_HASH_OFFSET);

        /* iKey || Header+i final hash */
        whatToRender(_.TMP_WORK_OFFSET, 16);
        _.textures.swap();
        _.programs['copier'].use().render(_.NONCED_HEADER_OFFSET + 16, _.TMP_WORK_OFFSET, 5, _.HWORK_MODE, 1184);
        _.textures.swap();
        _.programs['copier'].render(null, _.TMP_WORK_OFFSET + 4, 1, _.VALUE_MODE, [0, i+1]);
        _.textures.swap();
        _.programs['texture-copy'].use().render();
        sha256_round(_.TEMP_HASH_OFFSET);

        /* oKey || h(iKey || Header+i) final hash */
        whatToRender(_.TMP_WORK_OFFSET, 16);
        _.textures.swap();
        _.programs['copier'].use().render(_.TEMP_HASH_OFFSET, _.TMP_WORK_OFFSET, 8, _.HWORK_MODE, 768);
        _.textures.swap();
        _.programs['texture-copy'].use().render();

        whatToRender(_.TEMP_HASH_OFFSET, 8);
        _.textures.swap();
        _.programs['copier'].use().render(_.OKEY_HASH1_OFFSET, _.TEMP_HASH_OFFSET, 8);
        _.textures.swap();
        _.programs['texture-copy'].use().render();
        sha256_round(_.TEMP_HASH_OFFSET);

        whatToRender(_.SCRYPT_X_OFFSET + (i*8), 8);
        _.textures.swap();
        _.programs['copier'].use().render(_.TEMP_HASH_OFFSET, _.SCRYPT_X_OFFSET + (i*8), 8, _.REVERT_MODE);
        _.textures.swap();
        _.programs['texture-copy'].use().render();
    }
}

function salsa8(di, xi) {
    /* Xor di 16 words with xi ones*/
    whatToRender(_.SCRYPT_X_OFFSET + di, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.SCRYPT_X_OFFSET + xi, _.SCRYPT_X_OFFSET + di, 16, _.XOR_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    /* Copy di 16 words to TMP */
    whatToRender(_.TMP_SCRYPT_X_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.SCRYPT_X_OFFSET + di, _.TMP_SCRYPT_X_OFFSET, 16, _.COPY_MODE);

    /* Generate salsa8 */
    _.programs['salsa'].use();
    for (var q = 0; q < 4; q++) {
        for (var j = 0; j < 2; j++) {
            for (var i = 0; i < 4; i++) {
                _.textures.swap();
                _.programs['salsa'].render(j, i);
            }
        }
    }

    whatToRender(_.SCRYPT_X_OFFSET);
    _.textures.swap();
    _.programs['copier'].use().render(_.TMP_SCRYPT_X_OFFSET, _.SCRYPT_X_OFFSET + di, 16, _.SUM_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
}

function computeX() {
    //iKey || X round 1
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.SCRYPT_X_OFFSET, _.TMP_WORK_OFFSET, 16, _.REVERT_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    whatToRender(_.TEMP_HASH_OFFSET, 8);
    _.textures.swap();
    _.programs['copier'].use().render(_.IKEY_HASH1_OFFSET, _.TEMP_HASH_OFFSET, 8);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
    sha256_round(_.TEMP_HASH_OFFSET);

    //iKey || X round 2
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.SCRYPT_X_OFFSET + 16, _.TMP_WORK_OFFSET, 16, _.REVERT_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
    sha256_round(_.TEMP_HASH_OFFSET);


    //iKey || X round 3
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.SCRYPT_X_OFFSET, _.TMP_WORK_OFFSET, 1, _.HWORK_MODE, 1568);
    _.textures.swap();
    _.programs['copier'].render(null, _.TMP_WORK_OFFSET, 1, _.VALUE_MODE, [0, 1]);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
    sha256_round(_.TEMP_HASH_OFFSET);

    /* oKey || h(iKey || X) final hash */
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.TEMP_HASH_OFFSET, _.TMP_WORK_OFFSET, 8, _.HWORK_MODE, 768);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    whatToRender(_.TEMP_HASH_OFFSET, 8);
    _.textures.swap();
    _.programs['copier'].use().render(_.OKEY_HASH1_OFFSET, _.TEMP_HASH_OFFSET, 8);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
    sha256_round(_.TEMP_HASH_OFFSET);

    whatToRender(_.FINAL_SCRYPT_OFFSET, 8);
    _.textures.swap();
    _.programs['copier'].use().render(_.TEMP_HASH_OFFSET, _.FINAL_SCRYPT_OFFSET, 8);
}

$(function() {
    initGL();
    initBuffers();
    initFramebuffers();
    initTextures();
    initPrograms();

    var buf = new Uint8Array(128 * 1 * 4);

    console.log("Headers is " + header);
    var header_bin = ___.hex_to_uint16_array(header);

    console.log("Nonce is " + nonce);
    var nonce_bin = ___.hex_to_uint16_array(nonce.toString(16));

    var startTime = (new Date()).getTime();

    /* Fill both textures with initial values */
    whatToRender(0, 180);
    _.programs['init-sha256'].use();
    _.textures.swap();
    _.programs['init-sha256'].render(header_bin.slice(0, 38), nonce_bin);

    _.textures.swap();
    _.programs['texture-copy'].use().render();

    /* initial tests */
    gl.readPixels(_.TMP_HASH_OFFSET, 0, 24, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Initial round", "6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd1902000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d559649", printBuffer(buf, 24));
    gl.readPixels(_.NONCED_HEADER_OFFSET, 0, 20, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Nonced header", "02000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d5596498ba5f869f139d55346e2021b00039bfc", printBuffer(buf, 20));
    gl.readPixels(_.PADDED_HEADER_OFFSET, 0, 16, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Padded header", "8ba5f869f139d55346e2021b00039bfc800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280", printBuffer(buf, 16));
    gl.readPixels(_.IKEY_OFFSET, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("iKey and oKey masks", "363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636365c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c", printBuffer(buf, 32));
    gl.readPixels(_.IKEY_HASH1_OFFSET, 0, 16, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("iKey and oKey initial hashes", "6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd196a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd19", printBuffer(buf, 16));

    /* First round for key hash */
    sha256_round(_.HEADER_HASH1_OFFSET, true);
    gl.readPixels(_.HEADER_HASH1_OFFSET, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Header base hash", "fd4fc824af9db9c0d882e8d70fd5d4a163ab22add3b7cd6dc336050003deca6e", printBuffer(buf, 8));

    /* Final round for key hash */
    //Copy first round hash to destination position
    whatToRender(_.HMAC_KEY_HASH_OFFSET, 8);
    _.textures.swap();
    _.programs['copier'].render(_.HEADER_HASH1_OFFSET, _.HMAC_KEY_HASH_OFFSET, 8, _.COPY_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    //Copy padded header last part to work arrays
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.programs['copier'].use().render(_.PADDED_HEADER_OFFSET, _.TMP_WORK_OFFSET, 16, _.COPY_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    sha256_round(_.HMAC_KEY_HASH_OFFSET);

    gl.readPixels(_.HMAC_KEY_HASH_OFFSET, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Final hash", "54e2fc0ab1d0c524d24ee13c0dee324776c878d419344ac35b995640eab1371c", printBuffer(buf, 8));

    whatToRender(_.IKEY_OFFSET, 32);
    /* Create iKey */
    _.textures.swap();
    _.programs['copier'].render(_.HMAC_KEY_HASH_OFFSET, _.IKEY_OFFSET, 8, _.XOR_MODE);

    /* Create oKey */
    _.textures.swap();
    _.programs['copier'].render(_.HMAC_KEY_HASH_OFFSET, _.OKEY_OFFSET, 8, _.XOR_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();

    gl.readPixels(_.IKEY_OFFSET, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("iKey/oKey", "62d4ca3c87e6f312e478d70a3bd8047140fe4ee22f027cf56daf6076dc87012a363636363636363636363636363636363636363636363636363636363636363608bea056ed8c99788e12bd6051b26e1b2a9424884568169f07c50a1cb6ed6b405c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c", printBuffer(buf, 32));

    /* Create iKey initial hash */
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].use().render(_.IKEY_OFFSET, _.TMP_WORK_OFFSET, 16, _.COPY_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
    sha256_round(_.IKEY_HASH1_OFFSET);
    gl.readPixels(_.IKEY_HASH1_OFFSET, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("iKey base hash", "1810219db381a5578d2a3163f1c8300d31dffbcd47d7cad0c2f2be550f287816", printBuffer(buf, 8));

    /* Create oKey initial hash */
    whatToRender(_.TMP_WORK_OFFSET, 16);
    _.textures.swap();
    _.programs['copier'].render(_.OKEY_OFFSET, _.TMP_WORK_OFFSET, 16, _.COPY_MODE);
    _.textures.swap();
    _.programs['texture-copy'].use().render();
    sha256_round(_.OKEY_HASH1_OFFSET);
    gl.readPixels(_.OKEY_HASH1_OFFSET, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("oKey base hash", "14d07616f180c5531ea198c14c20997445b7cf0cfc90d3650e59c6a1af3626a2", printBuffer(buf, 8));

    fillScryptX();
    gl.readPixels(_.SCRYPT_X_OFFSET, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Scrypt X", "65e8bba22ac94d38e28aa9b7f3005501abb5bad0a01ddd9e0ff0b241cea4b85163a5c4366f372bb6aff7ecf17a377087dfa2f06185cccfc5454fa183b0a61179ce4a765393e2605646d993b7348dc902203e59f65510feb509c448cf12895a6e228989e52be2fc021ca36fd4d8342ecaabd4fe15feada69d114728f4dd77033c", printBuffer(buf, 32));

    for(var i = 0; i < 1024; i++) {
        whatToRender(_.SCRYPT_V_OFFSET + (i*32), 32);
        _.textures.swap();
        _.programs['copier'].use().render(_.SCRYPT_X_OFFSET, _.SCRYPT_V_OFFSET + (i*32), 32, _.COPY_MODE);
        /* TODO avoid this copy operation. Fill V only for one texture */
        _.textures.swap();
        _.programs['texture-copy'].use().render();

        salsa8(0, 16);
        salsa8(16, 0);
    }

    gl.readPixels(_.SCRYPT_X_OFFSET, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("1024 salsa rounds", "df29c599f41f175b62737cd533e7adce586bbddaeaef3ba7ffd1be591dceaaba9822ef2d0438f00e992ab4bcf5cf0942ab0439bac73e761c2472db0cfc170b44fcf1cc3e8d03c71d4a3a54b63220d201d82ea8ed22b8a5138123adafb00c3d1a5640c5683766cc2fd2fd009531222e99e4fba360412ec7bbd70b327644a4aebb", printBuffer(buf, 32));

    gl.readPixels(_.SCRYPT_V_OFFSET, 0, 64, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("First 64 words of V", "65e8bba22ac94d38e28aa9b7f3005501abb5bad0a01ddd9e0ff0b241cea4b85163a5c4366f372bb6aff7ecf17a377087dfa2f06185cccfc5454fa183b0a61179ce4a765393e2605646d993b7348dc902203e59f65510feb509c448cf12895a6e228989e52be2fc021ca36fd4d8342ecaabd4fe15feada69d114728f4dd77033c6ccb9335ef55d24890a1dcb7c20e9f0a2cebec8625eb8dba76c81743149eac799fb212d323b424207119baf1158bbce20cbb9f4584db1da8d67e62fa2c2a2555a45dee8fe66edef4ca83cf19ea304f683ffa2a195d446e9b1240dda69decf03327eb8821fc1590da0a751a958c7476e6817a8dfe8a5f1bd7dc86500d89b3279c", printBuffer(buf, 64));

    whatToRender("whole");
    _.textures.swap();
    _.programs['texture-copy'].use().render();


    for(var i = 0; i < 1024; i++) {
        whatToRender(_.SCRYPT_X_OFFSET, 32);
        _.textures.swap();
        _.programs['copier'].use().render(null, _.SCRYPT_X_OFFSET, 32, _.SCRYPT_MODE);
        _.textures.swap();
        _.programs['texture-copy'].use().render();

        salsa8(0, 16);
        salsa8(16, 0);
    }

    gl.readPixels(_.SCRYPT_X_OFFSET, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Restore to X", "1f39e39a9d78e53adadafc030499012f187501d0b23ab166f39296dfe0b75b4bc9e91c0c40d8feafe4d543c8649b2ee145415ffbf90358e980c3d0c2aab0b7a1161b459166df29cb172ba08de0c522c71cd3bf416e0b6931eb39c18eaf0d49efa33f5693997eb9e90d37a1b76a4c887ac61beb75cafa253859f18f262680e5f6", printBuffer(buf, 32));

    computeX();

    whatToRender("whole");
    _.textures.swap();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    _.programs['texture-copy'].use().render();

    gl.readPixels(_.FINAL_SCRYPT_OFFSET, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("SCRYPT HASH", "c75792640f558294e4cb2dd70f3c898c47221f1803452ef8f42dd932a6180000", printBuffer(buf, 8));

    console.log("Scrypt hash is " + printBuffer(buf, 8));

    gl.readPixels(244 + _.FINAL_SCRYPT_OFFSET, 32, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("SECOND SCRYPT HASH", "1630ffa9ad818041406d49aa7ebf2bdda49f76d4d6cc0ac9d22b9e5aaed296c2", printBuffer(buf, 8));

    gl.readPixels(244 + _.NONCED_HEADER_OFFSET, 32, 20, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("SECOND Nonced header", "02000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d5596498ba5f869f139d55346e2021b01039bfc", printBuffer(buf, 20));

    var msecTime = (((new Date()).getTime())-startTime);
    console.log("Running time: " + msecTime + "ms");
});
