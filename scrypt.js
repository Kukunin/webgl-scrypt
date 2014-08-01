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

var gl;
var _ = {
    buffers: {},
    framebuffers: {},
    textures: {},
    programs: {},

    COPY_MODE:  1,
    SUM_MODE:   2,
    XOR_MODE:   3,
    VALUE_MODE: 4
}

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
            gl = canvas.getContext(names[i], {preserveDrawingBuffer: true});
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
    //Init two texture for ping ponging
    _.textures.K = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, _.textures.K);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 64, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, k);

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


function initBuffers() {
    //Convert pixel coordinate to vertex (-1, 1)
    var x = 1024;
    var nX = x / textureSize;
    var vX = (nX * 2) - 1

    var y = 2;
    var nY = y / textureSize;
    var vY = (nY * 2) - 1;

    var vertices = new Float32Array([
       //  1,  1,
       // -1,  1,
       //  1, -1,
       // -1, -1
         vX, -1,
        -1, -1,
         vX, vY,
        -1, vY
    ]); //Square to cover whole canvas

    _.buffers.vertices = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initPrograms() {
    _.programs["init-sha256"] = initSHA256Program();
    _.programs["fill-sha256-work"] = fillSHA256workProgram();
    _.programs["compute-sha256"] = computeSHA256Program();
    _.programs["copier"] = copierProgram();
}

/**
* Shader fills 8 initial hash words (32 bytes) with initial values from H array
* And fills 16 predefined work elements
*/
function initSHA256Program () {
    var program = establishProgram("shaders/default-vs.js", "shaders/init-sha256-fs.js");

    var locations = {
        H:       gl.getUniformLocation(program, "H"),
        header:  gl.getUniformLocation(program, "header"),
        nonce:   gl.getUniformLocation(program, "base_nonce")
    };
    var attributes = {
        position: gl.getAttribLocation(program, "aPosition")
    }

    return {
        P: program,
        L: locations,
        A: attributes,
        use: function() { gl.useProgram(program); },
        render: function(header, nonce) {
            gl.uniform2fv(locations.header, header);
            gl.uniform2f(locations.nonce, nonce[0], nonce[1]);
            gl.uniform2fv(locations.H, h);

            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(attributes.position);
        }
    };
}

/**
* Shader uses 2 rounds to fill 64*4 bytes array with work.
* Call this shader 24 times (24*2 = 48 without 16 predefined elements) with rounds 0..24
*/
function fillSHA256workProgram() {
    var program = establishProgram("shaders/default-vs.js", "shaders/fill-sha256-work.fs.js");

    var locations = {
        round: gl.getUniformLocation(program, "round"),
        sampler: gl.getUniformLocation(program, "uSampler")
    };
    var attributes = {
        position: gl.getAttribLocation(program, "aPosition")
    }

    return {
        P: program,
        L: locations,
        A: attributes,
        use: function() { gl.useProgram(program); },
        render: function(round) {
            gl.uniform1f(locations.round, round);

            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1i(locations.sampler, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(attributes.position);
        }
    };

}
/**
* Shader uses 2 rounds to execute main SHA256 computation
* Call this shader 32 times (32*2 = 64 total rounds) with rounds 0..31
*/
function computeSHA256Program() {
    var program = establishProgram("shaders/default-vs.js", "shaders/compute-sha256.fs.js");

    var locations = {
        round: gl.getUniformLocation(program, "round"),
        sampler: gl.getUniformLocation(program, "uSampler"),
        kSampler: gl.getUniformLocation(program, "kSampler")
    };
    var attributes = {
        position: gl.getAttribLocation(program, "aPosition")
    }

    return {
        P: program,
        L: locations,
        A: attributes,
        use: function() { gl.useProgram(program); },
        render: function(round) {
            gl.uniform1f(locations.round, round);

            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1i(locations.sampler, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, _.textures.K);
            gl.uniform1i(locations.kSampler, 1);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(attributes.position);
        }
    };

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
* @arg value       Value used in VALUE_MODE
* src_offset, dst_offset, length and mode flag
*/
function copierProgram() {
    var program = establishProgram("shaders/default-vs.js", "shaders/copier.fs.js");

    var locations = {
        source:      gl.getUniformLocation(program, "source"),
        destination: gl.getUniformLocation(program, "destination"),
        length:      gl.getUniformLocation(program, "length"),
        mode:        gl.getUniformLocation(program, "mode"),
        value:       gl.getUniformLocation(program, "value"),
        sampler:     gl.getUniformLocation(program, "uSampler"),
    };
    var attributes = {
        position: gl.getAttribLocation(program, "aPosition")
    }

    return {
        P: program,
        L: locations,
        A: attributes,
        use: function() { gl.useProgram(program); },
        render: function(src, dst, length, mode, value) {
            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(locations.source, src);
            gl.uniform1f(locations.destination, dst);
            gl.uniform1f(locations.length, length);
            gl.uniform1i(locations.mode, mode);
            gl.uniform1i(locations.sampler, 0);
            if( mode == _.VALUE_MODE ) {
                gl.uniform2f(locations.value, value[0], value[1]);
            }

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(attributes.position);
        }
    };
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

    _.textures.swap();
    _.programs['init-sha256'].use();
    _.programs['init-sha256'].render(header_bin.slice(0, 38), nonce_bin);

    gl.readPixels(0, 0, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Initial round", "6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd1902000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d5596490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd19", printBuffer(buf, 80));

    gl.readPixels(80, 0, 16, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Padded header", "8ba5f869f139d55346e2021b00039bfc800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280", printBuffer(buf, 16));

    gl.readPixels(96, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("iKey and oKey masks", "363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636363636365c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c", printBuffer(buf, 32));

    _.programs['fill-sha256-work'].use();

    for(var i = 0; i < 24; i++) {
        _.textures.swap();
        _.programs['fill-sha256-work'].render(i);
    }

    gl.readPixels(0, 0, 80, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    match("Fill work array", "6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd1902000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d559649132969c1ea9d2b5fc66142e4286085f9a809188e1204725d5679a7f0990ee0b0ff4f1190994e0ec53cde910f4f5f765de6567a992c59a1fc3366dcb41ba268c94a89248822f0ddeea2aae349d26c04c5a73bcc704bd9e9badbfb81d6a803e3e7eed17376873fb43b161ab8b2d4f6d995d327c01d9949ac1bff15a9c23f02ee9f2310307fa361b07f26b29ace9a61ea6a663f0fc66a0b4b49a3aa724b44c56638945edb519680528deeb6d5ea302e86293cc3d327c13df5c75a0cf0d50e09105f6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd19", printBuffer(buf, 80));

    _.programs['compute-sha256'].use();


    for(var i = 0; i < 32; i++) {
        _.textures.swap();
        _.programs['compute-sha256'].render(i);
    }

    gl.readPixels(0, 0, 80, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    // f577ed68bb
    match("Hash computing", "9345e1bdf4360b3b9c13f5656a85df67129cd02e38b264e1a3b22b55a7fdfd5502000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d559649132969c1ea9d2b5fc66142e4286085f9a809188e1204725d5679a7f0990ee0b0ff4f1190994e0ec53cde910f4f5f765de6567a992c59a1fc3366dcb41ba268c94a89248822f0ddeea2aae349d26c04c5a73bcc704bd9e9badbfb81d6a803e3e7eed17376873fb43b161ab8b2d4f6d995d327c01d9949ac1bff15a9c23f02ee9f2310307fa361b07f26b29ace9a61ea6a663f0fc66a0b4b49a3aa724b44c56638945edb519680528deeb6d5ea302e86293cc3d327c13df5c75a0cf0d50e09105f6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd19", printBuffer(buf, 80));

    _.programs['copier'].use();

    _.textures.swap();
    _.programs['copier'].render(0, 72, 8, _.SUM_MODE); //Add computed hash to destination

    gl.readPixels(0, 0, 80, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Copying", "9345e1bdf4360b3b9c13f5656a85df67129cd02e38b264e1a3b22b55a7fdfd5502000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d559649132969c1ea9d2b5fc66142e4286085f9a809188e1204725d5679a7f0990ee0b0ff4f1190994e0ec53cde910f4f5f765de6567a992c59a1fc3366dcb41ba268c94a89248822f0ddeea2aae349d26c04c5a73bcc704bd9e9badbfb81d6a803e3e7eed17376873fb43b161ab8b2d4f6d995d327c01d9949ac1bff15a9c23f02ee9f2310307fa361b07f26b29ace9a61ea6a663f0fc66a0b4b49a3aa724b44c56638945edb519680528deeb6d5ea302e86293cc3d327c13df5c75a0cf0d50e09105ffd4fc824af9db9c0d882e8d70fd5d4a163ab22add3b7cd6dc336050003deca6e", printBuffer(buf, 80));

    /* Prepare to next round of SHA-256 */
    _.textures.swap();
    //Copy first round hash to initial position
    _.programs['copier'].render(72, 0, 8, _.COPY_MODE);
    _.textures.swap();
    //Copy first round hash to destination position
    _.programs['copier'].render(72, 128, 8, _.COPY_MODE);
    _.textures.swap();
    //Header padded last part to work arrays
    _.programs['copier'].render(80, 8, 16, _.COPY_MODE);

    gl.readPixels(0, 0, 24, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Prepare to next round", "fd4fc824af9db9c0d882e8d70fd5d4a163ab22add3b7cd6dc336050003deca6e8ba5f869f139d55346e2021b00039bfc800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000280", printBuffer(buf, 24));

    /* Compute and fill work elements */
    _.programs['fill-sha256-work'].use();

    for(var i = 0; i < 24; i++) {
        _.textures.swap();
        _.programs['fill-sha256-work'].render(i);
    }

    /* Compute the hash */
    _.programs['compute-sha256'].use();

    for(var i = 0; i < 32; i++) {
        _.textures.swap();
        _.programs['compute-sha256'].render(i);
    }

    /* Copy the result to key_hash block */
    _.programs['copier'].use();

    _.textures.swap();
    _.programs['copier'].render(0, 128, 8, _.SUM_MODE);

    gl.readPixels(128, 0, 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("Final hash", "54e2fc0ab1d0c524d24ee13c0dee324776c878d419344ac35b995640eab1371c", printBuffer(buf, 8));

    /* Create iKey */
    _.textures.swap();
    _.programs['copier'].render(128, 96, 8, _.XOR_MODE);

    /* Create oKey */
    _.textures.swap();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    _.programs['copier'].render(128, 112, 8, _.XOR_MODE);

    gl.readPixels(96, 0, 32, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    match("iKey/oKey", "62d4ca3c87e6f312e478d70a3bd8047140fe4ee22f027cf56daf6076dc87012a363636363636363636363636363636363636363636363636363636363636363608bea056ed8c99788e12bd6051b26e1b2a9424884568169f07c50a1cb6ed6b405c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c", printBuffer(buf, 32));

    var msecTime = (((new Date()).getTime())-startTime);
    console.log("Running time: " + msecTime + "ms");
});
