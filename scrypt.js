/* SHA-256 related stuff */
var h =  [0x6a09, 0xe667, 0xbb67, 0xae85,
          0x3c6e, 0xf372, 0xa54f, 0xf53a,
          0x510e, 0x527f, 0x9b05, 0x688c,
          0x1f83, 0xd9ab, 0x5be0, 0xcd19];

var k =  [0x428a, 0x2f98, 0x7137, 0x4491,
          0xb5c0, 0xfbcf, 0xe9b5, 0xdba5,
          0x3956, 0xc25b, 0x59f1, 0x11f1,
          0x923f, 0x82a4, 0xab1c, 0x5ed5,
          0xd807, 0xaa98, 0x1283, 0x5b01,
          0x2431, 0x85be, 0x550c, 0x7dc3,
          0x72be, 0x5d74, 0x80de, 0xb1fe,
          0x9bdc, 0x06a7, 0xc19b, 0xf174,
          0xe49b, 0x69c1, 0xefbe, 0x4786,
          0x0fc1, 0x9dc6, 0x240c, 0xa1cc,
          0x2de9, 0x2c6f, 0x4a74, 0x84aa,
          0x5cb0, 0xa9dc, 0x76f9, 0x88da,
          0x983e, 0x5152, 0xa831, 0xc66d,
          0xb003, 0x27c8, 0xbf59, 0x7fc7,
          0xc6e0, 0x0bf3, 0xd5a7, 0x9147,
          0x06ca, 0x6351, 0x1429, 0x2967,
          0x27b7, 0x0a85, 0x2e1b, 0x2138,
          0x4d2c, 0x6dfc, 0x5338, 0x0d13,
          0x650a, 0x7354, 0x766a, 0x0abb,
          0x81c2, 0xc92e, 0x9272, 0x2c85,
          0xa2bf, 0xe8a1, 0xa81a, 0x664b,
          0xc24b, 0x8b70, 0xc76c, 0x51a3,
          0xd192, 0xe819, 0xd699, 0x0624,
          0xf40e, 0x3585, 0x106a, 0xa070,
          0x19a4, 0xc116, 0x1e37, 0x6c08,
          0x2748, 0x774c, 0x34b0, 0xbcb5,
          0x391c, 0x0cb3, 0x4ed8, 0xaa4a,
          0x5b9c, 0xca4f, 0x682e, 0x6ff3,
          0x748f, 0x82ee, 0x78a5, 0x636f,
          0x84c8, 0x7814, 0x8cc7, 0x0208,
          0x90be, 0xfffa, 0xa450, 0x6ceb,
          0xbef9, 0xa3f7, 0xc671, 0x78f2];

var gl;
var _ = {
    buffers: {},
    framebuffers: {},
    textures: {},
    programs: {}
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
//     var x = 32;
//     var nX = x / textureSize;
//     var vX = (nX * 2) - 1
//
//     var y = 2;
//     var nY = y / textureSize;
//     var vY = (nY * 2) - 1;
// //
    var vertices = new Float32Array([
        1,  1,
       -1,  1,
        1, -1,
       -1, -1
        //  vX, -1,
        // -1, -1,
        //  vX, vY,
        // -1, vY
    ]); //Square to cover whole canvas

    _.buffers.vertices = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initPrograms() {
    _.programs["init-sha256"] = initSHA256Program();
    _.programs["sha256-round"] = sha256RoundProgram();
}

function initSHA256Program () {
    var program = establishProgram("shaders/default-vs.js", "shaders/init-sha256-fs.js");

    var locations = {
        H:       gl.getUniformLocation(program, "H"),
        initial: gl.getUniformLocation(program, "initial")
    };
    var attributes = {
        position: gl.getAttribLocation(program, "aPosition")
    }

    return {
        P: program,
        L: locations,
        A: attributes,
        use: function() { gl.useProgram(program); },
        render: function(initial) {
            gl.uniform2fv(locations.initial, initial);
            gl.uniform2fv(locations.H, h);

            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

            gl.disableVertexAttribArray(attributes.position);
        }
    };
}

function sha256RoundProgram() {
    var program = establishProgram("shaders/default-vs.js", "shaders/sha256-round-fs.js");

    var locations = {
        K:     gl.getUniformLocation(program, "K"),
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
            gl.uniform2fv(locations.K, k);

            gl.bindBuffer(gl.ARRAY_BUFFER, _.buffers.vertices);
            gl.enableVertexAttribArray(attributes.position);
            gl.vertexAttribPointer(attributes.position, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1i(locations.sampler, 0);

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

    var buf = new Uint8Array(80 * 1 * 4);

    console.log("Headers is " + header);
    var header_bin = ___.hex_to_uint16_array(header);

    _.textures.swap();
    _.programs['init-sha256'].use();
    _.programs['init-sha256'].render(header_bin.slice(0, 32));

    gl.readPixels(0, 0, 80, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    match("Initial round", "6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd1902000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d5596490000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd19", printBuffer(buf, 80));

    _.textures.swap();

    _.programs['sha256-round'].use();

    _.programs['sha256-round'].render(0);

    gl.readPixels(0, 0, 80, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    match("First round", "6a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd1902000000ff1fd715a981626682fd8d73afda09d825722d6ba5f665b1be6ed400242f7b650c3623c0f087fefdeefcd4c84d916a511551425fabaf52d55d559649132969c1ea9d2b5fc66142e4286085f9a809188e1204725d5679a7f0990ee0b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006a09e667bb67ae853c6ef372a54ff53a510e527f9b05688c1f83d9ab5be0cd19", printBuffer(buf, 80));

});
