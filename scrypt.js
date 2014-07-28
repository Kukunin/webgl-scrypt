function initializeGl() {
    canvas = document.createElement('canvas');
    if (debug || true) document.body.appendChild(canvas)
    canvas.height = 1;
    canvas.width = threads;

    var names = [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ],
        gl = null;

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

    return gl;
}

function loadResource(n) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", n, false);
    xhr.send(null);
    var x = xhr.responseText;
    return x;
};

function setupShaders(gl) {
    var program = gl.createProgram(),
        vShader = gl.createShader(gl.VERTEX_SHADER),
        vShaderSource = loadResource("shader-vs.js"),
        fShader = gl.createShader(gl.FRAGMENT_SHADER),
        fShaderSource = loadResource("shader-fs.js");

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
    gl.useProgram(program);
//
    var vertices = new Float32Array([
        1, 1,
       -1, 1,
        1,-1,
       -1,-1
    ]), //Square to cover whole canvas
        vertexPositionLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(vertexPositionLoc);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(vertexPositionLoc, 2, gl.FLOAT, false, 0, 0);

    return {};
}
$(function() {
    var gl = initializeGl();
    var locations = setupShaders(gl);

    var buf = new Uint8Array(threads * 1 * 4);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.readPixels(0, 0, threads, 1, gl.RGBA, gl.UNSIGNED_BYTE, buf);

    console.log(buf);
});
