// save a chat csv to disk
export const saveCsvDownload = async ({ csvContent, filename }) => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: `${filename}.csv`,
        types: [{ description: "CSV File", accept: { "text/csv": [".csv"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    if (err?.name !== "AbortError") console.error("Save CSV error:", err);
  }
};
