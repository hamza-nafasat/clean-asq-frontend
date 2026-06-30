/** Transparent resize hit areas around the chat panel edges and corners. */
export default function PanelResizeHandles({ onResizeMouseDown }) {
  return (
    <>
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "n")}
        style={{ position: "absolute", top: 0, left: 8, right: 8, height: 5, cursor: "n-resize", zIndex: 10 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "s")}
        style={{ position: "absolute", bottom: 0, left: 8, right: 8, height: 5, cursor: "s-resize", zIndex: 10 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "e")}
        style={{ position: "absolute", top: 8, right: 0, bottom: 8, width: 5, cursor: "e-resize", zIndex: 10 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "w")}
        style={{ position: "absolute", top: 8, left: 0, bottom: 8, width: 5, cursor: "w-resize", zIndex: 10 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "nw")}
        style={{ position: "absolute", top: 0, left: 0, width: 12, height: 12, cursor: "nw-resize", zIndex: 11 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "ne")}
        style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, cursor: "ne-resize", zIndex: 11 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "sw")}
        style={{ position: "absolute", bottom: 0, left: 0, width: 12, height: 12, cursor: "sw-resize", zIndex: 11 }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "se")}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 12,
          height: 12,
          cursor: "se-resize",
          zIndex: 11,
        }}
      />
      <div
        onMouseDown={(e) => onResizeMouseDown(e, "se")}
        style={{
          position: "absolute",
          bottom: 4,
          right: 4,
          zIndex: 12,
          pointerEvents: "none",
          opacity: 0.35,
          lineHeight: 1,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ color: "#666" }}>
          <rect x="6" y="0" width="2" height="2" />
          <rect x="6" y="4" width="2" height="2" />
          <rect x="6" y="8" width="2" height="2" />
          <rect x="2" y="4" width="2" height="2" />
          <rect x="2" y="8" width="2" height="2" />
          <rect x="0" y="8" width="2" height="2" />
        </svg>
      </div>
    </>
  );
}
