const SVG_NS = 'http://www.w3.org/2000/svg';

export class SvgRenderer {
  readonly svg: SVGSVGElement;
  readonly gridLayer: SVGGElement;
  readonly contourLayer: SVGGElement;
  readonly tangentLayer: SVGGElement;
  readonly nodoLayer: SVGGElement;
  private canvasSize = 600;

  constructor(container: HTMLElement) {
    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.setAttribute('xmlns', SVG_NS);

    this.contourLayer = document.createElementNS(SVG_NS, 'g');
    this.contourLayer.setAttribute('id', 'layer-contours');

    this.gridLayer = document.createElementNS(SVG_NS, 'g');
    this.gridLayer.setAttribute('id', 'layer-grid');

    this.tangentLayer = document.createElementNS(SVG_NS, 'g');
    this.tangentLayer.setAttribute('id', 'layer-tangents');

    this.nodoLayer = document.createElementNS(SVG_NS, 'g');
    this.nodoLayer.setAttribute('id', 'layer-nodos');

    this.svg.appendChild(this.contourLayer);
    this.svg.appendChild(this.gridLayer);
    this.svg.appendChild(this.tangentLayer);
    this.svg.appendChild(this.nodoLayer);

    container.appendChild(this.svg);
    this.resize(container);
  }

  resize(container: HTMLElement): void {
    const rect = container.getBoundingClientRect();
    this.canvasSize = Math.min(rect.width, rect.height);
    if (this.canvasSize < 200) this.canvasSize = 200;
    this.svg.setAttribute('width', String(this.canvasSize));
    this.svg.setAttribute('height', String(this.canvasSize));
    this.svg.setAttribute('viewBox', `0 0 ${this.canvasSize} ${this.canvasSize}`);
  }

  getCanvasSize(): number {
    return this.canvasSize;
  }

  clearLayer(layer: SVGGElement): void {
    while (layer.firstChild) {
      layer.removeChild(layer.firstChild);
    }
  }

  clearAll(): void {
    this.clearLayer(this.gridLayer);
    this.clearLayer(this.contourLayer);
    this.clearLayer(this.tangentLayer);
    this.clearLayer(this.nodoLayer);
  }
}

export function createSvgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const [key, val] of Object.entries(attrs)) {
      el.setAttribute(key, val);
    }
  }
  return el;
}
