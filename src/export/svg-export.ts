export function exportSvg(svgElement: SVGSVGElement): void {
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
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'hofmann-grid.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
