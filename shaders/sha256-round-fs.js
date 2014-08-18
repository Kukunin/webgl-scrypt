precision mediump float;

uniform sampler2D uSampler;
varying vec2 vTextCoord;

void main () {
    gl_FragColor = texture2D(uSampler, vec2(vTextCoord.s, vTextCoord.t));
}
