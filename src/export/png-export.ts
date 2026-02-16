export function exportPng(svgElement: SVGSVGElement): void {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Keep only closed (filled) contour paths
  clone.querySelectorAll('.tangent-hit, .tangent-line, .nodo').forEach((el) => el.remove());

  clone.querySelectorAll('.contour-path').forEach((el) => {
    const path = el as SVGPathElement;
    if (path.classList.contains('contour-path--closed')) {
      path.removeAttribute('class');
      path.setAttribute('fill', '#000000');
      path.setAttribute('fill-rule', 'evenodd');
      path.setAttribute('stroke', 'none');
    } else {
      path.remove();
    }
  });

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);

  const scale = 2;
  const width = parseInt(clone.getAttribute('width') || '600', 10) * scale;
  const height = parseInt(clone.getAttribute('height') || '600', 10) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const img = new Image();
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return;
      const pngUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = 'hofmann-grid.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };

  img.src = url;
}
