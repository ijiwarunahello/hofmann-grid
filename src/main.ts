import './style.css';
import { AppState } from './model/app-state';
import { SvgRenderer } from './render/svg-renderer';
import { renderNodos } from './render/nodo-renderer';
import { renderTangents } from './render/tangent-renderer';
import { renderContours } from './render/contour-renderer';
import { InteractionHandler } from './ui/interaction';
import { setupControls } from './ui/controls';
import { exportSvg } from './export/svg-export';
import { exportPng } from './export/png-export';

const container = document.getElementById('svg-container')!;
const state = new AppState();
const renderer = new SvgRenderer(container);
const interaction = new InteractionHandler(state, () => renderer.getCanvasSize());

function render(): void {
  renderContours(state, renderer);
  renderNodos(state, renderer, {
    onNodoClick: (nodo) => interaction.onNodoClick(nodo),
    onNodoEnter: (nodo) => interaction.onNodoEnter(nodo),
    onNodoLeave: (nodo) => interaction.onNodoLeave(nodo),
  });
  renderTangents(state, renderer, {
    onTangentClick: (tangent) => interaction.onTangentClick(tangent),
  });
}

state.setOnChange(render);
state.buildGrid();

setupControls(state, () => {
  renderer.resize(container);
  render();
});

document.getElementById('btn-random')!.addEventListener('click', () => {
  state.generateRandom(renderer.getCanvasSize());
});

document.getElementById('btn-svg')!.addEventListener('click', () => {
  exportSvg(renderer.svg);
});

document.getElementById('btn-png')!.addEventListener('click', () => {
  exportPng(renderer.svg);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    interaction.onEscape();
  }
});

window.addEventListener('resize', () => {
  renderer.resize(container);
  render();
});
