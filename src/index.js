import http from "http";

const PORT = process.env.PORT || 3000;

// HTML con LaunchDarkly + Calculadora controlada por 2 feature flags
const html = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge;chrome=1" />
    <title>LaunchDarkly + Zyphra Calculator</title>
    <script src="https://unpkg.com/launchdarkly-js-client-sdk@3"></script>
  </head>
  <body
    style="
      margin: 0;
      padding: 40px 16px;
      background: radial-gradient(circle at top, #0f172a 0, #020617 55%);
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
        'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
        'Helvetica Neue', sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-align: center;
    "
  >
    <header style="margin-bottom: 32px;">
      <h1 style="margin-bottom: 4px; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.9rem; color: #60a5fa;">
        LaunchDarkly x Zyphra Labs
      </h1>
      <h2 style="margin: 0; font-size: 1.9rem;">Feature-Flagged Calculator</h2>
      <p style="margin-top: 8px; color: #cbd5f5; font-size: 0.95rem;">
        La calculadora y su modo avanzado se manejan 100% desde LaunchDarkly.
      </p>
    </header>

    <main
      style="
        max-width: 980px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        gap: 24px;
      "
    >
      <!-- Panel de estado de Feature Flags -->
      <section
        style="
          padding: 20px 18px;
          border-radius: 16px;
          background: linear-gradient(135deg, #0b1120 0%, #020617 60%);
          border: 1px solid rgba(148, 163, 184, 0.35);
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.85);
          text-align: left;
        "
      >
        <h3 style="margin: 0 0 12px 0; font-size: 1.1rem;">
          Estado de Feature Flags
        </h3>
        <p
          id="status"
          style="margin: 0 0 16px 0; font-size: 0.9rem; color: #e5e7eb;"
        >
          Inicializando SDK de LaunchDarkly...
        </p>

        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 10px;
            font-size: 0.9rem;
          "
        >
          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 12px;
              border-radius: 10px;
              background: rgba(15, 23, 42, 0.7);
            "
          >
            <div>
              <div style="font-weight: 600;">calculator-enabled</div>
              <div style="font-size: 0.78rem; color: #9ca3af;">
                Habilita o no la calculadora completa
              </div>
            </div>
            <span
              id="flag-basic-pill"
              style="
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 0.8rem;
                font-weight: 600;
                background: #4b5563;
              "
              >?</span
            >
          </div>

          <div
            style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 10px 12px;
              border-radius: 10px;
              background: rgba(15, 23, 42, 0.7);
            "
          >
            <div>
              <div style="font-weight: 600;">calculator-advanced</div>
              <div style="font-size: 0.78rem; color: #9ca3af;">
                Activa modo avanzado: operaciones extra + historial
              </div>
            </div>
            <span
              id="flag-advanced-pill"
              style="
                padding: 4px 10px;
                border-radius: 999px;
                font-size: 0.8rem;
                font-weight: 600;
                background: #4b5563;
              "
              >?</span
            >
          </div>
        </div>

        <div
          style="
            margin-top: 18px;
            padding: 10px 12px;
            border-radius: 10px;
            background: rgba(37, 99, 235, 0.16);
            border: 1px solid rgba(59, 130, 246, 0.6);
            font-size: 0.8rem;
            color: #dbeafe;
          "
        >
          <div style="font-weight: 600; margin-bottom: 4px;">
            Contexto de usuario (simulado)
          </div>
          <code style="font-size: 0.78rem;">
            { kind: "user", key: "example-context-key", name: "Sandy" }
          </code>
          <p style="margin: 6px 0 0 0;">
            🔁 Cambiar los flags en LaunchDarkly refleja cambios en tiempo
            real aquí.
          </p>
        </div>
      </section>

      <!-- Calculadora -->
      <section
        id="calc-wrapper"
        style="
          position: relative;
          padding: 20px 18px;
          border-radius: 16px;
          background: radial-gradient(circle at top left, #0b1120 0, #020617 65%);
          border: 1px solid rgba(30, 64, 175, 0.7);
          box-shadow: 0 18px 45px rgba(30, 64, 175, 0.75);
          text-align: left;
          overflow: hidden;
        "
      >
        <div
          id="calc-overlay-disabled"
          style="
            position: absolute;
            inset: 0;
            background: rgba(15, 23, 42, 0.82);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            z-index: 10;
          "
        >
          <div
            style="
              padding: 6px 12px;
              border-radius: 999px;
              font-size: 0.75rem;
              background: rgba(239, 68, 68, 0.18);
              border: 1px solid rgba(248, 113, 113, 0.7);
              color: #fed7d7;
            "
          >
            Feature OFF
          </div>
          <div style="font-weight: 600; font-size: 1rem;">
            La calculadora está deshabilitada
          </div>
          <p
            style="
              margin: 0;
              font-size: 0.85rem;
              color: #9ca3af;
              max-width: 260px;
              text-align: center;
            "
          >
            Activa el flag <code>calculator-enabled</code> en LaunchDarkly para
            liberar esta funcionalidad.
          </p>
        </div>

        <header style="margin-bottom: 10px; display: flex; gap: 8px;">
          <h3 style="margin: 0; font-size: 1.15rem;">Zyphra Calculator</h3>
          <span
            id="mode-pill"
            style="
              align-self: center;
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              background: rgba(56, 189, 248, 0.18);
              border: 1px solid rgba(56, 189, 248, 0.6);
              color: #e0f2fe;
            "
          >
            Basic mode
          </span>
        </header>
        <p style="margin: 0 0 12px 0; font-size: 0.85rem; color: #9ca3af;">
          Implementando feature flags en una calculadora simple para demostrar
          dark launch &amp; releases progresivos.
        </p>

        <!-- Formulario de cálculo -->
        <div
          style="
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            gap: 12px;
          "
        >
          <div
            style="
              display: flex;
              flex-direction: row;
              gap: 10px;
              flex-wrap: wrap;
            "
          >
            <label style="font-size: 0.85rem; flex: 1 1 140px;">
              Operación básica:
              <select
                id="op-basic"
                style="
                  width: 100%;
                  margin-top: 4px;
                  padding: 6px 8px;
                  border-radius: 8px;
                  border: none;
                  background: #020617;
                  color: #e5e7eb;
                "
              >
                <option value="add">Sumar (+)</option>
                <option value="subtract">Restar (-)</option>
                <option value="multiply">Multiplicar (×)</option>
                <option value="divide">Dividir (÷)</option>
              </select>
            </label>

            <label
              id="op-advanced-wrapper"
              style="font-size: 0.85rem; flex: 1 1 140px; opacity: 0.45;"
            >
              Operación avanzada:
              <select
                id="op-advanced"
                style="
                  width: 100%;
                  margin-top: 4px;
                  padding: 6px 8px;
                  border-radius: 8px;
                  border: none;
                  background: #020617;
                  color: #e5e7eb;
                "
                disabled
              >
                <option value="power">Potencia (a^b)</option>
                <option value="sqrt">Raíz cuadrada (sqrt a)</option>
                <option value="percent">Porcentaje (a % de b)</option>
              </select>
            </label>
          </div>

          <div
            style="
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 10px;
            "
          >
            <label style="font-size: 0.85rem;">
              Número 1:
              <input
                id="num1"
                type="number"
                style="
                  width: 100%;
                  margin-top: 4px;
                  padding: 6px 8px;
                  border-radius: 8px;
                  border: none;
                  background: #020617;
                  color: #e5e7eb;
                "
              />
            </label>

            <label style="font-size: 0.85rem;">
              Número 2:
              <input
                id="num2"
                type="number"
                style="
                  width: 100%;
                  margin-top: 4px;
                  padding: 6px 8px;
                  border-radius: 8px;
                  border: none;
                  background: #020617;
                  color: #e5e7eb;
                "
              />
            </label>
          </div>

          <div
            style="
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              margin-top: 4px;
            "
          >
            <button
              id="btn-basic"
              style="
                flex: 1 1 120px;
                padding: 9px 14px;
                border-radius: 999px;
                border: none;
                background: linear-gradient(to right, #22c55e, #16a34a);
                color: white;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.9rem;
              "
            >
              Calcular básico
            </button>

            <button
              id="btn-advanced"
              style="
                flex: 1 1 120px;
                padding: 9px 14px;
                border-radius: 999px;
                border: none;
                background: linear-gradient(to right, #38bdf8, #0ea5e9);
                color: white;
                font-weight: 600;
                cursor: pointer;
                font-size: 0.9rem;
                opacity: 0.4;
              "
              disabled
            >
              Calcular avanzado
            </button>
          </div>

          <div
            id="result-card"
            style="
              margin-top: 10px;
              padding: 10px 12px;
              border-radius: 12px;
              background: rgba(15, 23, 42, 0.85);
              border: 1px solid rgba(148, 163, 184, 0.6);
              min-height: 46px;
              font-size: 0.9rem;
            "
          >
            <span id="result-label" style="color: #9ca3af;">
              Esperando operación...
            </span>
          </div>

          <div
            id="history-wrapper"
            style="
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px dashed rgba(148, 163, 184, 0.5);
              font-size: 0.8rem;
              color: #9ca3af;
              max-height: 120px;
              overflow-y: auto;
            "
          >
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600;">Historial</span>
              <span id="history-badge" style="opacity: 0.6;"
                >Modo avanzado OFF</span
              >
            </div>
            <ul id="history-list" style="margin: 6px 0 0 0; padding-left: 16px;">
            </ul>
          </div>
        </div>
      </section>
    </main>

    <script>
      function main() {
        // 👉 Tu client-side ID de LaunchDarkly
        const clientSideID = "6934c78ba3a9340998d66efb";

        // 👉 Flags que controlan la calculadora
        const FLAG_BASIC = "calculator-enabled";
        const FLAG_ADVANCED = "calculator-advanced";

        const statusLabel = document.getElementById("status");
        const basicPill = document.getElementById("flag-basic-pill");
        const advancedPill = document.getElementById("flag-advanced-pill");
        const overlayDisabled = document.getElementById("calc-overlay-disabled");
        const modePill = document.getElementById("mode-pill");
        const opAdvancedWrapper = document.getElementById("op-advanced-wrapper");
        const opAdvancedSelect = document.getElementById("op-advanced");
        const btnAdvanced = document.getElementById("btn-advanced");
        const historyBadge = document.getElementById("history-badge");
        const historyList = document.getElementById("history-list");
        const resultLabel = document.getElementById("result-label");

        const btnBasic = document.getElementById("btn-basic");
        const opBasicSelect = document.getElementById("op-basic");
        const num1Input = document.getElementById("num1");
        const num2Input = document.getElementById("num2");

        const context = {
          kind: "user",
          key: "example-context-key",
          name: "Sandy",
        };

        const ldclient = LDClient.initialize(clientSideID, context);

        function setFlagPill(pillEl, value) {
          pillEl.textContent = value ? "ON" : "OFF";
          pillEl.style.background = value
            ? "rgba(22, 163, 74, 0.16)"
            : "rgba(148, 163, 184, 0.25)";
          pillEl.style.color = value ? "#bbf7d0" : "#e5e7eb";
          pillEl.style.border = value
            ? "1px solid rgba(34, 197, 94, 0.8)"
            : "1px solid rgba(148, 163, 184, 0.7)";
        }

        function pushHistory(entry) {
          const li = document.createElement("li");
          li.textContent = entry;
          historyList.insertBefore(li, historyList.firstChild);

          // solo últimos 5
          while (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
          }
        }

        function render() {
          const basicOn = ldclient.variation(FLAG_BASIC, false);
          const advancedOn = ldclient.variation(FLAG_ADVANCED, false);

          setFlagPill(basicPill, basicOn);
          setFlagPill(advancedPill, advancedOn);

          if (basicOn) {
            overlayDisabled.style.display = "none";
            statusLabel.textContent =
              "✅ calculator-enabled = true → calculadora liberada.";
          } else {
            overlayDisabled.style.display = "flex";
            statusLabel.textContent =
              "🚫 calculator-enabled = false → calculadora bloqueada.";
          }

          if (advancedOn && basicOn) {
            modePill.textContent = "Advanced mode";
            modePill.style.background = "rgba(251, 191, 36, 0.18)";
            modePill.style.border = "1px solid rgba(251, 191, 36, 0.8)";
            modePill.style.color = "#fef9c3";

            opAdvancedWrapper.style.opacity = "1";
            opAdvancedSelect.disabled = false;
            btnAdvanced.disabled = false;
            btnAdvanced.style.opacity = "1";
            historyBadge.textContent = "Modo avanzado ON";
            historyBadge.style.opacity = "1";
          } else {
            modePill.textContent = "Basic mode";
            modePill.style.background = "rgba(56, 189, 248, 0.18)";
            modePill.style.border = "1px solid rgba(56, 189, 248, 0.6)";
            modePill.style.color = "#e0f2fe";

            opAdvancedWrapper.style.opacity = "0.45";
            opAdvancedSelect.disabled = true;
            btnAdvanced.disabled = true;
            btnAdvanced.style.opacity = "0.4";
            historyBadge.textContent = "Modo avanzado OFF";
            historyBadge.style.opacity = "0.6";
          }
        }

        function doBasic() {
          const op = opBasicSelect.value;
          const a = parseFloat(num1Input.value);
          const b = parseFloat(num2Input.value);

          if (Number.isNaN(a) || Number.isNaN(b)) {
            resultLabel.textContent = "❌ Ingresa dos números válidos.";
            resultLabel.style.color = "#fca5a5";
            return;
          }

          let res;
          let expr;

          switch (op) {
            case "add":
              res = a + b;
              expr = \`\${a} + \${b}\`;
              break;
            case "subtract":
              res = a - b;
              expr = \`\${a} - \${b}\`;
              break;
            case "multiply":
              res = a * b;
              expr = \`\${a} × \${b}\`;
              break;
            case "divide":
              if (b === 0) {
                resultLabel.textContent =
                  "⚠️ No se puede dividir para cero.";
                resultLabel.style.color = "#fed7aa";
                return;
              }
              res = a / b;
              expr = \`\${a} ÷ \${b}\`;
              break;
            default:
              resultLabel.textContent = "Operación no válida.";
              resultLabel.style.color = "#fca5a5";
              return;
          }

          resultLabel.textContent = \`✅ Resultado básico: \${expr} = \${res}\`;
          resultLabel.style.color = "#bbf7d0";
        }

        function doAdvanced() {
          const advancedOn = ldclient.variation(FLAG_ADVANCED, false);
          if (!advancedOn) {
            resultLabel.textContent =
              "🚫 Modo avanzado deshabilitado por feature flag.";
            resultLabel.style.color = "#fca5a5";
            return;
          }

          const op = opAdvancedSelect.value;
          const a = parseFloat(num1Input.value);
          const b = parseFloat(num2Input.value);

          if (Number.isNaN(a) || (op !== "sqrt" && Number.isNaN(b))) {
            resultLabel.textContent =
              "❌ Ingresa un número válido (y dos para la mayoría de operaciones).";
            resultLabel.style.color = "#fca5a5";
            return;
          }

          let res;
          let expr;

          switch (op) {
            case "power":
              res = Math.pow(a, b);
              expr = \`\${a} ^ \${b}\`;
              break;
            case "sqrt":
              if (a < 0) {
                resultLabel.textContent =
                  "⚠️ No se puede sacar raíz cuadrada de un número negativo (en esta demo).";
                resultLabel.style.color = "#fed7aa";
                return;
              }
              res = Math.sqrt(a);
              expr = \`√\${a}\`;
              break;
            case "percent":
              res = (a * b) / 100;
              expr = \`\${a}% de \${b}\`;
              break;
            default:
              resultLabel.textContent = "Operación avanzada no válida.";
              resultLabel.style.color = "#fca5a5";
              return;
          }

          const entry = \`\${expr} = \${res}\`;
          resultLabel.textContent = \`✨ Resultado avanzado: \${entry}\`;
          resultLabel.style.color = "#e9d5ff";
          pushHistory(entry);
        }

        ldclient.on("initialized", () => {
          statusLabel.textContent = "SDK inicializado, evaluando flags...";
        });

        ldclient.on("failed", () => {
          statusLabel.textContent =
            "SDK failed to initialize. Revisa tu clientSideID.";
        });

        ldclient.on("ready", render);
        ldclient.on("change", render);

        btnBasic.addEventListener("click", doBasic);
        btnAdvanced.addEventListener("click", doAdvanced);
      }

      main();
    </script>
  </body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/" || req.url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`🚀 LaunchDarkly + Zyphra Calculator running on http://localhost:${PORT}`);
});
