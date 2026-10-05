import React, { useEffect, useRef, useState } from "react";

const MODEL_URL = "/models/VH_M_Heart.glb";
const BG = [0.035, 0.067, 0.098, 1];
const FALLBACK_TEXT = "3D heart model could not be loaded.";

const TYPE_INFO = {
  5120: { size: 1, ArrayType: Int8Array },
  5121: { size: 1, ArrayType: Uint8Array },
  5122: { size: 2, ArrayType: Int16Array },
  5123: { size: 2, ArrayType: Uint16Array },
  5125: { size: 4, ArrayType: Uint32Array },
  5126: { size: 4, ArrayType: Float32Array },
};

const TYPE_COMPONENTS = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
};

function readGlb(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 20 || view.getUint32(0, true) !== 0x46546c67) {
    throw new Error("Invalid GLB header");
  }

  let offset = 12;
  let json = null;
  let binary = null;

  while (offset + 8 <= view.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    offset += 8;

    if (offset + chunkLength > view.byteLength) {
      throw new Error("Invalid GLB chunk length");
    }

    if (chunkType === 0x4e4f534a) {
      const bytes = new Uint8Array(buffer, offset, chunkLength);
      json = JSON.parse(new TextDecoder().decode(bytes).trim());
    } else if (chunkType === 0x004e4942) {
      binary = new Uint8Array(buffer, offset, chunkLength);
    }

    offset += chunkLength;
  }

  if (!json || !binary) {
    throw new Error("GLB is missing JSON or binary data");
  }

  return { json, binary };
}

function accessorData(gltf, binary, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  if (!accessor) throw new Error(`Missing accessor ${accessorIndex}`);

  const viewDef = gltf.bufferViews?.[accessor.bufferView];
  if (!viewDef) throw new Error(`Missing bufferView for accessor ${accessorIndex}`);
  const typeInfo = TYPE_INFO[accessor.componentType];
  const componentCount = TYPE_COMPONENTS[accessor.type];
  if (!typeInfo || !componentCount) throw new Error(`Unsupported accessor ${accessorIndex}`);

  const start = (viewDef.byteOffset || 0) + (accessor.byteOffset || 0);
  const stride = viewDef.byteStride || typeInfo.size * componentCount;
  const ArrayType = typeInfo.ArrayType;
  const values = new Array(accessor.count * componentCount);

  if (start + Math.max(0, accessor.count - 1) * stride + typeInfo.size * componentCount > binary.byteLength) {
    throw new Error(`Accessor ${accessorIndex} exceeds GLB binary chunk`);
  }

  const raw = new DataView(binary.buffer, binary.byteOffset, binary.byteLength);

  function readComponent(byteOffset) {
    switch (accessor.componentType) {
      case 5120: return raw.getInt8(byteOffset);
      case 5121: return raw.getUint8(byteOffset);
      case 5122: return raw.getInt16(byteOffset, true);
      case 5123: return raw.getUint16(byteOffset, true);
      case 5125: return raw.getUint32(byteOffset, true);
      case 5126: return raw.getFloat32(byteOffset, true);
      default: throw new Error("Unsupported component type");
    }
  }

  for (let i = 0; i < accessor.count; i += 1) {
    const base = start + i * stride;
    for (let c = 0; c < componentCount; c += 1) {
      let value = readComponent(base + c * typeInfo.size);
      if (accessor.normalized && accessor.componentType !== 5126) {
        if (accessor.componentType === 5120 || accessor.componentType === 5122) {
          const max = accessor.componentType === 5120 ? 127 : 32767;
          value = Math.max(-1, value / max);
        } else {
          const max = accessor.componentType === 5121 ? 255 : accessor.componentType === 5123 ? 65535 : 4294967295;
          value /= max;
        }
      }
      values[i * componentCount + c] = value;
    }
  }

  return { values, componentCount, ArrayType };
}

