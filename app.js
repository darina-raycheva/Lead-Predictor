document.querySelectorAll('input[type="range"]').forEach((range) => {
  const output = document.querySelector(`#${range.id.replace('-rate', '-output')}`);

  const updateOutput = () => {
    const minimum = Number(range.min) || 0;
    const maximum = Number(range.max) || 100;
    const value = Math.min(maximum, Math.max(minimum, Number(range.value) || 0));
    const percentage = ((value - minimum) / (maximum - minimum || 1)) * 100;
    const formattedValue = `${value.toFixed(2)}%`;

    range.value = value;
    range.style.setProperty('--rate-progress', `${percentage}%`);
    if (output) {
      output.value = formattedValue;
      output.textContent = formattedValue;
    }
  };

  range.addEventListener('input', updateOutput);
  range.addEventListener('change', updateOutput);
  updateOutput();
});
