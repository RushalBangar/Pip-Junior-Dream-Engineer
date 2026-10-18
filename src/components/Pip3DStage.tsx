import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface Pip3DStageProps {
  isNightMode: boolean;
  onTriggerEasterEgg: () => void;
  onGiggle: () => void;
}

const _dummy = new THREE.Object3D();

function createBlockFaceTexture(
  letter: string,
  bgColor: string,
  textColor: string,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#5C4033';
    ctx.lineWidth = 14;
    ctx.strokeRect(12, 12, 232, 232);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 135px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 128, 134);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

export const Pip3DStage: React.FC<Pip3DStageProps> = ({
  isNightMode,
  onTriggerEasterEgg,
  onGiggle,
}) => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [cameraPreset, setCameraPreset] = useState<'front' | 'closeup' | 'orbit'>('front');
  const [orbitSpread, setOrbitSpread] = useState<number>(1.0);
  const [bowTap3D, setBowTap3D] = useState<number>(0);

  const presetRef = useRef(cameraPreset);
  const transitionFramesRef = useRef<number>(0);
  const spreadRef = useRef(orbitSpread);
  const nightRef = useRef(isNightMode);
  const onEasterEggRef = useRef(onTriggerEasterEgg);
  const onGiggleRef = useRef(onGiggle);

  useEffect(() => {
    presetRef.current = cameraPreset;
    transitionFramesRef.current = 55;
  }, [cameraPreset]);

  useEffect(() => {
    spreadRef.current = orbitSpread;
  }, [orbitSpread]);

  useEffect(() => {
    nightRef.current = isNightMode;
  }, [isNightMode]);

  useEffect(() => {
    onEasterEggRef.current = onTriggerEasterEgg;
    onGiggleRef.current = onGiggle;
  }, [onTriggerEasterEgg, onGiggle]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 420;
    const height = mount.clientHeight || 350;

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    const scene = new THREE.Scene();
    const initialBg = nightRef.current ? 0x0d101f : 0x261d36;
    scene.background = new THREE.Color(initialBg);
    scene.fog = new THREE.FogExp2(initialBg, 0.055);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.35, 5.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.85, 0);
    controls.minDistance = 2.6;
    controls.maxDistance = 8.2;
    controls.maxPolarAngle = Math.PI * 0.62;

    const hemiLight = new THREE.HemisphereLight(0xfde68a, 0x312e81, 0.9);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.75);
    keyLight.position.set(3.5, 5.5, 4.0);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xf472b6, 0.95);
    rimLight.position.set(-3.5, 2.8, -3.0);
    scene.add(rimLight);

    const lanternLight = new THREE.PointLight(0xfbbf24, 3.4, 7.0);
    lanternLight.position.set(1.15, 0.95, 0.65);
    scene.add(lanternLight);

    const porcelainMat = new THREE.MeshPhysicalMaterial({
      color: 0xfff9f2,
      roughness: 0.16,
      metalness: 0.02,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
    });

    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.0,
    });

    const pajamaMat = new THREE.MeshStandardMaterial({
      color: 0xf4c6d7,
      roughness: 0.62,
      metalness: 0.05,
    });

    const nightcapMat = new THREE.MeshStandardMaterial({
      color: 0x3b2d64,
      roughness: 0.55,
      metalness: 0.1,
    });

    const socketMat = new THREE.MeshStandardMaterial({
      color: 0x1f161b,
      roughness: 0.85,
      metalness: 0.0,
    });

    const amberGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });

    const pinkBowMat = new THREE.MeshPhysicalMaterial({
      color: 0xec4899,
      roughness: 0.32,
      metalness: 0.1,
      clearcoat: 0.5,
    });

    const blushMat = new THREE.MeshStandardMaterial({
      color: 0xfda4af,
      roughness: 0.6,
      metalness: 0.0,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.22,
      metalness: 0.88,
    });

    const pipGroup = new THREE.Group();
    scene.add(pipGroup);

    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 8, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0,0,0,0.48)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const contactShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.8),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.55,
      })
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.35;
    scene.add(contactShadow);

    const cloudGroup = new THREE.Group();
    const puffCoords = [
      { x: 0, y: 0.05, z: 0, r: 0.72 },
      { x: -0.62, y: 0.0, z: 0.12, r: 0.52 },
      { x: 0.62, y: 0.0, z: 0.12, r: 0.52 },
      { x: -0.32, y: 0.08, z: 0.42, r: 0.48 },
      { x: 0.35, y: 0.08, z: 0.42, r: 0.48 },
      { x: 0, y: 0.05, z: -0.38, r: 0.54 },
    ];
    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    puffCoords.forEach((p) => {
      const puff = new THREE.Mesh(sphereGeo, cloudMat);
      puff.scale.set(p.r, p.r * 0.72, p.r);
      puff.position.set(p.x, p.y, p.z);
      puff.castShadow = true;
      puff.receiveShadow = true;
      cloudGroup.add(puff);
    });
    pipGroup.add(cloudGroup);

    const torsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.48, 0.68, 24),
      pajamaMat
    );
    torsoMesh.position.set(0, 0.58, 0);
    torsoMesh.castShadow = true;
    pipGroup.add(torsoMesh);

    const leftArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.32, 12, 16),
      porcelainMat
    );
    leftArm.position.set(-0.52, 0.75, 0.18);
    leftArm.rotation.z = -0.65;
    leftArm.rotation.x = -0.4;
    pipGroup.add(leftArm);

    const rightArm = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.11, 0.32, 12, 16),
      porcelainMat
    );
    rightArm.position.set(0.54, 0.68, 0.22);
    rightArm.rotation.z = 0.55;
    pipGroup.add(rightArm);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.32, 0);
    pipGroup.add(headGroup);

    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.58, 32, 32), porcelainMat);
    cranium.scale.set(1.06, 0.96, 1.0);
    cranium.castShadow = true;
    headGroup.add(cranium);

    const jaw = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.28, 0.28, 24),
      porcelainMat
    );
    jaw.position.set(0, -0.36, 0.12);
    headGroup.add(jaw);

    // Rosy porcelain cheeks
    const leftCheek = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), blushMat);
    leftCheek.scale.set(1.2, 0.7, 0.4);
    leftCheek.position.set(-0.36, -0.18, 0.48);
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), blushMat);
    rightCheek.scale.set(1.2, 0.7, 0.4);
    rightCheek.position.set(0.36, -0.18, 0.48);
    headGroup.add(rightCheek);

    // Crooked little smile
    const smileArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.016, 8, 20, Math.PI * 0.85),
      socketMat
    );
    smileArc.rotation.z = Math.PI + 0.12;
    smileArc.position.set(0.01, -0.26, 0.44);
    headGroup.add(smileArc);

    const leftSocket = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), socketMat);
    leftSocket.scale.set(1, 1.05, 0.45);
    leftSocket.position.set(-0.21, -0.02, 0.51);
    headGroup.add(leftSocket);

    const rightSocket = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), socketMat);
    rightSocket.scale.set(1, 1.05, 0.45);
    rightSocket.position.set(0.21, -0.02, 0.51);
    headGroup.add(rightSocket);

    const leftPinprick = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), amberGlowMat);
    leftPinprick.position.set(-0.21, -0.02, 0.57);
    headGroup.add(leftPinprick);

    const rightPinprick = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), amberGlowMat);
    rightPinprick.position.set(0.21, -0.02, 0.57);
    headGroup.add(rightPinprick);

    const brimMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.52, 0.11, 16, 36),
      cloudMat
    );
    brimMesh.rotation.x = Math.PI / 2 - 0.18;
    brimMesh.position.set(0, 0.34, -0.02);
    headGroup.add(brimMesh);

    const capCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.52, 0.85, 28),
      nightcapMat
    );
    capCone.position.set(0.08, 0.72, -0.08);
    capCone.rotation.z = -0.28;
    headGroup.add(capCone);

    const pomPom = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), amberGlowMat);
    pomPom.position.set(0.24, 1.12, -0.08);
    headGroup.add(pomPom);

    const bowGroup = new THREE.Group();
    bowGroup.position.set(-0.38, 0.38, 0.38);
    bowGroup.rotation.z = 0.35;
    headGroup.add(bowGroup);

    const bowCenter = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), pinkBowMat);
    bowCenter.name = 'pip_pink_bow';
    const bowLeft = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 16), pinkBowMat);
    bowLeft.rotation.z = -Math.PI / 2;
    bowLeft.position.x = -0.11;
    bowLeft.name = 'pip_pink_bow';
    const bowRight = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 16), pinkBowMat);
    bowRight.rotation.z = Math.PI / 2;
    bowRight.position.x = 0.11;
    bowRight.name = 'pip_pink_bow';
    bowGroup.add(bowCenter, bowLeft, bowRight);

    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(0.95, 0.75, 0.35);
    pipGroup.add(lanternGroup);

    const lanternRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.022, 12, 24),
      brassMat
    );
    lanternRing.position.y = 0.22;
    const lanternOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 24, 24),
      amberGlowMat
    );
    lanternOrb.name = 'pip_lantern';
    lanternGroup.add(lanternRing, lanternOrb);

    // InstancedMesh of 24 twinkling starlight motes around Pip
    const starCount = 24;
    const starGeo = new THREE.OctahedronGeometry(0.045, 0);
    const starInstanced = new THREE.InstancedMesh(starGeo, amberGlowMat, starCount);
    const starPositions: { x: number; y: number; z: number; phase: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2;
      const dist = 2.1 + (i % 3) * 0.45;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist - 0.4;
      const y = 0.2 + ((i * 7) % 24) * 0.1;
      starPositions.push({ x, y, z, phase: i * 0.7 });
      _dummy.position.set(x, y, z);
      _dummy.updateMatrix();
      starInstanced.setMatrixAt(i, _dummy.matrix);
    }
    starInstanced.instanceMatrix.needsUpdate = true;
    starInstanced.computeBoundingSphere();
    scene.add(starInstanced);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const blockSpecs = [
      { char: 'h', bg: '#F4C6D7', angle: 0.4, y: 1.55, freq: 523.25 },
      { char: 'a', bg: '#FDE68A', angle: 1.9, y: 0.95, freq: 659.25 },
      { char: 'X', bg: '#C7D2FE', angle: 3.5, y: 1.65, freq: 783.99 },
      { char: '♡', bg: '#FECDD3', angle: 5.0, y: 1.05, freq: 1046.5 },
    ];
    const blockGeo = new THREE.BoxGeometry(0.36, 0.36, 0.36);
    const orbitingBlocks: { mesh: THREE.Mesh; baseAngle: number; baseY: number; freq: number }[] = [];
    const clickableMeshes: THREE.Object3D[] = [
      cranium,
      bowCenter,
      bowLeft,
      bowRight,
      lanternOrb,
    ];

    blockSpecs.forEach((b) => {
      const tex = createBlockFaceTexture(b.char, b.bg, '#3A2721', maxAniso);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.42,
        metalness: 0.05,
      });
      const mesh = new THREE.Mesh(blockGeo, mat);
      mesh.castShadow = true;
      mesh.userData = { freq: b.freq, isBlock: true };
      scene.add(mesh);
      orbitingBlocks.push({ mesh, baseAngle: b.angle, baseY: b.y, freq: b.freq });
      clickableMeshes.push(mesh);
    });

    renderer.compile(scene, camera);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2(0, 0);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (event: PointerEvent) => {
      transitionFramesRef.current = 0;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const hitObj = hits[0].object;
        if (hitObj.name === 'pip_pink_bow') {
          setBowTap3D((c) => {
            const next = c + 1;
            soundEngine.playClickChime(1 + next * 0.15);
            if (next >= 3) {
              onEasterEggRef.current();
              return 0;
            }
            return next;
          });
        } else if (hitObj.userData?.isBlock) {
          soundEngine.playMusicBoxNote(hitObj.userData.freq, 0.85, 0.45);
          hitObj.scale.setScalar(1.32);
        } else {
          onGiggleRef.current();
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

    const targetCamPos = new THREE.Vector3(0, 1.35, 5.1);
    const targetBgColor = new THREE.Color();
    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      targetBgColor.setHex(nightRef.current ? 0x0c0f1d : 0x261d36);
      if (scene.background instanceof THREE.Color) {
        scene.background.lerp(targetBgColor, delta * 4);
      }
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.lerp(targetBgColor, delta * 4);
      }

      pipGroup.position.y = Math.sin(elapsed * 1.6) * 0.08;
      headGroup.rotation.y = THREE.MathUtils.damp(
        headGroup.rotation.y,
        pointerTarget.x * 0.35 + Math.sin(elapsed * 0.7) * 0.08,
        6,
        delta
      );
      headGroup.rotation.x = THREE.MathUtils.damp(
        headGroup.rotation.x,
        -pointerTarget.y * 0.2,
        6,
        delta
      );

      // Animate instanced stars gently bobbing
      for (let i = 0; i < starCount; i++) {
        const sp = starPositions[i];
        _dummy.position.set(
          sp.x,
          sp.y + Math.sin(elapsed * 1.8 + sp.phase) * 0.08,
          sp.z
        );
        _dummy.rotation.y = elapsed + sp.phase;
        _dummy.updateMatrix();
        starInstanced.setMatrixAt(i, _dummy.matrix);
      }
      starInstanced.instanceMatrix.needsUpdate = true;

      // Update orbiting blocks
      const radius = 1.65 * spreadRef.current;
      orbitingBlocks.forEach((item, idx) => {
        const a = item.baseAngle + elapsed * 0.45;
        item.mesh.position.x = Math.cos(a) * radius;
        item.mesh.position.z = Math.sin(a) * radius;
        item.mesh.position.y = item.baseY + Math.sin(elapsed * 2 + idx) * 0.12;
        item.mesh.rotation.x += delta * 0.6;
        item.mesh.rotation.y += delta * 0.8;
        const s = THREE.MathUtils.damp(item.mesh.scale.x, 1.0, 8, delta);
        item.mesh.scale.setScalar(s);
      });

      if (presetRef.current === 'closeup') {
        targetCamPos.set(0, 1.45, 3.25);
      } else if (presetRef.current === 'orbit') {
        targetCamPos.set(Math.sin(elapsed * 0.5) * 4.8, 1.6, Math.cos(elapsed * 0.5) * 4.8);
      } else {
        targetCamPos.set(0, 1.35, 5.1);
      }

      if (presetRef.current === 'orbit') {
        camera.position.lerp(targetCamPos, delta * 2.5);
      } else if (transitionFramesRef.current > 0) {
        camera.position.lerp(targetCamPos, delta * 5.0);
        transitionFramesRef.current -= 1;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth || 420;
      const h = mount.clientHeight || 350;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      controls.dispose();
      sphereGeo.dispose();
      starGeo.dispose();
      blockGeo.dispose();
      porcelainMat.dispose();
      cloudMat.dispose();
      pajamaMat.dispose();
      nightcapMat.dispose();
      socketMat.dispose();
      amberGlowMat.dispose();
      pinkBowMat.dispose();
      blushMat.dispose();
      brassMat.dispose();
      envTexture.dispose();
      shadowTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[350px] rounded-xl overflow-hidden select-none">
      <div ref={canvasMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#111524]/85 text-[#FDE68A] text-[11px] font-mono-tabular border border-white/10">
        Drag to Orbit 3D · Tap Blocks to Chime · Bow ({bowTap3D}/3)
      </div>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] flex flex-col items-center">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClickChime(1.05);
            setDockCollapsed(!dockCollapsed);
          }}
          className="px-3 py-1 rounded-t-lg bg-[#111524] text-[#F8F5F0] border border-b-0 border-white/15 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>Show Camera Dock</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Hide Dock</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full p-2.5 rounded-xl bg-[#111524] text-[#F8F5F0] border border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs shadow-lg">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'front', label: 'Front' },
                  { id: 'closeup', label: 'Close-Up' },
                  { id: 'orbit', label: 'Auto-Orbit' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClickChime(1.1);
                    setCameraPreset(p.id);
                  }}
                  className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap shrink-0 ${
                    cameraPreset === p.id
                      ? 'bg-[#A34063] text-white'
                      : 'text-white/75 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] opacity-75">Block Orbit:</span>
              <input
                type="range"
                min={0.75}
                max={1.45}
                step={0.05}
                value={orbitSpread}
                onChange={(e) => setOrbitSpread(Number(e.target.value))}
                className="w-20 accent-[#A34063] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
