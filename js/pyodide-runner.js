/* ============================================
   Pyodide-powered Live Python Editor
   Loads Pyodide WASM runtime and executes Python in-browser
   ============================================ */

const PyodideRunner = (() => {
  let pyodide = null;
  let loading = false;
  let loadCallbacks = [];

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function setOutputContent(el, labelText, content, cssClass) {
    el.textContent = '';
    const label = document.createElement('div');
    label.className = 'output-label';
    label.textContent = labelText;
    el.appendChild(label);
    const body = document.createElement('div');
    body.className = cssClass;
    body.textContent = content;
    el.appendChild(body);
  }

  function setOutputLoading(el, msg) {
    el.textContent = '';
    const div = document.createElement('div');
    div.className = 'loading';
    div.textContent = msg;
    el.appendChild(div);
  }

  function updateAllEditorStatus(msg) {
    document.querySelectorAll('.code-output').forEach(el => {
      if (msg) {
        setOutputLoading(el, msg);
      }
    });
  }

  async function ensurePyodide() {
    if (pyodide) return pyodide;
    if (loading) {
      return new Promise((resolve) => loadCallbacks.push(resolve));
    }
    loading = true;
    updateAllEditorStatus('Loading Python runtime...');
    try {
      pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });
      await pyodide.loadPackage(['numpy']);
      loading = false;
      loadCallbacks.forEach(cb => cb(pyodide));
      loadCallbacks = [];
      return pyodide;
    } catch (err) {
      loading = false;
      console.error('Failed to load Pyodide:', err);
      updateAllEditorStatus('Failed to load Python. Please refresh.');
      throw err;
    }
  }

  async function runCode(code, outputEl, packages = []) {
    try {
      setOutputLoading(outputEl, 'Running...');
      const py = await ensurePyodide();

      if (packages.length > 0) {
        setOutputLoading(outputEl, 'Loading packages...');
        await py.loadPackage(packages);
      }

      py.runPython(`
import sys
from io import StringIO
_stdout = sys.stdout
_stderr = sys.stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
`);

      try {
        let result = py.runPython(code);
        let stdout = py.runPython('sys.stdout.getvalue()');
        let stderr = py.runPython('sys.stderr.getvalue()');
        py.runPython('sys.stdout = _stdout; sys.stderr = _stderr');

        let output = '';
        if (stdout) output += stdout;
        if (result !== undefined && result !== null && String(result) !== 'None') {
          if (output) output += '\n';
          output += String(result);
        }

        outputEl.textContent = '';
        const label = document.createElement('div');
        label.className = 'output-label';
        label.textContent = 'Output';
        outputEl.appendChild(label);

        if (output) {
          const outDiv = document.createElement('div');
          outDiv.className = 'output-text';
          outDiv.textContent = output;
          outputEl.appendChild(outDiv);
        }

        if (stderr) {
          const errDiv = document.createElement('div');
          errDiv.className = 'error-text';
          errDiv.textContent = stderr;
          outputEl.appendChild(errDiv);
        }

        if (!output && !stderr) {
          const noOut = document.createElement('div');
          noOut.className = 'output-text';
          noOut.style.color = 'var(--text-muted)';
          noOut.textContent = '(No output)';
          outputEl.appendChild(noOut);
        }
      } catch (err) {
        py.runPython('sys.stdout = _stdout; sys.stderr = _stderr');
        setOutputContent(outputEl, 'Error', err.message, 'error-text');
      }
    } catch (err) {
      setOutputContent(outputEl, 'Error', err.message, 'error-text');
    }
  }

  function initEditors() {
    document.querySelectorAll('.code-editor-wrapper').forEach(wrapper => {
      const textarea = wrapper.querySelector('.code-textarea');
      const outputEl = wrapper.querySelector('.code-output');
      const runBtn = wrapper.querySelector('.run-btn');
      const resetBtn = wrapper.querySelector('.reset-btn');
      const originalCode = textarea.value;
      const packages = (wrapper.dataset.packages || '').split(',').filter(Boolean);

      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (runBtn) runBtn.click();
        }
      });

      if (runBtn) {
        runBtn.addEventListener('click', async () => {
          runBtn.disabled = true;
          runBtn.textContent = 'Running...';
          await runCode(textarea.value, outputEl, packages);
          runBtn.disabled = false;
          runBtn.textContent = '▶ Run';
        });
      }

      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          textarea.value = originalCode;
          setOutputContent(outputEl, 'Output', 'Click "Run" to execute', 'output-text');
          outputEl.querySelector('.output-text').style.color = 'var(--text-muted)';
        });
      }
    });
  }

  return { init: initEditors, run: runCode, ensurePyodide };
})();

document.addEventListener('DOMContentLoaded', () => PyodideRunner.init());