function composeNodeMatrix(node) {
  if (node.matrix) return new Float32Array(node.matrix);

  const t = node.translation || [0, 0, 0];
  const r = node.rotation || [0, 0, 0, 1];
  const s = node.scale || [1, 1, 1];
  const [x, y, z, w] = r;
  const [sx, sy, sz] = s;

  const xx = x * x;
  const yy = y * y;
  const zz = z * z;
  const xy = x * y;
  const xz = x * z;
  const yz = y * z;
  const wx = w * x;
  const wy = w * y;
  const wz = w * z;

  return new Float32Array([
    (1 - 2 * (yy + zz)) * sx,
    (2 * (xy + wz)) * sx,
    (2 * (xz - wy)) * sx,
    0,
    (2 * (xy - wz)) * sy,
    (1 - 2 * (xx + zz)) * sy,
    (2 * (yz + wx)) * sy,
    0,
    (2 * (xz + wy)) * sz,
    (2 * (yz - wx)) * sz,
    (1 - 2 * (xx + yy)) * sz,
    0,
    t[0],
    t[1],
    t[2],
    1,
  ]);
}

function multiplyMat4(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[col * 4 + row] =
        a[row] * b[col * 4] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function transformPoint(matrix, x, y, z) {
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
  ];
}

function transformNormal(matrix, x, y, z) {
  const nx = matrix[0] * x + matrix[4] * y + matrix[8] * z;
  const ny = matrix[1] * x + matrix[5] * y + matrix[9] * z;
  const nz = matrix[2] * x + matrix[6] * y + matrix[10] * z;
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

function buildGeometry(gltf, binary) {
  const sceneIndex = gltf.scene ?? 0;
  const scene = gltf.scenes?.[sceneIndex];
  if (!scene?.nodes?.length) throw new Error("GLB contains no scene nodes");

  const parts = [];
  const mins = [Infinity, Infinity, Infinity];
  const maxs = [-Infinity, -Infinity, -Infinity];
  const identity = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

  function visitNode(nodeIndex, parentMatrix) {
    const node = gltf.nodes?.[nodeIndex];
    if (!node) return;
    const local = composeNodeMatrix(node);
    const world = multiplyMat4(parentMatrix, local);

    if (node.mesh !== undefined) {
      const mesh = gltf.meshes?.[node.mesh];
      for (const primitive of mesh?.primitives || []) {
        if (primitive.mode !== undefined && primitive.mode !== 4) continue;
        if (primitive.indices === undefined) continue;

        const position = accessorData(gltf, binary, primitive.attributes?.POSITION);
        const normal = primitive.attributes?.NORMAL !== undefined
          ? accessorData(gltf, binary, primitive.attributes.NORMAL)
          : { values: new Array(position.values.length).fill(0), componentCount: 3 };
        const color = primitive.attributes?.COLOR_0 !== undefined
          ? accessorData(gltf, binary, primitive.attributes.COLOR_0)
          : null;
        const indices = accessorData(gltf, binary, primitive.indices);

        const vertexCount = position.values.length / 3;
        const positions = new Float32Array(vertexCount * 3);
        const normals = new Float32Array(vertexCount * 3);
        const colors = new Float32Array(vertexCount * 4);

        for (let i = 0; i < vertexCount; i += 1) {
          const p = position.values.slice(i * 3, i * 3 + 3);
          const worldP = transformPoint(world, p[0], p[1], p[2]);
          positions.set(worldP, i * 3);
          mins[0] = Math.min(mins[0], worldP[0]);
          mins[1] = Math.min(mins[1], worldP[1]);
          mins[2] = Math.min(mins[2], worldP[2]);
          maxs[0] = Math.max(maxs[0], worldP[0]);
          maxs[1] = Math.max(maxs[1], worldP[1]);
          maxs[2] = Math.max(maxs[2], worldP[2]);

          const n = normal.values.slice(i * 3, i * 3 + 3);
          normals.set(transformNormal(world, n[0], n[1], n[2]), i * 3);

          if (color) {
            const cc = color.values.slice(i * color.componentCount, i * color.componentCount + color.componentCount);
            colors[i * 4] = cc[0] ?? 1;
            colors[i * 4 + 1] = cc[1] ?? colors[i * 4];
            colors[i * 4 + 2] = cc[2] ?? colors[i * 4];
            colors[i * 4 + 3] = cc[3] ?? 1;
          } else {
            colors.set([0.70, 0.22, 0.20, 1], i * 4);
          }
        }

        const indexArray = new Uint32Array(indices.values.length);
        for (let i = 0; i < indices.values.length; i += 1) indexArray[i] = indices.values[i];

        parts.push({ positions, normals, colors, indices: indexArray });
      }
    }

    for (const child of node.children || []) visitNode(child, world);
  }

  for (const rootNode of scene.nodes) visitNode(rootNode, identity);

  if (!parts.length) throw new Error("No renderable triangle meshes found in GLB");

  const center = [
    (mins[0] + maxs[0]) / 2,
    (mins[1] + maxs[1]) / 2,
    (mins[2] + maxs[2]) / 2,
  ];
  const size = [maxs[0] - mins[0], maxs[1] - mins[1], maxs[2] - mins[2]];
  const largest = Math.max(...size) || 1;
  const scale = 2.45 / largest;

  for (const part of parts) {
    for (let i = 0; i < part.positions.length; i += 3) {
      part.positions[i] = (part.positions[i] - center[0]) * scale;
      part.positions[i + 1] = (part.positions[i + 1] - center[1]) * scale;
      part.positions[i + 2] = (part.positions[i + 2] - center[2]) * scale;
    }
  }

  return parts;
}

function makePerspective(out, fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

function normalize3(x, y, z) {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
}

function lookAt(out, eye, target, up) {
  let zx = eye[0] - target[0];
  let zy = eye[1] - target[1];
  let zz = eye[2] - target[2];
  [zx, zy, zz] = normalize3(zx, zy, zz);

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  [xx, xy, xz] = normalize3(xx, xy, xz);

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  out.set([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
    -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
    -(zx * eye[0] + zy * eye[1] + zz * eye[2]),
    1,
  ]);
  return out;
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create WebGL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || "shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(log);
  }
  return shader;
}

function createProgram(gl) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, `#version 300 es
    in vec3 aPosition;
    in vec3 aNormal;
    in vec4 aColor;
    uniform mat4 uViewProjection;
    out vec3 vNormal;
    out vec4 vColor;
    void main() {
      vNormal = normalize(aNormal);
      vColor = aColor;
      gl_Position = uViewProjection * vec4(aPosition, 1.0);
    }
  `);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, `#version 300 es
    precision highp float;
    in vec3 vNormal;
    in vec4 vColor;
    uniform vec3 uLight;
    out vec4 outColor;
    void main() {
      vec3 n = normalize(vNormal);
      float key = max(dot(n, normalize(uLight)), 0.0);
      float fill = 0.30 + 0.70 * key;
      float rim = pow(1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
      vec3 base = vColor.rgb;
      vec3 lit = base * fill + vec3(0.08, 0.11, 0.14) * rim;
      outColor = vec4(lit, vColor.a);
    }
  `);
  const program = gl.createProgram();
  if (!program) throw new Error("Could not create WebGL program");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) || "program linking failed";
    gl.deleteProgram(program);
    throw new Error(log);
  }
  return program;
}

