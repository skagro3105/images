/**
 * Utility to download files in their original uploaded quality.
 * Handles Blob URLs, remote CORS URLs, and direct file downloads cleanly.
 */
export const downloadOriginalAsset = async (fileUrl, fileName, fileType = '') => {
  try {
    // If it's a data URL or blob URL created locally from device upload
    if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // For remote web links (e.g. Unsplash high-res or Google Drive raw files)
    const response = await fetch(fileUrl, { mode: 'cors' });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    // Fallback if CORS blocks direct fetch: trigger browser window download
    console.warn('Cross-origin direct blob download blocked, opening original file directly:', error);
    const windowRef = window.open(fileUrl, '_blank');
    if (!windowRef) {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
};
