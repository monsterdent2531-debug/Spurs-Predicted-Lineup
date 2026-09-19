"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { formations } from "../data/formations";
import { players as sourcePlayers } from "../data/players";
import { teams } from "../data/teams";
import "./predicted.css";

/* =========================================================
   DATA
========================================================= */

const players = [...sourcePlayers].sort(
  (a, b) => Number(a.number) - Number(b.number)
);

const initialIds = [
  "solanke",
  "savio",
  "marmoush",
  "kudus",
  "tonali",
  "fernandes",
  "udogie",
  "vandeven",
  "vanhecke",
  "porro",
  "kinsky",
];

const competitions = [
  {
    id: "none",
    name: "ไม่ใช้โลโก้รายการ",
    logo: "",
  },
  {
    id: "premier-league",
    name: "Premier League",
    logo: "/images/competitions/premier-league.png",
  },
  {
    id: "carabao-cup",
    name: "Carabao Cup",
    logo: "/images/competitions/carabao-cup.png",
  },
  {
    id: "fa-cup",
    name: "FA Cup",
    logo: "/images/competitions/fa-cup.png",
  },
  {
    id: "champions-league",
    name: "Champions League",
    logo: "/images/competitions/champions-league.png",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function makeXI(f = "4-2-3-1") {
  return formations[f].map((slot, index) => ({
    slot: slot.id,
    playerId: initialIds[index] || players[index]?.id,
    x: slot.left,
    y: slot.top,
  }));
}

const logo = (id) => `/images/logos/${id}.png.png`;

/* =========================================================
   PAGE
========================================================= */

export default function Page() {
  const posterRef = useRef(null);

  /* ---------- MATCH ---------- */

  const [opponent, setOpponent] = useState("forest");

  const [customTeamName, setCustomTeamName] = useState("");
  const [customTeamLogo, setCustomTeamLogo] = useState("");

  const [formation, setFormation] = useState("4-2-3-1");
  const [competition, setCompetition] = useState("none");
  const [spursHome, setSpursHome] = useState(false);

  /* ---------- LINE UP ---------- */

  const [xi, setXi] = useState(() => makeXI());

  const [title, setTitle] = useState("PREDICTED LINE UP");

  const [drag, setDrag] = useState(null);

  /* ---------- CUSTOM PLAYER ---------- */

  const [custom, setCustom] = useState(() =>
    Object.fromEntries(
      initialIds.map((id) => [
        id,
        {
          image: "",
          name: "",
          number: "",
        },
      ])
    )
  );

  /* =========================================================
     CURRENT TEAM
  ========================================================= */

  const opponentTeam =
    teams.find((team) => team.id === opponent) || teams[0];

  const opponentName =
    customTeamName.trim() || opponentTeam.name;

  const opponentLogo =
    customTeamLogo || logo(opponentTeam.id);

  /* =========================================================
     CURRENT COMPETITION
  ========================================================= */

  const comp =
    competitions.find((item) => item.id === competition) ||
    competitions[0];

  /* =========================================================
     SELECTED PLAYERS
  ========================================================= */

  const selected = useMemo(
    () => new Set(xi.map((item) => item.playerId)),
    [xi]
  );

  /* =========================================================
     FORMATION
  ========================================================= */

  function changeFormation(newFormation) {
    setFormation(newFormation);
    setXi(makeXI(newFormation));
  }

  /* =========================================================
     CHANGE PLAYER
  ========================================================= */

  function setPlayer(index, playerId) {
    setXi((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              playerId,
            }
          : item
      )
    );
  }

  /* =========================================================
     CUSTOM PLAYER
  ========================================================= */

  function updateCustom(playerId, key, value) {
    setCustom((current) => ({
      ...current,

      [playerId]: {
        ...(current[playerId] || {}),
        [key]: value,
      },
    }));
  }

  function uploadCustom(playerId, file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateCustom(playerId, "image", reader.result);
    };

    reader.readAsDataURL(file);
  }

  /* =========================================================
     CUSTOM TEAM LOGO
  ========================================================= */

  function uploadTeamLogo(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setCustomTeamLogo(reader.result);
    };

    reader.readAsDataURL(file);
  }

  function resetCustomTeam() {
    setCustomTeamName("");
    setCustomTeamLogo("");
  }

  /* =========================================================
     DRAG PLAYER
  ========================================================= */

  function pointerDown(event, index) {
    event.currentTarget.setPointerCapture(event.pointerId);

    setDrag(index);
  }

  function pointerMove(event) {
    if (drag === null) return;

    const pitch =
      posterRef.current?.querySelector(".pitchArea");

    if (!pitch) return;

    const rect = pitch.getBoundingClientRect();

    let x =
      ((event.clientX - rect.left) / rect.width) * 100;

    let y =
      ((event.clientY - rect.top) / rect.height) * 100;

    x = Math.max(5, Math.min(95, x));
    y = Math.max(5, Math.min(95, y));

    setXi((current) =>
      current.map((player, index) =>
        index === drag
          ? {
              ...player,
              x,
              y,
            }
          : player
      )
    );
  }

  function pointerUp() {
    setDrag(null);
  }

  /* =========================================================
     SAVE PNG
  ========================================================= */

  async function imageUrlToDataUrl(src) {
    // รูปที่อัปโหลดเองเป็น data URL อยู่แล้ว
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      return src;
    }

    const response = await fetch(src, { cache: "force-cache" });
    if (!response.ok) {
      throw new Error(`โหลดรูปไม่สำเร็จ: ${src}`);
    }

    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function waitForImage(img) {
    if (img.complete && img.naturalWidth > 0) return;

    await new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
      setTimeout(done, 3000);
    });
  }

  async function save() {
    if (!posterRef.current) return;

    const node = posterRef.current;
    const replacements = [];
    const posterBg = node.querySelector(".posterBg");
    const originalPosterBackground = node.style.background;
    const originalBgVisibility = posterBg?.style.visibility || "";

    try {
      // 1) รอ Font ให้พร้อม
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // 2) ฝังรูปทุกใบเป็น Data URL ก่อน Capture
      //    ช่วยให้ Safari/iPhone เก็บโลโก้และรูปนักเตะได้ครบ
      const images = Array.from(node.querySelectorAll("img"));

      for (const img of images) {
        await waitForImage(img);

        const originalSrc = img.getAttribute("src") || "";
        if (!originalSrc || originalSrc.startsWith("data:")) continue;

        try {
          const absoluteSrc = new URL(originalSrc, window.location.href).href;
          const dataUrl = await imageUrlToDataUrl(absoluteSrc);

          replacements.push({ img, originalSrc });
          img.src = dataUrl;
          await waitForImage(img);
        } catch (imageError) {
          console.warn("Inline image failed:", originalSrc, imageError);
        }
      }

      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 180))
        )
      );

      const TARGET_WIDTH = 2000;
      const TARGET_HEIGHT = 2500;

      // ใช้ฐาน Layout แบบ Desktop ตอน Export เสมอ
      // ทำให้ช่องไฟรูป-ชื่อเหมือนคอม และสัดส่วนวงกลมไม่เพี้ยนบน iPhone
      const originalPosterInlineStyle = {
        width: node.style.width,
        height: node.style.height,
        maxWidth: node.style.maxWidth,
        maxHeight: node.style.maxHeight,
        aspectRatio: node.style.aspectRatio,
      };
      node.__originalPosterInlineStyle = originalPosterInlineStyle;

      node.style.width = "800px";
      node.style.height = "1000px";
      node.style.maxWidth = "none";
      node.style.maxHeight = "none";
      node.style.aspectRatio = "4 / 5";

      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => setTimeout(resolve, 120))
        )
      );

      const exportPixelRatio = 2.5; // 800x1000 -> 2000x2500

      // 3) โหลดพื้นหลังแยกไว้สำหรับวาดลง Canvas โดยตรง
      //    ไม่ให้ html-to-image เป็นคนฝัง background เพราะ Safari มักทำรูปใหญ่หาย
      const bgSrc = posterBg?.src || "/images/pitch/predicted-bg.png";
      const backgroundImage = new Image();

      await new Promise((resolve, reject) => {
        backgroundImage.onload = resolve;
        backgroundImage.onerror = reject;
        backgroundImage.src = bgSrc;
      });

      // ซ่อนเฉพาะพื้นหลังตอน Capture เพื่อให้ได้ overlay โปร่งใส
      if (posterBg) posterBg.style.visibility = "hidden";
      node.style.background = "transparent";

      // Safari/iPhone: ปิด shadow เฉพาะตอน Export
      // เพื่อไม่ให้เกิดแถบสีเทาหลังกรอบทีม เบอร์ และชื่อนักเตะ
      const exportStyleBackups = [];

      function setExportStyle(selector, styles) {
        node.querySelectorAll(selector).forEach((el) => {
          const backup = {};
          Object.keys(styles).forEach((key) => {
            backup[key] = el.style[key];
            el.style[key] = styles[key];
          });
          exportStyleBackups.push({ el, backup });
        });
      }

      // บังคับวงนักเตะเป็นสี่เหลี่ยมจัตุรัส "ด้วย px จริง"
      // ไม่พึ่ง aspect-ratio/clip-path ตอน html-to-image เพราะ Safari
      // อาจคำนวณแกน X/Y ต่างกันจนวงกลมกลายเป็นวงรี
      node.querySelectorAll(".playerCircle").forEach((el) => {
        const rect = el.getBoundingClientRect();
        const size = Math.round(rect.width);

        const backup = {};
        [
          "width","height","minWidth","minHeight","maxWidth","maxHeight",
          "aspectRatio","borderRadius","backgroundColor","overflow",
          "boxShadow","clipPath","WebkitClipPath","flex"
        ].forEach((key) => {
          backup[key] = el.style[key];
        });

        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.minWidth = `${size}px`;
        el.style.minHeight = `${size}px`;
        el.style.maxWidth = `${size}px`;
        el.style.maxHeight = `${size}px`;
        el.style.aspectRatio = "auto";
        el.style.borderRadius = `${size / 2}px`;
        el.style.backgroundColor = "#ffffff";
        el.style.overflow = "hidden";
        el.style.boxShadow = "none";
        el.style.clipPath = "none";
        el.style.WebkitClipPath = "none";
        el.style.flex = `0 0 ${size}px`;

        exportStyleBackups.push({ el, backup });
      });

      setExportStyle(".playerCircle img", {
        filter: "none",
      });

      // ช่องไฟรูปกับชื่อให้เท่ากับหน้า Desktop
      setExportStyle(".playerName", {
        boxShadow: "none",
        marginTop: "-8px",
      });

      // ลบเงาที่ Safari ทำเป็นแถบสีเทา
      setExportStyle(".teamBox", { boxShadow: "none" });
      setExportStyle(".numberBox", { boxShadow: "none" });

      // เก็บ backup ไว้คืนหลัง Save
      node.__exportStyleBackups = exportStyleBackups;

      // โลโก้สโมสร/ทัวร์นาเมนต์: Safari บางครั้งไม่วาดรูปเล็กใน html-to-image
      // จึงอ่านตำแหน่งจาก Preview แล้ววาดลง Canvas โดยตรง
      const posterRectForLogos = node.getBoundingClientRect();
      const directLogos = [];

      for (const logoImg of node.querySelectorAll(".teamBox img, .competitionTitle img")) {
        await waitForImage(logoImg);
        if (!logoImg.naturalWidth || !logoImg.naturalHeight) continue;

        const r = logoImg.getBoundingClientRect();
        directLogos.push({
          src: logoImg.src,
          x: r.left - posterRectForLogos.left,
          y: r.top - posterRectForLogos.top,
          width: r.width,
          height: r.height,
          element: logoImg,
          originalVisibility: logoImg.style.visibility || "",
        });
        logoImg.style.visibility = "hidden";
      }

      node.__directLogos = directLogos;

      // 4) Capture เฉพาะข้อความ นักเตะ และองค์ประกอบด้านหน้า
      const overlayDataUrl = await toPng(node, {
        pixelRatio: exportPixelRatio,
        cacheBust: false,
        skipAutoScale: true,
        backgroundColor: "transparent",
      });

      const overlayImage = new Image();
      await new Promise((resolve, reject) => {
        overlayImage.onload = resolve;
        overlayImage.onerror = reject;
        overlayImage.src = overlayDataUrl;
      });

      // 5) สร้างไฟล์จริง 2000x2500:
      //    วาด background ต้นฉบับก่อน แล้ววาง overlay Hi-Res ทับ
      const canvas = document.createElement("canvas");
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // วาดพื้นหลังแบบ object-fit: cover ให้เหมือน .posterBg ใน CSS
      const iw = backgroundImage.naturalWidth;
      const ih = backgroundImage.naturalHeight;
      const scale = Math.max(TARGET_WIDTH / iw, TARGET_HEIGHT / ih);
      const sw = TARGET_WIDTH / scale;
      const sh = TARGET_HEIGHT / scale;
      const sx = (iw - sw) / 2;
      const sy = (ih - sh) / 2;

      ctx.drawImage(
        backgroundImage,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      // วางองค์ประกอบทั้งหมดจาก Preview ทับพื้นหลัง
      ctx.drawImage(
        overlayImage,
        0,
        0,
        TARGET_WIDTH,
        TARGET_HEIGHT
      );

      // วาดโลโก้สโมสร + โลโก้ทัวร์นาเมนต์ลง Canvas โดยตรง
      const logoScaleX = TARGET_WIDTH / 800;
      const logoScaleY = TARGET_HEIGHT / 1000;

      for (const item of (node.__directLogos || [])) {
        try {
          const logoImage = new Image();
          await new Promise((resolve, reject) => {
            logoImage.onload = resolve;
            logoImage.onerror = reject;
            logoImage.src = item.src;
          });

          const boxX = item.x * logoScaleX;
          const boxY = item.y * logoScaleY;
          const boxW = item.width * logoScaleX;
          const boxH = item.height * logoScaleY;
          const imageRatio = logoImage.naturalWidth / logoImage.naturalHeight;
          const boxRatio = boxW / boxH;

          let drawW, drawH;
          if (imageRatio > boxRatio) {
            drawW = boxW;
            drawH = boxW / imageRatio;
          } else {
            drawH = boxH;
            drawW = boxH * imageRatio;
          }

          ctx.drawImage(
            logoImage,
            boxX + (boxW - drawW) / 2,
            boxY + (boxH - drawH) / 2,
            drawW,
            drawH
          );
        } catch (logoError) {
          console.warn("Direct logo draw failed:", item.src, logoError);
        }
      }

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (result) =>
            result ? resolve(result) : reject(new Error("Cannot create PNG")),
          "image/png"
        );
      });

      const safeName = (customTeamName.trim() || opponent)
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .replace(/^-+|-+$/g, "") || "opponent";

      const fileName = `predicted-lineup-${safeName}-2000x2500.png`;
      // 6) ดาวน์โหลด PNG ลงเครื่องโดยตรง — ไม่เปิด Share Sheet
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();

      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Save PNG error:", error);
        alert("สร้างรูปไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      // คืนโลโก้ที่ซ่อนเฉพาะตอน Export
      for (const item of (node.__directLogos || [])) {
        if (item.element) item.element.style.visibility = item.originalVisibility;
      }
      node.__directLogos = [];

      // คืน style ที่แก้เฉพาะตอน Export
      const exportStyleBackups = node.__exportStyleBackups || [];
      for (const { el, backup } of exportStyleBackups) {
        for (const [key, value] of Object.entries(backup)) {
          el.style[key] = value;
        }
      }
      node.__exportStyleBackups = [];

      // คืนขนาด Poster หลัง Export ให้เหมือน Preview เดิม
      const originalPosterInlineStyle = node.__originalPosterInlineStyle;
      if (originalPosterInlineStyle) {
        node.style.width = originalPosterInlineStyle.width;
        node.style.height = originalPosterInlineStyle.height;
        node.style.maxWidth = originalPosterInlineStyle.maxWidth;
        node.style.maxHeight = originalPosterInlineStyle.maxHeight;
        node.style.aspectRatio = originalPosterInlineStyle.aspectRatio;
        delete node.__originalPosterInlineStyle;
      }

      // คืน Preview ให้เหมือนเดิมทุกอย่าง
      if (posterBg) posterBg.style.visibility = originalBgVisibility;
      node.style.background = originalPosterBackground;

      for (const { img, originalSrc } of replacements) {
        img.src = originalSrc;
      }
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="app">

      {/* =====================================================
          PREVIEW
      ====================================================== */}

      <section className="previewWrap">

        <div
          className="poster"
          ref={posterRef}
        >

          {/* BACKGROUND */}

          <img
            className="posterBg"
            src="/images/pitch/predicted-bg.png"
            alt=""
          />

          {/* =================================================
              TITLE
          ================================================== */}

          <div className="topBrand">

            {competition !== "none" && comp.logo && (
              <div className="competitionTitle">
                <img
                  src={comp.logo}
                  alt={comp.name}
                />
              </div>
            )}

            <h1>{title}</h1>

          </div>

          {/* =================================================
              MATCH
          ================================================== */}

          <div className="matchRow">

            {spursHome ? (
              <>
                {/* SPURS LEFT */}

                <div className="teamBox">

                  <img
                    src={logo("tottenham")}
                    alt="Tottenham Hotspur"
                  />

                  <span>
                    TOTTENHAM HOTSPUR
                  </span>

                </div>

                {/* VS */}

                <div className="vs">
                  VS
                </div>

                {/* OPPONENT RIGHT */}

                <div className="teamBox right">

                  <span>
                    {opponentName}
                  </span>

                  <img
                    src={opponentLogo}
                    alt={opponentName}
                  />

                </div>
              </>
            ) : (
              <>
                {/* OPPONENT LEFT */}

                <div className="teamBox">

                  <img
                    src={opponentLogo}
                    alt={opponentName}
                  />

                  <span>
                    {opponentName}
                  </span>

                </div>

                {/* VS */}

                <div className="vs">
                  VS
                </div>

                {/* SPURS RIGHT */}

                <div className="teamBox right">

                  <span>
                    TOTTENHAM HOTSPUR
                  </span>

                  <img
                    src={logo("tottenham")}
                    alt="Tottenham Hotspur"
                  />

                </div>
              </>
            )}

          </div>

          {/* =================================================
              PITCH
          ================================================== */}

          <div
            className="pitchArea"
            onPointerMove={pointerMove}
            onPointerUp={pointerUp}
            onPointerCancel={pointerUp}
          >

            {xi.map((item, index) => {

              const player = players.find(
                (p) => p.id === item.playerId
              );

              const customPlayer =
                custom[item.playerId] || {};

              const image =
                customPlayer.image ||
                player?.starterImage;

              const displayName =
                customPlayer.name ||
                player?.name ||
                "PLAYER";

              const displayNumber =
                customPlayer.number !== "" &&
                customPlayer.number !== undefined
                  ? customPlayer.number
                  : player?.number ?? "";

              return (
                <div
                  key={`${item.slot}-${index}`}
                  className="player"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  onPointerDown={(event) =>
                    pointerDown(event, index)
                  }
                >

                  <div className="playerVisual">

                    <div className="playerCircle">

                      {image && (
                        <img
                          src={image}
                          alt={displayName}
                          draggable="false"
                        />
                      )}

                    </div>

                    <span className="numberBox">
                      {displayNumber}
                    </span>

                  </div>

                  <div className="playerName">
                    {displayName}
                  </div>

                </div>
              );
            })}

          </div>

          {/* =================================================
              PAGE LOGO
          ================================================== */}

          <img
            className="pageLogo"
            src="/images/branding/spurs-content.png"
            alt="Spurs Content"
          />

        </div>

      </section>

      {/* =====================================================
          CONTROL PANEL
      ====================================================== */}

      <aside className="controls">

        <h3>
          Predicted Line Up
        </h3>

        <p className="hint">
          แก้ข้อมูลด้านล่าง แล้วลากนักเตะบนสนามเพื่อจัดตำแหน่ง
        </p>

        {/* ===================================================
            TITLE
        ==================================================== */}

        <label>

          หัวข้อ

          <input
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
          />

        </label>

        {/* ===================================================
            OPPONENT + FORMATION
        ==================================================== */}

        <div className="grid2">

          <label>

            คู่แข่ง

            <select
              value={opponent}
              onChange={(event) => {

                setOpponent(event.target.value);

                /*
                  เมื่อเลือกทีมจากฐานข้อมูลใหม่
                  ให้กลับไปใช้ชื่อ/โลโก้ทีมในฐานข้อมูล
                */

                setCustomTeamName("");
                setCustomTeamLogo("");
              }}
            >

              {teams
                .filter(
                  (team) =>
                    team.id !== "tottenham"
                )
                .map((team) => (
                  <option
                    key={team.id}
                    value={team.id}
                  >
                    {team.name}
                  </option>
                ))}

            </select>

          </label>

          <label>

            Formation

            <select
              value={formation}
              onChange={(event) =>
                changeFormation(
                  event.target.value
                )
              }
            >

              {Object.keys(formations).map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

          </label>

        </div>

        {/* ===================================================
            COMPETITION
        ==================================================== */}

        <label>

          รายการแข่งขัน

          <select
            value={competition}
            onChange={(event) =>
              setCompetition(
                event.target.value
              )
            }
          >

            {competitions.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}

          </select>

        </label>

        {/* ===================================================
            CUSTOM OPPONENT
        ==================================================== */}

        <div className="customTeamEditor">

          <h4>
            เพิ่ม / แก้ไขทีมคู่แข่ง
          </h4>

          {/* TEAM NAME */}

          <label>

            ชื่อทีม

            <input
              type="text"
              value={customTeamName}
              placeholder={opponentTeam.name}
              onChange={(event) =>
                setCustomTeamName(
                  event.target.value
                )
              }
            />

          </label>

          {/* TEAM LOGO */}

          <label>

            โลโก้ทีม

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={(event) =>
                uploadTeamLogo(
                  event.target.files?.[0]
                )
              }
            />

          </label>

          {/* CUSTOM TEAM PREVIEW */}

          {(customTeamLogo ||
            customTeamName.trim()) && (

            <div className="customTeamLogoPreview">

              <img
                src={opponentLogo}
                alt={opponentName}
              />

              <div>

                <strong>
                  {opponentName}
                </strong>

                <button
                  type="button"
                  onClick={resetCustomTeam}
                >
                  กลับไปใช้ทีมเดิม
                </button>

              </div>

            </div>
          )}

        </div>

        {/* ===================================================
            HOME / AWAY
        ==================================================== */}

        <label className="homeAwayToggle">

          <input
            type="checkbox"
            checked={spursHome}
            onChange={(event) =>
              setSpursHome(
                event.target.checked
              )
            }
          />

          <span className="toggleTrack">
            <span className="toggleKnob" />
          </span>

          <span>
            สลับฝั่งทีมเหย้า / เยือน —{" "}
            {spursHome
              ? "Spurs เหย้า"
              : `${opponentName} เหย้า`}
          </span>

        </label>

        <p className="folderHint">
          โลโก้รายการ: public/images/competitions
        </p>

        {/* ===================================================
            STARTING XI
        ==================================================== */}

        <h4>
          11 ผู้เล่นตัวจริง
        </h4>

        <div className="playersList">

          {xi.map((item, index) => (

            <label
              key={`${item.slot}-${index}`}
            >

              <span>
                {item.slot}
              </span>

              <select
                value={item.playerId}
                onChange={(event) =>
                  setPlayer(
                    index,
                    event.target.value
                  )
                }
              >

                {players.map((player) => (

                  <option
                    key={player.id}
                    value={player.id}
                    disabled={
                      selected.has(player.id) &&
                      player.id !==
                        item.playerId
                    }
                  >

                    {String(
                      player.number
                    ).padStart(2, "0")}
                    {" — "}
                    {player.name}

                  </option>

                ))}

              </select>

            </label>

          ))}

        </div>

        {/* ===================================================
            CUSTOM PLAYERS
        ==================================================== */}

        <h4>
          เพิ่ม / แก้ไขรูปนักเตะ
        </h4>

        <p className="folderHint">
          Upload รูป / แก้ชื่อ / แก้เบอร์ — Preview เปลี่ยนทันที
        </p>

        <div className="customPlayers">

          {xi.map((item, index) => {

            const player =
              players.find(
                (p) =>
                  p.id === item.playerId
              );

            const customPlayer =
              custom[item.playerId] ||
              {};

            return (

              <details
                key={`${item.slot}-custom-${index}`}
                className="customCard"
              >

                <summary>

                  <b>
                    {item.slot}
                  </b>

                  <span>
                    {customPlayer.name ||
                      player?.name ||
                      "PLAYER"}
                  </span>

                </summary>

                <div className="customFields">

                  {/* UPLOAD PLAYER */}

                  <label className="uploadField">

                    รูปนักเตะ

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        uploadCustom(
                          item.playerId,
                          event.target
                            .files?.[0]
                        )
                      }
                    />

                  </label>

                  {/* PLAYER NAME */}

                  <label>

                    ชื่อ

                    <input
                      value={
                        customPlayer.name ||
                        ""
                      }
                      placeholder={
                        player?.name ||
                        "PLAYER"
                      }
                      onChange={(event) =>
                        updateCustom(
                          item.playerId,
                          "name",
                          event.target.value
                        )
                      }
                    />

                  </label>

                  {/* PLAYER NUMBER */}

                  <label>

                    เบอร์

                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={
                        customPlayer.number ||
                        ""
                      }
                      placeholder={String(
                        player?.number ?? ""
                      )}
                      onChange={(event) =>
                        updateCustom(
                          item.playerId,
                          "number",
                          event.target.value
                        )
                      }
                    />

                  </label>

                </div>

              </details>
            );
          })}

        </div>

        {/* ===================================================
            BUTTONS
        ==================================================== */}

        <button
          className="reset"
          type="button"
          onClick={() =>
            setXi(
              makeXI(formation)
            )
          }
        >
          รีเซ็ตตำแหน่ง
        </button>

        <button
          className="save"
          type="button"
          onClick={save}
        >
          Save PNG
        </button>

      </aside>

    </main>
  );
}