function riskColor(probability) {
  if (!Number.isFinite(probability)) return [0.55, 0.64, 0.70, 0.85];
  if (probability >= 0.70) return [0.98, 0.20, 0.25, 1.0];
  if (probability >= 0.40) return [1.00, 0.62, 0.18, 1.0];
  return [0.22, 0.84, 0.65, 1.0];
}

function riskBand(probability) {
  if (!Number.isFinite(probability)) return "No prediction";
  if (probability >= 0.70) return "High";
  if (probability >= 0.40) return "Moderate";
  return "Lower";
}

function makeCoronaryPaths(resultMap) {
  const defs = [
    { id: "lad", name: "LAD", probability: resultMap.lad?.probability, points: [[0.02,0.92,0.24],[-0.01,0.62,0.29],[0.00,0.28,0.32],[0.02,-0.10,0.29],[0.03,-0.48,0.23]] },
    { id: "lcx", name: "LCX", probability: resultMap.lcx?.probability, points: [[-0.02,0.73,0.25],[-0.25,0.70,0.29],[-0.50,0.58,0.27],[-0.70,0.36,0.22],[-0.78,0.08,0.16]] },
    { id: "rca", name: "RCA", probability: resultMap.rca?.probability, points: [[0.22,0.62,0.26],[0.42,0.55,0.28],[0.58,0.38,0.25],[0.68,0.10,0.20],[0.64,-0.22,0.16]] },
  ];
  return defs.map((def) => ({ ...def, color: riskColor(def.probability), band: riskBand(def.probability) }));
}

