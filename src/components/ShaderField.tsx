import { useEffect, useRef } from "react";

/**
 * Lightweight WebGL field: slow, organic "growing" gradient in the Nourish palette.
 * - Pauses when offscreen or tab hidden
 * - Renders a single still frame with prefers-reduced-motion
 * - Falls back silently (CSS gradient behind it) when WebGL is unavailable
 */
type Variant = "hero" | "ambient" | "deep" | "sage";

const palettes: Record<Variant, [number[], number[], number[], number[]]> = {
  // base, accent1, accent2, highlight
  hero: [
    [0.98, 0.984, 0.968],
    [0.871, 0.914, 0.6],
    [0.62, 0.78, 0.64],
    [0.95, 0.86, 0.62],
  ],
  ambient: [
    [0.98, 0.984, 0.968],
    [0.93, 0.95, 0.88],
    [0.88, 0.93, 0.89],
    [0.97, 0.94, 0.86],
  ],
  deep: [
    [0.1, 0.22, 0.17],
    [0.16, 0.34, 0.26],
    [0.27, 0.45, 0.33],
    [0.62, 0.72, 0.36],
  ],
  sage: [
    [0.9, 0.93, 0.9],
    [0.86, 0.91, 0.72],
    [0.78, 0.87, 0.82],
    [0.95, 0.9, 0.76],
  ],
};

const vert = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const frag = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;uniform vec3 c3;uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*1.6;
 float tt=t*.045;
 vec2 q=vec2(fbm(p+tt),fbm(p+vec2(5.2,1.3)-tt));
 vec2 w=vec2(fbm(p+3.*q+vec2(1.7,9.2)+tt*1.3),fbm(p+3.*q+vec2(8.3,2.8)-tt));
 float f=fbm(p+2.5*w+(m-.5)*.6);
 vec3 col=mix(c0,c1,smoothstep(.25,.85,f));
 col=mix(col,c2,smoothstep(.35,.95,length(q))*.75);
 col=mix(col,c3,smoothstep(.6,1.,w.x)*.45);
 // soft contour lines, like a topographic map of the city
 float lines=abs(fract(f*9.)-.5);
 col=mix(col,c2*.92,(1.-smoothstep(0.,.035,lines))*.18*k);
 // gentle vignette toward base so text stays readable
 float v=smoothstep(1.25,.2,length(uv-vec2(.72,.45)));
 col=mix(c0,col,mix(.55,1.,v)*k);
 col+= (h(gl_FragCoord.xy+t)-.5)*.025;
 gl_FragColor=vec4(col,1.);
}`;

export default function ShaderField({
  variant = "ambient",
  intensity = 1,
  className = "",
}: {
  variant?: Variant;
  intensity?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
      preserveDrawingBuffer: false,
    });
    if (!gl) {
      canvas.style.display = "none";
      return;
    }
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.style.display = "none";
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const [c0, c1, c2, c3] = palettes[variant];
    gl.uniform3fv(u("c0"), c0);
    gl.uniform3fv(u("c1"), c1);
    gl.uniform3fv(u("c2"), c2);
    gl.uniform3fv(u("c3"), c3);
    gl.uniform1f(u("k"), intensity);
    const ur = u("r"),
      ut = u("t"),
      um = u("m");
    const mouse = [0.5, 0.5],
      target = [0.5, 0.5];
    const scale = 0.5; // render at half resolution; the field is soft anyway
    function resize() {
      const w = Math.max(1, Math.floor(canvas!.clientWidth * scale));
      const hgt = Math.max(1, Math.floor(canvas!.clientHeight * scale));
      if (canvas!.width !== w || canvas!.height !== hgt) {
        canvas!.width = w;
        canvas!.height = hgt;
        gl!.viewport(0, 0, w, hgt);
      }
      gl!.uniform2f(ur, w, hgt);
    }
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0,
      visible = true,
      start = performance.now() - Math.random() * 40000;
    function draw(now: number) {
      resize();
      mouse[0] += (target[0] - mouse[0]) * 0.04;
      mouse[1] += (target[1] - mouse[1]) * 0.04;
      gl!.uniform2f(um, mouse[0], mouse[1]);
      gl!.uniform1f(ut, (now - start) / 1000);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }
    function loop(now: number) {
      draw(now);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      target[0] = (e.clientX - b.left) / b.width;
      target[1] = 1 - (e.clientY - b.top) / b.height;
    };
    const onVis = () => {
      visible = !document.hidden;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    draw(performance.now());
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [variant, intensity]);
  return (
    <canvas
      ref={ref}
      className={`shader-field shader-${variant} ${className}`}
      aria-hidden="true"
    />
  );
}
