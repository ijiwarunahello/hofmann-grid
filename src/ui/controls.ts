import type { AppState } from '../model/app-state';

export function setupControls(
  state: AppState,
  onGridChange: () => void,
): void {
  const btnRowsDec = document.getElementById('btn-rows-dec')!;
  const btnRowsInc = document.getElementById('btn-rows-inc')!;
  const valRows = document.getElementById('val-rows')!;

  const btnColsDec = document.getElementById('btn-cols-dec')!;
  const btnColsInc = document.getElementById('btn-cols-inc')!;
  const valCols = document.getElementById('val-cols')!;

  const sliderRadius = document.getElementById('slider-radius') as HTMLInputElement;

  const btnClear = document.getElementById('btn-clear')!;

  const btnHelp = document.getElementById('btn-help')!;
  const btnHelpClose = document.getElementById('btn-help-close')!;
  const helpOverlay = document.getElementById('help-overlay')!;

  function updateDisplay(): void {
    valRows.textContent = String(state.rows);
    valCols.textContent = String(state.cols);
  }

  btnRowsDec.addEventListener('click', () => {
    state.setRows(state.rows - 1);
    updateDisplay();
    onGridChange();
  });

  btnRowsInc.addEventListener('click', () => {
    state.setRows(state.rows + 1);
    updateDisplay();
    onGridChange();
  });

  btnColsDec.addEventListener('click', () => {
    state.setCols(state.cols - 1);
    updateDisplay();
    onGridChange();
  });

  btnColsInc.addEventListener('click', () => {
    state.setCols(state.cols + 1);
    updateDisplay();
    onGridChange();
  });

  sliderRadius.addEventListener('input', () => {
    const val = parseInt(sliderRadius.value, 10);
    state.setRadiusRatio(val / 100);
    onGridChange();
  });

  btnClear.addEventListener('click', () => {
    state.clearAll();
    onGridChange();
  });

  btnHelp.addEventListener('click', () => {
    helpOverlay.classList.toggle('overlay--hidden');
  });

  btnHelpClose.addEventListener('click', () => {
    helpOverlay.classList.add('overlay--hidden');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === '?') {
      helpOverlay.classList.toggle('overlay--hidden');
    }
    if (e.key === 'Escape' && !helpOverlay.classList.contains('overlay--hidden')) {
      helpOverlay.classList.add('overlay--hidden');
    }
  });

  updateDisplay();
}