function buildRibbon(points, width) {
  const positions = new Float32Array(points.length * 2 * 3);
  const normals = new Float32Array(points.length * 2 * 3);

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    let tangent = normalize3(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]);
    let side = [tangent[1] * 0 - tangent[2] * 1, tangent[2] * 0 - tangent[0] * 0, tangent[0] * 1 - tangent[1] * 0];
    const sideLen = Math.hypot(...side);
    if (sideLen < 0.001) side = [1, 0, 0];
    else side = normalize3(...side);

    const a = [p[0] + side[0] * width, p[1] + side[1] * width, p[2] + side[2] * width];
    const b = [p[0] - side[0] * width, p[1] - side[1] * width, p[2] - side[2] * width];
    positions.set(a, i * 6);
    positions.set(b, i * 6 + 3);
    normals.set([0, 0, 1], i * 6);
    normals.set([0, 0, 1], i * 6 + 3);
  }
  return { positions, normals, count: points.length * 2 };
}

function HeartRenderer({ onError, results = {}, selectedVessel = null }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;
    let frame = 0;
    let gl = null;
    let program = null;
    let parts = [];
    let coronaryBuffers = [];

    const state = {
      yaw: 0.25,
      pitch: 0.08,
      distance: 3.8,
      target: [0, 0, 0],
      dragging: false,
      mode: "rotate",
      lastX: 0,
      lastY: 0,
    };

    const view = new Float32Array(16);
    const projection = new Float32Array(16);
    const viewProjection = new Float32Array(16);

    const fail = (error) => {
      if (cancelled) return;
      console.error("CardioVision 3D viewer:", error);
      onError(error instanceof Error ? error.message : FALLBACK_TEXT);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      if (gl) gl.viewport(0, 0, width, height);
    };

    const render = () => {
      try {
        resize();
        if (!gl || !program) return;

        const aspect = canvas.width / Math.max(1, canvas.height);
        makePerspective(projection, 42 * Math.PI / 180, aspect, 0.1, 20);
        const cosPitch = Math.cos(state.pitch);
        const eye = [
          state.target[0] + state.distance * cosPitch * Math.sin(state.yaw),
          state.target[1] + state.distance * Math.sin(state.pitch),
          state.target[2] + state.distance * cosPitch * Math.cos(state.yaw),
        ];
        lookAt(view, eye, state.target, [0, 1, 0]);

        for (let i = 0; i < 16; i += 1) {
          const row = i % 4;
          const col = Math.floor(i / 4);
          viewProjection[i] =
            projection[row] * view[col * 4] +
            projection[4 + row] * view[col * 4 + 1] +
            projection[8 + row] * view[col * 4 + 2] +
            projection[12 + row] * view[col * 4 + 3];
        }

        gl.clearColor(...BG);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "uViewProjection"), false, viewProjection);
        gl.uniform3f(gl.getUniformLocation(program, "uLight"), 0.7, 1.0, 0.8);

        for (const part of parts) {
          gl.bindBuffer(gl.ARRAY_BUFFER, part.positionBuffer);
          gl.enableVertexAttribArray(part.positionLocation);
          gl.vertexAttribPointer(part.positionLocation, 3, gl.FLOAT, false, 0, 0);

          gl.bindBuffer(gl.ARRAY_BUFFER, part.normalBuffer);
          gl.enableVertexAttribArray(part.normalLocation);
          gl.vertexAttribPointer(part.normalLocation, 3, gl.FLOAT, false, 0, 0);

          gl.bindBuffer(gl.ARRAY_BUFFER, part.colorBuffer);
          gl.enableVertexAttribArray(part.colorLocation);
          gl.vertexAttribPointer(part.colorLocation, 4, gl.FLOAT, false, 0, 0);

          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indexBuffer);
          gl.drawElements(gl.TRIANGLES, part.indexCount, gl.UNSIGNED_INT, 0);
        }

        // Coronary layer uses the same camera as the anatomical model, so vessels rotate/zoom with the heart.
        gl.disable(gl.CULL_FACE);
        for (const vessel of coronaryBuffers) {
          gl.bindBuffer(gl.ARRAY_BUFFER, vessel.positionBuffer);
          gl.vertexAttribPointer(vessel.positionLocation, 3, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, vessel.normalBuffer);
          gl.vertexAttribPointer(vessel.normalLocation, 3, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, vessel.colorBuffer);
          gl.vertexAttribPointer(vessel.colorLocation, 4, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, vessel.count);
        }
        gl.enable(gl.CULL_FACE);
      } catch (error) {
        cancelAnimationFrame(frame);
        fail(error);
        return;
      }
      frame = requestAnimationFrame(render);
    };

    const onPointerDown = (event) => {
      state.dragging = true;
      state.mode = event.shiftKey || event.button === 2 ? "pan" : "rotate";
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
      if (!state.dragging) return;
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;

      if (state.mode === "rotate") {
        state.yaw -= dx * 0.008;
        state.pitch = Math.max(-1.3, Math.min(1.3, state.pitch - dy * 0.006));
      } else {
        const scale = 0.0035 * state.distance;
        state.target[0] -= dx * scale;
        state.target[1] += dy * scale;
      }
    };

    const stopDragging = (event) => {
      state.dragging = false;
      canvas.releasePointerCapture?.(event.pointerId);
    };

    const onWheel = (event) => {
      event.preventDefault();
      state.distance = Math.max(1.45, Math.min(7, state.distance * Math.exp(event.deltaY * 0.001)));
    };

    const onContextMenu = (event) => event.preventDefault();
    const onContextLost = (event) => {
      event.preventDefault();
      fail(new Error("WebGL context was lost"));
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("contextmenu", onContextMenu);
    canvas.addEventListener("webglcontextlost", onContextLost);

    async function init() {
      try {
        if (cancelled) return;
        gl = canvas.getContext("webgl2", { antialias: true, alpha: false, preserveDrawingBuffer: false });
        if (!gl) throw new Error("WebGL2 is unavailable in this browser");

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        const response = await fetch(MODEL_URL, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${MODEL_URL}`);
        const buffer = await response.arrayBuffer();
        if (cancelled) return;

        const { json, binary } = readGlb(buffer);
        parts = buildGeometry(json, binary);
        if (cancelled) return;

        program = createProgram(gl);
        const positionLocation = gl.getAttribLocation(program, "aPosition");
        const normalLocation = gl.getAttribLocation(program, "aNormal");
        const colorLocation = gl.getAttribLocation(program, "aColor");

        if (positionLocation < 0 || normalLocation < 0 || colorLocation < 0) {
          throw new Error("3D shader attributes could not be initialized");
        }

        for (const part of parts) {
          part.positionLocation = positionLocation;
          part.normalLocation = normalLocation;
          part.colorLocation = colorLocation;
          part.positionBuffer = gl.createBuffer();
          part.normalBuffer = gl.createBuffer();
          part.colorBuffer = gl.createBuffer();
          part.indexBuffer = gl.createBuffer();
          if (!part.positionBuffer || !part.normalBuffer || !part.colorBuffer || !part.indexBuffer) {
            throw new Error("Could not create WebGL buffers");
          }

          gl.bindBuffer(gl.ARRAY_BUFFER, part.positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, part.positions, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, part.normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, part.normals, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, part.colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, part.colors, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, part.indices, gl.STATIC_DRAW);
          part.indexCount = part.indices.length;
        }

        coronaryBuffers = makeCoronaryPaths(results).map((vessel) => {
          const probability = Number.isFinite(vessel.probability) ? vessel.probability : 0.35;
          const width = 0.012 + probability * 0.014 + (selectedVessel === vessel.id ? 0.010 : 0);
          const ribbon = buildRibbon(vessel.points, width);
          const colors = new Float32Array(ribbon.count * 4);
          for (let i = 0; i < ribbon.count; i += 1) colors.set(vessel.color, i * 4);
          const positionBuffer = gl.createBuffer();
          const normalBuffer = gl.createBuffer();
          const colorBuffer = gl.createBuffer();
          if (!positionBuffer || !normalBuffer || !colorBuffer) throw new Error(`Could not create ${vessel.id} coronary buffers`);
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, ribbon.positions, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, ribbon.normals, gl.STATIC_DRAW);
          gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
          gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
          return { ...vessel, positionBuffer, normalBuffer, colorBuffer, count: ribbon.count, positionLocation, normalLocation, colorLocation };
        });

        resize();
        frame = requestAnimationFrame(render);
      } catch (error) {
        fail(error);
      }
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", stopDragging);
      canvas.removeEventListener("pointercancel", stopDragging);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("webglcontextlost", onContextLost);

      if (gl) {
        for (const part of parts) {
          gl.deleteBuffer(part.positionBuffer);
          gl.deleteBuffer(part.normalBuffer);
          gl.deleteBuffer(part.colorBuffer);
          gl.deleteBuffer(part.indexBuffer);
        }
        for (const vessel of coronaryBuffers) {
          gl.deleteBuffer(vessel.positionBuffer);
          gl.deleteBuffer(vessel.normalBuffer);
          gl.deleteBuffer(vessel.colorBuffer);
        }
        if (program) gl.deleteProgram(program);
      }
    };
  }, [onError, results.lad?.probability, results.lcx?.probability, results.rca?.probability, selectedVessel]);

  return (
    <canvas
      ref={canvasRef}
      className="viewer__canvas"
      aria-label="Interactive anatomical 3D heart model"
      role="img"
    />
  );
}

function ViewerFallback({ title, detail }) {
  return (
    <div className="viewer__placeholder" role="status" aria-live="polite">
      <div className="viewer__placeholder-title">{title}</div>
      <div className="viewer__placeholder-text">{detail}</div>
    </div>
  );
}

export default function HeartScene({ results = {} }) {
  const [error, setError] = useState(null);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const vessels = makeCoronaryPaths(results);
  const hasPrediction = vessels.some((item) => Number.isFinite(item.probability));
  const selected = vessels.find((item) => item.id === selectedVessel) || null;

  return (
    <div className="heart-scene" data-viewer-slot="heart">
      {!error ? (
        <HeartRenderer results={results} selectedVessel={selectedVessel} onError={setError} />
      ) : (
        <ViewerFallback
          title={FALLBACK_TEXT}
          detail="The rest of the CardioVision dashboard is still available. Confirm the model file is present at /models/VH_M_Heart.glb."
        />
      )}

      {!error && (
        <>
          <div className="viewer__model-badge">ANATOMICAL BASE + CORONARY RISK MAP</div>
          <div className="viewer__controls-hint">Drag · Zoom · Shift/Right-drag Pan</div>

          <div className="coronary-legend" aria-label="Coronary risk legend">
            <div className="coronary-legend__title">Predicted vessel risk</div>
            <div className="coronary-legend__items">
              <span><i className="risk-dot risk-dot--lower" /> Lower &lt;40%</span>
              <span><i className="risk-dot risk-dot--moderate" /> Moderate 40–69%</span>
              <span><i className="risk-dot risk-dot--high" /> High ≥70%</span>
            </div>
          </div>

          {hasPrediction && (
            <div className="coronary-labels" aria-label="Coronary vessel predictions">
              {vessels.map((vessel) => {
                const pct = Number.isFinite(vessel.probability) ? `${(vessel.probability * 100).toFixed(1)}%` : "—";
                return (
                  <button
                    key={vessel.id}
                    type="button"
                    className={`coronary-label coronary-label--${vessel.band.toLowerCase().replace(/\s/g, "-")}${selectedVessel === vessel.id ? " is-selected" : ""}`}
                    onClick={() => setSelectedVessel((current) => current === vessel.id ? null : vessel.id)}
                    aria-pressed={selectedVessel === vessel.id}
                  >
                    <span className="coronary-label__name">{vessel.name}</span>
                    <span className="coronary-label__value">{pct}</span>
                    <span className="coronary-label__band">{vessel.band}</span>
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <div className="coronary-focus" role="status" aria-live="polite">
              <strong>{selected.name}</strong>
              <span>{Number.isFinite(selected.probability) ? `${(selected.probability * 100).toFixed(1)}% predicted probability` : "No prediction yet"}</span>
              <button type="button" onClick={() => setSelectedVessel(null)} aria-label="Clear vessel selection">×</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
