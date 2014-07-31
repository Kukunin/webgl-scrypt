attribute vec2 aPosition;
varying vec2 vTextCoord;

void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTextCoord = (aPosition * 0.5) + 0.5;
}
