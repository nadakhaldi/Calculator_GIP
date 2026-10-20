const display = document.getElementById("display");
const OPERATORS = ["+", "-", "*", "/"];
let justCalculated = false;

function appendToDisplay(input) {
  if (display.value === "Error") display.value = "";

  const isOperator = OPERATORS.includes(input);

  if (justCalculated && !isOperator) display.value = "";
  justCalculated = false;

  const value = display.value;
  const last = value.slice(-1);

  if (isOperator) {
    if (value === "") {
      if (input === "-") display.value = "-";
      return;
    }
    if (input === "-" && (last === "*" || last === "/")) {
      display.value += input;
      return;
    }
    if (OPERATORS.includes(last)) {
      display.value = value.replace(/[+\-*/]+$/, "") + input;
      return;
    }
  }

  if (input === ".") {
    const currentNumber = value.split(/[+\-*/]/).pop();
    if (currentNumber.includes(".")) return;
    if (currentNumber === "") {
      display.value += "0.";
      return;
    }
  }

  display.value += input;
}

function clearDisplay() {
  display.value = "";
  justCalculated = false;
}
function deleteLast() {
  display.value = display.value.slice(0, -1);
  justCalculated = false;
}

function backspace() {
  if (display.value === "Error") return clearDisplay();
  display.value = display.value.slice(0, -1);
}

/*   أولوية العمليات */
function evaluate(expr) {
  const tokens = expr.match(/\d+\.?\d*|\.\d+|[+\-*/]/g);
  if (!tokens) throw new Error("empty");
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  // المستوى 1: + و -
  function parseExpression() {
    let left = parseTerm();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const right = parseTerm();
      left = op === "+" ? left + right : left - right;
    }
    return left;
  }

  function parseTerm() {
    let left = parseFactor();
    while (peek() === "*" || peek() === "/") {
      const op = next();
      const right = parseFactor();
      if (op === "/" && right === 0) throw new Error("div0");
      left = op === "*" ? left * right : left / right;
    }
    return left;
  }

  // unary minus
  function parseFactor() {
    const t = next();
    if (t === "-") return -parseFactor();
    if (t === "+") return parseFactor();
    if (t === undefined || OPERATORS.includes(t)) throw new Error("syntax");
    return parseFloat(t);
  }

  const result = parseExpression();
  if (pos < tokens.length) throw new Error("syntax");
  return result;
}

function calculate() {
  if (display.value === "" || display.value === "Error") return;
  try {
    const result = evaluate(display.value);
    // يصلح مشكل 0.1 + 0.2 = 0.30000000000000004
    display.value = String(parseFloat(result.toFixed(10)));
    justCalculated = true;
  } catch (error) {
    display.value = "Error";
    justCalculated = false;
  }
}

/* ===== الكيبورد ===== */
document.addEventListener("keydown", (e) => {
  const key = e.key;

  if (/^[0-9]$/.test(key) || OPERATORS.includes(key) || key === ".") {
    e.preventDefault();
    appendToDisplay(key);
  } else if (key === "Enter" || key === "=") {
    e.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    deleteLast();
  } else if (
    key === "Escape" ||
    key === "Delete" ||
    key.toLowerCase() === "c"
  ) {
    clearDisplay();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") e.target.blur();
});
